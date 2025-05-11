import { Router as RouterApp } from 'express'
import { animeStatus, endPoints } from '../../src/enums'
import { scrapeAllAnimes } from '../../src/scrapers/animes/scrapeAllAnimes'
import { scrapeEmisionAnimes } from '../../src/scrapers/animes/scrapeEmisionAnimes'
import { scrapeLastAnimes } from '../../src/scrapers/animes/scrapeLastAnimes'
import { scrapeRatingAnimes } from '../../src/scrapers/animes/scrapeRatingAnimes'
import { getAnimeInfo } from '../controllers/animes/getAnimeInfo'
import { searchAnimes } from '../controllers/animes/searchAnimes'
import { getEpisodesByAnimeId } from '../controllers/episodes/getEpisodesBy'
import { longCache, mediumCache, shortCache } from '../../src/middleware/expressCache'
import { searchLimiter } from '../../src/middleware/rateLimiter'
import { logger } from '../../src/utils/logger'

const router = RouterApp()

// Ruta para obtener todos los animes (con caché medio)
router.get('/', mediumCache, async (req, res) => {
	const { page } = req.query

	try {
		const foundAnimes = await scrapeAllAnimes(Number(page) || 1)
		
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

// Ruta para obtener los últimos animes (con caché corto)
router.get(endPoints.LATEST_ANIMES, shortCache, async (req, res) => {
	const { limit } = req.query

	try {
		const latestAnimes = await scrapeLastAnimes(Number(limit))
		
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

// Ruta para obtener animes en emisión (con caché medio)
router.get(endPoints.BROADCAST_ANIMES, mediumCache, async (req, res) => {
	const { limit } = req.query

	try {
		const emisionAnimes = await scrapeEmisionAnimes(Number(limit))
		
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
	const { limit } = req.query

	const ratingAnimes = await scrapeRatingAnimes(animeStatus.BROADCAST, Number(limit))
	if (ratingAnimes.length === 0) {
		res.status(404).send('No se encontraron animes')
		return
	}

	res.send(ratingAnimes)
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
