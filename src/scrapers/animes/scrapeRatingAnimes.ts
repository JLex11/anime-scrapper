import { JSDOM } from 'jsdom'
/* import { getAnimeInfo } from '../../controllers/animes/getAnimeInfo'
import { animeFLVPages, animeStatus } from '../../enums' */
import { requestTextWithCache } from '../../services/requestWithCache'
/* import { Anime } from '../../types.d' */
import { getAnimeInfo } from '../../../api/controllers/animes/getAnimeInfo'
import { animeFLVPages, animeStatus } from '../../../api/enums'
import { Anime } from '../../../api/types'
import { getFulfilledResults } from '../../utils/getFulfilledResults'
import { getAnimeIdFromLink, getAnimeOriginalLink } from './animeGetters'

export async function scrapeRatingAnimes(status: animeStatus, limit?: number): Promise<Anime[]> {
  const html = await requestTextWithCache(`${animeFLVPages.BASE}/?status=${status}&order=rating`, {
    ttl: 86400,
  })

  const { document } = new JSDOM(html).window

  const animeList = [...document.querySelectorAll('ul.ListAnimes li')]
  animeList.length = limit || 10

  const mappedRatingAnimes = animeList.map<Promise<Anime>>(async animeItem => {
    const originalLink = getAnimeOriginalLink(animeItem)
    const animeId = getAnimeIdFromLink(originalLink)

    return getAnimeInfo(animeId)
  })

  const results = await Promise.allSettled(mappedRatingAnimes)
  return getFulfilledResults(results)
}
