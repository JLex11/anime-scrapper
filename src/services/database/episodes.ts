import { Database } from '../../supabase'
import { ColumnType, EpisodeColumns } from '../../types'
import { supabase } from './supabaseClient'

/* Get Episode */
export const getEpisodeBy = async <Column extends keyof ColumnType<EpisodeColumns>>(
  column: Column,
  value: ColumnType<EpisodeColumns>[Column],
  offset?: number,
  limit?: number
) => {
  const episode = await supabase
    .from('episodes')
    .select()
    .eq(column, value)
    .range(offset || 0, limit || 10)
    .order('episode', { ascending: false })
  return episode
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
