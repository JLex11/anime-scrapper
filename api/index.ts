import cors from 'cors'
import express from 'express'
import compression from 'compression'
import { setOriginPath } from '../src/config'
import animesRouter from './router/animes'
import episodesRouter from './router/episodes'
import imagesRouter from './router/images'
import routesDocumentation from './router/routesDocumentation'
import { apiLimiter, imageLimiter } from '../src/middleware/rateLimiter'
import { logger } from '../src/utils/logger'

// Detectar entorno
const isServerless = process.env.VERCEL_ENV !== undefined
const isProdMode = process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production'

// Inicializar la app de Express
const app: express.Application = express()

// Middlewares básicos
app.use(compression())
app.use(cors())
app.use(express.json({ limit: '10mb' }))  // Limitar el tamaño del body
app.use(express.static('public', {
  maxAge: isProdMode ? '1d' : 0, // Cache de archivos estáticos en producción
}))

// Ruta específica para la documentación de la API
app.use('/api-docs', express.static('public/api-docs', {
  maxAge: isProdMode ? '1d' : 0,
}))

// Middleware para establecer la ruta de origen
app.use(async (req, _, next) => {
	setOriginPath(`${isProdMode ? 'https' : req.protocol}://${req.get('host')}`)
	next()
})

// Middleware de registro de solicitudes para desarrollo y depuración
if (!isProdMode) {
  app.use((req, res, next) => {
    const start = new Date()
    
    res.on('finish', () => {
      const duration = new Date().getTime() - start.getTime()
      logger.debug(
        `${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`
      )
    })
    
    next()
  })
}

// Redirección de la ruta raíz
app.get('/', (_, res) => res.redirect('/api-docs'))

// Rutas de la API con limitadores de tasa
app.use('/api/', apiLimiter, routesDocumentation)
app.use('/api/animes', apiLimiter, animesRouter)
app.use('/api/episodes', apiLimiter, episodesRouter)
app.use('/api/image', imageLimiter, imagesRouter)

// Ruta de estado/health check para monitoreo
app.get('/health', (_, res) => {
  res.status(200).json({
    status: 'ok',
    environment: isServerless ? 'serverless' : 'nodejs',
    uptime: process.uptime(),
  })
})

// Manejo de rutas no encontradas
app.use('*', (_, res) => {
	res.status(404).send('Not found')
})

// Manejo global de errores
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error(`Error no controlado: ${err.message}`)
  res.status(500).json({
    error: isProdMode ? 'Error interno del servidor' : err.message,
  })
})

// Registrar inicialización
logger.info(`API inicializada, entorno: ${isServerless ? 'serverless' : 'nodejs'}`)

export default app
