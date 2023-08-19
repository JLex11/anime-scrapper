import { S3 } from 'aws-sdk'
import { getOriginPath } from '../config'
import { mapOriginPath } from '../utils/mapOriginPath'

const MY_R2_ACCOUNT_ID = 'b3baa81851cc15c684c831bc1f0571ea'
const MY_R2_ACCESS_KEY_ID = 'fc881d2852c2125b949daaa1210cc912'
const MY_R2_SECRET_ACCESS_KEY_ID = '7435d831c95cad07e4dda38fbc913271f697952776dce0f0dab2942d3c0a2c4b'
const MY_R2_BUCKET = 'anime-app'
const MY_R2_API_URL = `https://${MY_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`

const client = new S3({
  endpoint: MY_R2_API_URL,
  credentials: {
    accessKeyId: MY_R2_ACCESS_KEY_ID,
    secretAccessKey: MY_R2_SECRET_ACCESS_KEY_ID,
  },
  signatureVersion: 'v4',
})

interface S3PutOperation {
  filename: string
  fileBuffer: Buffer
}

interface S3HeadOrGetOperation {
  filename: string
}

export async function s3PutOperation({ filename, fileBuffer }: S3PutOperation) {
  const originPath = getOriginPath()
  const putObjectRequest = await client.putObject({ Bucket: MY_R2_BUCKET, Key: filename, Body: fileBuffer }).promise()
  return {
    ...putObjectRequest,
    url: mapOriginPath(originPath, `api/image/${filename}`),
  }
}

export async function s3HeadOperation({ filename }: S3HeadOrGetOperation) {
  const originPath = getOriginPath()
  const headObjectRequest = await client.headObject({ Bucket: MY_R2_BUCKET, Key: filename }).promise()

  return {
    ...headObjectRequest,
    url: mapOriginPath(originPath, `api/image/${filename}`),
  }
}

export async function s3GetOperation({ filename }: S3HeadOrGetOperation) {
  const getObjectRequest = await client.getObject({ Bucket: MY_R2_BUCKET, Key: filename }).promise()
  return getObjectRequest
}
