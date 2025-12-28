import { Window } from 'happy-dom'
import { getAnimeInfo } from '../../../api/controllers/animes/getAnimeInfo'
import { animeFLVPages } from '../../enums'
import { requestTextWithCache } from '../../services/requestWithCache'
import type { Anime } from '../../types'
import { getFulfilledResults } from '../../utils/getFulfilledResults'
import { getIdFromLink, getOriginalLink } from './animeGetters'

const CACHE_HOURS = 1

export async function scrapeEmisionAnimes(limit?: number): Promise<Anime[]> {
	const html = await requestTextWithCache(animeFLVPages.BASE, { ttl: CACHE_HOURS * 60 * 60 })
	if (!html) return []

	const window = new Window()
	window.document.write(html)
	const document = window.document

	const emisionList = [...document.querySelectorAll('.Emision .ListSdbr li')]

	const mappedEmisionAnimes = emisionList.slice(0, limit || 20).map<Promise<Anime | null>>(async animeItem => {
		const originalLink = getOriginalLink(animeItem)
		const animeId = getIdFromLink(originalLink)

		return getAnimeInfo(animeId)
	})

	const results = await Promise.allSettled(mappedEmisionAnimes)
	return getFulfilledResults(results).filter(Boolean) as Anime[]
}
