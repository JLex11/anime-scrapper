import { getAnimesByQuery } from '../../../src/services/database/animes'
import type { Anime } from '../../../src/types'
import { mapAnimeImages } from './getAnimeInfo'

export const searchAnimes = async (query: string, page?: number, pageSize?: number): Promise<Anime[] | undefined> => {
	const animesResponse = await getAnimesByQuery(query, page, pageSize)

	const animes = animesResponse.data
	if (!animes) return

	return animes.map(anime => {
		return mapAnimeImages(anime)
	})
}
