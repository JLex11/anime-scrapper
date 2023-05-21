import { HeadObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import * as dotenv from 'dotenv'
dotenv.config()

const MY_AWS_ACCESS_KEY_ID = 'AKIASXMGBSOAZQXCS3GM' //process.env.MY_AWS_ACCESS_KEY_ID
const MY_AWS_SECRET_ACCESS_KEY = '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' //process.env.MY_AWS_SECRET_ACCESS_KEY
const MY_AWS_S3_BUCKET = 'anime-app' //process.env.MY_AWS_S3_BUCKET
const MY_AWS_S3_REGION = 'us-east-1' //process.env.MY_AWS_S3_REGION

const client = new S3Client({
  region: MY_AWS_S3_REGION,
  credentials: {
    accessKeyId: MY_AWS_ACCESS_KEY_ID!,
    secretAccessKey: MY_AWS_SECRET_ACCESS_KEY!,
  },
})

interface S3Request {
  operation: 'putObject' | 'getObject'
  fileName: string
  fileBuffer?: Buffer
}

export async function s3Request({ operation, fileName, fileBuffer }: S3Request) {
  if (operation === 'putObject') {
    return s3PutOperation({ fileName, fileBuffer: fileBuffer! })
  }

  if (operation === 'getObject') {
    return s3GetOperation({ fileName })
  }

  return undefined
}

interface S3PutOperation {
  fileName: string
  fileBuffer: Buffer
}

async function s3PutOperation({ fileName, fileBuffer }: S3PutOperation) {
  const command = new PutObjectCommand({
    Bucket: MY_AWS_S3_BUCKET,
    Key: fileName,
    Body: fileBuffer,
    ContentLength: fileBuffer.length,
  })

  await client.send(command)
  return `https://${MY_AWS_S3_BUCKET}.s3.${MY_AWS_S3_REGION}.amazonaws.com/${fileName}`

  /* const blob = new Blob([fileBuffer])

  const request = new Request(`https://s3.amazonaws.com/${MY_AWS_S3_BUCKET}/${fileName}`, {
    method: 'PUT',
    body: blob,
    headers: {
      Authorization: `Bearer ${MY_AWS_ACCESS_KEY_ID}:${MY_AWS_SECRET_ACCESS_KEY}`,
    },
  })

  const response = await fetch(request)
  console.log(response)

  return `https://${MY_AWS_S3_BUCKET}.s3.${MY_AWS_S3_REGION}.amazonaws.com/${fileName}` */
}

async function s3GetOperation({ fileName }: { fileName: string }): Promise<string | undefined> {
  const command = new HeadObjectCommand({
    Bucket: MY_AWS_S3_BUCKET!,
    Key: fileName,
  })

  try {
    await client.send(command)
    return `https://${MY_AWS_S3_BUCKET}.s3.${MY_AWS_S3_REGION}.amazonaws.com/${fileName}`
  } catch (error) {
    return
  }

  /* const request = new Request(`https://s3.amazonaws.com/${MY_AWS_S3_BUCKET}/${fileName}`, {
    method: 'HEAD',
  })

  return fetch(request)
    .then(response => {
      console.log(response)
      return `https://${MY_AWS_S3_BUCKET}.s3.${MY_AWS_S3_REGION}.amazonaws.com/${fileName}`
    })
    .catch(error => {
      return undefined
    }) */
}
