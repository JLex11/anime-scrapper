import { JSDOM } from 'jsdom'
import { getAnimeInfo } from '../../../api/controllers/animes/getAnimeInfo'
import { animeFLVPages, animeStatus } from '../../enums'
import { requestTextWithCache } from '../../services/requestWithCache'
import { Anime } from '../../types'
import { getFulfilledResults } from '../../utils/getFulfilledResults'
import { getAnimeIdFromLink, getAnimeOriginalLink } from './animeGetters'

const CACHE_HOURS = 6

export async function scrapeRatingAnimes(status: animeStatus, limit?: number): Promise<Anime[]> {
  const html = await requestTextWithCache(`${animeFLVPages.BASE}/browse?status=${status}&order=rating`, {
    ttl: CACHE_HOURS * 60 * 60,
  })

  const { document } = new JSDOM(html).window

  const animeList = [...document.querySelectorAll('ul.ListAnimes li')]

  const mappedRatingAnimes = animeList.slice(0, limit || 10).map<Promise<Anime>>(async animeItem => {
    const originalLink = getAnimeOriginalLink(animeItem)
    const animeId = getAnimeIdFromLink(originalLink)

    return getAnimeInfo(animeId)
  })

  const results = await Promise.allSettled(mappedRatingAnimes)
  return getFulfilledResults(results)
}
