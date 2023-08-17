import { scrapeFullAnimeInfo } from '../../../src/scrapers/animes/scrapeFullAnimeInfo'
import { UpsertAnimes, getAnimeBy } from '../../../src/services/database/animes'
import { Anime } from '../../../src/types'
import { isUpToDate } from '../../../src/utils/isUpToDate'

export const getAnimeInfo = async (animeId: string): Promise<Anime> => {
  const animeInfo = await getAnimeBy('animeId', animeId)

  if (animeInfo.data && animeInfo.data.length > 0) {
    const anime: Anime = animeInfo.data[0]

    if (isUpToDate(anime.updated_at)) {
      console.log('Anime info is up to date')
      return anime
    }
  }

  const currentTime = new Date().toISOString()

  const scrapedAnime = await scrapeFullAnimeInfo(animeId)
  const animeToUpsert: Anime = {
    ...scrapedAnime,
    created_at: currentTime,
    updated_at: currentTime,
  }
  const { data: updatedAnime } = await UpsertAnimes(animeToUpsert)
  if (updatedAnime?.[0]) return updatedAnime[0]

  return animeToUpsert
}
