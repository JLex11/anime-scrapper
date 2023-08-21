import { scrapeFullAnimeInfo } from '../../../src/scrapers/animes/scrapeFullAnimeInfo'
import { UpsertAnimes, getAnimeBy } from '../../../src/services/database/animes'
import { Anime } from '../../../src/types'
import { isUpToDate } from '../../../src/utils/isUpToDate'
import { mapOriginPath } from '../../../src/utils/mapOriginPath'

const mapAnimeImagesURLs = (animeImages: Anime['images']) => {
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
  const animeInfo = await getAnimeBy('animeId', animeId)

  if (animeInfo.data && animeInfo.data.length > 0) {
    const anime = animeInfo.data[0]

    if (isUpToDate(anime.updated_at)) {
      console.log('Anime info is up to date')

      return {
        ...anime,
        images: mapAnimeImagesURLs(anime.images ?? undefined),
      }
    }
  }

  const currentTime = new Date().toISOString()

  const scrapedAnime = await scrapeFullAnimeInfo(animeId)
  const animeToUpsert: Anime = {
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
