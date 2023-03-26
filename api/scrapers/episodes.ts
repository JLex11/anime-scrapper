import { JSDOM } from 'jsdom'
import { getOptimizeImage } from '../services/getOptimizeImage'
import { requestTextWithCache } from '../services/requestWithCache'
import { EpisodeSources, LastEpisode } from '../types'
import { getFulfilledResults } from '../utils/getFulfilledResults'
import { animeFLVPages } from './../enums'

export async function scrapeLastEpisodes (): Promise<LastEpisode[]> {
  const html = await requestTextWithCache(animeFLVPages.BASE)

  const { document } = (new JSDOM(html)).window

  const episodesList = [...document.querySelectorAll('ul.ListEpisodios li')]

  const mappedLastEpidodes = episodesList.map(async episodeItem => {
    const originalLink = `${animeFLVPages.BASE}${episodeItem.querySelector('a')?.href ?? ''}`
    const imageLink = `${animeFLVPages.BASE}${episodeItem.querySelector('.Image img')?.getAttribute('src') ?? ''}`
    const episode = +(episodeItem.querySelector('.Capi')?.textContent?.replace(/[^0-9]/g, '') ?? 0)
    const title = episodeItem.querySelector('.Title')?.textContent?.trim()
    const episodeId = originalLink.split('ver/').pop()
    const animeId = title?.replace(/[^a-zA-Z0-9 ]/g, '').replace(/ /g, '-').toLowerCase()

    const image = await getOptimizeImage(imageLink, episodeId ?? animeId ?? 'unknown')

    return {
      originalLink,
      image,
      episode,
      title,
      episodeId,
      animeId
    }
  })

  const results = await Promise.allSettled(mappedLastEpidodes)
  const successfulResults = getFulfilledResults(results)
  return await Promise.all(successfulResults)
}

export async function scrapeEpisodeSources(episodeId: string): Promise<EpisodeSources> {
  if (!episodeId) {
    return {
      episode: 0,
      videos: []
    }
  }

  const html = await requestTextWithCache(`${animeFLVPages.BASE}/ver/${episodeId}`, { ttl: 259200 })

  const { document } = new JSDOM(html).window

  const scrapedScript = [...document.querySelectorAll('script[type="text/javascript"]')].map(
    (script) => script.textContent
  ).join(' ')

  /* const animeId = scrapedScript.split('var anime_id = ')[1].split(';')[0].replace(/"/g, '')
  const episodeId = scrapedScript.split('var episode_id = ')[1].split(';')[0].replace(/"/g, '') */
  const episode = +(scrapedScript?.split('var episode_number = ')?.[1]?.split(';')?.[0]?.replace(/"/g, '') ?? 0)
  const videos = JSON.parse(scrapedScript?.split('var videos = ')?.[1]?.split(';')?.[0] ?? '[]')

  return {
    episode,
    videos
  }
}
