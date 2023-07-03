import { JSDOM } from 'jsdom'
import { getAnimeInfo } from '../../../api/controllers/animes/getAnimeInfo'
import { animeFLVPages } from '../../enums'
import { requestTextWithCache } from '../../services/requestWithCache'
import { Anime } from '../../types'
import { getFulfilledResults } from '../../utils/getFulfilledResults'
import { getAnimeIdFromLink, getAnimeOriginalLink } from './animeGetters'

const CACHE_HOURS = 1

export async function scrapeLastAnimes(limit?: number) {
  const html = await requestTextWithCache(animeFLVPages.BASE, { ttl: CACHE_HOURS * 60 * 60 })

  const { document } = new JSDOM(html).window

  const animeList = [...document.querySelectorAll('ul.ListAnimes li')]
  animeList.length = limit || 10

  const mappedLastAnimes = animeList.map<Promise<Anime>>(async animeItem => {
    const originalLink = getAnimeOriginalLink(animeItem)
    const animeId = getAnimeIdFromLink(originalLink)

    return await getAnimeInfo(animeId)
  })

  const results = await Promise.allSettled(mappedLastAnimes)
  return getFulfilledResults(results)
}
