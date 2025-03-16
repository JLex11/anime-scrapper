import NodeCache from 'node-cache'
import sharp from 'sharp'
import logger from '../utils/logger'
import { s3HeadOperation, s3PutOperation } from './cloudflareR2'
import { requestBufferWithCache } from './requestWithCache'

interface OptimizeOptions {
	width?: number
	height?: number
	effort?: number
}

type GetOptimizedImage = (link: string, name: string, options?: OptimizeOptions) => Promise<string | null>

const cacheDefaultConfig = { stdTTL: 604800, useClones: false }
const requestCache = new NodeCache(cacheDefaultConfig)
const TTL_24H = 86400
const dfOptions = { width: 350, height: 500, effort: 6 }

const handleS3HeadOperationError = (error: unknown) => logger.error('image not found')

const handleGetOptimizedImageBufferError = (error: unknown) => {
	logger.error(`error optimizing image => ${error}`)
	return null
}

const handleS3PutOperationError = (error: unknown) => {
	logger.error(`error uploading image to s3 => ${error}`)
	return null
}

export const getOptimizedImage: GetOptimizedImage = async (url, name, options = dfOptions) => {
	const cacheUrl = requestCache.get<string>(url)
	if (cacheUrl) return cacheUrl

	const imageName = `${name}.webp`

	try {
		const s3ImageResponse = await s3HeadOperation({ filename: imageName })
		if (!s3ImageResponse.$response?.error) {
			requestCache.set(url, s3ImageResponse.url, cacheDefaultConfig.stdTTL)
			return s3ImageResponse.url
		}
	} catch (error) {
		handleS3HeadOperationError(error)
	}

	const imageArrayBuffer = await requestBufferWithCache(url, { ttl: TTL_24H }).catch(() => null)
	if (!imageArrayBuffer) return null

	const outputImageBuffer = await getOptimizedImageBuffer(imageArrayBuffer, options).catch(handleGetOptimizedImageBufferError)
	if (!outputImageBuffer) return null

	try {
		const s3PutImageResponse = await s3PutOperation({
			filename: imageName,
			fileBuffer: outputImageBuffer,
		})

		return s3PutImageResponse.url
	} catch (error) {
		return handleS3PutOperationError(error)
	}
}

async function getOptimizedImageBuffer(imageArrayBuffer: ArrayBuffer, options: OptimizeOptions) {
	const { width, height, effort } = options
	return await sharp(Buffer.from(imageArrayBuffer)).resize(width, height).webp({ effort }).toBuffer()
}
