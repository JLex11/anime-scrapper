import { scrapeFullAnimeInfo } from '../../../src/scrapers/animes/scrapeFullAnimeInfo'
import { createAnime, getAnimeBy } from '../../../src/services/database/animes'
import { Database } from '../../../src/supabase'
import { Anime } from '../../../src/types'

export const getAnimeInfo = async (animeId: string) => {
  const animeInfo = await getAnimeBy('animeId', animeId)
  if (animeInfo.data && animeInfo.data.length > 0) {
    return animeInfo.data[0] as Anime
  }

  const scrapedAnime = await scrapeFullAnimeInfo(animeId)

  type AnimeInsert = Database['public']['Tables']['animes']['Insert']
  const animeToCreate: AnimeInsert = scrapedAnime

  createAnime(animeToCreate).then(response => {
    /* console.log(response) */
  })

  return scrapedAnime
}
