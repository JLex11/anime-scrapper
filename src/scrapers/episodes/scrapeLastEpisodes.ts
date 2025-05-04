import { JSDOM } from 'jsdom'
import { animeFLVPages } from '../../enums'
import { getOptimizedImage } from '../../services/getOptimizeImage'
import { requestTextWithCache } from '../../services/requestWithCache'
import type { Episode } from '../../types'

const CACHE_TIME = 10 * 60 // -> 10 minutes

export async function scrapeLastEpisodes(limit: number): Promise<Episode[]> {
	const html = await requestTextWithCache(animeFLVPages.BASE, { ttl: CACHE_TIME })
	if (!html) return []

	const { document } = new JSDOM(html).window

	const episodesList = [...document.querySelectorAll('ul.ListEpisodios li')].slice(0, limit)

	const mappedLastEpidodes = episodesList.map(async episodeItem => {
		const originalLink = `${animeFLVPages.BASE}${episodeItem.querySelector('a')?.href ?? ''}`
		const imageLink = `${animeFLVPages.BASE}${episodeItem.querySelector('.Image img')?.getAttribute('src') ?? ''}`
		const episode = Number(episodeItem.querySelector('.Capi')?.textContent?.replace(/[^0-9]/g, '') ?? 0)
		const title = episodeItem.querySelector('.Title')?.textContent?.trim() ?? ''
		const episodeId = originalLink.split('ver/').pop() ?? ''
		const animeId = episodeId.replace(`-${episode.toString()}`, '')

		const imageName = episodeId ?? animeId ?? 'unknown'
		const imageOptions = { width: 350, height: 250, effort: 6 }
		const image = await getOptimizedImage(imageLink, imageName, imageOptions)

		return {
			originalLink,
			image,
			episode,
			title,
			episodeId,
			animeId,
		}
	})

	const results = await Promise.all(mappedLastEpidodes)
	return results
}
