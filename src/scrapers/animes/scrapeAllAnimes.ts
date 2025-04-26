import { JSDOM } from 'jsdom'
import { getAnimeInfo } from '../../../api/controllers/animes/getAnimeInfo'
import { animeFLVPages } from '../../enums'
import type { Anime } from '../../types'
import { getFulfilledResults } from '../../utils/getFulfilledResults'
import { getIdFromLink, getOriginalLink } from './animeGetters'

export async function scrapeAllAnimes(page = 1): Promise<Anime[]> {
	const html = await fetch(`${animeFLVPages.BASE}/browse?page=${page}`)
		.then(async res => await res.text())
		.catch(() => null)
	if (!html) return []

	const { document } = new JSDOM(html).window

	const animeList = [...document.querySelectorAll('ul.ListAnimes li')]

	const mappedFoundAnimes = animeList.map<Promise<Anime | null>>(async animeItem => {
		const originalLink = getOriginalLink(animeItem)
		const animeId = getIdFromLink(originalLink)

		return getAnimeInfo(animeId)
	})

	const results = await Promise.allSettled(mappedFoundAnimes)
	return getFulfilledResults(results).filter(Boolean) as Anime[]
}
