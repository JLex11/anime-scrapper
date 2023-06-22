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

    /* const lastUpdate = new Date(anime.updated_at)
    const now = new Date()
    const oneDay = 1000 * 60 * 60 * 24
    const oneDayAgo = new Date(now.getTime() - oneDay) */

    if (isUpToDate(anime.updated_at)) {
      console.log('Anime info is up to date')
      return anime
    }
  }

  const nowTimestamp = new Date().getTime().toString()

  const scrapedAnime = await scrapeFullAnimeInfo(animeId)
  const animeToUpsert: AnimeInsert = {
    ...scrapedAnime,
    updated_at: nowTimestamp,
  }
  const updatedAnime = await UpsertAnimes(animeToUpsert)
  if (updatedAnime.data?.[0]) return updatedAnime.data?.[0]

  return {
    ...scrapedAnime,
    created_at: nowTimestamp,
    updated_at: nowTimestamp,
  }
}
