import type { Database } from '../../supabase'
import type { ColumnType, EpisodeColumns } from '../../types'
import { supabase } from './supabaseClient'

/* Get Episode */
export const getEpisodeBy = async <Column extends keyof ColumnType<EpisodeColumns>>(
	column: Column,
	value: ColumnType<EpisodeColumns>[Column],
	offset?: number,
	limit?: number
) => {
	const from = offset || 0
	const to = from + (limit || 10) - 1

	const episode = await supabase
		.from('episodes')
		.select()
		.eq(column, value)
		.range(from, to)
		.order('episode', { ascending: false })
	return episode
}

export const getEpisodesByIds = async (episodeIds: string[]) => {
	const episodesResponse = await supabase.from('episodes').select().in('episodeId', episodeIds)
	return episodesResponse
}

/* Get Episodes by matches */
export const getEpisodesByQuery = async (query: string, limit?: number) => {
	const columnsToSearch: (keyof EpisodeColumns)[] = ['animeId', 'episode', 'episodeId', 'title']
	const orQuery = columnsToSearch.map(column => `${column}.ilike.%${query}%`).join(',')

	const episodes = await supabase
		.from('episodes')
		.select()
		.or(orQuery)
		.limit(limit || 30)

	return episodes
}

/* Create Episode */
type EpisodeInsert = Database['public']['Tables']['episodes']['Insert']

export const createEpisode = async (episodes: EpisodeInsert | EpisodeInsert[]) => {
	const newEpisode = await supabase.from('episodes').insert(Array.isArray(episodes) ? episodes : [episodes])
	return newEpisode
}

export const UpsertEpisodes = async (episodes: EpisodeInsert[] | EpisodeInsert) => {
	const newEpisodes = await supabase
		.from('episodes')
		.upsert(Array.isArray(episodes) ? episodes : [episodes])
		.select()
	return newEpisodes
}

export const getLatestEpisodesFeed = async (limit = 30) => {
	const { data: feedItems, error } = await supabase
		.from('episode_feed_items')
		.select('episode_id')
		.eq('feed_type', 'latest')
		.order('position', { ascending: true })
		.range(0, Math.max(0, limit - 1))

	if (error || !feedItems) {
		return { data: [] as Database['public']['Tables']['episodes']['Row'][], error }
	}

	const episodeIds = feedItems.map(item => item.episode_id)
	if (episodeIds.length === 0) {
		return { data: [] as Database['public']['Tables']['episodes']['Row'][], error: null }
	}

	const { data: episodes, error: episodesError } = await getEpisodesByIds(episodeIds)

	if (episodesError || !episodes) {
		return { data: [] as Database['public']['Tables']['episodes']['Row'][], error: episodesError }
	}

	const byId = new Map(episodes.map(episode => [episode.episodeId, episode]))
	return {
		data: episodeIds.map(episodeId => byId.get(episodeId)).filter(Boolean) as Database['public']['Tables']['episodes']['Row'][],
		error: null,
	}
}

/* Update Episode */
type EpisodeUpdate = Database['public']['Tables']['episodes']['Update']

export const updateEpisode = async (episodeId: string, episode: EpisodeUpdate) => {
	const updatedEpisode = await supabase.from('episodes').update(episode).eq('episodeId', episodeId)
	return updatedEpisode
}

/* Delete Episode */
export const deleteEpisode = async (episodeId: string) => {
	const deletedEpisode = await supabase.from('episodes').delete().eq('episodeId', episodeId)
	return deletedEpisode
}
