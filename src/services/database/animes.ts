import { createClient } from '@supabase/supabase-js'
import { Database } from '../../../api/supabase'
import { AnimeColumns, ColumnType } from '../../../api/types'

const supabase = createClient<Database>(
  'https://qyuxymbzzxwnrgqxjloe.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF5dXh5bWJ6enh3bnJncXhqbG9lIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NzkzMjUwNTMsImV4cCI6MTk5NDkwMTA1M30.-CWwL2b6hVFoD9g5JgFJVYUMGds9ucc28pUaxABHIRA'
)

/* Get Animes */
export const getAnimes = async () => {
  const animesResponse = await supabase.from('animes').select()
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
  const columnsToSearch: (keyof AnimeColumns)[] = ['title', 'description', /* 'genres', 'otherTitles', */ 'type']
  const orQuery = columnsToSearch.map(column => `${column}.ilike.%${query}%`).join(',')

  const animes = await supabase.from('animes').select().or(orQuery).limit(limit || 30)

  return animes
}

/* Create Anime */
type AnimeInsert = Database['public']['Tables']['animes']['Insert']

export const createAnime = async (anime: AnimeInsert) => {
  const newAnime = await supabase.from('animes').insert(anime)
  return newAnime
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
