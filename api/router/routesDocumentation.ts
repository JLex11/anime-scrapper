import { endPoints } from './../enums'

export default [
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
