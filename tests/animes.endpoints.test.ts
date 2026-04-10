import { afterAll, beforeAll, describe, expect, jest, mock, test } from 'bun:test'
import { encodeImageKey } from '../src/utils/imageToken'

process.env.VERCEL_ENV = 'test'
process.env.NODE_ENV = 'test'
process.env.SUPABASE_URL = process.env.SUPABASE_URL ?? 'http://127.0.0.1:54321'
process.env.SUPABASE_API_KEY = process.env.SUPABASE_API_KEY ?? 'test-supabase-key'
process.env.GOOGLE_API_KEY = process.env.GOOGLE_API_KEY ?? 'test-google-key'
process.env.GOOGLE_SEARCH_ENGINE_ID = process.env.GOOGLE_SEARCH_ENGINE_ID ?? 'test-search-engine-id'
process.env.R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID ?? 'test-r2-account-id'
process.env.R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID ?? 'test-r2-access-key'
process.env.R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY ?? 'test-r2-secret-access-key'

const feedDirectory = [
	{
		animeId: 'naruto',
		title: 'Naruto',
		cover_image_key: 'animes/naruto/cover.webp',
		carousel_image_keys: ['animes/naruto/banner-1.webp'],
		images: null,
	},
	{
		animeId: 'bleach',
		title: 'Bleach',
		images: null,
	},
]

const feedLatest = [
	{
		animeId: 'frieren',
		title: 'Frieren',
		cover_image_key: 'animes/frieren/cover.webp',
		images: {
			coverImage: 'https://cdn.example.invalid/frieren-cover.jpg',
			carouselImages: [],
		},
	},
]

const feedBroadcast = [
	{
		animeId: 'one-piece',
		title: 'One Piece',
		images: null,
	},
]

const feedRating = [
	{
		animeId: 'fullmetal-alchemist-brotherhood',
		title: 'Fullmetal Alchemist: Brotherhood',
		rank: 1,
		images: null,
	},
]

const animeInfo = {
	animeId: 'naruto',
	title: 'Naruto',
	description: 'A ninja story',
	cover_image_key: 'animes/naruto/cover.webp',
	carousel_image_keys: ['animes/naruto/banner-1.webp', 'animes/naruto/banner-2.webp'],
	images: null,
}

const relatedAnimes = [
	{
		animeId: 'naruto-shippuden',
		title: 'Naruto Shippuden',
		relation: 'sequel',
	},
]

const episodes = [
	{
		episodeId: 'ep-1',
		animeId: 'naruto',
		title: 'Enter: Naruto Uzumaki!',
		originalLink: 'https://example.test/ep-1',
		episode: 1,
		image: null,
	},
	{
		episodeId: 'ep-2',
		animeId: 'naruto',
		title: 'My Name is Konohamaru!',
		originalLink: 'https://example.test/ep-2',
		episode: 2,
		image: null,
	},
]

const getAnimeFeed = jest.fn(async (feedType: string) => {
	switch (feedType) {
		case 'directory':
			return { data: feedDirectory, error: null }
		case 'latest':
			return { data: feedLatest, error: null }
		case 'broadcast':
			return { data: feedBroadcast, error: null }
		case 'rating':
			return { data: feedRating, error: null }
		default:
			return { data: [], error: null }
	}
})

const getAnimeBy = jest.fn(async (_column: string, value: string) => {
	if (value === 'missing-anime') {
		return { data: null, error: null }
	}

	return { data: animeInfo, error: null }
})

const getRelatedAnimesFromDb = jest.fn(async (animeId: string) => {
	if (animeId === 'missing-anime') {
		return []
	}

	return relatedAnimes
})

const getAnimesByQuery = jest.fn(async (query: string) => {
	if (query === 'missing-anime') {
		return { data: null, error: null }
	}

	return {
		data: [
			{
				animeId: 'one-piece',
				title: 'One Piece',
				cover_image_key: 'animes/one-piece/cover.webp',
				carousel_image_keys: ['animes/one-piece/banner-1.webp'],
				images: null,
			},
		],
		error: null,
	}
})

const getEpisodeBy = jest.fn(async (_column: string, value: string) => {
	if (value === 'missing-anime') {
		return { data: [], error: null }
	}

	return { data: episodes, error: null }
})

const getLatestEpisodesFeed = jest.fn(async () => ({
	data: [],
	error: null,
}))

await mock.module('../src/services/database/animes', () => ({
	getAnimeBy,
	getRelatedAnimesFromDb,
	getAnimesByQuery,
	getAnimeFeed,
}))

await mock.module('../src/services/database/episodes', () => ({
	getEpisodeBy,
	getLatestEpisodesFeed,
}))

const { default: app } = await import('../api/index')

let server: ReturnType<typeof app.listen> | undefined
let baseUrl = ''

beforeAll(async () => {
	server = app.listen(0)

	await new Promise<void>((resolve, reject) => {
		server?.once('listening', () => {
			const address = server?.address()
			if (!address || typeof address === 'string') {
				reject(new Error('No se pudo obtener el puerto del servidor de pruebas'))
				return
			}

			baseUrl = `http://127.0.0.1:${address.port}`
			resolve()
		})

		server?.once('error', reject)
	})
})

afterAll(async () => {
	mock.restore()

	if (!server) return

	await new Promise<void>((resolve, reject) => {
		server?.close(error => {
			if (error) {
				reject(error)
				return
			}

			resolve()
		})
	})
})

const requestJson = async (path: string) => {
	const response = await fetch(`${baseUrl}${path}`)
	return { response, body: await response.json() }
}

