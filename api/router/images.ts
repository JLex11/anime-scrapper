import { Router as RouterApp } from 'express'
import { endPoints } from '../../src/enums'
import { s3GetOperation } from '../../src/services/cloudflareR2'
import { longCache } from '../../src/middleware/expressCache'
import { logger } from '../../src/utils/logger'
import { optimizeImage } from '../../src/services/imageOptimizer'

const router = RouterApp()

// Las imágenes son ideales para caché largo ya que rara vez cambian
router.get(endPoints.IMAGES, longCache, async (req, res) => {
	const { imgFilename } = req.params
	const { width, height, format, quality } = req.query

	try {
		// Obtener la imagen del storage
		const s3Response = await s3GetOperation({ filename: imgFilename })
		
		if (!s3Response?.Body) {
			res.status(404).send({ error: 'Image not found' })
			return
		}

		let imgBuffer = s3Response.Body as Buffer

		// Si se solicitaron parámetros de optimización, procesamos la imagen
		if (width || height || format || quality) {
			try {
				const optimizedBuffer = await optimizeImage(imgBuffer, {
					width: width ? Number.parseInt(width as string, 10) : undefined,
					height: height ? Number.parseInt(height as string, 10) : undefined,
					format: format as 'webp' | 'jpeg' | 'png' | 'avif' || 'webp',
					quality: quality ? Number.parseInt(quality as string, 10) : undefined,
				})

				if (optimizedBuffer) {
					imgBuffer = optimizedBuffer
				}
			} catch (optimizeError) {
				logger.error(`Error optimizando imagen ${imgFilename}: ${optimizeError}`)
				// Continuamos con la imagen original si hay error en la optimización
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
