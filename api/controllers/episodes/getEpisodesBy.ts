import { getEpisodeBy } from '../../../src/services/database/episodes'
import type { Episode } from '../../../src/types'
import { encodeImageKey, getLegacyImageKey } from '../../../src/utils/imageToken'
import { mapOriginPath } from '../../../src/utils/mapOriginPath'

interface EpisodeInput {
	episodeId: string
	animeId: string | null
	episode: number | null
	title: string | null
	image: string | null
	image_key?: string | null
	originalLink: string | null
	created_at?: string | null
	updated_at?: string | null
}

export const mapEpisodeImage = (episode: EpisodeInput) => {
	const imageKey = ('image_key' in episode ? episode.image_key : null) ?? getLegacyImageKey(episode.image)
	const imageUrl = imageKey
		? mapOriginPath(`api/image/${encodeImageKey(imageKey)}`)
		: episode.image
			? (episode.image.startsWith('https://') || episode.image.startsWith('http://')
					? episode.image
					: mapOriginPath(episode.image.startsWith('/') ? episode.image.slice(1) : episode.image))
			: null

	return {
		originalLink: episode.originalLink ?? '',
		title: episode.title ?? '',
		image: imageUrl,
		episode: episode.episode ?? 0,
		episodeId: episode.episodeId,
		animeId: episode.animeId ?? '',
		created_at: episode.created_at ?? undefined,
		updated_at: episode.updated_at ?? undefined,
	} as Episode
}

export const getEpisodesByAnimeId = async (animeId: string, offset = 0, limit = 10) => {
	const { data: episodesData } = await getEpisodeBy('animeId', animeId, offset, limit)
	return (episodesData ?? []).map(mapEpisodeImage)
}

export const getEpisodeByEpisodeId = async (episodeId: string) => {
	const episodesResponse = await getEpisodeBy('episodeId', episodeId)
	const episode = episodesResponse.data?.[0]
	return episode ? mapEpisodeImage(episode) : null
}
