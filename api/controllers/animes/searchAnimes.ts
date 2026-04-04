import { getAnimesByQuery } from '../../../src/services/database/animes'
import { mapAnimeImages, type AnimeWithMappedImages } from './getAnimeInfo'

export const searchAnimes = async (query: string, page?: number, pageSize?: number): Promise<AnimeWithMappedImages[] | undefined> => {
	const animesResponse = await getAnimesByQuery(query, page, pageSize)
	const animes = animesResponse.data
	if (!animes) return

	return animes.map(anime => mapAnimeImages(anime as unknown as AnimeWithMappedImages))
}
