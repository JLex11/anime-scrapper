import { Router } from 'express'
import { mapOriginPath } from '../../src/utils/mapOriginPath'
import { getOriginPath } from '../config'
import { endPoints } from './../enums'

const router = Router()

const routesDocumentation = [
  {
    route: `/episodes${endPoints.LATEST_EPISODES}`,
    description: 'The latesd episodes',
  },
  {
    route: `/episodes${endPoints.EPISODE_SOURCES}`,
    description: 'Get episode videos/streamings, receives episodeId as param',
  },
  {
    route: `/animes${endPoints.LATEST_ANIMES}`,
    description: 'The latesd animes',
  },
  {
    route: `/animes${endPoints.BROADCAST_ANIMES}`,
    description: 'In broadcast animes',
  },
  {
    route: `/animes${endPoints.RATING_ANIMES}`,
    description: 'The latesd rating animes',
  },
  {
    route: `/animes${endPoints.SEARCH_ANIMES}`,
    description: 'Search animes, receives :query as param',
  },
  {
    route: `/animes${endPoints.ANIME_DIRECTORY}`,
    description: 'Get all animes, can be paginated using :page query param',
  },
  {
    route: `/animes${endPoints.ANIME_INFO}`,
    description: 'Full anime info, receives animeId as param',
  },
  {
    route: `/animes${endPoints.ANIME_EPISODES}`,
    description: 'Episodes of an anime, can be paginated using offset and limit query params',
  },
]

router.get('/', async (_, res) => {
  const originPath = getOriginPath()

  return res.send(
    routesDocumentation.map(docRoute => ({
      ...docRoute,
      route: mapOriginPath(originPath, `api${docRoute.route}`),
    }))
  )
})

export default router
