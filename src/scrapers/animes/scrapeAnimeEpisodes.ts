import { JSDOM } from 'jsdom'
import { animeFLVPages } from '../../enums'
import { getOptimizedImage } from '../../services/getOptimizeImage'
import { requestTextWithCache } from '../../services/requestWithCache'
import type { Episode } from '../../types'
import { getTitle } from './animeGetters'

const CACHE_HOURS = 0.5

export async function scrapeAnimeEpisodes(
	animeId: string,
	offset: number,
	limit: number,
	extractImage = true
): Promise<Episode[]> {
	const originalLink = `${animeFLVPages.BASE}/anime/${animeId}`
	const html = await requestTextWithCache(originalLink, { ttl: CACHE_HOURS * 60 * 60 })
	if (!html) return []

	const { document } = new JSDOM(html).window

	const title = getTitle(document)
	const scrapedScript = [...document.querySelectorAll('script')].map(s => s.textContent).join(' ')

	let animeInfo: string | undefined
	let episodesIds: number[][] = []

	try {
		animeInfo = JSON.parse(
			scrapedScript
				.split(/(var|let|const) *anime_info *= */)
				.pop()
				?.split(/;|(var|let|const)/)
				.shift() ?? '[]'
		)

		episodesIds = JSON.parse(
			scrapedScript
				.split(/(var|let|const) *episodes *= */)
				.pop()
				?.split(';')
				.shift() ?? '[]'
		)
	} catch (error) {
		return []
	}

	const animeEpisodes = episodesIds.slice(offset || 0, limit || 20).map(async ([episodeNumber]: number[]): Promise<Episode> => {
		const episode = episodeNumber
		const episodeId = `${animeId}-${episodeNumber}`
		const originalLink = `${animeFLVPages.BASE}/ver/${episodeId}`

		const imageLink = `https://cdn.animeflv.net/screenshots/${animeInfo?.[0] ?? 0}/${episodeNumber}/th_3.jpg`
		const imageName = `episode-image-${animeId}-${episodeNumber}`
		const optimizeImage = extractImage ? await getOptimizedImage(imageLink, imageName, { width: 150, height: 80 }) : null

		return {
			episodeId,
			animeId,
			title,
			episode,
			originalLink,
			image: optimizeImage,
		}
	})

	const episodesResults = await Promise.all(animeEpisodes)
	return episodesResults
}
