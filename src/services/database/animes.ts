import type { Database } from '../../supabase'
import type { Anime, AnimeColumns, CarouselImage, ColumnType, FeedType } from '../../types'
import { supabase } from './supabaseClient'

/* Get Animes */
export const getAnimesById = async (animeIds: Anime['animeId'][]) => {
	const animesResponse = await supabase.from('animes').select().in('animeId', animeIds)
	return animesResponse
}

const mapOrderedAnimes = async (animeIds: Anime['animeId'][]) => {
	if (animeIds.length === 0) {
		return { data: [] as Anime[], error: null }
	}

	const { data, error } = await getAnimesById(animeIds)

	if (error || !data) {
		return { data: [] as Anime[], error }
	}

	const byId = new Map(data.map(anime => [anime.animeId, anime]))
	return {
		data: animeIds.map(animeId => byId.get(animeId)).filter(Boolean) as Anime[],
		error: null,
	}
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

	const { data: feedItems, error } = await supabase
		.from('anime_feed_items')
		.select('anime_id')
		.eq('feed_type', feedType)
		.order('page', { ascending: true })
		.order('position', { ascending: true })
		.range(from, to)

	if (error || !feedItems) {
		return { data: [] as Anime[], error }
	}

	const animeIds = feedItems.map(item => item.anime_id)
	return mapOrderedAnimes(animeIds)
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
