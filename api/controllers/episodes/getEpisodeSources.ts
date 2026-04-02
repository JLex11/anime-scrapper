import { getEpisodeSourcesByEpisodeId } from '../../../src/services/database/episodeSources'
import type { EpisodeSources } from '../../../src/types'

export const getEpisodeSources = async (episodeId: string): Promise<EpisodeSources | null> => {
	const { data } = await getEpisodeSourcesByEpisodeId(episodeId)

	if (!data) {
		return null
	}

	return {
		episode: data.episode,
		videos: data.videos as EpisodeSources['videos'],
		scraped_at: data.scraped_at,
		expires_at: data.expires_at,
		updated_at: data.updated_at,
	}
}
