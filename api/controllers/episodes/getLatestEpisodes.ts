import { getLatestEpisodesFeed } from '../../../src/services/database/episodes'
import { mapEpisodeImage } from './getEpisodesBy'

export const getLatestEpisodes = async (limit = 30) => {
	const { data } = await getLatestEpisodesFeed(limit)
	return data.map(mapEpisodeImage)
}
