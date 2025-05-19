import { Router } from 'express'
import { endPoints } from '../../src/enums'
import { scrapeEpisodeSources } from '../../src/scrapers/episodes/scrapeEpisodeSources'
import type { EpisodeSources } from '../../src/types'
import { logger } from '../../src/utils/logger'
import { getEpisodeByEpisodeId } from '../controllers/episodes/getEpisodesBy'
import { getLatestEpisodes } from '../controllers/episodes/getLatestEpisodes'

const router = Router()

// Ruta para obtener los últimos episodios (corto TTL porque se actualizan frecuentemente)
router.get(endPoints.LATEST_EPISODES, async (_req, res) => {
	try {
		const latestEpisodes = await getLatestEpisodes()
		res.send(latestEpisodes)
	} catch (error) {
		logger.error(`Error al obtener los últimos episodios: ${error}`)
		res.status(500).send('Error al obtener los episodios')
	}
})

// Ruta para obtener episodio por ID (caché largo porque no cambian)
router.get(endPoints.EPISODE_BY_ID, async (req, res) => {
	const { episodeId } = req.params

	try {
		const episodes = await getEpisodeByEpisodeId(episodeId)

		if (!episodes) {
			res.status(404).send('Episodio no encontrado')
			return
		}

		res.send(episodes)
	} catch (error) {
		logger.error(`Error al obtener episodio ${episodeId}: ${error}`)
		res.status(500).send('Error al obtener el episodio')
	}
})

// Ruta para obtener fuentes de un episodio (caché medio)
router.get(endPoints.EPISODE_SOURCES, async (req, res) => {
	const { id } = req.params

	try {
		const episodeSources: EpisodeSources = await scrapeEpisodeSources(id)

		if (!episodeSources || Object.keys(episodeSources).length === 0) {
			res.status(404).send('No se encontraron fuentes para este episodio')
			return
		}

		res.send(episodeSources)
	} catch (error) {
		logger.error(`Error al obtener fuentes del episodio ${id}: ${error}`)
		res.status(500).send('Error al obtener las fuentes del episodio')
	}
})

export default router
