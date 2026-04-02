import { S3Client } from '@aws-sdk/client-s3'
import { Sha256 } from '@aws-crypto/sha256-js'
import { HttpRequest } from '@smithy/protocol-http'
import { SignatureV4 } from '@smithy/signature-v4'
import { R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET, R2_SIGNED_URL_TTL_SECONDS } from '../config/env'
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

const signer = new SignatureV4({
	service: 's3',
	region: 'auto',
	sha256: Sha256,
	credentials: {
		accessKeyId: R2_ACCESS_KEY_ID,
		secretAccessKey: R2_SECRET_ACCESS_KEY,
	},
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

const encodePathKey = (objectKey: string) => objectKey.split('/').map(encodeURIComponent).join('/')

export const createSignedR2GetUrlByKey = async (objectKey: string, ttlSeconds = R2_SIGNED_URL_TTL_SECONDS) => {
	const request = new HttpRequest({
		protocol: 'https:',
		hostname: `${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
		method: 'GET',
		path: `/${R2_BUCKET}/${encodePathKey(objectKey)}`,
	})

	const signedRequest = await signer.presign(request, { expiresIn: ttlSeconds })
	const url = new URL(`${signedRequest.protocol}//${signedRequest.hostname}${signedRequest.path}`)

	for (const [key, value] of Object.entries(signedRequest.query || {})) {
		if (Array.isArray(value)) {
			for (const item of value) {
				url.searchParams.append(key, item)
			}
		} else if (value != null) {
			url.searchParams.set(key, value)
		}
	}

	return url.toString()
}

export const createSignedR2GetUrlByToken = async (imageToken: string, ttlSeconds = R2_SIGNED_URL_TTL_SECONDS) => {
	const objectKey = decodeImageToken(imageToken)
	if (!objectKey) {
		return null
	}

	return createSignedR2GetUrlByKey(objectKey, ttlSeconds)
}
