import { S3Client } from '@aws-sdk/client-s3'

const MY_R2_ACCOUNT_ID = 'b3baa81851cc15c684c831bc1f0571ea'
const MY_R2_ACCESS_KEY_ID = 'fc881d2852c2125b949daaa1210cc912'
const MY_R2_SECRET_ACCESS_KEY_ID = '7435d831c95cad07e4dda38fbc913271f697952776dce0f0dab2942d3c0a2c4b'
const MY_R2_BUCKET = 'anime-app'
const MY_R2_API_URL = `https://${MY_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`

const client = new S3Client({
	endpoint: MY_R2_API_URL,
	credentials: {
		accessKeyId: MY_R2_ACCESS_KEY_ID,
		secretAccessKey: MY_R2_SECRET_ACCESS_KEY_ID,
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
	const putObjectRequest = await client.send(new PutObjectCommand({ Bucket: MY_R2_BUCKET, Key: filename, Body: fileBuffer }))

	return {
		...putObjectRequest,
		url: `image/${filename}`,
	}
}

export async function s3HeadOperation({ filename }: S3HeadOrGetOperation) {
	const { HeadObjectCommand } = await import('@aws-sdk/client-s3')
	const headObjectRequest = await client.send(new HeadObjectCommand({ Bucket: MY_R2_BUCKET, Key: filename }))

	return {
		...headObjectRequest,
		url: `image/${filename}`,
	}
}

export async function s3GetOperation({ filename }: S3HeadOrGetOperation) {
	const { GetObjectCommand } = await import('@aws-sdk/client-s3')
	const getObjectRequest = await client.send(new GetObjectCommand({ Bucket: MY_R2_BUCKET, Key: filename }))
	return getObjectRequest
}
