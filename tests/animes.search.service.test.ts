import { expect, mock, test } from 'bun:test'
import path from 'node:path'

process.env.VERCEL_ENV = 'test'
process.env.NODE_ENV = 'test'
process.env.SUPABASE_URL = process.env.SUPABASE_URL ?? 'http://127.0.0.1:54321'
process.env.SUPABASE_API_KEY = process.env.SUPABASE_API_KEY ?? 'test-supabase-key'

const rootDir = process.cwd()
const resolvePath = (relativePath: string) => path.resolve(rootDir, relativePath)

const rpc = mock(async () => ({
	data: [
		{
			animeId: 'one-piece',
			title: 'One Piece',
			type: 'TV',
			status: 'En emision',
			genres: ['Accion'],
			images: null,
			description: 'Piratas',
			otherTitles: null,
			rank: 1,
			relevance: 0.99,
		},
	],
	error: null,
}))

const inQuery = mock(async () => ({
	data: [
		{
			animeId: 'one-piece',
			images: null,
			cover_image_key: 'animes/one-piece/cover.webp',
			carousel_image_keys: ['animes/one-piece/banner-1.webp'],
		},
	],
	error: null,
}))

const select = mock(() => ({
	in: inQuery,
}))

const from = mock(() => ({
	select,
}))

await mock.module(resolvePath('src/services/database/supabaseClient.ts'), () => ({
	supabase: {
		rpc,
		from,
	},
}))

const { getAnimesByQuery } = await import('../src/services/database/animes.ts')

test('getAnimesByQuery complementa resultados del RPC con keys canonicas desde animes', async () => {
	const response = await getAnimesByQuery('one-piece', 2, 3)

	expect(rpc).toHaveBeenCalledWith('search_animes', {
		search_query: 'one-piece',
		result_limit: 3,
		result_offset: 3,
	})
	expect(from).toHaveBeenCalledWith('animes')
	expect(select).toHaveBeenCalledWith('animeId, images, cover_image_key, carousel_image_keys')
	expect(inQuery).toHaveBeenCalledWith('animeId', ['one-piece'])
	expect(response.data).toEqual([
		{
			animeId: 'one-piece',
			title: 'One Piece',
			type: 'TV',
			status: 'En emision',
			genres: ['Accion'],
			images: null,
			description: 'Piratas',
			otherTitles: null,
			rank: 1,
			relevance: 0.99,
			cover_image_key: 'animes/one-piece/cover.webp',
			carousel_image_keys: ['animes/one-piece/banner-1.webp'],
		},
	])
})
