import { JSDOM } from 'jsdom'
import { getBase64Image } from '../services/getBase64Image'
import { requestTextWithCache } from '../services/requestWithCache'
import { EpisodeSources, LastEpisode } from '../types'
import { getFulfilledResults } from '../utils/getFulfilledResults'

const ANIMEFLV_BASE_URL = 'https://www3.animeflv.net'

export async function scrapeLastEpisodes (): Promise<LastEpisode[]> {
  const html = await requestTextWithCache(ANIMEFLV_BASE_URL)

  const { document } = (new JSDOM(html)).window

  const episodesList = [...document.querySelectorAll('ul.ListEpisodios li')]

  const mappedLastEpidodes = episodesList.map(async episodeItem => {
    const originalLink = `${ANIMEFLV_BASE_URL}${episodeItem.querySelector('a')?.href ?? ''}`
    const imageLink = `${ANIMEFLV_BASE_URL}${episodeItem.querySelector('.Image img')?.getAttribute('src') ?? ''}`
    const episode = episodeItem.querySelector('.Capi')?.textContent?.replace(/[^0-9]/g, '')
    const title = episodeItem.querySelector('.Title')?.textContent?.trim()
    const id = originalLink.split('ver/').pop()

    const image = await getBase64Image(imageLink)

    return {
      originalLink,
      image,
      episode,
      title,
      id
    }
  })

  const results = await Promise.allSettled(mappedLastEpidodes)
  const successfulResults = getFulfilledResults(results)
  return await Promise.all(successfulResults)
}

export async function scrapeEpisodeSources (id: string): Promise<EpisodeSources> {
  const html = await requestTextWithCache(`${ANIMEFLV_BASE_URL}/ver/${id}`, { ttl: 259200 })

  const { document } = new JSDOM(html).window

  const scrapedScript = [...document.querySelectorAll('script[type="text/javascript"]')].map(
    (script) => script.textContent
  ).join(' ')

  const animeId = scrapedScript.split('var anime_id = ')[1].split(';')[0].replace(/"/g, '')
  const episodeId = scrapedScript.split('var episode_id = ')[1].split(';')[0].replace(/"/g, '')
  const episode = scrapedScript.split('var episode_number = ')[1].split(';')[0].replace(/"/g, '')
  const videos = JSON.parse(scrapedScript.split('var videos = ')[1].split(';')[0])

  return {
    animeId,
    episodeId,
    episode,
    videos
  }
}
