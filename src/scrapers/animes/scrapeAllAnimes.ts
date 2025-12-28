import { Window } from 'happy-dom'
import { getAnimeInfo } from '../../../api/controllers/animes/getAnimeInfo'
import { animeFLVPages } from '../../enums'
import { requestTextWithCache } from '../../services/requestWithCache'
import type { Anime } from '../../types'
import { getFulfilledResults } from '../../utils/getFulfilledResults'
import { getIdFromLink, getOriginalLink } from './animeGetters'

const CACHE_TIME = 30 * 60 // -> 30 minutes

export async function scrapeAllAnimes(page = 1): Promise<Anime[]> {
		const html = await requestTextWithCache(`${animeFLVPages.BASE}/browse?page=${page}`, { ttl: CACHE_TIME })
	if (!html) return []

	const window = new Window()
	window.document.write(html)
	const document = window.document

	const animeList = [...document.querySelectorAll('ul.ListAnimes li')]

	const mappedFoundAnimes = animeList.map<Promise<Anime | null>>(async animeItem => {
		const originalLink = getOriginalLink(animeItem)
		const animeId = getIdFromLink(originalLink)

		return getAnimeInfo(animeId)
	})

	const results = await Promise.allSettled(mappedFoundAnimes)
	return getFulfilledResults(results).filter(Boolean) as Anime[]
}
