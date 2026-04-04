import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET, R2_SIGNED_URL_TTL_SECONDS } from '../config/env'
import { signedUrlCache } from './cacheService'
import { decodeImageToken } from '../utils/imageToken'

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

export const createSignedR2GetUrlByKey = async (objectKey: string, ttlSeconds = R2_SIGNED_URL_TTL_SECONDS) => {
	const cacheKey = `r2:signed:${objectKey}`
	const cached = signedUrlCache.get<string>(cacheKey)
	if (cached) return cached

	const url = await getSignedUrl(
		client,
		new GetObjectCommand({
			Bucket: R2_BUCKET,
			Key: objectKey,
		}),
		{ expiresIn: ttlSeconds },
	)

	signedUrlCache.set(cacheKey, url)
	return url
}

export const createSignedR2GetUrlByToken = async (imageToken: string, ttlSeconds = R2_SIGNED_URL_TTL_SECONDS) => {
	const objectKey = decodeImageToken(imageToken)
	if (!objectKey) {
		return null
	}

	return createSignedR2GetUrlByKey(objectKey, ttlSeconds)
}
