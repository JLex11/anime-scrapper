import { Router } from 'express'
import { animeStatus } from '../enums'
import { scrapeEmisionAnimes, scrapeLastAnimes, scrapeRatingAnimes } from '../scrapers/animes'
import { scrapeEpisodeSources, scrapeLastEpisodes } from '../scrapers/episodes'
import { endPoints } from './../enums'
import routesDocumentation from './routesDocumentation'

const router = Router()

router.get('/', (_, res) => res.send(routesDocumentation))

router.get(endPoints.LATEST_EPISODES, async (_, res) => {
  const latestEpisodes = await scrapeLastEpisodes()
  return res.send(latestEpisodes)
})

router.get(`${endPoints.EPISODE_SOURCES}/:id`, async (req, res) => {
  const { id } = req.params

  const emisionAnimes = await scrapeEpisodeSources(id)
  return res.send(emisionAnimes)
})

router.get(endPoints.LATEST_ANIMES, async (_, res) => {
  const latestAnimes = await scrapeLastAnimes()
  return res.send(latestAnimes)
})

router.get(endPoints.BROADCAST_ANIMES, async (_, res) => {
  const emisionAnimes = await scrapeEmisionAnimes()
  return res.send(emisionAnimes)
})

router.get(endPoints.RATING_ANIMES, async (_, res) => {
  const ratingAnimes = await scrapeRatingAnimes(animeStatus.BROADCAST)
  return res.send(ratingAnimes)
})

export default router
