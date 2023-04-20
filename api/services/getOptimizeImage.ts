import NodeCache from 'node-cache'
import sharp from 'sharp'
import { s3Request } from './awsS3Service'
import { requestBufferWithCache } from './requestWithCache'

const cacheDefaultConfig = { stdTTL: 604800, useClones: false }
const requestCache = new NodeCache(cacheDefaultConfig)

type OptimizeOptions = {
  width?: number
  height?: number
  effort?: number
}

interface GetOptimizedImage {
  (
    link: string,
    name: string,
    options?: OptimizeOptions
  ): Promise<string | undefined>
}

const dfOptions = {
  width: 350,
  height: 500,
  effort: 4,
}

export const getOptimizeImage: GetOptimizedImage = async (link, name, options = dfOptions) => {
  const imageArrayBuffer = await requestBufferWithCache(link, { ttl: 86400 })
  if (!imageArrayBuffer) return link

  const cacheKey = link
  const cacheResource = requestCache.get<ResponseType>(cacheKey)
  if (cacheResource) return cacheResource

  const imageName = `${name}.webp`

  const s3ImageUrl = await s3Request({ operation: 'getObject', fileName: imageName })
  if (s3ImageUrl) {
    requestCache.set(cacheKey, s3ImageUrl, cacheDefaultConfig.stdTTL)
    return s3ImageUrl
  }

  const outputImageBuffer = await getOptimizedImageBuffer(imageArrayBuffer, options)
  if (!outputImageBuffer) return '' //link

  const uploadedUrl = await s3Request({
    operation: 'putObject',
    fileName: imageName,
    fileBuffer: outputImageBuffer,
  })

  requestCache.set(cacheKey, uploadedUrl, cacheDefaultConfig.stdTTL)
  return uploadedUrl
}

async function getOptimizedImageBuffer(imageArrayBuffer: Buffer, options: OptimizeOptions) {
  const { width, height, effort } = options

  return sharp(Buffer.from(imageArrayBuffer))
    .resize(width, height)
    .webp({ effort })
    .toBuffer()
    .catch(error => {
      console.error(error)
      return null
    })
}
/* 
async function getImageUrlFromS3(imageName: string) {
  const s3Response = await getFileFromS3(imageName)
  return s3Response ? `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/${imageName}` : null
} */