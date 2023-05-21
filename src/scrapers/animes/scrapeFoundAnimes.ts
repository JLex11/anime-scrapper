import { JSDOM } from 'jsdom'
import { getAnimeInfo } from '../../../api/controllers/animes/getAnimeInfo'
import { animeFLVPages } from '../../../api/enums'
import { Anime } from '../../../api/types'
import { requestTextWithCache } from '../../services/requestWithCache'
import { getFulfilledResults } from '../../utils/getFulfilledResults'
import { getAnimeIdFromLink, getAnimeOriginalLink } from './animeGetters'

export async function scrapeFoundAnimes(query: string): Promise<Anime[]> {
  const html = await requestTextWithCache(`${animeFLVPages.BASE}/browse?q=${query}`, {
    ttl: 648000,
  })

  const { document } = new JSDOM(html).window

  const animeList = [...document.querySelectorAll('ul.ListAnimes li')]

  const mappedFoundAnimes = animeList.map<Promise<Anime>>(animeItem => {
    const originalLink = getAnimeOriginalLink(animeItem)
    const animeId = getAnimeIdFromLink(originalLink)

    return getAnimeInfo(animeId)
  })

  const results = await Promise.allSettled(mappedFoundAnimes)
  return getFulfilledResults(results)
}
