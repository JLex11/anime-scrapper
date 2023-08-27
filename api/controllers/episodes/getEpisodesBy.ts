import { domainsToFilter } from '../../../src/constants'
import { scrapeAnimeEpisodes } from '../../../src/scrapers/animes/scrapeAnimeEpisodes'
import { UpsertEpisodes, getEpisodeBy } from '../../../src/services/database/episodes'
import { Database } from '../../../src/supabase'
import { Episode } from '../../../src/types'
import { isUpToDate } from '../../../src/utils/isUpToDate'
import { mapOriginPath } from '../../../src/utils/mapOriginPath'

type EpisodeInsert = Database['public']['Tables']['episodes']['Insert']

export const getEpisodesByAnimeId = async (animeId: string, offset: number = 0, limit: number = 10) => {
  const { data: episodesData } = await getEpisodeBy('animeId', animeId, offset, limit)

  if (episodesData && episodesData[0] && isUpToDate(episodesData[0]?.updated_at)) {
    return episodesData.map(episode => ({
      ...episode,
      image: episode.image && mapOriginPath(`api/${episode.image.replace(domainsToFilter, '')}`)
    })) as Episode[]
  }

  const extractImage = !(
    episodesData &&
    episodesData[0]?.image &&
    !episodesData[0]?.image.includes('https://cdn.animeflv.net')
  )

  const scrapedEpisodes: EpisodeInsert[] = await scrapeAnimeEpisodes(animeId, offset, limit, extractImage)

  const mappedEpisodes = scrapedEpisodes.map(scrapeEpisode => {
    const dbEpisode = episodesData?.find(episode => episode.episodeId === scrapeEpisode.episodeId)
    return { ...(dbEpisode ?? {}), ...scrapeEpisode }
  })

  UpsertEpisodes(mappedEpisodes as EpisodeInsert[])

  return mappedEpisodes.map(episode => ({
    ...episode,
    image: episode.image && mapOriginPath(`api/${episode.image.replace(domainsToFilter, '')}`)
  }))
}

export const getEpisodeByEpisodeId = async (episodeId: string) => {
  const episodesResponse = await getEpisodeBy('episodeId', episodeId)

  const episodes = episodesResponse.data?.map(episode => ({
    ...episode,
    image: episode.image && mapOriginPath(`api/${episode.image.replace(domainsToFilter, '')}`)
  }))

  return episodes
}
