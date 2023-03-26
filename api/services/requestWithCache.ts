import NodeCache from 'node-cache'
import { ResponseType } from '../enums'

const cacheDefaultConfig = { stdTTL: 10800, useClones: false }

const requestCache = new NodeCache(cacheDefaultConfig)

interface FetchResponse {
  response: Response | null
  resource: any
}

interface RequestCacheInit extends RequestInit {
  ttl?: number
}

interface FetchAndCache {
  (
    url: string,
    config?: RequestCacheInit,
    responseType?: ResponseType
  ): Promise<FetchResponse>
}

const fetchAndCache: FetchAndCache = async (url, config, responseType) => {
  const cacheKey = JSON.stringify({ url, config })

  const cachePromise = new Promise<FetchResponse>(resolve => {
    const cacheResource = requestCache.get<ResponseType>(cacheKey)

    if (cacheResource != null) {
      //console.log(`From cache: ${cacheKey}`)
      resolve({
        response: null,
        resource: cacheResource
      })
    }
  })

  const responsePromise = fetch(url, config).then(async response => {
    const resource = responseType === ResponseType.JSON
      ? await response.json()
      : responseType === ResponseType.TEXT
        ? await response.text()
        : await response.arrayBuffer()
    requestCache.set(cacheKey, resource, config?.ttl ?? cacheDefaultConfig.stdTTL)
    return { response, resource }
  })

  return await Promise.race([cachePromise, responsePromise])
}

interface RequestWithCache {
  (url: string, config?: RequestCacheInit): Promise<any>
}

export const requestJsonWithCache: RequestWithCache = async (url, config): Promise<Object | undefined> => {
  const { resource } = await fetchAndCache(url, config, ResponseType.JSON)
  return resource
}

export const requestTextWithCache: RequestWithCache = async (url, config): Promise<string | undefined> => {
  const { resource } = await fetchAndCache(url, config, ResponseType.TEXT)
  return resource
}

export const requestBufferWithCache: RequestWithCache = async (url, config): Promise<string | undefined> => {
  const { resource } = await fetchAndCache(url, config, ResponseType.BUFFER)
  return resource
}
