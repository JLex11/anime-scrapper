import { getRelatedAnimesFromDb } from '../../../src/services/database/animes'
import type { RelatedAnime } from '../../../src/types'

export const getRelatedAnimes = async (animeId: string): Promise<RelatedAnime[]> => {
	return getRelatedAnimesFromDb(animeId)
}
