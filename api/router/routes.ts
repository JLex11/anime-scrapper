import { Router } from 'express'
import { animeStatus } from '../enums'
import { scrapeEmisionAnimes, scrapeFoundAnimes, scrapeFullAnimeInfo, scrapeLastAnimes, scrapeRatingAnimes } from '../scrapers/animes'
import { scrapeEpisodeSources, scrapeLastEpisodes } from '../scrapers/episodes'
import { endPoints } from './../enums'
import { Anime, EpisodeSources } from './../types.d'
import { mappedOriginUrl } from './../utils/mappedOriginUrl'
import routesDocumentation from './routesDocumentation'

const router = Router()

router.get('/', (req, res) => {
  return res.send(routesDocumentation.map(docRoute => ({
    ...docRoute,
    route: mappedOriginUrl(`api${docRoute.route}`, req)
  })))
})

router.get(endPoints.LATEST_EPISODES, async (req, res) => {
  const latestEpisodes = await scrapeLastEpisodes()
  return res.send(latestEpisodes.map(latestEpisode => ({
    ...latestEpisode,
    image: mappedOriginUrl(latestEpisode.image, req)
  })))
})

router.get(endPoints.EPISODE_SOURCES, async (req, res) => {
  const { id } = req.params

  const episodeSources: EpisodeSources = await scrapeEpisodeSources(id)
  return res.send(episodeSources)
})

router.get(endPoints.LATEST_ANIMES, async (req, res) => {
  const latestAnimes = await scrapeLastAnimes()
  return res.send(latestAnimes.map(latestAnime => ({
    ...latestAnime,
    image: mappedOriginUrl(latestAnime.image, req)
  })))
})

router.get(endPoints.BROADCAST_ANIMES, async (req, res) => {
  const emisionAnimes = await scrapeEmisionAnimes()
  return res.send(emisionAnimes.map(emisionAnime => ({
    ...emisionAnime,
    image: mappedOriginUrl(emisionAnime.image, req)
  })))
})

router.get(endPoints.RATING_ANIMES, async (req, res) => {
  const ratingAnimes = await scrapeRatingAnimes(animeStatus.BROADCAST)
  return res.send(ratingAnimes.map(ratingAnime => ({
    ...ratingAnime,
    image: mappedOriginUrl(ratingAnime.image, req)
  })))
})

router.get(endPoints.SEARCH_ANIMES, async (req, res) => {
  const { query } = req.params

  const foundAnimes = await scrapeFoundAnimes(query)
  return res.send(foundAnimes.map(foundAnime => ({
    ...foundAnime,
    image: mappedOriginUrl(foundAnime.image, req)
  })))
})

router.get(endPoints.ANIME_INFO, async (req, res) => {
  const { animeId } = req.params

  const foundAnime: Anime = await scrapeFullAnimeInfo(animeId)
  return res.send({
    ...foundAnime,
    image: mappedOriginUrl(foundAnime.image, req),
    episodes: foundAnime.episodes.map(e => ({
      ...e,
      image: mappedOriginUrl(e.image, req)
    }))
  })
})

export default router
