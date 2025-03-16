import { domainsToFilter } from '../../../src/constants'
import { scrapeFullAnimeInfo } from '../../../src/scrapers/animes/scrapeFullAnimeInfo'
import { UpsertAnimes, getAnimeBy } from '../../../src/services/database/animes'
import type { Anime } from '../../../src/types'
import { isUpToDate } from '../../../src/utils/isUpToDate'
import { mapOriginPath } from '../../../src/utils/mapOriginPath'

export const mapAnimeImagesURLs = (animeImages: Anime['images']) => {
	if (!animeImages) return null

	return {
		coverImage: animeImages.coverImage && mapOriginPath(`api/${animeImages.coverImage.replace(domainsToFilter, '')}`),
		carouselImages:
			animeImages.carouselImages.map(image => ({
				...image,
				link: image.link && mapOriginPath(`api/${image.link.replace(domainsToFilter, '')}`),
			})) ?? [],
	}
}

const getCurrentTime = () => new Date().toISOString()

export const getAnimeInfo = async (animeId: string): Promise<Anime | null> => {
	const { data } = await getAnimeBy('animeId', animeId)
	const dbAnime = data?.at(0)

	if (dbAnime && isUpToDate(dbAnime.updated_at) && Boolean(dbAnime?.images?.carouselImages?.length)) {
		return {
			...dbAnime,
			images: mapAnimeImagesURLs(dbAnime.images),
		}
	}

	const extractImages = !dbAnime?.images || Boolean(dbAnime?.images?.carouselImages?.length)

	const currentTime = getCurrentTime()

	const scrapedAnime = await scrapeFullAnimeInfo(animeId, extractImages)
	if (!scrapedAnime) return null

	const animeToUpsert: Anime = {
		...(dbAnime ?? {}),
		...scrapedAnime,
		created_at: currentTime,
		updated_at: currentTime,
	}

	UpsertAnimes(animeToUpsert)

	const mappedAnime = {
		...animeToUpsert,
		images: mapAnimeImagesURLs(animeToUpsert.images),
	}

	return mappedAnime
}
