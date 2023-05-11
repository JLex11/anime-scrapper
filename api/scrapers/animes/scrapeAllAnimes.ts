import { JSDOM } from 'jsdom'
import { getAnimeInfo } from '../../controllers/animes/getAnimeInfo'
import { animeFLVPages } from '../../enums'
import { Anime } from '../../types.d'
import { getFulfilledResults } from '../../utils/getFulfilledResults'
import { getAnimeIdFromLink, getAnimeOriginalLink } from './animeGetters'

export async function scrapeAllAnimes(page: number = 1): Promise<Anime[]> {
  const html = await fetch(`${animeFLVPages.BASE}/browse?page=${page}`).then(res => res.text())

  const { document } = new JSDOM(html).window

  const animeList = [...document.querySelectorAll('ul.ListAnimes li')]

  const mappedFoundAnimes = animeList.map<Promise<Anime>>(async animeItem => {
    const originalLink = getAnimeOriginalLink(animeItem)
    const animeId = getAnimeIdFromLink(originalLink)

    return await getAnimeInfo(animeId)
  })

  const results = await Promise.allSettled(mappedFoundAnimes)
  return getFulfilledResults(results)
}