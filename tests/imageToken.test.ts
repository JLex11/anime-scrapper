import { expect, test } from 'bun:test'
import { decodeImageToken, encodeImageKey, getLegacyImageKey } from '../src/utils/imageToken'

test('decodeImageToken decodifica una key válida sin alterarla', () => {
	const objectKey = 'uploads/animes/covers/4347.jpg'
	const token = encodeImageKey(objectKey)

	expect(decodeImageToken(token)).toBe(objectKey)
})

test('decodeImageToken normaliza keys con slash inicial', () => {
	const token = encodeImageKey('/uploads/animes/covers/4347.jpg')

	expect(decodeImageToken(token)).toBe('uploads/animes/covers/4347.jpg')
})

test('decodeImageToken remueve prefijo legacy image/', () => {
	const token = encodeImageKey('image/uploads/animes/covers/4347.jpg')

	expect(decodeImageToken(token)).toBe('uploads/animes/covers/4347.jpg')
})

test('decodeImageToken devuelve null con payload vacío tras normalización', () => {
	const token = encodeImageKey('/image/')

	expect(decodeImageToken(token)).toBeNull()
})

test('getLegacyImageKey reconoce object keys legacy en uploads/', () => {
	expect(getLegacyImageKey('/uploads/animes/covers/4347.jpg')).toBe('uploads/animes/covers/4347.jpg')
	expect(getLegacyImageKey('https://anime-scrapper-alpha.vercel.app/uploads/animes/covers/4347.jpg')).toBe(
		'uploads/animes/covers/4347.jpg',
	)
})

test('getLegacyImageKey reconoce object keys legacy en image/', () => {
	expect(getLegacyImageKey('image/getter-robo-arc.webp')).toBe('getter-robo-arc.webp')
	expect(getLegacyImageKey('/image/getter-robo-arc.webp')).toBe('getter-robo-arc.webp')
	expect(getLegacyImageKey('https://anime-scrapper-alpha.vercel.app/image/getter-robo-arc.webp')).toBe(
		'getter-robo-arc.webp',
	)
})

test('getLegacyImageKey decodifica tokens ya proxificados en /api/image/', () => {
	const objectKey = 'uploads/animes/covers/4347.jpg'
	const token = encodeImageKey(objectKey)

	expect(getLegacyImageKey(`/api/image/${token}`)).toBe(objectKey)
	expect(getLegacyImageKey(`https://anime-scrapper-alpha.vercel.app/api/image/${token}`)).toBe(objectKey)
})
