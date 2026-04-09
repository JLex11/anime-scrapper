const MAX_OBJECT_KEY_LENGTH = 1024

const normalizeObjectKey = (objectKey: string) => {
	const withoutLeadingSlashes = objectKey.replace(/^\/+/, '')
	const withoutLegacyPrefix = withoutLeadingSlashes.replace(/^image\/+/, '')
	return withoutLegacyPrefix
}

const getUrlPathname = (value: string) => {
	try {
		if (value.startsWith('http://') || value.startsWith('https://')) {
			return new URL(value).pathname
		}

		if (value.startsWith('//')) {
			return new URL(`https:${value}`).pathname
		}
	} catch {
		return value
	}

	return value
}

export const encodeImageKey = (objectKey: string) => {
	return Buffer.from(objectKey, 'utf8').toString('base64url')
}

export const decodeImageToken = (token: string) => {
	try {
		const decodedKey = Buffer.from(token, 'base64url').toString('utf8').trim()
		const objectKey = normalizeObjectKey(decodedKey)
		if (objectKey.length === 0 || objectKey.length > MAX_OBJECT_KEY_LENGTH) return null
		if (objectKey.includes('\0')) return null
		return objectKey
	} catch {
		return null
	}
}

export const getLegacyImageKey = (value: string | null | undefined) => {
	if (!value) return null

	const normalizedValue = getUrlPathname(value)
	const objectKeyCandidate = normalizeObjectKey(normalizedValue)
	if (/^\/?(?:image|uploads)\//.test(normalizedValue) && objectKeyCandidate.length > 0) {
		return objectKeyCandidate
	}

	const marker = '/api/image/'
	const markerIndex = normalizedValue.indexOf(marker)
	if (markerIndex < 0) return null

	const rawKey = normalizedValue.slice(markerIndex + marker.length).split('?')[0]
	if (!rawKey) return null

	const decodedToken = decodeImageToken(rawKey)
	if (decodedToken) return decodedToken

	try {
		return normalizeObjectKey(decodeURIComponent(rawKey))
	} catch {
		return normalizeObjectKey(rawKey)
	}
}
