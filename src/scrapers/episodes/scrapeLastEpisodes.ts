import { JSDOM } from 'jsdom'
import { animeFLVPages } from '../../enums'
import { getOptimizeImage } from '../../services/getOptimizeImage'
import { requestTextWithCache } from '../../services/requestWithCache'
import { Episode } from '../../types'

const CACHE_MINUTES = 10

export async function scrapeLastEpisodes(limit: number): Promise<Episode[]> {
  const html = await requestTextWithCache(animeFLVPages.BASE, { ttl: CACHE_MINUTES * 60 })

  const { document } = new JSDOM(html).window

  const episodesList = [...document.querySelectorAll('ul.ListEpisodios li')].slice(0, limit)

  const mappedLastEpidodes = episodesList.map(async episodeItem => {
    const originalLink = `${animeFLVPages.BASE}${episodeItem.querySelector('a')?.href ?? ''}`
    const imageLink = `${animeFLVPages.BASE}${episodeItem.querySelector('.Image img')?.getAttribute('src') ?? ''}`
    const episode = Number(episodeItem.querySelector('.Capi')?.textContent?.replace(/[^0-9]/g, '') ?? 0)
    const title = episodeItem.querySelector('.Title')?.textContent?.trim() ?? ''
    const episodeId = originalLink.split('ver/').pop()!
    const animeId = episodeId.replace(`-${episode.toString()}`, '')

    const imageName = episodeId ?? animeId ?? 'unknown'
    const imageOptions = { width: 350, height: 250, effort: 4 }
    const image = await getOptimizeImage(imageLink, imageName, imageOptions)

    return {
      originalLink,
      image,
      episode,
      title,
      episodeId,
      animeId,
    }
  })

  const results = await Promise.all(mappedLastEpidodes)
  //const successfulResults = getFulfilledResults(results)
  return results /* await Promise.all(successfulResults) */
}
