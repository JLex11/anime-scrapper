import NodeCache from 'node-cache'
import sharp from 'sharp'
import { requestBufferWithCache } from './requestWithCache'

const cacheDefaultConfig = { stdTTL: 604800, useClones: false }
const requestCache = new NodeCache(cacheDefaultConfig)

interface GetOptimizedImage {
  (
    imageLink: string,
    options?: {
      width?: number
      height?: number
      effort?: number
    }
  ): Promise<string>
}

const dfOptions = {
  width: 300,
  height: 450,
  effort: 6
}

export const getOptimizeImage: GetOptimizedImage = async (imageLink, options = dfOptions) => {
  const { width, height, effort } = options

  const imageArrayBuffer = await requestBufferWithCache(imageLink, { ttl: 86400 })
  if (imageArrayBuffer == null) return imageLink

  const cacheKey = imageLink
  const cacheResource = requestCache.get<ResponseType>(cacheKey)

  if (cacheResource) return cacheResource

  const outputImageBuffer = await sharp(Buffer.from(imageArrayBuffer))
    .resize(width, height)
    .webp({ effort })
    .toBuffer()

  const base64Image = `data:image/webp;base64,${outputImageBuffer.toString('base64')}`
  //const imageName = `${new URL(imageLink).pathname.split('/').join('-').replace(/\.[a-zA-Z]+/, '')}.webp`

  requestCache.set(cacheKey, base64Image, cacheDefaultConfig.stdTTL)
  return base64Image
}