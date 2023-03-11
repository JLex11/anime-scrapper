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
    .resize(250, 350)
    .webp({ effort: 3, quality: 90 })
    .toBuffer()

  // Genera un nombre único para la imagen
  const imageName = `${imageLink.split('/').pop()}.webp`

  // Guarda la imagen en el servidor
  const imagePath = path.join(__dirname, '../../images', imageName)
  await fs.promises.writeFile(imagePath, outputImageBuffer).catch(console.log)

  // Devuelve una URL que apunte a la ubicación de la imagen en el servidor
  const imageUrl = `/images/${imageName}`

  requestCache.set(cacheKey, imageUrl, cacheDefaultConfig.stdTTL)
  return imageUrl
}