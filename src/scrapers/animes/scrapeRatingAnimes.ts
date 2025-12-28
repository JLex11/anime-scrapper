import { Window } from 'happy-dom'
import { getAnimeInfo } from '../../../api/controllers/animes/getAnimeInfo'
import { animeFLVPages, type animeStatus } from '../../enums'
import { requestTextWithCache } from '../../services/requestWithCache'
import type { Anime } from '../../types'
import { getFulfilledResults } from '../../utils/getFulfilledResults'
import { getIdFromLink, getOriginalLink } from './animeGetters'

const CACHE_HOURS = 6

export async function scrapeRatingAnimes(status: animeStatus, limit?: number): Promise<Anime[]> {
	const html = await requestTextWithCache(`${animeFLVPages.BASE}/browse?status=${status}&order=rating`, {
		ttl: CACHE_HOURS * 60 * 60,
	})
	if (!html) return []

	const window = new Window()
	window.document.write(html)
	const document = window.document

	const animeList = [...document.querySelectorAll('ul.ListAnimes li')]

	const mappedRatingAnimes = animeList.slice(0, limit || 10).map<Promise<Anime | null>>(async animeItem => {
		const originalLink = getOriginalLink(animeItem as HTMLElement)
		const animeId = getIdFromLink(originalLink)

		return getAnimeInfo(animeId)
	})

	const results = await Promise.allSettled(mappedRatingAnimes)
	return getFulfilledResults(results).filter(Boolean) as Anime[]
}
