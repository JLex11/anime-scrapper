import { scrapeFullAnimeInfo } from '../../scrapers/animes/scrapeFullAnimeInfo'
import { createAnime, getAnimeBy } from '../../services/database/animes'
import { Database } from '../../supabase'

export const getAnimeInfo = async (animeId: string) => {
  const animeResponse = await getAnimeBy('animeId', animeId)
  if (animeResponse.data && animeResponse.data.length > 0) {
    return animeResponse.data[0]
  }

  const scrapeAnime = await scrapeFullAnimeInfo(animeId)
  if (scrapeAnime) {
    type AnimeInsert = Database['public']['Tables']['animes']['Insert']
    const animeToCreate: AnimeInsert = scrapeAnime

    createAnime(animeToCreate).then(response => {
      console.log(response)
    })
  }

  return scrapeAnime
}
