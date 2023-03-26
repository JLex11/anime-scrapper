import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import * as dotenv from 'dotenv'
dotenv.config()

const { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_S3_REGION, AWS_S3_BUCKET } = process.env

const client = new S3Client({
  region: AWS_S3_REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID!,
    secretAccessKey: AWS_SECRET_ACCESS_KEY!,
  },
})

export async function uploadFileToS3(fileBuffer: Buffer, fileName: string) {
  const command = new PutObjectCommand({
    Bucket: AWS_S3_BUCKET,
    Key: fileName,
    Body: fileBuffer,
    ContentLength: fileBuffer.length,
  })

  await client.send(command)

  return `https://${AWS_S3_BUCKET}.s3.${AWS_S3_REGION}.amazonaws.com/${fileName}`
}

export async function getFileFromS3(fileName: string) {
  const command = new GetObjectCommand({
    Bucket: AWS_S3_BUCKET!,
    Key: fileName,
  })

  try {
    const getOjectResponse = await client.send(command)
    return getOjectResponse
  } catch (error) {
    console.error(error)
    return
  }
}