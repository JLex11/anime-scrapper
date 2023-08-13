import NodeCache from 'node-cache'
import { ResponseType } from '../enums'

const cacheDefaultConfig = { stdTTL: 3600, useClones: false }

const requestCache = new NodeCache(cacheDefaultConfig)

interface FetchResponse {
  response: Response | null
  resource: any | null
}

interface RequestCacheInit extends RequestInit {
  ttl?: number
}

interface FetchAndCache {
  (url: string, config?: RequestCacheInit, responseType?: ResponseType): Promise<FetchResponse | null>
}

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
      const resource =
        responseType === ResponseType.JSON
          ? await response.json()
          : responseType === ResponseType.TEXT
          ? await response.text()
          : await response.arrayBuffer()

      requestCache.set(cacheKey, resource, config?.ttl ?? cacheDefaultConfig.stdTTL)

      return { response, resource }
    })
    .catch(error => {
      console.error(error)
      return null
    })

  return await Promise.race([cachePromise, responsePromise])
}

type RequestWithCache = (url: string, config?: RequestCacheInit) => Promise<any | null>

export const requestJsonWithCache: RequestWithCache = async (url, config): Promise<Object | undefined> => {
  const response = await fetchAndCache(url, config, ResponseType.JSON)
  return response?.resource
}

export const requestTextWithCache: RequestWithCache = async (url, config): Promise<string | undefined> => {
  const response = await fetchAndCache(url, config, ResponseType.TEXT)
  return response?.resource
}

export const requestBufferWithCache: RequestWithCache = async (url, config): Promise<string | undefined> => {
  const response = await fetchAndCache(url, config, ResponseType.BUFFER)
  return response?.resource
}
