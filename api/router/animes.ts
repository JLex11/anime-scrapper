import { Router } from 'express'
import { animeStatus } from '../enums'
import { scrapeEmisionAnimes, scrapeFoundAnimes, scrapeFullAnimeInfo, scrapeLastAnimes, scrapeRatingAnimes } from '../scrapers/animes'
import { endPoints } from './../enums'
import { Anime } from './../types.d'

const router = Router()

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

router.get(endPoints.SEARCH_ANIMES, async (req, res) => {
  const { query } = req.params

  const foundAnimes = await scrapeFoundAnimes(query)
  return res.send(foundAnimes)
})

router.get(endPoints.ANIME_INFO, async (req, res) => {
  const { animeId } = req.params

  const foundAnime: Anime = await scrapeFullAnimeInfo(animeId)
  return res.send(foundAnime)
})

export default router
