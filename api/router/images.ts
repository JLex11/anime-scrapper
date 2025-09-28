import { Router as RouterApp } from 'express'
import { endPoints } from '../../src/enums'
import { s3GetOperation } from '../../src/services/cloudflareR2'
import { optimizeImage } from '../../src/services/imageOptimizer'
import { logger } from '../../src/utils/logger'

const router = RouterApp()

router.get(endPoints.IMAGES, async (req, res) => {
	const { imgFilename } = req.params
	const { width, height, format, quality } = req.query

	try {
		// Obtener la imagen del storage
		const s3Response = await s3GetOperation({ filename: imgFilename })

		if (!s3Response?.Body) {
			res.status(404).send({ error: 'Image not found' })
			return
		}

		// Convert Body to Buffer for AWS SDK v3
		let imgBuffer: Buffer

		if (Buffer.isBuffer(s3Response.Body)) {
			// If it's already a Buffer
			imgBuffer = s3Response.Body
		} else if (s3Response.Body instanceof Uint8Array) {
			// If it's a Uint8Array
			imgBuffer = Buffer.from(s3Response.Body)
		} else if (typeof s3Response.Body === 'string') {
			// If it's a string
			imgBuffer = Buffer.from(s3Response.Body, 'binary')
		} else if (s3Response.Body && typeof s3Response.Body === 'object' && 'getReader' in s3Response.Body) {
			// If it's a ReadableStream
			const stream = s3Response.Body as ReadableStream<Uint8Array>
			const reader = stream.getReader()
			const chunks: Uint8Array[] = []

			try {
				while (true) {
					const { done, value } = await reader.read()
					if (done) break
					chunks.push(value)
				}
			} finally {
				reader.releaseLock()
			}

			imgBuffer = Buffer.concat(chunks)
		} else if (s3Response.Body && s3Response.Body.constructor?.name === 'IncomingMessage') {
			// Handle Node.js IncomingMessage stream (common in AWS SDK v3 with Node.js)
			const stream = s3Response.Body as any
			const chunks: Buffer[] = []

			for await (const chunk of stream) {
				chunks.push(chunk)
			}

			imgBuffer = Buffer.concat(chunks)
		} else {
			// Fallback: try to convert to array buffer
			const arrayBuffer = await (s3Response.Body as any).arrayBuffer()
			imgBuffer = Buffer.from(arrayBuffer)
		}

		if (width || height || format || quality) {
			try {
				const optimizedBuffer = await optimizeImage(imgBuffer, {
					width: width ? Number.parseInt(width as string, 10) : undefined,
					height: height ? Number.parseInt(height as string, 10) : undefined,
					format: (format as 'webp' | 'jpeg' | 'png' | 'avif') || 'webp',
					quality: quality ? Number.parseInt(quality as string, 10) : undefined,
				})

				if (optimizedBuffer) {
					imgBuffer = optimizedBuffer
				}
			} catch (optimizeError) {
				logger.error(`Error optimizando imagen ${imgFilename}: ${optimizeError}`)
				res.status(500).send({ error: 'Error optimizing image' })
				return
			}
		}

		// Establecer el tipo de contenido correcto
		let contentType = 'image/webp'
		if (format === 'jpeg') contentType = 'image/jpeg'
		else if (format === 'png') contentType = 'image/png'
		else if (format === 'avif') contentType = 'image/avif'

		// Configurar headers para mejor caché y rendimiento
		res.setHeader('Content-Type', contentType)
		res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
		res.setHeader('Content-Length', imgBuffer.length)

		res.send(imgBuffer)
	} catch (error) {
		logger.error(`Error obteniendo imagen ${imgFilename}: ${error}`)
		res.status(404).send({ error: 'Image not found' })
	}
})

export default router
