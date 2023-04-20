import { Router } from 'express'
import {
  scrapeEmisionAnimes,
  scrapeFoundAnimes,
  scrapeFullAnimeInfo,
  scrapeLastAnimes,
  scrapeRatingAnimes,
} from '../scrapers/animes'
import { Anime } from '../types'
import { animeStatus, endPoints } from './../enums'

const router = Router()

router.get(endPoints.LATEST_ANIMES, async (req, res) => {
  const { limit } = req.query

  const latestAnimes = await scrapeLastAnimes(Number(limit))
  return res.send(latestAnimes)
})

router.get(endPoints.BROADCAST_ANIMES, async (_, res) => {
  const emisionAnimes = await scrapeEmisionAnimes()
  return res.send(emisionAnimes)
})

router.get(endPoints.RATING_ANIMES, async (req, res) => {
  const { limit } = req.query

  const ratingAnimes = await scrapeRatingAnimes(animeStatus.BROADCAST, Number(limit))
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
