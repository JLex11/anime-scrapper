import compression from 'compression'
import cors from 'cors'
import express from 'express'
import fs from 'node:fs'
import path from 'node:path'
import { setOriginPath } from '../src/config'
import { expressCacheMiddleware } from '../src/middleware/expressCache'
import { logger } from '../src/utils/logger'
import animesRouter from './router/animes'
import episodesRouter from './router/episodes'
import imagesRouter from './router/images'
import routesDocumentation from './router/routesDocumentation'

const isServerless = process.env.VERCEL_ENV !== undefined
const isProdMode = process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production'

const app: express.Application = express()
const currentDir = path.dirname(fileURLToPath(import.meta.url))
const docsStaticDir = path.resolve(currentDir, '../public/api-docs')
const docsIndexPath = path.join(docsStaticDir, 'index.html')
const hasBuiltDocs = () => fs.existsSync(docsIndexPath)

app.use(compression({ level: 2 }))
app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use(expressCacheMiddleware() as express.RequestHandler)

app.use(async (req, _, next) => {
	setOriginPath(`${isProdMode ? 'https' : req.protocol}://${req.get('host')}`)
	next()
})

if (!isProdMode) {
	app.use((req, res, next) => {
		const start = new Date()

		res.on('finish', () => {
			const duration = new Date().getTime() - start.getTime()
			logger.debug(`${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`)
		})

		next()
	})
}

if (!hasBuiltDocs()) {
	logger.warn('La documentación Astro no está construida. Ejecuta "bun run docs:build" para generarla.')
}

app.use('/api-docs', (req, res, next) => {
	if (!hasBuiltDocs()) {
		res
			.status(503)
			.send('La documentación interactiva aún no está disponible. Ejecuta "bun run docs:build" y vuelve a intentarlo.')
		return
	}
	next()
})
app.use('/api-docs', express.static(docsStaticDir))
app.get('/api-docs', (_, res) => {
	res.redirect('/api-docs/')
})

app.get('/', (_, res) => res.redirect('/api-docs/'))
app.get('/api/', (_, res) => res.redirect('/api-docs/'))

app.use('/api/api-routes', routesDocumentation)
app.use('/api/animes', animesRouter)
app.use('/api/episodes', episodesRouter)
app.use('/api/image', imagesRouter)

app.use((_, res) => {
	res.status(404).send('Not found')
})

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
	logger.error(`Error no controlado: ${err.message}`)
	res.status(500).json({
		error: isProdMode ? 'Error interno del servidor' : err.message,
	})
})

if (!isServerless) {
	const PORT = process.env.PORT || 3000
	app.listen(PORT, () => {
		console.log(`http://localhost:${PORT}`)
		logger.info(`Servidor Express iniciado en el puerto ${PORT}`)
	})
}

export default app
