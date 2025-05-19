import { IMG_POSITIONS, LANDSCAPE_DIMENSIONS } from '../enums'
import type { GoogleImage } from '../googleTypes'
import type { CarouselImage } from '../types'
import logger from '../utils/logger'
import { getGoogleImage } from './getGoogleImage'
import { getOptimizedImage } from './getOptimizeImage'
import { requestBufferWithCache } from './requestWithCache'

function determinateImgPosition(image: GoogleImage) {
	const aspectRatioThreshold = 1.5
	return image?.width / image?.height >= aspectRatioThreshold ? IMG_POSITIONS.CENTER : IMG_POSITIONS.TOP
}

export function buildImageObject(link: string, image?: GoogleImage): CarouselImage {
	return {
		link,
		position: image ? determinateImgPosition(image) : IMG_POSITIONS.CENTER,
		width: image?.width || 1080,
		height: image?.height || 1920,
	}
}

const predefinedWords = ['anime']

/**
 * Verifica si una imagen es válida y puede cargarse correctamente
 * @param imageUrl URL de la imagen a validar
 * @returns true si la imagen es válida, false si está rota o no se puede cargar
 */
async function isValidImage(imageUrl: string): Promise<boolean> {
	try {
		// Intentamos obtener el buffer de la imagen
		const imageBuffer = await requestBufferWithCache(imageUrl, { ttl: 3600 }).catch(() => null)

		// Si no se puede obtener el buffer, la imagen está rota
		if (!imageBuffer) {
			logger.warn(`Imagen rota o inaccesible: ${imageUrl}`)
			return false
		}

		// Si llegamos aquí, la imagen se pudo descargar correctamente
		return true
	} catch (error) {
		logger.error(`Error al validar imagen ${imageUrl}: ${error}`)
		return false
	}
}

/**
 * Obtiene una sola imagen de carrusel, intentando con varias imágenes de Google hasta encontrar una válida
 * @param keywords Palabras clave para buscar la imagen
 * @param maxAttempts Número máximo de intentos (por defecto 3)
 * @returns Una imagen de carrusel o null si no se pudo obtener ninguna válida
 */
export const getCarouselImage = async (keywords: string[] | string, maxAttempts = 3): Promise<CarouselImage | null> => {
	const keywordsArr = Array.isArray(keywords) ? keywords : [keywords]
	const keywordsString = keywordsArr.join('-')
	const query = [...keywordsArr, ...predefinedWords].join(' ')

	logger.info(`Buscando imágenes para: ${query} con ${maxAttempts} intentos máximos`)

	try {
		const googleImageItems = await getGoogleImage(query, { num: maxAttempts.toString() })

		if (!googleImageItems.length) {
			logger.warn('No se encontraron imágenes en Google')
			return null
		}

		for (let i = 0; i < googleImageItems.length; i++) {
			const item = googleImageItems[i]
			if (!item.link) {
				logger.warn(`Imagen ${i + 1} sin enlace`)
				continue
			}

			const image = buildImageObject(item.link, item.image)

			if (!image.link) {
				logger.warn(`Imagen ${i + 1} sin enlace después de construir el objeto`)
				continue
			}

			logger.info(`Verificando validez de imagen ${i + 1} de ${googleImageItems.length}`)
			const isValid = await isValidImage(image.link)
			if (!isValid) {
				logger.warn(`Imagen ${i + 1} inválida, probando con la siguiente`)
				continue
			}

			const imageName = `${keywordsString}-carouselImage`
			const options = {
				width: LANDSCAPE_DIMENSIONS.WIDTH,
				height: LANDSCAPE_DIMENSIONS.HEIGHT,
				effort: 6,
			}

			if (!image.link) continue

			logger.info(`Optimizando imagen ${i + 1}`)
			const optimizedImageUrl = await getOptimizedImage(image.link, imageName, options)

			if (optimizedImageUrl) {
				image.link = optimizedImageUrl
				logger.info(`Imagen ${i + 1} procesada correctamente`)
				return image
			}

			logger.warn(`No se pudo optimizar la imagen ${i + 1}`)
		}

		logger.error(`Ninguna de las ${googleImageItems.length} imágenes resultó válida`)
		return null
	} catch (error) {
		logger.error(`Error al procesar imágenes: ${error}`)
		return null
	}
}

export const getCarouselImages = async (keywords: string[] | string, maxAttempts = 3): Promise<CarouselImage[]> => {
	const image = await getCarouselImage(keywords, maxAttempts)
	console.log('getCarouselImages', image)
	return image ? [image] : []
}
