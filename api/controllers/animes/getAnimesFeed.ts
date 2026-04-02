import { getAnimeFeed } from '../../../src/services/database/animes'
import type { Anime, FeedType } from '../../../src/types'
import { mapAnimeImages } from './getAnimeInfo'

export const getAnimesFeed = async (feedType: FeedType, options?: { page?: number; pageSize?: number; limit?: number }): Promise<Anime[]> => {
	const { data } = await getAnimeFeed(feedType, options)
	return data.map(anime => mapAnimeImages(anime))
}
