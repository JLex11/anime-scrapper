const MAX_OBJECT_KEY_LENGTH = 1024

export const encodeImageKey = (objectKey: string) => {
	return Buffer.from(objectKey, 'utf8').toString('base64url')
}

export const decodeImageToken = (token: string) => {
	try {
		const objectKey = Buffer.from(token, 'base64url').toString('utf8').trim()
		if (objectKey.length === 0 || objectKey.length > MAX_OBJECT_KEY_LENGTH) return null
		if (objectKey.includes('\0')) return null
		return objectKey
	} catch {
		return null
	}
}

export const getLegacyImageKey = (value: string | null | undefined) => {
	if (!value) return null

	if (value.startsWith('image/')) {
		return value.replace(/^image\//, '')
	}

	const marker = '/api/image/'
	const markerIndex = value.indexOf(marker)
	if (markerIndex < 0) return null

	const rawKey = value.slice(markerIndex + marker.length).split('?')[0]
	if (!rawKey) return null

	try {
		return decodeURIComponent(rawKey)
	} catch {
		return rawKey
	}
}