describe('animes endpoints', () => {
	test('GET /api/animes responds with the directory feed', async () => {
		const { response, body } = await requestJson('/api/animes')

		expect(response.status).toBe(200)
		expect(body).toEqual([
			{
				animeId: 'naruto',
				title: 'Naruto',
				images: {
					coverImage: `${baseUrl}/api/image/${encodeImageKey('animes/naruto/cover.webp')}`,
					carouselImages: [
						{
							link: `${baseUrl}/api/image/${encodeImageKey('animes/naruto/banner-1.webp')}`,
							position: '1',
							width: 0,
							height: 0,
						},
					],
				},
			},
			{
				animeId: 'bleach',
				title: 'Bleach',
				images: null,
			},
		])
		expect(body[0].cover_image_key).toBeUndefined()
		expect(body[0].carousel_image_keys).toBeUndefined()
		expect(getAnimeFeed).toHaveBeenCalledWith('directory', { page: 1, pageSize: 24 })
	})

	test('GET /api/animes/latest responds with the latest feed', async () => {
		const { response, body } = await requestJson('/api/animes/latest?limit=2')

		expect(response.status).toBe(200)
		expect(body).toEqual([
			{
				animeId: 'frieren',
				title: 'Frieren',
				images: {
					coverImage: `${baseUrl}/api/image/${encodeImageKey('animes/frieren/cover.webp')}`,
					carouselImages: [],
				},
			},
		])
		expect(getAnimeFeed).toHaveBeenCalledWith('latest', { limit: 2 })
	})

	test('GET /api/animes/broadcast responds with the broadcast feed', async () => {
		const { response, body } = await requestJson('/api/animes/broadcast?limit=5')

		expect(response.status).toBe(200)
		expect(body).toEqual(feedBroadcast)
		expect(getAnimeFeed).toHaveBeenCalledWith('broadcast', { limit: 5 })
	})

	test('GET /api/animes/latest/rating responds with the rating feed', async () => {
		const { response, body } = await requestJson('/api/animes/latest/rating?limit=3')

		expect(response.status).toBe(200)
		expect(body).toEqual(feedRating)
		expect(getAnimeFeed).toHaveBeenCalledWith('rating', { limit: 3 })
	})

	test('GET /api/animes/search/:query responds with matching animes', async () => {
		const { response, body } = await requestJson('/api/animes/search/one-piece?page=2&pageSize=3')

		expect(response.status).toBe(200)
		expect(body).toEqual([
			{
				animeId: 'one-piece',
				title: 'One Piece',
				images: {
					coverImage: `${baseUrl}/api/image/${encodeImageKey('animes/one-piece/cover.webp')}`,
					carouselImages: [
						{
							link: `${baseUrl}/api/image/${encodeImageKey('animes/one-piece/banner-1.webp')}`,
							position: '1',
							width: 0,
							height: 0,
						},
					],
				},
			},
		])
		expect(body[0].cover_image_key).toBeUndefined()
		expect(body[0].carousel_image_keys).toBeUndefined()
		expect(getAnimesByQuery).toHaveBeenCalledWith('one-piece', 2, 3)
	})

	test('GET /api/animes/:animeId responds with anime info', async () => {
		const { response, body } = await requestJson('/api/animes/naruto')

		expect(response.status).toBe(200)
		expect(body).toEqual({
			animeId: 'naruto',
			title: 'Naruto',
			description: 'A ninja story',
			images: {
				coverImage: `${baseUrl}/api/image/${encodeImageKey('animes/naruto/cover.webp')}`,
				carouselImages: [
					{
						link: `${baseUrl}/api/image/${encodeImageKey('animes/naruto/banner-1.webp')}`,
						position: '1',
						width: 0,
						height: 0,
					},
					{
						link: `${baseUrl}/api/image/${encodeImageKey('animes/naruto/banner-2.webp')}`,
						position: '2',
						width: 0,
						height: 0,
					},
				],
			},
			relatedAnimes,
		})
		expect(body.cover_image_key).toBeUndefined()
		expect(body.carousel_image_keys).toBeUndefined()
		expect(getAnimeBy).toHaveBeenCalledWith('animeId', 'naruto')
		expect(getRelatedAnimesFromDb).toHaveBeenCalledWith('naruto')
	})

	test('GET /api/animes/:animeId/related responds with related animes', async () => {
		const { response, body } = await requestJson('/api/animes/naruto/related')

		expect(response.status).toBe(200)
		expect(body).toEqual(relatedAnimes)
		expect(getRelatedAnimesFromDb).toHaveBeenCalledWith('naruto')
	})

	test('GET /api/animes/:animeId/episodes responds with mapped episodes', async () => {
		const { response, body } = await requestJson('/api/animes/naruto/episodes?offset=1&limit=2')

		expect(response.status).toBe(200)
		expect(body).toEqual([
			{
				originalLink: 'https://example.test/ep-1',
				title: 'Enter: Naruto Uzumaki!',
				image: null,
				episode: 1,
				episodeId: 'ep-1',
				animeId: 'naruto',
			},
			{
				originalLink: 'https://example.test/ep-2',
				title: 'My Name is Konohamaru!',
				image: null,
				episode: 2,
				episodeId: 'ep-2',
				animeId: 'naruto',
			},
		])
		expect(getEpisodeBy).toHaveBeenCalledWith('animeId', 'naruto', 1, 2)
	})

	test('GET /api/animes/:animeId returns 404 when the anime does not exist', async () => {
		const response = await fetch(`${baseUrl}/api/animes/missing-anime`)

		expect(response.status).toBe(404)
		expect(await response.text()).toBe('No se encontró el anime')
	})
})
