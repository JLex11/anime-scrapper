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

test('mapAnimeImages usa cover_image_key como fuente canonica aunque coverImage sea externo', () => {
	const anime = mapAnimeImages({
		animeId: 'frieren',
		title: 'Frieren',
		cover_image_key: 'animes/frieren/cover.jpg',
		images: {
			coverImage: 'https://cdn.example.invalid/frieren-cover.jpg',
			carouselImages: [],
		},
	})

	expect(anime.images).toEqual({
		coverImage: `http://127.0.0.1:3000/api/image/${encodeImageKey('animes/frieren/cover.jpg')}`,
		carouselImages: [],
	})
	expect('cover_image_key' in anime).toBe(false)
	expect('carousel_image_keys' in anime).toBe(false)
})

test('mapAnimeImages usa carousel_image_keys aunque link legacy sea null', () => {
	const anime = mapAnimeImages({
		animeId: 'frieren',
		title: 'Frieren',
		carousel_image_keys: ['animes/frieren/carousel-1.jpg', 'animes/frieren/carousel-2.jpg'],
		images: {
			coverImage: null,
			carouselImages: [
				{
					link: null,
					position: '1',
					width: 1280,
					height: 720,
				},
				{
					link: 'https://cdn.example.invalid/frieren-banner-2.jpg',
					position: '2',
					width: 1280,
					height: 720,
				},
			],
		},
	})

	expect(anime.images).toEqual({
		coverImage: null,
		carouselImages: [
			{
				link: `http://127.0.0.1:3000/api/image/${encodeImageKey('animes/frieren/carousel-1.jpg')}`,
				position: '1',
				width: 1280,
				height: 720,
			},
			{
				link: `http://127.0.0.1:3000/api/image/${encodeImageKey('animes/frieren/carousel-2.jpg')}`,
				position: '2',
				width: 1280,
				height: 720,
			},
		],
	})
})

test('mapAnimeImages construye images desde keys aunque images sea null', () => {
	const anime = mapAnimeImages({
		animeId: 'blue-lock',
		title: 'Blue Lock',
		cover_image_key: 'animes/blue-lock/cover.webp',
		carousel_image_keys: ['animes/blue-lock/banner-1.webp', 'animes/blue-lock/banner-2.webp'],
		images: null,
	})

	expect(anime.images).toEqual({
		coverImage: `http://127.0.0.1:3000/api/image/${encodeImageKey('animes/blue-lock/cover.webp')}`,
		carouselImages: [
			{
				link: `http://127.0.0.1:3000/api/image/${encodeImageKey('animes/blue-lock/banner-1.webp')}`,
				position: '1',
				width: 0,
				height: 0,
			},
			{
				link: `http://127.0.0.1:3000/api/image/${encodeImageKey('animes/blue-lock/banner-2.webp')}`,
				position: '2',
				width: 0,
				height: 0,
			},
		],
	})
})

test('mapAnimeImages preserva indices de carousel_image_keys y no los compacta', () => {
	const anime = mapAnimeImages({
		animeId: 'vinland-saga',
		title: 'Vinland Saga',
		carousel_image_keys: ['animes/vinland-saga/banner-1.webp', '', 'animes/vinland-saga/banner-3.webp'],
		images: {
			coverImage: null,
			carouselImages: [
				{
					link: 'https://cdn.example.invalid/banner-1.jpg',
					position: '1',
					width: 1280,
					height: 720,
				},
				{
					link: 'https://anime-scrapper-alpha.vercel.app/uploads/animes/banners/vinland-2.jpg',
					position: '2',
					width: 1280,
					height: 720,
				},
				{
					link: 'https://cdn.example.invalid/banner-3.jpg',
					position: '3',
					width: 1280,
					height: 720,
				},
			],
		},
	})

	expect(anime.images?.carouselImages).toEqual([
		{
			link: `http://127.0.0.1:3000/api/image/${encodeImageKey('animes/vinland-saga/banner-1.webp')}`,
			position: '1',
			width: 1280,
			height: 720,
		},
		{
			link: `http://127.0.0.1:3000/api/image/${encodeImageKey('uploads/animes/banners/vinland-2.jpg')}`,
			position: '2',
			width: 1280,
			height: 720,
		},
		{
			link: `http://127.0.0.1:3000/api/image/${encodeImageKey('animes/vinland-saga/banner-3.webp')}`,
			position: '3',
			width: 1280,
			height: 720,
		},
	])
})
