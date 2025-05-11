import app from './index'
import { logger } from '../src/utils/logger'
import { defaultCache, longTermCache } from '../src/services/cacheService'

// Definir configuración específica para entorno Node.js (no serverless)
process.env.NODE_ENV = process.env.NODE_ENV || 'development'

// Puerto para el servidor
const PORT = process.env.PORT ?? 3002

// Iniciar el servidor
const server = app.listen(PORT, () => {
  logger.info(`🚀 Servidor iniciado en http://localhost:${PORT}`)
  logger.info(`📚 Documentación de la API disponible en http://localhost:${PORT}/api-docs`)
  logger.info(`👉 Endpoints JSON disponibles en http://localhost:${PORT}/api`)
})

// Gestión adecuada de cierre del servidor
const handleShutdown = () => {
  logger.info('Iniciando apagado controlado...')
  
  // Cerrar el servidor HTTP
  server.close(() => {
    logger.info('Servidor HTTP cerrado correctamente')
    
    // Limpiar caché y otros recursos
    defaultCache.flush()
    longTermCache.flush()
    
    logger.info('Recursos liberados, finalizando proceso')
    process.exit(0)
  })
  
  // Si no se cierra en 10 segundos, forzar salida
  setTimeout(() => {
    logger.error('No se pudieron cerrar las conexiones a tiempo, forzando salida')
    process.exit(1)
  }, 10000)
}

// Registrar manejadores para cierre controlado
process.on('SIGTERM', handleShutdown)
process.on('SIGINT', handleShutdown)

// Gestión de excepciones no controladas
process.on('uncaughtException', (error) => {
  logger.error(`Excepción no controlada: ${error.message}`)
  logger.error(error.stack || '')
})

process.on('unhandledRejection', (reason) => {
  logger.error(`Promesa rechazada no controlada: ${reason}`)
})
