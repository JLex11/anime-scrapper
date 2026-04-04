import { getAnimeBy, getRelatedAnimesFromDb } from '../../../src/services/database/animes'
import type { Anime } from '../../../src/types'
import { encodeImageKey, getLegacyImageKey } from '../../../src/utils/imageToken'
import { mapOriginPath } from '../../../src/utils/mapOriginPath'

export type AnimeWithMappedImages = {
	animeId: string
	title: string
	type?: string | null
	rank?: number | null
	otherTitles?: string[] | null
	description?: string | null
	originalLink?: string | null
	status?: string | null
	genres?: string[] | null
	images?: Anime['images'] | null
	relatedAnimes?: Anime['relatedAnimes'] | null
	created_at?: string
	updated_at?: string
}

const toImageProxyUrl = (objectKey: string | null | undefined) => {
	if (!objectKey) return null
	return mapOriginPath(`api/image/${encodeImageKey(objectKey)}`)
}

const normalizeMediaUrl = (url: string | null | undefined) => {
	if (!url) return url ?? null
	if (url.startsWith('https://') || url.startsWith('http://')) return url
	if (url.startsWith('//')) return `https:${url}`

	return mapOriginPath(url.startsWith('/') ? url.slice(1) : url)
}

export const mapAnimeImages = <T extends AnimeWithMappedImages>(anime: T) => {
	const animeImages = anime.images as Anime['images']
	const coverKey = getLegacyImageKey(animeImages?.coverImage)

	const mappedAnimeImages = animeImages
		? {
				coverImage: toImageProxyUrl(coverKey) ?? normalizeMediaUrl(animeImages.coverImage),
				carouselImages:
					animeImages.carouselImages?.map((image, index) => {
						const carouselKey = getLegacyImageKey(image.link)

						return {
							...image,
							link: toImageProxyUrl(carouselKey) ?? normalizeMediaUrl(image.link),
						}
					}) ?? [],
			}
		: null

	return {
		...anime,
		images: mappedAnimeImages,
	}
}

export const getAnimeInfo = async (animeId: string): Promise<Anime | null> => {
	const [animeResult, relatedAnimes] = await Promise.all([
		getAnimeBy('animeId', animeId),
		getRelatedAnimesFromDb(animeId),
	])

	const animeFromDb = animeResult.data
	if (!animeFromDb) return null

	return mapAnimeImages({ ...animeFromDb, relatedAnimes })
}
