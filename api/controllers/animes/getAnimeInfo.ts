import { scrapeFullAnimeInfo } from '../../../src/scrapers/animes/scrapeFullAnimeInfo'
import { UpsertAnimes, getAnimeBy } from '../../../src/services/database/animes'
import { Anime } from '../../../src/types'
import { isUpToDate } from '../../../src/utils/isUpToDate'
import { mapOriginPath } from '../../../src/utils/mapOriginPath'

export const mapAnimeImagesURLs = (animeImages: Anime['images']) => {
  return {
    coverImage: mapOriginPath(`api/${animeImages?.coverImage}`),
    carouselImages:
      animeImages?.carouselImages?.map(image => ({
        ...image,
        link: mapOriginPath(`api/${image.link}`),
      })) ?? [],
  }
}

export const getAnimeInfo = async (animeId: string): Promise<Anime> => {
  const { data } = await getAnimeBy('animeId', animeId)
  const dbAnime = data?.at(0)

  if (dbAnime && isUpToDate(dbAnime.updated_at) && (dbAnime.images?.carouselImages?.length || 0) > 0) {
    return {
      ...dbAnime,
      images: mapAnimeImagesURLs(dbAnime.images ?? undefined),
    }
  }

  const extractImages = !((data?.at(0)?.images?.carouselImages?.length || 0) > 0)

  const currentTime = new Date().toISOString()

  const scrapedAnime = await scrapeFullAnimeInfo(animeId, extractImages)
  const animeToUpsert: Anime = {
    ...(dbAnime ?? {}),
    ...scrapedAnime,
    created_at: currentTime,
    updated_at: currentTime,
  }

  UpsertAnimes(animeToUpsert)

  return {
    ...animeToUpsert,
    images: mapAnimeImagesURLs(animeToUpsert.images),
  }
}
