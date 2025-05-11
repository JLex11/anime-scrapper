import { ResponseType } from '../enums'
import { defaultCache } from './cacheService'
import { logger } from '../utils/logger'

interface FetchResponse {
	response: Response | null
	resource: unknown | null
}

interface RequestCacheInit extends RequestInit {
	ttl?: number
}

type FetchAndCache = (url: string, config?: RequestCacheInit, responseType?: ResponseType) => Promise<FetchResponse>

const fetchAndCache: FetchAndCache = async (url, config, responseType) => {
	const cacheKey = `fetch:${url}:${JSON.stringify(config)}`

	try {
		// Intentar obtener del caché primero
		const cachedResource = defaultCache.get<unknown>(cacheKey)
		if (cachedResource != null) {
			return {
				response: null,
				resource: cachedResource,
			}
		}

		// Si no está en caché, realizar la petición
		const response = await fetch(url, {
			...config,
			// Agregar timeout para evitar peticiones que se quedan colgadas
			signal: config?.signal || AbortSignal.timeout(15000) // 15 segundos timeout
		})

		if (!response.ok || (response.status < 200 || response.status >= 300)) {
			throw new Error(`Request failed with status ${response.status}`)
		}

		let resource: unknown
		switch (responseType) {
			case ResponseType.JSON:
				resource = await response.json()
				break
			case ResponseType.TEXT:
				resource = await response.text()
				break
			default:
				resource = await response.arrayBuffer()
		}

		// Guardar en caché
		defaultCache.set(cacheKey, resource, config?.ttl)

		return { response, resource }
	} catch (error) {
		logger.error(`Error fetching ${url}: ${error instanceof Error ? error.message : String(error)}`)
		return { response: null, resource: null }
	}
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
