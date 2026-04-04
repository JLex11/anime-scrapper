import { getAnimeFeed } from '../../../src/services/database/animes'
import type { FeedType } from '../../../src/types'
import { mapAnimeImages } from './getAnimeInfo'

export const getAnimesFeed = async (feedType: FeedType, options?: { page?: number; pageSize?: number; limit?: number }) => {
	const { data } = await getAnimeFeed(feedType, options)
	return data.map(anime => mapAnimeImages(anime))
}
