import NodeCache from 'node-cache'

interface CacheOptions {
  stdTTL?: number
  checkperiod?: number
  useClones?: boolean
  enableLogs?: boolean
}

class CacheService {
  private cache: NodeCache
  private enableLogs: boolean

  constructor(options: CacheOptions = {}) {
    const { stdTTL = 3600, checkperiod = 600, useClones = false, enableLogs = false } = options
    this.cache = new NodeCache({ stdTTL, checkperiod, useClones })
    this.enableLogs = enableLogs

    // Si estamos en un entorno serverless, configurar limpieza periódica
    if (process.env.VERCEL_ENV) {
      // En Vercel, no tiene sentido hacer limpieza periódica debido a la naturaleza efímera
      // del entorno serverless, pero podemos limitar el tamaño máximo de caché
      const maxKeys = 1000
      setInterval(() => {
        const keys = this.cache.keys()
        if (keys.length > maxKeys) {
          // Eliminar las entradas más antiguas basadas en ttl
          const keysToRemove = keys.slice(0, keys.length - maxKeys)
          for (const key of keysToRemove) {
            this.cache.del(key)
          }
          this.log(`Recorte de caché: se eliminaron ${keysToRemove.length} entradas antiguas`)
        }
      }, 60000) // Verificar cada minuto
    }
  }

  get<T>(key: string): T | undefined {
    const value = this.cache.get<T>(key)
    this.log(`Cache ${value ? 'HIT' : 'MISS'}: ${key}`)
    return value
  }

  set<T>(key: string, value: T, ttl?: number): boolean {
    this.log(`Cache SET: ${key} (TTL: ${ttl ?? 'default'})`)
    return this.cache.set(key, value, ttl)
  }

  del(key: string | string[]): number {
    const count = this.cache.del(key)
    this.log(`Cache DEL: ${typeof key === 'string' ? key : key.join(', ')} (${count} eliminados)`)
    return count
  }

  flush(): void {
    this.log('Cache FLUSH: Eliminando todas las entradas')
    this.cache.flushAll()
  }

  getStats(): NodeCache.Stats {
    return this.cache.getStats()
  }

  // Método de ayuda para mejorar el patrón común "get-or-compute-and-set"
  async getOrSet<T>(
    key: string,
    dataFn: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    const cachedData = this.get<T>(key)
    if (cachedData !== undefined) {
      return cachedData
    }

    try {
      const freshData = await dataFn()
      if (freshData !== undefined && freshData !== null) {
        this.set(key, freshData, ttl)
      }
      return freshData
    } catch (error) {
      this.log(`Error en getOrSet para clave ${key}: ${error}`, true)
      throw error
    }
  }

  private log(message: string, isError = false): void {
    if (this.enableLogs) {
      if (isError) {
        console.error(`[CacheService] ${message}`)
      } else {
        console.log(`[CacheService] ${message}`)
      }
    }
  }
}

// Exportar una instancia por defecto para uso general
export const defaultCache = new CacheService({
  stdTTL: 3600, // 1 hora
  enableLogs: process.env.NODE_ENV === 'development' || process.env.DEBUG === 'true',
})

// Caché específica para datos que cambian menos frecuentemente (como la información de anime)
export const longTermCache = new CacheService({
  stdTTL: 86400, // 24 horas
  enableLogs: process.env.NODE_ENV === 'development' || process.env.DEBUG === 'true',
})

// Caché específica para resultados de búsqueda (menos tiempo para que refleje cambios nuevos)
export const searchCache = new CacheService({
  stdTTL: 1800, // 30 minutos
  enableLogs: process.env.NODE_ENV === 'development' || process.env.DEBUG === 'true',
})

// Exportar la clase para crear instancias personalizadas si es necesario
export default CacheService
