import { type Response, Router } from 'express'
import { endPoints } from '../../src/enums'
import { logger } from '../../src/utils/logger'
import { getEpisodeSources } from '../controllers/episodes/getEpisodeSources'
import { getEpisodeByEpisodeId } from '../controllers/episodes/getEpisodesBy'
import { getLatestEpisodes } from '../controllers/episodes/getLatestEpisodes'

const router = Router()

// Ruta para obtener los últimos episodios precalculados en DB.
router.get(endPoints.LATEST_EPISODES, async (req, res) => {
	const limit = Number(req.query.limit) || 30

	try {
		const latestEpisodes = await getLatestEpisodes(limit)
		if (latestEpisodes.length === 0) {
			res.status(404).send('No se encontraron episodios')
			return
		}

		res.send(latestEpisodes)
	} catch (error) {
		logger.error(`Error al obtener los últimos episodios: ${error}`)
		res.status(500).send('Error al obtener los episodios')
	}
})

// Ruta para obtener episodio por ID desde DB.
router.get(endPoints.EPISODE_BY_ID, async (req, res) => {
	const { episodeId } = req.params

	try {
		const episode = await getEpisodeByEpisodeId(episodeId)

		if (!episode) {
			res.status(404).send('Episodio no encontrado')
			return
		}

		res.send(episode)
	} catch (error) {
		logger.error(`Error al obtener episodio ${episodeId}: ${error}`)
		res.status(500).send('Error al obtener el episodio')
	}
})

const handleGetEpisodeSources = async (episodeId: string, res: Response) => {
	try {
		const episodeSources = await getEpisodeSources(episodeId)

		if (!episodeSources) {
			res.status(404).send('No se encontraron fuentes para este episodio')
			return
		}

		res.send(episodeSources)
	} catch (error) {
		logger.error(`Error al obtener fuentes del episodio ${episodeId}: ${error}`)
		res.status(500).send('Error al obtener las fuentes del episodio')
	}
}

router.get(endPoints.EPISODE_SOURCES_BY_EPISODE_ID, async (req, res) => {
	await handleGetEpisodeSources(req.params.episodeId, res)
})

// Alias legado, se mantiene temporalmente para compatibilidad.
router.get(endPoints.EPISODE_SOURCES, async (req, res) => {
	await handleGetEpisodeSources(req.params.id, res)
})

export default router
