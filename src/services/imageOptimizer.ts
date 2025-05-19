import sharp from 'sharp'
import { logger } from '../utils/logger'
import { defaultCache } from './cacheService'

// Configuración predeterminada para optimización de imágenes
const DEFAULT_QUALITY = 80
const DEFAULT_WIDTH = 800
const DEFAULT_FORMAT = 'webp'

// Opciones de formato para diferentes tipos de imágenes
const FORMAT_OPTIONS = {
	webp: { quality: DEFAULT_QUALITY },
	jpeg: { quality: DEFAULT_QUALITY, progressive: true },
	png: { compressionLevel: 8, progressive: false },
	avif: { quality: DEFAULT_QUALITY },
}

interface OptimizeImageOptions {
	width?: number
	height?: number
	fit?: keyof sharp.FitEnum
	format?: 'webp' | 'jpeg' | 'png' | 'avif'
	quality?: number
}

/**
 * Optimiza una imagen a partir de un buffer
 */
export const optimizeImage = async (buffer: Buffer, options: OptimizeImageOptions = {}): Promise<Buffer | null> => {
	const { width = DEFAULT_WIDTH, height, fit = 'inside', format = DEFAULT_FORMAT as 'webp' | 'jpeg' | 'png' | 'avif', quality = DEFAULT_QUALITY } = options

	try {
		let processor = sharp(buffer, {
			failOn: 'truncated',
			limitInputPixels: 268402689, // Límite seguro para imágenes (16384^2)
			sequentialRead: true, // Mejora el rendimiento en archivos grandes
		})

		if (width || height) {
			processor = processor.resize({
				width,
				height,
				fit: fit,
				withoutEnlargement: true,
				fastShrinkOnLoad: true, // Mejora de rendimiento para reducciones grandes
			})
		}

		const formatOptions = { ...FORMAT_OPTIONS[format] }
		if (quality && quality !== DEFAULT_QUALITY) {
			if ('quality' in formatOptions) {
				formatOptions.quality = quality
			}
		}

		if (format === 'webp') {
			processor = processor.webp({
				...formatOptions,
				smartSubsample: true, // Mejora la calidad
				alphaQuality: 90, // Mejor calidad del canal alfa
			})
		}
		if (format === 'jpeg') {
			processor = processor.jpeg({
				...formatOptions,
				trellisQuantisation: true, // Mejor compresión
				overshootDeringing: true, // Mejor calidad en bordes
			})
		}
		if (format === 'png') {
			processor = processor.png({
				...formatOptions,
				palette: true, // Usar paleta para PNG con pocos colores
			})
		}
		if (format === 'avif') {
			processor = processor.avif({
				...formatOptions,
				effort: 9,
			})
		}

		return await processor.toBuffer()
	} catch (error) {
		logger.error(`Error optimizando imagen: ${error instanceof Error ? error.message : String(error)}`)
		return null
	}
}

/**
 * Optimiza una imagen a partir de una URL
 */
export const optimizeImageFromUrl = async (url: string, options: OptimizeImageOptions = {}): Promise<Buffer | null> => {
	// Generar una clave de caché única basada en la URL y las opciones
	const cacheKey = `img:${url}:${JSON.stringify(options)}`

	try {
		// Intenta obtener la imagen optimizada del caché
		const cachedImage = defaultCache.get<Buffer>(cacheKey)
		if (cachedImage) {
			return cachedImage
		}

		// Si no está en caché, descarga la imagen con un timeout adecuado
		const response = await fetch(url, {
			headers: {
				'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
			},
			signal: AbortSignal.timeout(10000), // 10 segundos timeout
		})

		if (!response.ok) {
			throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`)
		}

		// Convertir la respuesta a un buffer
		const arrayBuffer = await response.arrayBuffer()
		const buffer = Buffer.from(arrayBuffer)

		// Optimizar la imagen
		const optimizedBuffer = await optimizeImage(buffer, options)
		if (!optimizedBuffer) {
			throw new Error('Failed to optimize image')
		}

		// Guardar en caché por 24 horas
		defaultCache.set(cacheKey, optimizedBuffer)

		return optimizedBuffer
	} catch (error) {
		logger.error(`Error con imagen desde URL ${url}: ${error instanceof Error ? error.message : String(error)}`)
		return null
	}
}

/**
 * Devuelve la extensión de archivo para un formato
 */
export const getExtensionForFormat = (format: string): string => {
	switch (format) {
		case 'jpeg':
			return '.jpg'
		default:
			return `.${format}`
	}
}
