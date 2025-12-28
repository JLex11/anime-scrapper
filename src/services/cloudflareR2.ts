import { S3Client } from '@aws-sdk/client-s3'
import { R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET } from '../config/env'

const MY_R2_API_URL = `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`

const client = new S3Client({
	endpoint: MY_R2_API_URL,
	credentials: {
		accessKeyId: R2_ACCESS_KEY_ID,
		secretAccessKey: R2_SECRET_ACCESS_KEY,
	},
	region: 'auto',
})

interface S3PutOperation {
	filename: string
	fileBuffer: Buffer
}

interface S3HeadOrGetOperation {
	filename: string
}

export async function s3PutOperation({ filename, fileBuffer }: S3PutOperation) {
	const { PutObjectCommand } = await import('@aws-sdk/client-s3')
	const putObjectRequest = await client.send(new PutObjectCommand({ Bucket: R2_BUCKET, Key: filename, Body: fileBuffer }))

	return {
		...putObjectRequest,
		url: `image/${filename}`,
	}
}

export async function s3HeadOperation({ filename }: S3HeadOrGetOperation) {
	const { HeadObjectCommand } = await import('@aws-sdk/client-s3')
	const headObjectRequest = await client.send(new HeadObjectCommand({ Bucket: R2_BUCKET, Key: filename }))

	return {
		...headObjectRequest,
		url: `image/${filename}`,
	}
}

export async function s3GetOperation({ filename }: S3HeadOrGetOperation) {
	const { GetObjectCommand } = await import('@aws-sdk/client-s3')
	const getObjectRequest = await client.send(new GetObjectCommand({ Bucket: R2_BUCKET, Key: filename }))
	return getObjectRequest
}
