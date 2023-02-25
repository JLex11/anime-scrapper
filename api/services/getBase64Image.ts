import NodeCache from 'node-cache'
import sharp from 'sharp'
import { requestBufferWithCache } from './requestWithCache'

const cacheDefaultConfig = { stdTTL: 604800, useClones: false }
const requestCache = new NodeCache(cacheDefaultConfig)

export const getBase64Image = async (imageLink: string): Promise<string> => {
  const imageArrayBuffer = await requestBufferWithCache(imageLink, { ttl: 86400 })
  if (imageArrayBuffer == null) return imageLink

  const cacheKey = imageLink

  const cacheResource = requestCache.get<ResponseType>(cacheKey)

  if (cacheResource != null) {
    console.log(`From cache: $${cacheKey}`)
    return cacheResource
  }

  const outputImageBuffer = await sharp(Buffer.from(imageArrayBuffer))
    .resize(200, 300)
    .webp({ effort: 6, quality: 60 })
    .toBuffer()

  const base64Image = outputImageBuffer.toString('base64')
  const image = `data:image/webp;base64,${base64Image}`

  requestCache.set(cacheKey, image, cacheDefaultConfig.stdTTL)
  return image
}
