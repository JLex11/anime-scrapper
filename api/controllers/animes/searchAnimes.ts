import { getAnimesByQuery } from '../../../src/services/database/animes'

export const searchAnimes = async (query: string, limit?: number) => {
  const animesResponse = await getAnimesByQuery(query, limit || 30)

  const animes = animesResponse.data
  return animes
}
