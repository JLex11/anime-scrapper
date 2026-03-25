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

/* Get Related Animes from DB */
export const getRelatedAnimesFromDb = async (animeId: string) => {
	const { data, error } = await supabase.from('related_animes').select('related_id, title, relation').eq('anime_id', animeId)
	if (error) {
		console.error('Error fetching related animes:', error)
		return []
	}
	return data.map(rel => ({ animeId: rel.related_id, title: rel.title, relation: rel.relation }))
}

/* Get Animes by matches */
export const getAnimesByQuery = async (query: string, page?: number, pageSize?: number) => {
	const startIndex = ((page || 1) - 1) * (pageSize || 10)
	const endIndex = startIndex + (pageSize || 10) - 1

	console.log({ startIndex, endIndex })

	const animes = await supabase
		.from('animes')
		.select('animeId, title, type, status, genres, images, description, otherTitles')
		.textSearch('full_anime_search', query, {
			type: 'websearch',
		})
		.range(startIndex, endIndex)

	return animes
}

/* Create Anime */
type AnimeInsert = Database['public']['Tables']['animes']['Insert']

const stripGeneratedAnimeFields = <T extends Record<string, unknown>>(anime: T) => {
	// Supabase/Postgres rejects writes to generated columns, so keep only writable fields here.
	const { full_anime_search, relatedAnimes, ...writableAnime } = anime as T & {
		full_anime_search?: unknown
		relatedAnimes?: unknown
	}

	return writableAnime
}

export const createAnime = async (anime: AnimeInsert) => {
	const newAnime = await supabase.from('animes').insert(stripGeneratedAnimeFields(anime))
	return newAnime
}

/* Upsert Animes */
type RelatedAnimeInsert = { animeId: string; title: string; relation: string }
type AnimeWithRelated = AnimeInsert & { relatedAnimes?: RelatedAnimeInsert[] | null }

export const UpsertAnimes = async (animes: AnimeWithRelated[] | AnimeWithRelated) => {
	const animesToUpsert = Array.isArray(animes) ? animes : [animes]

	// Remove generated/non-writable fields before writing to Postgres.
	const animesData = animesToUpsert.map(anime => stripGeneratedAnimeFields(anime))

	const { data: upsertedAnimes, error } = await supabase.from('animes').upsert(animesData).select()

	if (error) {
		console.error('Error upserting animes:', error)
		return { data: null, error }
	}

	// Upsert related animes
	for (const anime of animesToUpsert) {
		if (anime.relatedAnimes && anime.relatedAnimes.length > 0) {
			const relatedData = anime.relatedAnimes.map(rel => ({
				anime_id: anime.animeId,
				related_id: rel.animeId,
				title: rel.title,
				relation: rel.relation,
			}))

			// @ts-ignore - Supabase types might not be updated yet
			const { error: relError } = await supabase.from('related_animes').upsert(relatedData, {
				onConflict: 'anime_id,related_id,relation',
			})

			if (relError) {
				console.error(`Error upserting related animes for ${anime.animeId}:`, relError)
			}
		}
	}

	return { data: upsertedAnimes, error: null }
}

/* Update Anime */
type AnimeUpdate = Database['public']['Tables']['animes']['Update']

export const updateAnime = async (animeId: string, anime: AnimeUpdate) => {
	const updatedAnime = await supabase.from('animes').update(stripGeneratedAnimeFields(anime)).eq('animeId', animeId)
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
