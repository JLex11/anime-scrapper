import { scrapeFullAnimeInfo } from '../../../src/scrapers/animes/scrapeFullAnimeInfo'
import { UpsertAnimes, getRelatedAnimesFromDb } from '../../../src/services/database/animes'
import type { RelatedAnime } from '../../../src/types'

export const getRelatedAnimes = async (animeId: string): Promise<RelatedAnime[]> => {
	// 1. Try to get from DB
	const relatedFromDb = await getRelatedAnimesFromDb(animeId)

	if (relatedFromDb.length > 0) return relatedFromDb

	// 2. If not in DB, scrape it
	const scrapedAnime = await scrapeFullAnimeInfo(animeId, false)
	
	if (!scrapedAnime) return []

	// 3. Save to DB incrementally (upsert will handle existing animeId)
	await UpsertAnimes({
		animeId,
		title: scrapedAnime.title,
		relatedAnimes: scrapedAnime.relatedAnimes
	} as any)

	return scrapedAnime.relatedAnimes ?? []
}
