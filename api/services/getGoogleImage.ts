import { GoogleRequestConfig, GoogleSearchResponse } from './../googleTypes.d'
import { requestJsonWithCache } from './requestWithCache'

const GOOGLE_API_URL = 'https://www.googleapis.com/customsearch/v1?'
const API_KEY = 'AIzaSyDqy9qhMVsxLnEBlFYmBuOWsK8DAcAov-0'
const SEARCH_ENGINE_ID = 'd605fa7e0557f4774'

const DEFAULT_CONFIG: GoogleRequestConfig = {
  imgOrientation: 'horizontal',
  searchType: 'image',
  imgSize: 'huge',
  key: API_KEY,
  cx: SEARCH_ENGINE_ID,
  num: '5'
}

export const getGoogleImage = async (query: string, config?: GoogleRequestConfig) => {
  if (!query) return []

  const fullConfig = {
    ...DEFAULT_CONFIG,
    ...config,
    q: query
  }

  const parameters = new URLSearchParams(fullConfig)

  const searchResponse = await requestJsonWithCache(`${GOOGLE_API_URL}${parameters.toString()}`) as GoogleSearchResponse | undefined
  return searchResponse?.items ?? []
}
