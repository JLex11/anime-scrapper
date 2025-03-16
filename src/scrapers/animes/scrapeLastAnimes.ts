import { JSDOM } from 'jsdom'
import { getAnimeInfo } from '../../../api/controllers/animes/getAnimeInfo'
import { animeFLVPages } from '../../enums'
import { requestTextWithCache } from '../../services/requestWithCache'
import type { Anime } from '../../types'
import { getFulfilledResults } from '../../utils/getFulfilledResults'
import { getAnimeIdFromLink, getAnimeOriginalLink } from './animeGetters'

const CACHE_HOURS = 1

export async function scrapeLastAnimes(limit?: number) {
	const html = await requestTextWithCache(animeFLVPages.BASE, { ttl: CACHE_HOURS * 60 * 60 })
	if (!html) return []

	const { document } = new JSDOM(html).window

	const animeList = [...document.querySelectorAll('ul.ListAnimes li')]

	const mappedLastAnimes = animeList.slice(0, limit || 15).map<Promise<Anime | null>>(async animeItem => {
		const originalLink = getAnimeOriginalLink(animeItem)
		const animeId = getAnimeIdFromLink(originalLink)
		return getAnimeInfo(animeId)
	})

	const results = await Promise.allSettled(mappedLastAnimes)
	return getFulfilledResults(results).filter(Boolean) as Anime[]
}
