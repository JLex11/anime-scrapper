/* import { GoogleApi } from '../enums'
import { GoogleRequestConfig, GoogleSearchResponse } from './../googleTypes.d' */
import { GoogleApi } from '../../api/enums'
import { GoogleRequestConfig, GoogleSearchResponse } from '../../api/googleTypes'
import { requestJsonWithCache } from './requestWithCache'

export const getGoogleImage = async (query: string, config?: GoogleRequestConfig) => {
  if (!query) return []

  const GOOGLE_API_KEY = 'AIzaSyDqy9qhMVsxLnEBlFYmBuOWsK8DAcAov-0' //process.env.GOOGLE_API_KEY

  const DEFAULT_CONFIG: GoogleRequestConfig = {
    imgOrientation: config?.imgOrientation ?? 'horizontal',
    searchType: config?.searchType ?? 'image',
    imgSize: config?.imgSize ?? 'huge',
    key: GOOGLE_API_KEY,
    cx: GoogleApi.SEARCH_ENGINE_ID,
    num: config?.num ?? '5',
  }

  const fullConfig = {
    ...DEFAULT_CONFIG,
    q: query,
  }

  const parameters = new URLSearchParams(fullConfig)

  const searchResponse = (await requestJsonWithCache(`${GoogleApi.API_URL}${parameters.toString()}`)) as GoogleSearchResponse

  return searchResponse?.items ?? []
}
