import NodeCache from 'node-cache'

interface CacheOptions {
	stdTTL?: number
	useClones?: boolean
	enableLogs?: boolean
}

class CacheService {
	private cache: NodeCache
	private enableLogs: boolean

	constructor(options: CacheOptions = {}) {
		const { stdTTL = 3600, useClones = false, enableLogs = false } = options
		this.cache = new NodeCache({ stdTTL, useClones })
		this.enableLogs = enableLogs
	}

	get<T>(key: string): T | undefined {
		const value = this.cache.get<T>(key)
		this.log(`Cache ${value ? 'HIT' : 'MISS'}: ${key}`)
		return value
	}

	set<T>(key: string, value: T): boolean {
		this.log(`Cache SET: ${key})`)
		return this.cache.set(key, value)
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
	async getOrSet<T>(key: string, dataFn: () => Promise<T>): Promise<T> {
		const cachedData = this.get<T>(key)
		if (cachedData !== undefined) {
			return cachedData
		}

		try {
			const freshData = await dataFn()
			if (freshData !== undefined && freshData !== null) {
				this.set(key, freshData)
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

export const defaultCache = new CacheService({
	stdTTL: 3600, // 1 hora
	enableLogs: process.env.NODE_ENV === 'development' || process.env.DEBUG === 'true',
})

export const longTermCache = new CacheService({
	stdTTL: 86400, // 24 horas
	enableLogs: process.env.NODE_ENV === 'development' || process.env.DEBUG === 'true',
})

export const searchCache = new CacheService({
	stdTTL: 1800, // 30 minutos
	enableLogs: process.env.NODE_ENV === 'development' || process.env.DEBUG === 'true',
})

export default CacheService
