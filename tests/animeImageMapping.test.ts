import { beforeEach, expect, mock, test } from 'bun:test'
import path from 'node:path'
import { setOriginPath } from '../src/config'
import { encodeImageKey } from '../src/utils/imageToken'

process.env.VERCEL_ENV = 'test'
process.env.NODE_ENV = 'test'
process.env.SUPABASE_URL = process.env.SUPABASE_URL ?? 'http://127.0.0.1:54321'
process.env.SUPABASE_API_KEY = process.env.SUPABASE_API_KEY ?? 'test-supabase-key'

const rootDir = process.cwd()
const resolvePath = (relativePath: string) => path.resolve(rootDir, relativePath)

await mock.module(resolvePath('src/services/database/animes.ts'), () => ({
	getAnimeBy: async () => ({ data: null, error: null }),
	getRelatedAnimesFromDb: async () => [],
}))

const { mapAnimeImages } = await import('../api/controllers/animes/getAnimeInfo')

beforeEach(() => {
	setOriginPath('http://127.0.0.1:3000/')
})

test('mapAnimeImages convierte uploads legacy a /api/image/:token', () => {
	const anime = mapAnimeImages({
		animeId: 'dorohedoro-season-2',
		title: 'Dorohedoro Season 2',
		images: {
			coverImage: 'https://anime-scrapper-alpha.vercel.app/uploads/animes/covers/4334.jpg',
			carouselImages: [],
		},
	})

	expect(anime.images).toEqual({
		coverImage: `http://127.0.0.1:3000/api/image/${encodeImageKey('uploads/animes/covers/4334.jpg')}`,
		carouselImages: [],
	})
})

test('mapAnimeImages convierte image/<archivo> al proxy firmado', () => {
	const anime = mapAnimeImages({
		animeId: 'getter-robo-arc',
		title: 'Getter Robo Arc',
		images: {
			coverImage: 'image/getter-robo-arc.webp',
			carouselImages: [],
		},
	})

	expect(anime.images).toEqual({
		coverImage: `http://127.0.0.1:3000/api/image/${encodeImageKey('getter-robo-arc.webp')}`,
		carouselImages: [],
	})
})

test('mapAnimeImages no re-encoda URLs ya proxificadas', () => {
	const objectKey = 'uploads/animes/covers/4334.jpg'
	const token = encodeImageKey(objectKey)

	const anime = mapAnimeImages({
		animeId: 'dorohedoro-season-2',
		title: 'Dorohedoro Season 2',
		images: {
			coverImage: `https://anime-scrapper-alpha.vercel.app/api/image/${token}`,
			carouselImages: [],
		},
	})

	expect(anime.images).toEqual({
		coverImage: `http://127.0.0.1:3000/api/image/${token}`,
		carouselImages: [],
	})
})
