import { getAnimesByQuery } from '../../../src/services/database/animes'
import { mapAnimeImages, type AnimeWithMappedImages, type PublicAnime } from './getAnimeInfo'

export const searchAnimes = async (query: string, page?: number, pageSize?: number): Promise<PublicAnime[] | undefined> => {
	const animesResponse = await getAnimesByQuery(query, page, pageSize)
	const animes = animesResponse.data
	if (!animes) return

	return animes.map(anime => mapAnimeImages(anime as unknown as AnimeWithMappedImages))
}
