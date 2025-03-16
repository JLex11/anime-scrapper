import { Router as RouterApp } from 'express'
import { animeStatus, endPoints } from '../../src/enums'
import { scrapeAllAnimes } from '../../src/scrapers/animes/scrapeAllAnimes'
import { scrapeEmisionAnimes } from '../../src/scrapers/animes/scrapeEmisionAnimes'
import { scrapeLastAnimes } from '../../src/scrapers/animes/scrapeLastAnimes'
import { scrapeRatingAnimes } from '../../src/scrapers/animes/scrapeRatingAnimes'
import { getAnimeInfo } from '../controllers/animes/getAnimeInfo'
import { searchAnimes } from '../controllers/animes/searchAnimes'
import { getEpisodesByAnimeId } from '../controllers/episodes/getEpisodesBy'

const router = RouterApp()

router.get('/', async (req, res) => {
	const { page } = req.query

	const foundAnimes = await scrapeAllAnimes(Number(page) || 1)
	if (foundAnimes.length === 0) {
		res.status(404).send('No se encontraron animes')
		return
	}

	res.send(foundAnimes)
})

router.get(endPoints.LATEST_ANIMES, async (req, res) => {
	const { limit } = req.query

	const latestAnimes = await scrapeLastAnimes(Number(limit))
	if (latestAnimes.length === 0) {
		res.status(404).send('No se encontraron animes')
		return
	}

	res.send(latestAnimes)
})

router.get(endPoints.BROADCAST_ANIMES, async (req, res) => {
	const { limit } = req.query

	const emisionAnimes = await scrapeEmisionAnimes(Number(limit))
	if (emisionAnimes.length === 0) {
		res.status(404).send('No se encontraron animes')
		return
	}

	res.send(emisionAnimes)
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
