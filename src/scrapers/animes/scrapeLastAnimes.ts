import { JSDOM } from 'jsdom'
import { getAnimeInfo } from '../../../api/controllers/animes/getAnimeInfo'
import { animeFLVPages } from '../../../api/enums'
import { Anime } from '../../../api/types'
import { requestTextWithCache } from '../../services/requestWithCache'
import { getFulfilledResults } from '../../utils/getFulfilledResults'
import { getAnimeIdFromLink, getAnimeOriginalLink } from './animeGetters'

export async function scrapeLastAnimes(limit?: number) {
  const html = await requestTextWithCache(animeFLVPages.BASE)

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