import { GoogleApi } from '../enums'
import type { GoogleRequestConfig, GoogleSearchResponse } from '../googleTypes'
import { requestJsonWithCache } from './requestWithCache'
import { GOOGLE_API_KEY, GOOGLE_SEARCH_ENGINE_ID } from '../config/env'

export const getGoogleImage = async (query: string, config?: GoogleRequestConfig) => {
	if (!query) return []

	const DEFAULT_CONFIG: GoogleRequestConfig = {
		key: GOOGLE_API_KEY,
		cx: GOOGLE_SEARCH_ENGINE_ID,
		imgOrientation: config?.imgOrientation || 'horizontal',
		searchType: config?.searchType || 'image',
		imgSize: config?.imgSize || 'huge',
		num: config?.num || '3',
	}

	const fullConfig = {
		...DEFAULT_CONFIG,
		q: query,
	}

	const parameters = new URLSearchParams(fullConfig)
	const searchResponse = (await requestJsonWithCache(`${GoogleApi.API_URL}${parameters.toString()}`)) as unknown as GoogleSearchResponse
	return searchResponse?.items ?? []
}
