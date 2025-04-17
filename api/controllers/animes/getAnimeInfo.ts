import { domainsToFilter } from '../../../src/constants'
import { scrapeFullAnimeInfo } from '../../../src/scrapers/animes/scrapeFullAnimeInfo'
import { UpsertAnimes, getAnimeBy } from '../../../src/services/database/animes'
import type { Anime } from '../../../src/types'
import { isUpToDate } from '../../../src/utils/isUpToDate'
import { mapOriginPath } from '../../../src/utils/mapOriginPath'

export const mapAnimeImages = (anime: Anime) => {
	const animeImages = anime.images as Anime['images']
	const mappedAnimeImages = animeImages
		? {
				coverImage: animeImages.coverImage && mapOriginPath(`api/${animeImages.coverImage.replace(domainsToFilter, '')}`),
				carouselImages:
					animeImages.carouselImages.map(image => ({
						...image,
						link: image.link && mapOriginPath(`api/${image.link.replace(domainsToFilter, '')}`),
					})) ?? [],
			}
		: null

	return {
		...anime,
		images: mappedAnimeImages,
	}
}

const getCurrentTime = () => new Date().toISOString()

export const getAnimeInfo = async (animeId: string): Promise<Anime | null> => {
	const { data: animeFromDb } = await getAnimeBy('animeId', animeId)

	const isUpdated = !animeFromDb || !isUpToDate(animeFromDb.updated_at)
	const hasCarouselImages = Boolean(animeFromDb?.images?.carouselImages?.length)

	/* if (!isUpdated && hasCarouselImages) {
		return mapAnimeImages(animeFromDb)
	} */

	const currentTime = getCurrentTime()

	const scrapedAnime = await scrapeFullAnimeInfo(animeId, !hasCarouselImages)
	if (!scrapedAnime) return null

	const newAnime: Anime = {
		...(animeFromDb ?? {}),
		...scrapedAnime,
		created_at: currentTime,
		updated_at: currentTime,
	}

	UpsertAnimes(newAnime)

	const mappedAnime = mapAnimeImages(newAnime)
	return mappedAnime
}
