import { HeadObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import * as dotenv from 'dotenv'
dotenv.config()

const MY_AWS_ACCESS_KEY_ID = process.env.MY_AWS_ACCESS_KEY_ID
const MY_AWS_SECRET_ACCESS_KEY = process.env.MY_AWS_SECRET_ACCESS_KEY
const MY_AWS_S3_REGION = process.env.MY_AWS_S3_REGION
const MY_AWS_S3_BUCKET = process.env.MY_AWS_S3_BUCKET

const client = new S3Client({
  region: MY_AWS_S3_REGION,
  credentials: {
    accessKeyId: MY_AWS_ACCESS_KEY_ID!,
    secretAccessKey: MY_AWS_SECRET_ACCESS_KEY!,
  },
})

/*

const authorization = MY_AWS_ACCESS_KEY_ID;

async function fetchImage() {
  const url = `https://${MY_AWS_S3_BUCKET}.s3.${MY_AWS_S3_REGION}.amazonaws.com/${fileName}`;
  const headers = new Headers();
  headers.append('Host', bucketName);
  headers.append('Date', new Date().toUTCString());
  headers.append('x-amz-date', new Date().toUTCString());
  headers.append('Authorization', authorization);

  const response = await fetch(url, {
    method: 'GET',
    headers: headers,
  });

  if (response.status === 200) {
    const imageData = await response.blob();

    // Do something with the image data...
  } else {
    console.log('Error fetching image:', response.status);
  }
}

fetchImage();


*/

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

  return
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
}

async function s3GetOperation({ fileName }: { fileName: string }) {
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
}