import { expect, test } from 'bun:test'
import { decodeImageToken, encodeImageKey } from '../src/utils/imageToken'

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