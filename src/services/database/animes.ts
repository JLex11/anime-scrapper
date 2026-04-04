import type { Database } from '../../supabase'
import type { Anime, AnimeColumns, CarouselImage, ColumnType, FeedType } from '../../types'
import { supabase } from './supabaseClient'

/* Get Anime */
export const getAnimeBy = async <Column extends keyof ColumnType<AnimeColumns>>(column: Column, value: ColumnType<AnimeColumns>[Column]) => {
	const anime = await supabase.from('animes').select('animeId, title, type, rank, otherTitles, description, originalLink, status, genres, images, created_at, updated_at').eq(column, value).limit(1).single()
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
	const limit = pageSize || 10
	const offset = ((page || 1) - 1) * limit

	const animes = await supabase.rpc('search_animes', {
		search_query: query,
		result_limit: limit,
		result_offset: offset,
	})

	return animes
}

export const getAnimeFeed = async (feedType: FeedType, options?: { page?: number; pageSize?: number; limit?: number }) => {
	const { page = 1, pageSize = 24, limit } = options ?? {}
	const from = limit == null ? (page - 1) * pageSize : 0
	const to = limit == null ? from + pageSize - 1 : Math.max(0, limit - 1)

	let query = supabase.from('animes').select('animeId, title, type, rank, status, genres, images, updated_at')

	if (feedType === 'broadcast') {
		query = query.eq('status', 'En emision')
	}

	if (feedType === 'directory') {
		query = query.order('title', { ascending: true })
	} else if (feedType === 'rating') {
		query = query
			.order('rank', { ascending: false, nullsFirst: false })
			.order('updated_at', { ascending: false })
	} else {
		query = query.order('updated_at', { ascending: false })
	}

	const { data, error } = await query.range(from, to)
	return { data: (data ?? []) as Omit<Anime, 'created_at'>[], error }
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

	const { data: upsertedAnimes, error } = await supabase.from('animes').upsert(animesData).select('animeId, title')

	if (error) {
		console.error('Error upserting animes:', error)
		return { data: null, error }
	}

	// Batch upsert all related animes in a single query
	const allRelatedData = animesToUpsert.flatMap(anime =>
		(anime.relatedAnimes ?? []).map(rel => ({
			anime_id: anime.animeId,
			related_id: rel.animeId,
			title: rel.title,
			relation: rel.relation,
		}))
	)

	if (allRelatedData.length > 0) {
		// @ts-ignore - Supabase types might not be updated yet
		const { error: relError } = await supabase.from('related_animes').upsert(allRelatedData, {
			onConflict: 'anime_id,related_id,relation',
		})

		if (relError) {
			console.error('Error upserting related animes:', relError)
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
