import { Router as RouterApp } from 'express'
import { endPoints } from '../../src/enums'
import { logger } from '../../src/utils/logger'
import { getAnimesFeed } from '../controllers/animes/getAnimesFeed'
import { getAnimeInfo } from '../controllers/animes/getAnimeInfo'
import { getRelatedAnimes } from '../controllers/animes/getRelatedAnimes'
import { searchAnimes } from '../controllers/animes/searchAnimes'
import { getEpisodesByAnimeId } from '../controllers/episodes/getEpisodesBy'

const router = RouterApp()

router.get('/', async (req, res) => {
	const page = Number(req.query.page) || 1
	const pageSize = Number(req.query.pageSize) || 24

	try {
		const foundAnimes = await getAnimesFeed('directory', { page, pageSize })

		if (foundAnimes.length === 0) {
			res.status(404).send('No se encontraron animes')
			return
		}

		res.send(foundAnimes)
	} catch (error) {
		logger.error(`Error al obtener todos los animes: ${error}`)
		res.status(500).send('Error al obtener los animes')
	}
})

// Ruta para obtener los últimos animes precalculados.
router.get(endPoints.LATEST_ANIMES, async (req, res) => {
	const limit = Number(req.query.limit) || 15

	try {
		const latestAnimes = await getAnimesFeed('latest', { limit })

		if (latestAnimes.length === 0) {
			res.status(404).send('No se encontraron animes')
			return
		}

		res.send(latestAnimes)
	} catch (error) {
		logger.error(`Error al obtener los últimos animes: ${error}`)
		res.status(500).send('Error al obtener los animes')
	}
})

// Ruta para obtener animes en emisión precalculados.
router.get(endPoints.BROADCAST_ANIMES, async (req, res) => {
	const limit = Number(req.query.limit) || 20

	try {
		const emisionAnimes = await getAnimesFeed('broadcast', { limit })

		if (emisionAnimes.length === 0) {
			res.status(404).send('No se encontraron animes')
			return
		}

		res.send(emisionAnimes)
	} catch (error) {
		logger.error(`Error al obtener animes en emisión: ${error}`)
		res.status(500).send('Error al obtener los animes')
	}
})

router.get(endPoints.RATING_ANIMES, async (req, res) => {
	const limit = Number(req.query.limit) || 10

	try {
		const ratingAnimes = await getAnimesFeed('rating', { limit })
		if (ratingAnimes.length === 0) {
			res.status(404).send('No se encontraron animes')
			return
		}

		res.send(ratingAnimes)
	} catch (error) {
		logger.error(`Error al obtener animes mejor valorados: ${error}`)
		res.status(500).send('Error al obtener los animes')
	}
})

router.get(endPoints.SEARCH_ANIMES, async (req, res) => {
	const { query } = req.params
	const { page, pageSize } = req.query

	const foundAnimes = await searchAnimes(query, Number(page), Number(pageSize))
	if (!foundAnimes) {
		res.status(404).send('No se encontraron animes')
		return
	}

	res.send(foundAnimes)
})

router.get(endPoints.ANIME_INFO, async (req, res) => {
	const { animeId } = req.params

	const animeInfo = await getAnimeInfo(animeId)
	if (!animeInfo) {
		res.status(404).send('No se encontró el anime')
		return
	}

	res.send(animeInfo)
})

router.get(endPoints.ANIME_RELATED, async (req, res) => {
	const { animeId } = req.params

	const relatedAnimes = await getRelatedAnimes(animeId)
	res.send(relatedAnimes)
})

router.get(endPoints.ANIME_EPISODES, async (req, res) => {
	const { animeId } = req.params
	const { offset, limit } = req.query

	const animeEpisodes = await getEpisodesByAnimeId(animeId, Number(offset), Number(limit))
	if (animeEpisodes.length === 0) {
		res.status(404).send('No se encontraron episodios')
		return
	}

	res.send(animeEpisodes)
})

export default router
