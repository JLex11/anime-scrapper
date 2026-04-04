import { supabase } from './supabaseClient'

export const getEpisodeSourcesByEpisodeId = async (episodeId: string) => {
	return await supabase
		.from('episode_sources')
		.select('episode, videos, scraped_at, expires_at, updated_at')
		.eq('episode_id', episodeId)
		.limit(1)
		.maybeSingle()
}
