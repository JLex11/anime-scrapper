import { Router } from 'express'
import { getOriginPath } from '../../src/config'
import { endPoints } from '../../src/enums'
import { mapOriginPath } from '../../src/utils/mapOriginPath'

const router = Router()

const routesDocumentation = [
  {
    route: `/episodes${endPoints.LATEST_EPISODES}`,
    description: 'The latesd episodes',
  },
  {
    route: `/episodes${endPoints.EPISODE_BY_ID}`,
    description: 'Full episode info, receives episodeId as param',
  },
  {
    route: `/episodes${endPoints.EPISODE_SOURCES}`,
    description: 'Get episode videos/streamings, receives episodeId as param',
  },
  {
    route: `/animes`,
    description: 'Get all animes, can be paginated using :page query param',
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
    route: `/animes${endPoints.ANIME_INFO}`,
    description: 'Full anime info, receives animeId as param',
  },
  {
    route: `/animes${endPoints.ANIME_EPISODES}`,
    description: 'Episodes of an anime, can be paginated using offset and limit query params',
  },
  {
    route: endPoints.IMAGES,
    description: 'Get image of anime receives imgFilename as param',
  },
]

router.get('/', async (_, res) => {
  const originPath = getOriginPath()

  const mappedRoutesDocumentations = routesDocumentation.map(docRoute => ({
    ...docRoute,
    route: mapOriginPath(originPath, `api${docRoute.route}`),
  }))

  return res.send(mappedRoutesDocumentations)
})

export default router
