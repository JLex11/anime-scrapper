import { Router } from 'express'
import { scrapeEpisodeSources } from '../scrapers/episodes/scrapeEpisodeSources'
import { scrapeLastEpisodes } from '../scrapers/episodes/scrapeLastEpisodes'
import { endPoints } from './../enums'
import { EpisodeSources } from './../types.d'

const router = Router()

router.get(endPoints.LATEST_EPISODES, async (req, res) => {
  const latestEpisodes = await scrapeLastEpisodes()
  return res.send(latestEpisodes)
})

router.get(endPoints.EPISODE_SOURCES, async (req, res) => {
  const { id } = req.params

  const episodeSources: EpisodeSources = await scrapeEpisodeSources(id)
  return res.send(episodeSources)
})

export default router