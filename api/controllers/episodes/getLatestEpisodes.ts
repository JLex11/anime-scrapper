import { scrapeLastEpisodes } from '../../../src/scrapers/episodes/scrapeLastEpisodes'
import { UpsertEpisodes } from '../../../src/services/database/episodes'

export const getLatestEpisodes = async (limit = Infinity) => {
  const scrapedLatestEpisodes = await scrapeLastEpisodes(limit)
  UpsertEpisodes(scrapedLatestEpisodes)

  return scrapedLatestEpisodes
}
