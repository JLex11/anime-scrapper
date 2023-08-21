import { getAnimesByQuery } from '../../../src/services/database/animes'
import { Anime } from '../../../src/types'
import { mapAnimeImagesURLs } from './getAnimeInfo'

export const searchAnimes = async (query: string, limit?: number) => {
  const animesResponse = await getAnimesByQuery(query, limit || 30)

  const animes = animesResponse.data
  return animes?.map(anime => ({ ...anime, images: mapAnimeImagesURLs(anime.images ?? undefined) })) as Anime[]
}
