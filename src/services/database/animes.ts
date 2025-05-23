import type { Database } from '../../supabase'
import type { Anime, AnimeColumns, CarouselImage, ColumnType } from '../../types'
import { supabase } from './supabaseClient'

/* Get Animes */
export const getAnimesById = async (animeIds: Anime['animeId'][]) => {
	const animesResponse = await supabase.from('animes').select().in('animeId', animeIds)
	return animesResponse
}

/* Get Anime */
export const getAnimeBy = async <Column extends keyof ColumnType<AnimeColumns>>(column: Column, value: ColumnType<AnimeColumns>[Column]) => {
	const anime = await supabase.from('animes').select().eq(column, value).limit(1).single()
	return anime
}

/* Get Animes by matches */
export const getAnimesByQuery = async (query: string, page?: number, pageSize?: number) => {
	const startIndex = ((page || 1) - 1) * (pageSize || 10)
	const endIndex = startIndex + (pageSize || 10) - 1

	console.log({ startIndex, endIndex })

	const animes = await supabase
		.from('animes')
		.select()
		.textSearch('full_anime_search', query, {
			type: 'websearch',
		})
		.range(startIndex, endIndex)

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

/* Update Anime Json Images */
type PropertyPathMap = {
	coverImage: string
	carouselImages: CarouselImage[]
}
type NewValueType<Path extends keyof PropertyPathMap> = PropertyPathMap[Path]

export const updateAnimeJsonImages = async <Path extends keyof PropertyPathMap>(animeId: string, propertyPath: Path, newValue: NewValueType<Path>) => {
	const updatedAnime = await supabase.rpc('update_anime_images_json', {
		anime_id: animeId,
		property: propertyPath,
		new_value: newValue,
	})
	if (updatedAnime.error) {
		console.error('Error updating anime images:', updatedAnime.error)
		return null
	}
	return updatedAnime
}

/* Delete Anime */
export const deleteAnime = async (animeId: string) => {
	const deletedAnime = await supabase.from('animes').delete().eq('animeId', animeId)
	return deletedAnime
}
