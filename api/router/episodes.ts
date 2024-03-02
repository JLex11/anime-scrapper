import { Router as RouterApp, type Router as RouterType } from 'express'
import { endPoints } from '../../src/enums'
import { scrapeEpisodeSources } from '../../src/scrapers/episodes/scrapeEpisodeSources'
import { EpisodeSources } from '../../src/types'
import { getEpisodeByEpisodeId } from '../controllers/episodes/getEpisodesBy'
import { getLatestEpisodes } from '../controllers/episodes/getLatestEpisodes'

const router: RouterType = RouterApp()

router.get(endPoints.LATEST_EPISODES, async (_, res) => {
  const latestEpisodes = await getLatestEpisodes()
  return res.send(latestEpisodes)
})

router.get(endPoints.EPISODE_BY_ID, async (req, res) => {
  const { episodeId } = req.params

  const episodes = await getEpisodeByEpisodeId(episodeId)
  return res.send(episodes)
})

router.get(endPoints.EPISODE_SOURCES, async (req, res) => {
  const { id } = req.params

  const episodeSources: EpisodeSources = await scrapeEpisodeSources(id)
  return res.send(episodeSources)
})

export default router
