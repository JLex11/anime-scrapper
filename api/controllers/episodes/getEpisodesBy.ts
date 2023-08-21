import { scrapeAnimeEpisodes } from '../../../src/scrapers/animes/scrapeAnimeEpisodes'
import { UpsertEpisodes, getEpisodeBy } from '../../../src/services/database/episodes'
import { Database } from '../../../src/supabase'
import { Episode } from '../../../src/types'
import { mapOriginPath } from '../../../src/utils/mapOriginPath'

type EpisodeInsert = Database['public']['Tables']['episodes']['Insert']

export const getEpisodesByAnimeId = async (animeId: string, offset: number = 0, limit: number = 10) => {
  const episodesResponse = await getEpisodeBy('animeId', animeId)
  if (
    episodesResponse.data &&
    episodesResponse.data.length > 0 &&
    episodesResponse.data.length == episodesResponse.data[0].episode
  ) {
    return episodesResponse.data.map(episode => ({
      ...episode,
      image: episode.image && mapOriginPath(episode.image),
    })) as Episode[]
  }

  const scrapedEpisodes: EpisodeInsert[] = await scrapeAnimeEpisodes(animeId, offset, limit)
  UpsertEpisodes(scrapedEpisodes as EpisodeInsert[])
  return scrapedEpisodes.map(episode => ({ ...episode, image: episode.image && mapOriginPath(episode.image) }))
}

export const getEpisodeByEpisodeId = async (episodeId: string) => {
  const episodesResponse = await getEpisodeBy('episodeId', episodeId)
  /* if (episodesResponse.data && episodesResponse.data.length > 0) {
    return episodesResponse.data[0] as Episode
  }

  type EpisodeInsert = Database['public']['Tables']['episodes']['Insert']
  const scrapedEpisode: EpisodeInsert = await scrapeEpisode(episodeId) */

  const episodes = episodesResponse.data?.map(episode => ({
    ...episode,
    image: episode.image && mapOriginPath(episode.image),
  }))
  return episodes
}
