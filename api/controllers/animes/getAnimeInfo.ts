import { scrapeFullAnimeInfo } from '../../../src/scrapers/animes/scrapeFullAnimeInfo'
import { UpsertAnimes, getAnimeBy } from '../../../src/services/database/animes'
import { Database } from '../../../src/supabase'
import { Anime } from '../../../src/types'
import { isUpToDate } from '../../../src/utils/isUpToDate'

type AnimeInsert = Database['public']['Tables']['animes']['Insert']

export const getAnimeInfo = async (animeId: string) => {
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
  const animeToUpsert: AnimeInsert = {
    ...scrapedAnime,
    updated_at: currentTime,
  }
  const { data: updatedAnime } = await UpsertAnimes(animeToUpsert)
  if (updatedAnime?.at(0)) return updatedAnime[0]

  return {
    ...scrapedAnime,
    created_at: currentTime,
    updated_at: currentTime,
  }
}
