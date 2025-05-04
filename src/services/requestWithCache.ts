import NodeCache from 'node-cache'
import { ResponseType } from '../enums'

const cacheDefaultConfig = { stdTTL: 3600, useClones: false }

const requestCache = new NodeCache(cacheDefaultConfig)

interface FetchResponse {
	response: Response | null
	resource: unknown | null
}

interface RequestCacheInit extends RequestInit {
	ttl?: number
}

type FetchAndCache = (url: string, config?: RequestCacheInit, responseType?: ResponseType) => Promise<FetchResponse>

const fetchAndCache: FetchAndCache = async (url, config, responseType) => {
	const cacheKey = JSON.stringify({ url, config })

	const cachePromise = new Promise<FetchResponse>(resolve => {
		const cacheResource = requestCache.get<ResponseType>(cacheKey)

		if (cacheResource != null) {
			resolve({
				response: null,
				resource: cacheResource,
			})
		}
	})

	const responsePromise = fetch(url, config)
		.then(async response => {
			if (!response.ok) throw new Error(`Request failed with status ${response.status}`)

			const resource =
				responseType === ResponseType.JSON
					? await response.json()
					: responseType === ResponseType.TEXT
						? await response.text()
						: await response.arrayBuffer()

			requestCache.set(cacheKey, resource, config?.ttl ?? cacheDefaultConfig.stdTTL)

			return { response, resource }
		})
		.catch(() => {
			return { response: null, resource: null }
		})

	return await Promise.race([cachePromise, responsePromise])
}

type RequestWithCacheFn<T> = (url: string, config?: RequestCacheInit) => Promise<T | null>

export const requestJsonWithCache: RequestWithCacheFn<Record<string, unknown>> = async (url, config) => {
	const response = await fetchAndCache(url, config, ResponseType.JSON)
	return response?.resource as Record<string, unknown> | null
}

export const requestTextWithCache: RequestWithCacheFn<string> = async (url, config) => {
	const response = await fetchAndCache(url, config, ResponseType.TEXT)
	return response?.resource as string | null
}

export const requestBufferWithCache: RequestWithCacheFn<ArrayBuffer> = async (url, config) => {
	const response = await fetchAndCache(url, config, ResponseType.BUFFER)
	return response?.resource as ArrayBuffer | null
}
