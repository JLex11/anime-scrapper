import { JSDOM } from 'jsdom'
import { animeFLVPages } from '../../enums'
import { getCarouselImages } from '../../services/getCarouselImages'
import { getOptimizedImage } from '../../services/getOptimizeImage'
import { requestTextWithCache } from '../../services/requestWithCache'
import type { AnimeImages, AnimeWithoutDates } from '../../types'
import { animeGetter } from './animeGetters'

const CACHE_TIME = 60 * 60 // -> 1 hour

export async function scrapeFullAnimeInfo(animeId: string, extractImages = true): Promise<AnimeWithoutDates | null> {
	const originalLink = `${animeFLVPages.BASE}/anime/${animeId}`
	const html = await requestTextWithCache(originalLink, { ttl: CACHE_TIME })
	if (!html) return null
	const { document } = new JSDOM(html).window

	const getOfAnime = animeGetter(document)
	const type = getOfAnime.type()
	const imageLink = getOfAnime.imgLink()
	const title = getOfAnime.title()
	const status = getOfAnime.status()
	const otherTitles = getOfAnime.otherTitles()
	const description = getOfAnime.description()
	const rank = getOfAnime.rank('.vtprmd')
	const genres = getOfAnime.genres()

	if (!title || !imageLink) return null

	const anime: AnimeWithoutDates = {
		animeId,
		title,
		type,
		rank,
		otherTitles,
		description,
		originalLink,
		status,
		genres,
		images: undefined,
	}

	if (extractImages) {
		const images: AnimeImages = {
			coverImage: await getOptimizedImage(imageLink, animeId),
			carouselImages: await getCarouselImages(title),
		}

		anime.images = images
	}

	return anime
}
