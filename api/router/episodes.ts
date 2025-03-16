import { Router } from 'express'
import { endPoints } from '../../src/enums'
import { scrapeEpisodeSources } from '../../src/scrapers/episodes/scrapeEpisodeSources'
import type { EpisodeSources } from '../../src/types'
import { getEpisodeByEpisodeId } from '../controllers/episodes/getEpisodesBy'
import { getLatestEpisodes } from '../controllers/episodes/getLatestEpisodes'

const router = Router()

router.get(endPoints.LATEST_EPISODES, async (_req, res, next) => {
	// try {
	//   const latestEpisodes = await getLatestEpisodes()
	//   res.send(latestEpisodes)
	// } catch (error) {
	//   next(error)
	// }
	const latestEpisodes = await getLatestEpisodes()
	res.send(latestEpisodes)
})

router.get(endPoints.EPISODE_BY_ID, async (req, res) => {
	const { episodeId } = req.params

	const episodes = await getEpisodeByEpisodeId(episodeId)
	res.send(episodes)
})

router.get(endPoints.EPISODE_SOURCES, async (req, res) => {
	const { id } = req.params

	const episodeSources: EpisodeSources = await scrapeEpisodeSources(id)
	res.send(episodeSources)
})

export default router
