import { JSDOM } from 'jsdom'
import { getAnimeInfo } from '../../../api/controllers/animes/getAnimeInfo'
import { animeFLVPages } from '../../enums'
import { requestTextWithCache } from '../../services/requestWithCache'
import { Anime } from '../../types'
import { getFulfilledResults } from '../../utils/getFulfilledResults'
import { getAnimeIdFromLink, getAnimeOriginalLink } from './animeGetters'

const CACHE_HOURS = 0.5

export async function scrapeFoundAnimes(query: string): Promise<Anime[]> {
  const html = await requestTextWithCache(`${animeFLVPages.BASE}/browse?q=${query}`, {
    ttl: CACHE_HOURS * 60 * 60,
  })
  if (!html) return []

  const { document } = new JSDOM(html).window

  const animeList = [...document.querySelectorAll('ul.ListAnimes li')]

  const mappedFoundAnimes = animeList.map<Promise<Anime | null>>(async animeItem => {
    const originalLink = getAnimeOriginalLink(animeItem)
    const animeId = getAnimeIdFromLink(originalLink)

    return getAnimeInfo(animeId)
  })

  const results = await Promise.allSettled(mappedFoundAnimes)
  return getFulfilledResults(results).filter(Boolean) as Anime[]
}
