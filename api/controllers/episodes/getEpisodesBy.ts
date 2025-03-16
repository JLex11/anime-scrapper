import { domainsToFilter } from '../../../src/constants'
import { scrapeAnimeEpisodes } from '../../../src/scrapers/animes/scrapeAnimeEpisodes'
import { UpsertEpisodes, getEpisodeBy } from '../../../src/services/database/episodes'
import type { Database } from '../../../src/supabase'
import type { Episode } from '../../../src/types'
import { isUpToDate } from '../../../src/utils/isUpToDate'
import { mapOriginPath } from '../../../src/utils/mapOriginPath'

type EpisodeRow = Database['public']['Tables']['episodes']['Row']
type EpisodeInsert = Database['public']['Tables']['episodes']['Insert']

const mapEpisodeImage = (episode: EpisodeRow | EpisodeInsert) => {
	return {
		...episode,
		image: episode.image && mapOriginPath(`api/${episode.image.replace(domainsToFilter, '')}`),
	} as Episode
}

export const getEpisodesByAnimeId = async (animeId: string, offset = 0, limit = 10) => {
	const { data: episodesData }: { data: EpisodeRow[] | null } = await getEpisodeBy('animeId', animeId, offset, limit)

	if (episodesData?.[0] && isUpToDate(episodesData[0]?.updated_at)) {
		return episodesData.map(mapEpisodeImage)
	}

	const extractImage = !(episodesData?.[0]?.image && !episodesData[0]?.image.includes('https://cdn.animeflv.net'))

	const scrapedEpisodes: EpisodeInsert[] = await scrapeAnimeEpisodes(animeId, offset, limit, extractImage)

	const mappedEpisodes = scrapedEpisodes.map(scrapeEpisode => {
		const dbEpisode = episodesData?.find(episode => episode.episodeId === scrapeEpisode.episodeId)
		return { ...(dbEpisode ?? {}), ...scrapeEpisode }
	})

	UpsertEpisodes(mappedEpisodes)
	return mappedEpisodes.map(mapEpisodeImage)
}

export const getEpisodeByEpisodeId = async (episodeId: string) => {
	const episodesResponse = await getEpisodeBy('episodeId', episodeId)

	const episodes = episodesResponse.data?.map(mapEpisodeImage)

	return episodes
}
