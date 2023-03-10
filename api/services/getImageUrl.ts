import NodeCache from 'node-cache'
import fs from 'node:fs/promises'
import path from 'path'
import sharp from 'sharp'
import app from '../index'
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

  const imageName = `${new URL(imageLink).pathname.split('/').join('-').replace(/\.[a-zA-Z]+/, '')}.webp`
  const imagePath = path.join(app.get('public'), 'images', imageName)
  const imageUrl = `/images/${imageName}`

  try {
    await fs.access(path.join(app.get('public'), 'images'))
  } catch (error) {
    console.error(error)
    await fs.mkdir(path.join(app.get('public'), 'images'), { recursive: true })
  }
  
  await fs.writeFile(imagePath, outputImageBuffer).catch(console.error)

  requestCache.set(cacheKey, imageUrl, cacheDefaultConfig.stdTTL)
  return imageUrl
}