import { domainsToFilter } from '../../../src/constants'
import { scrapeFullAnimeInfo } from '../../../src/scrapers/animes/scrapeFullAnimeInfo'
import { UpsertAnimes, getAnimeBy } from '../../../src/services/database/animes'
import { Anime } from '../../../src/types'
import { isUpToDate } from '../../../src/utils/isUpToDate'
import { mapOriginPath } from '../../../src/utils/mapOriginPath'

export const mapAnimeImagesURLs = (animeImages: Anime['images']) => {
  if (!animeImages) return null

  return {
    coverImage:
      animeImages.coverImage && mapOriginPath(`api/${animeImages.coverImage.replace(domainsToFilter, '')}`),
    carouselImages:
      animeImages.carouselImages.map(image => ({
        ...image,
        link: image.link && mapOriginPath(`api/${image.link.replace(domainsToFilter, '')}`)
      })) ?? []
  }
}

export const getAnimeInfo = async (animeId: string): Promise<Anime> => {
  const { data } = await getAnimeBy('animeId', animeId)
  const dbAnime = data?.at(0)

  if (dbAnime && isUpToDate(dbAnime.updated_at) && Boolean(data?.at(0)?.images?.carouselImages?.length)) {
    const mappedAnime = {
      ...dbAnime,
      images: mapAnimeImagesURLs(dbAnime.images)
    }

    return mappedAnime
  }

  const extractImages = !data?.at(0)?.images || Boolean(data?.at(0)?.images?.carouselImages?.length)

  const currentTime = new Date().toISOString()

  const scrapedAnime = await scrapeFullAnimeInfo(animeId, extractImages)
  const animeToUpsert: Anime = {
    ...(dbAnime ?? {}),
    ...scrapedAnime,
    created_at: currentTime,
    updated_at: currentTime
  }

  UpsertAnimes(animeToUpsert)

  const mappedAnime = {
    ...animeToUpsert,
    images: mapAnimeImagesURLs(animeToUpsert.images)
  }

  return mappedAnime
}
