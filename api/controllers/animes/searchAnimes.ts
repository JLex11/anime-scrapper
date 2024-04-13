import { getAnimesByQuery } from '../../../src/services/database/animes'
import { Anime } from '../../../src/types'
import { mapAnimeImagesURLs } from './getAnimeInfo'

export const searchAnimes = async (query: string, limit?: number): Promise<Anime[] | undefined> => {
  const animesResponse = await getAnimesByQuery(query, limit || 30)

  const animes = animesResponse.data
  if (!animes) return

  return animes.map(anime => {
    return { ...anime, images: mapAnimeImagesURLs(anime.images) }
  })
}
