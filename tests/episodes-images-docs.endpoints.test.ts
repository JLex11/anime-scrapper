import { afterAll, beforeAll, expect, mock, test } from 'bun:test'
import path from 'node:path'
import type { AddressInfo } from 'node:net'
import { encodeImageKey } from '../src/utils/imageToken'

process.env.VERCEL_ENV = 'test'

const rootDir = process.cwd()
const resolvePath = (relativePath: string) => path.resolve(rootDir, relativePath)

const latestEpisodeImageKey = 'covers/latest-episode.jpg'
const episodeImageKey = 'covers/episode-detail.jpg'

const latestEpisode = {
	originalLink: 'https://example.com/anime/latest-episode',
	title: 'Latest episode',
	image_key: latestEpisodeImageKey,
	episode: 42,
	episodeId: 'latest-episode-42',
	animeId: 'anime-1',
	created_at: '2026-04-02T10:00:00.000Z',
	updated_at: '2026-04-02T10:30:00.000Z',
}

const episodeDetail = {
	originalLink: 'https://example.com/anime/episode-detail',
	title: 'Episode detail',
	image_key: episodeImageKey,
	episode: 7,
	episodeId: 'episode-7',
	animeId: 'anime-2',
	created_at: '2026-04-02T11:00:00.000Z',
	updated_at: '2026-04-02T11:30:00.000Z',
}

const episodeSources = {
	episodeId: 'episode-7',
	episode: 7,
	videos: [
		{
			name: 'Primary source',
			url: 'https://stream.example.invalid/video-1',
		},
	],
	scraped_at: '2026-04-02T11:31:00.000Z',
	expires_at: '2026-04-03T11:31:00.000Z',
	updated_at: '2026-04-02T11:31:30.000Z',
}

await Promise.all([
	mock.module(resolvePath('src/services/database/episodes.ts'), () => ({
		getLatestEpisodesFeed: async (limit = 30) => ({
			data: [latestEpisode].slice(0, limit),
			error: null,
		}),
		getEpisodeBy: async (column: string, value: string) => {
			if (column === 'episodeId' && value === episodeDetail.episodeId) {
				return { data: [episodeDetail], error: null }
			}

			return { data: [], error: null }
		},
	})),
	mock.module(resolvePath('src/services/database/episodeSources.ts'), () => ({
		getEpisodeSourcesByEpisodeId: async (episodeId: string) => ({
			data: episodeId === episodeSources.episodeId ? episodeSources : null,
			error: null,
		}),
	})),
	mock.module(resolvePath('src/services/cloudflareR2.ts'), () => ({
		createSignedR2GetUrlByToken: async (imageToken: string) => {
			if (imageToken === 'valid-image-token') {
				return 'https://r2.example.invalid/signed/proxy-image.jpg?X-Amz-Signature=fake'
			}

			return null
		},
	})),
	mock.module(resolvePath('src/services/database/supabaseClient.ts'), () => ({
		supabase: {},
	})),
	mock.module(resolvePath('api/router/animes.ts'), () => ({
		default: (_req: unknown, _res: unknown, next: () => void) => next(),
	})),
])

const app = (await import('../api/index.ts')).default

let server: ReturnType<typeof app.listen>
let baseUrl = ''

beforeAll(() => {
	server = app.listen(0)
	const address = server.address() as AddressInfo | string | null

	if (!address || typeof address === 'string') {
		throw new Error('No se pudo obtener el puerto del servidor de pruebas')
	}

	baseUrl = `http://127.0.0.1:${address.port}`
})

afterAll(async () => {
	await new Promise<void>((resolve, reject) => {
		server.close((error?: Error) => {
			if (error) {
				reject(error)
				return
			}

			resolve()
		})
	})

	mock.restore()
})

const request = (path: string, init?: RequestInit) => {
	return fetch(`${baseUrl}${path}`, {
		redirect: 'manual',
		...init,
	})
}

test('GET /api/episodes/latest returns mapped latest episodes', async () => {
	const response = await request('/api/episodes/latest')

	expect(response.status).toBe(200)

	const body = await response.json()
	expect(Array.isArray(body)).toBe(true)
	expect(body).toHaveLength(1)
	expect(body[0]).toMatchObject({
		episodeId: latestEpisode.episodeId,
		title: latestEpisode.title,
		animeId: latestEpisode.animeId,
		image: `${baseUrl}/api/image/${encodeImageKey(latestEpisodeImageKey)}`,
	})
})

test('GET /api/episodes/:episodeId returns the episode payload', async () => {
	const response = await request(`/api/episodes/${episodeDetail.episodeId}`)

	expect(response.status).toBe(200)

	const body = await response.json()
	expect(body).toMatchObject({
		episodeId: episodeDetail.episodeId,
		title: episodeDetail.title,
		animeId: episodeDetail.animeId,
		image: `${baseUrl}/api/image/${encodeImageKey(episodeImageKey)}`,
	})
})

test('GET /api/episodes/:episodeId/sources and legacy alias both return sources', async () => {
	for (const endpoint of [
		`/api/episodes/${episodeSources.episodeId}/sources`,
		`/api/episodes/sources/${episodeSources.episodeId}`,
	]) {
		const response = await request(endpoint)

		expect(response.status).toBe(200)

		const body = await response.json()
		expect(body).toMatchObject({
			episode: episodeSources.episode,
			scraped_at: episodeSources.scraped_at,
			expires_at: episodeSources.expires_at,
			updated_at: episodeSources.updated_at,
		})
		expect(body.videos).toHaveLength(1)
		expect(body.videos[0]).toMatchObject({
			name: 'Primary source',
			url: 'https://stream.example.invalid/video-1',
		})
	}
})

test('GET /api/image/:imageToken returns a signed redirect', async () => {
	const response = await request('/api/image/valid-image-token')

	expect(response.status).toBe(302)
	expect(response.headers.get('location')).toBe(
		'https://r2.example.invalid/signed/proxy-image.jpg?X-Amz-Signature=fake',
	)
	expect(response.headers.get('cache-control')).toBe('no-store')
})

test('GET /api/api-routes returns the documented routes with local origin', async () => {
	const response = await request('/api/api-routes')

	expect(response.status).toBe(200)

	const body = await response.json()
	expect(Array.isArray(body)).toBe(true)
	expect(body.length).toBeGreaterThan(0)

	const episodeRoutes = body.filter((route: { route?: string }) => route.route?.includes('/api/episodes'))
	const imageRoute = body.find((route: { route?: string }) => route.route?.includes('/api/image/'))

	expect(episodeRoutes.length).toBeGreaterThanOrEqual(4)
	expect(imageRoute?.route).toContain(baseUrl)
	expect(body).toEqual(
		expect.arrayContaining([
			expect.objectContaining({
				route: `${baseUrl}/api/episodes/latest`,
			}),
			expect.objectContaining({
				route: `${baseUrl}/api/image/:imageToken`,
			}),
		]),
	)
})

test('GET / and GET /api/ redirect to the docs UI', async () => {
	for (const endpoint of ['/', '/api/']) {
		const response = await request(endpoint)

		expect(response.status).toBe(302)
		expect(response.headers.get('location')).toBe('/api/api-docs/')
	}
})

test('GET /api/ruta-que-no-existe returns 404', async () => {
	const response = await request('/api/ruta-que-no-existe')

	expect(response.status).toBe(404)
	expect(await response.text()).toBe('Not found')
})
