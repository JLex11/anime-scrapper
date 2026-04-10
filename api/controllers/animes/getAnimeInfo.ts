import { getAnimeBy, getRelatedAnimesFromDb } from '../../../src/services/database/animes'
import type { Anime } from '../../../src/types'
import { encodeImageKey, getLegacyImageKey } from '../../../src/utils/imageToken'
import { mapOriginPath } from '../../../src/utils/mapOriginPath'

export type AnimeWithMappedImages = {
	animeId: string
	title: string
	cover_image_key?: string | null
	carousel_image_keys?: unknown
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

type AnimePublic<T extends AnimeWithMappedImages> = Omit<T, 'cover_image_key' | 'carousel_image_keys'> & {
	images: Anime['images'] | null
}

export type PublicAnime = AnimePublic<AnimeWithMappedImages>

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

const normalizeCarouselKeys = (value: unknown) => {
	if (!Array.isArray(value)) return []
	return value.map(item => (typeof item === 'string' && item.trim().length > 0 ? item.trim() : null))
}

const buildCarouselImages = (animeImages: Anime['images'], carouselKeys: Array<string | null>) => {
	const carouselImages = animeImages?.carouselImages ?? []
	const totalItems = Math.max(carouselImages.length, carouselKeys.length)

	if (totalItems === 0) return []

	return Array.from({ length: totalItems }, (_, index) => {
		const image = carouselImages[index]
		const carouselKey = carouselKeys[index] ?? getLegacyImageKey(image?.link)

		return {
			link: toImageProxyUrl(carouselKey) ?? normalizeMediaUrl(image?.link),
			position: image?.position ?? String(index + 1),
			width: image?.width ?? 0,
			height: image?.height ?? 0,
		}
	})
}

export const mapAnimeImages = <T extends AnimeWithMappedImages>(anime: T): AnimePublic<T> => {
	const animeImages = anime.images as Anime['images']
	const coverKey = anime.cover_image_key?.trim() || getLegacyImageKey(animeImages?.coverImage)
	const carouselKeys = normalizeCarouselKeys(anime.carousel_image_keys)
	const hasCanonicalImages = Boolean(coverKey) || carouselKeys.some(Boolean)

	const mappedAnimeImages = animeImages || hasCanonicalImages
		? {
				coverImage: toImageProxyUrl(coverKey) ?? normalizeMediaUrl(animeImages?.coverImage),
				carouselImages: buildCarouselImages(animeImages, carouselKeys),
			}
		: null

	const { cover_image_key: _coverImageKey, carousel_image_keys: _carouselImageKeys, ...publicAnime } = anime

	return {
		...publicAnime,
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
