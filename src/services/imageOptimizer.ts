import sharp from 'sharp'
import { defaultCache } from './cacheService'
import { logger } from '../utils/logger'

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
export const optimizeImage = async (
  buffer: Buffer,
  options: OptimizeImageOptions = {}
): Promise<Buffer | null> => {
  const {
    width = DEFAULT_WIDTH,
    height,
    fit = 'inside',
    format = DEFAULT_FORMAT as 'webp' | 'jpeg' | 'png' | 'avif',
    quality = DEFAULT_QUALITY,
  } = options

  try {
    // Crear un procesador de imagen con Sharp
    let processor = sharp(buffer)

    // Redimensionar la imagen si se proporciona ancho o alto
    if (width || height) {
      processor = processor.resize({
        width,
        height,
        fit: fit,
        withoutEnlargement: true,
      })
    }

    // Convertir al formato solicitado con las opciones adecuadas
    const formatOptions = { ...FORMAT_OPTIONS[format] }
    if (quality && quality !== DEFAULT_QUALITY) {
      formatOptions.quality = quality
    }

    // Aplicar formato y opciones
    switch (format) {
      case 'webp':
        processor = processor.webp(formatOptions)
        break
      case 'jpeg':
        processor = processor.jpeg(formatOptions)
        break
      case 'png':
        processor = processor.png(formatOptions)
        break
      case 'avif':
        processor = processor.avif(formatOptions)
        break
    }

    // Generar el buffer optimizado
    return await processor.toBuffer()
  } catch (error) {
    logger.error(`Error optimizando imagen: ${error instanceof Error ? error.message : String(error)}`)
    return null
  }
}

/**
 * Optimiza una imagen a partir de una URL
 */
export const optimizeImageFromUrl = async (
  url: string,
  options: OptimizeImageOptions = {}
): Promise<Buffer | null> => {
  // Generar una clave de caché única basada en la URL y las opciones
  const cacheKey = `img:${url}:${JSON.stringify(options)}`

  try {
    // Intenta obtener la imagen optimizada del caché
    const cachedImage = defaultCache.get<Buffer>(cacheKey)
    if (cachedImage) {
      return cachedImage
    }

    // Si no está en caché, descarga la imagen
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
    defaultCache.set(cacheKey, optimizedBuffer, 86400)

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
