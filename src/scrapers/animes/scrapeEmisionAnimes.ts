import { JSDOM } from 'jsdom'
// import { getAnimeInfo } from '../../controllers/animes/getAnimeInfo'
// import { animeFLVPages } from '../../enums'
import { requestTextWithCache } from '../../services/requestWithCache'
// import { Anime } from '../../types.d'
import { getAnimeInfo } from '../../../api/controllers/animes/getAnimeInfo'
import { animeFLVPages } from '../../../api/enums'
import { Anime } from '../../../api/types'
import { getFulfilledResults } from '../../utils/getFulfilledResults'
import { getAnimeIdFromLink, getAnimeOriginalLink } from './animeGetters'

export async function scrapeEmisionAnimes(limit?: number): Promise<Anime[]> {
  const html = await requestTextWithCache(animeFLVPages.BASE, { ttl: 172800 })

  const { document } = new JSDOM(html).window

  const emisionList = [...document.querySelectorAll('.Emision .ListSdbr li')]
  emisionList.length = limit || 20

  const mappedEmisionAnimes = emisionList.map<Promise<Anime>>(async animeItem => {
    const originalLink = getAnimeOriginalLink(animeItem)
    const animeId = getAnimeIdFromLink(originalLink)

    return await getAnimeInfo(animeId)
  })

  const results = await Promise.allSettled(mappedEmisionAnimes)
  return getFulfilledResults(results)
}
