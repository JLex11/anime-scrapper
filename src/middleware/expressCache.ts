import type { NextFunction, Request, Response } from 'express'
import { defaultCache } from '../services/cacheService'

interface ExpressCacheOptions {
	prefix?: string
	ignoreQueryString?: boolean
}

/**
 * Middleware para cachear respuestas de Express
 *
 * @param options Opciones de configuración del caché
 */
export const expressCacheMiddleware = (options: ExpressCacheOptions = {}) => {
	const { prefix = 'express:', ignoreQueryString = false } = options

	return (req: Request, res: Response, next: NextFunction) => {
		// No cachear métodos no GET o solicitudes con autenticación
		if (req.method !== 'GET' || req.headers.authorization) {
			return next()
		}

		// Crear clave única para el caché
		const key = prefix + (ignoreQueryString ? `${req.originalUrl.split('?')[0]}` : `${req.originalUrl}`)

		// Define a type for the cached response body
		type CachedResponse = { body: unknown; headers: Record<string, string> }
		// Comprobar si tenemos una respuesta cacheada
		const cachedResponse = defaultCache.get<CachedResponse>(key)

		if (cachedResponse) {
			// Establecer las cabeceras desde la respuesta cacheada
			for (const [name, value] of Object.entries(cachedResponse.headers)) {
				res.setHeader(name, value)
			}

			res.setHeader('X-Cache', 'HIT')

			// Enviar la respuesta cacheada
			return res.status(200).send(cachedResponse.body)
		}

		// No hay caché, capturar la respuesta para cachearla
		const originalSend = res.send

		res.send = function (body): Response {
			// No cachear respuestas de error
			if (res.statusCode >= 400) {
				return originalSend.call(this, body)
			}

			// Cachear solo respuestas exitosas
			if (res.statusCode >= 200 && res.statusCode < 300) {
				const headers: Record<string, string> = {}

				// Capturar cabeceras relevantes para el caché
				const headersToCache = ['content-type', 'content-language', 'last-modified']
				for (const headerName of headersToCache) {
					const headerValue = res.getHeader(headerName)
					if (headerValue) {
						headers[headerName] = String(headerValue)
					}
				}

				// Guardar en caché
				defaultCache.set(key, { body, headers })
			}

			// Indicar que fue un MISS en el caché
			res.setHeader('X-Cache', 'MISS')

			// Llamar al método send original
			return originalSend.call(this, body)
		}

		next()
	}
}
