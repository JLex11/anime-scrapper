import { supabase } from './supabaseClient'

export const getEpisodeSourcesByEpisodeId = async (episodeId: string) => {
	return await supabase
		.from('episode_sources')
		.select()
		.eq('episode_id', episodeId)
		.limit(1)
		.maybeSingle()
}
