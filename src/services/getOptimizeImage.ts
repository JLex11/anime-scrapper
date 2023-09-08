import NodeCache from 'node-cache'
import sharp from 'sharp'
import { s3HeadOperation, s3PutOperation } from './clouflareR2'
import { requestBufferWithCache } from './requestWithCache'

const cacheDefaultConfig = { stdTTL: 604800, useClones: false }
const requestCache = new NodeCache(cacheDefaultConfig)

type OptimizeOptions = {
  width?: number
  height?: number
  effort?: number
}

type GetOptimizedImage = (link: string, name: string, options?: OptimizeOptions) => Promise<string | null>

const dfOptions = {
  width: 350,
  height: 500,
  effort: 6,
}

export const getOptimizeImage: GetOptimizedImage = async (url, name, options = dfOptions) => {
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
    console.log('image not found')
  }

  const imageArrayBuffer = await requestBufferWithCache(url, { ttl: 86400 }).catch(() => null)
  if (!imageArrayBuffer) return null

  const outputImageBuffer = await getOptimizedImageBuffer(imageArrayBuffer, options)
  if (!outputImageBuffer) return null

  try {
    const s3PutImageResponse = await s3PutOperation({
      filename: imageName,
      fileBuffer: outputImageBuffer,
    })
    
    return s3PutImageResponse.url
  } catch (error) {
    console.log('error uploading image')
    return null
  }
}

async function getOptimizedImageBuffer(imageArrayBuffer: Buffer, options: OptimizeOptions) {
  const { width, height, effort } = options

  return sharp(Buffer.from(imageArrayBuffer))
    .resize(width, height)
    .webp({ effort })
    .toBuffer()
    .catch(error => {
      console.log('error optimizing image')
      return null
    })
}
