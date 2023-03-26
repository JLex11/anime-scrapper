import { Router } from 'express'
import { getOriginPath } from '../config'
import { mapOriginPath } from '../utils/mapOriginPath'
import { endPoints } from './../enums'

const router = Router()

const routesDocumentation = [
  {
    route: endPoints.LATEST_EPISODES,
    description: 'The latesd episodes'
  },
  {
    route: endPoints.EPISODE_SOURCES,
    description: 'Get episode videos/streamings'
  },
  {
    route: endPoints.LATEST_ANIMES,
    description: 'The latesd animes'
  },
  {
    route: endPoints.BROADCAST_ANIMES,
    description: 'In broadcast animes'
  },
  {
    route: endPoints.RATING_ANIMES,
    description: 'The latesd rating animes'
  },
  {
    route: endPoints.ANIME_INFO,
    description: 'Full anime info'
  }
]

router.get('/', async (_, res) => {
  const originPath = getOriginPath()

  return res.send(routesDocumentation.map(docRoute => ({
    ...docRoute,
    route: mapOriginPath(originPath, `api${docRoute.route}`)
  })))
})

export default router