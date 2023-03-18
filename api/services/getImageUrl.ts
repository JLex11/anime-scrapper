import NodeCache from 'node-cache'
import sharp from 'sharp'
import { requestBufferWithCache } from './requestWithCache'

const cacheDefaultConfig = { stdTTL: 604800, useClones: false }
const requestCache = new NodeCache(cacheDefaultConfig)

export const getImageUrl = async (imageLink: string): Promise<string> => {
  const imageArrayBuffer = await requestBufferWithCache(imageLink, { ttl: 86400 })
  if (imageArrayBuffer == null) return imageLink

  const cacheKey = imageLink
  const cacheResource = requestCache.get<ResponseType>(cacheKey)

  if (cacheResource != null) return cacheResource

  const outputImageBuffer = await sharp(Buffer.from(imageArrayBuffer))
    .resize(300, 450)
    .webp({ effort: 6 })
    .toBuffer()

    const base64Image = `data:image/webp;base64,${outputImageBuffer.toString('base64')}`
  //const imageName = `${new URL(imageLink).pathname.split('/').join('-').replace(/\.[a-zA-Z]+/, '')}.webp`

  requestCache.set(cacheKey, base64Image, cacheDefaultConfig.stdTTL)
  return base64Image
}