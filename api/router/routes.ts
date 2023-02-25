import { Router } from 'express'
import { animeStatus } from '../enums'
import { scrapeEmisionAnimes, scrapeLastAnimes, scrapeRatingAnimes } from '../scrapers/animes'
import { scrapeEpisodeSources, scrapeLastEpisodes } from '../scrapers/episodes'
import routesDocumentation from './routesDocumentation'

const router = Router()

router.get('/api/', (_, res) => res.send(routesDocumentation))

router.get('/api/episodes/latest', async (_, res) => {
  const latestEpisodes = await scrapeLastEpisodes()
  return res.send(latestEpisodes)
})

router.get('/api/episodes/sources/:id', async (req, res) => {
  const { id } = req.params

  const emisionAnimes = await scrapeEpisodeSources(id)
  return res.send(emisionAnimes)
})

router.get('/api/animes/latest', async (_, res) => {
  const latestAnimes = await scrapeLastAnimes()
  return res.send(latestAnimes)
})

router.get('/api/animes/broadcast', async (_, res) => {
  const emisionAnimes = await scrapeEmisionAnimes()
  return res.send(emisionAnimes)
})

router.get('/api/animes/latest/rating', async (_, res) => {
  const ratingAnimes = await scrapeRatingAnimes(animeStatus.BROADCAST)
  return res.send(ratingAnimes)
})

export default router
