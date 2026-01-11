import { getAnimesByQuery } from '../../../src/services/database/animes'
import type { Anime } from '../../../src/types'
import { mapAnimeImages } from './getAnimeInfo'

// Caché simple en memoria (considera Redis para producción)
const searchCache = new Map<string, { data: Anime[]; timestamp: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutos

export const searchAnimes = async (query: string, page?: number, pageSize?: number): Promise<Anime[] | undefined> => {
	const cacheKey = `${query}-${page || 1}-${pageSize || 10}`
	const cached = searchCache.get(cacheKey)

	// Retornar caché si es válido
	if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
		return cached.data
	}

	const animesResponse = await getAnimesByQuery(query, page, pageSize)

	const animes = animesResponse.data
	if (!animes) return

	const result = animes.map(anime => {
		return mapAnimeImages(anime)
	})

	// Guardar en caché
	searchCache.set(cacheKey, { data: result, timestamp: Date.now() })

	// Limpiar caché antigua (evitar memory leaks)
	if (searchCache.size > 100) {
		const now = Date.now()
		for (const [key, value] of searchCache.entries()) {
			if (now - value.timestamp > CACHE_TTL) {
				searchCache.delete(key)
			}
		}
	}

	return result
}
