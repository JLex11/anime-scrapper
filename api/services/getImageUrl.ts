import fs from 'fs'
import NodeCache from 'node-cache'
import path from 'path'
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
    .webp({ effort: 6 })
    .toBuffer()

  const imageName = `${new URL(imageLink).pathname.split('/').join('-').replace(/\.[a-zA-Z]+/, '')}.webp`
  const imagePath = path.join(process.cwd(), 'public', 'images', imageName)
  const imageUrl = `/images/${imageName}`

  await fs.promises.writeFile(imagePath, outputImageBuffer).catch(console.log)

  requestCache.set(cacheKey, imageUrl, cacheDefaultConfig.stdTTL)
  return imageUrl
}