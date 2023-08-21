import { scrapeLastEpisodes } from '../../../src/scrapers/episodes/scrapeLastEpisodes'
import { UpsertEpisodes } from '../../../src/services/database/episodes'
import { mapOriginPath } from '../../../src/utils/mapOriginPath'

export const getLatestEpisodes = async (limit = Infinity) => {
  const scrapedLatestEpisodes = await scrapeLastEpisodes(limit)
  UpsertEpisodes(scrapedLatestEpisodes)

  return scrapedLatestEpisodes.map(episode => ({
    ...episode,
    image: episode.image && mapOriginPath(`api/${episode.image}`),
  }))
}
