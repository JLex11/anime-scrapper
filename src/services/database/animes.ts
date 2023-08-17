import { Database } from '../../supabase'
import { Anime, AnimeColumns, ColumnType } from '../../types'
import { supabase } from './supabaseClient'

/* Get Animes */
export const getAnimesById = async (animeIds: Anime['animeId'][]) => {
  const animesResponse = await supabase.from('animes').select().in('animeId', animeIds)
  return animesResponse
}

/* Get Anime */
export const getAnimeBy = async <Column extends keyof ColumnType<AnimeColumns>>(
  column: Column,
  value: ColumnType<AnimeColumns>[Column]
) => {
  const anime = await supabase.from('animes').select().eq(column, value)
  return anime
}

/* Get Animes by matches */
export const getAnimesByQuery = async (query: string, limit?: number) => {
  const columnsToSearch: (keyof AnimeColumns)[] = ['title', 'description', 'type']
  const arrayColumnsToSearch: (keyof AnimeColumns)[] = ['genres', 'otherTitles']

  const orQuery = columnsToSearch.map(column => `${column}.ilike.%${query}%`).join(',')
  const arrayOrQuery = arrayColumnsToSearch.map(column => `${column}.cs.{${query}}`).join(',')

  const animes = await supabase
    .from('animes')
    .select()
    .or(`${orQuery},${arrayOrQuery}`)
    .limit(limit || 30)

  return animes
}

/* Create Anime */
type AnimeInsert = Database['public']['Tables']['animes']['Insert']

export const createAnime = async (anime: AnimeInsert) => {
  const newAnime = await supabase.from('animes').insert(anime)
  return newAnime
}

/* Upsert Animes */
export const UpsertAnimes = async (animes: AnimeInsert[] | AnimeInsert) => {
  const animesToUpsert = Array.isArray(animes) ? animes : [animes]
  const newAnimes = await supabase.from('animes').upsert(animesToUpsert).select()
  return newAnimes
}

/* Update Anime */
type AnimeUpdate = Database['public']['Tables']['animes']['Update']

export const updateAnime = async (animeId: string, anime: AnimeUpdate) => {
  const updatedAnime = await supabase.from('animes').update(anime).eq('animeId', animeId)
  return updatedAnime
}

/* Delete Anime */
export const deleteAnime = async (animeId: string) => {
  const deletedAnime = await supabase.from('animes').delete().eq('animeId', animeId)
  return deletedAnime
}
