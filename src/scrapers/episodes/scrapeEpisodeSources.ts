import { JSDOM } from 'jsdom'
import { animeFLVPages } from '../../enums'
import { requestTextWithCache } from '../../services/requestWithCache'
import { EpisodeSources } from '../../types'

const CACHE_DAYS = 30

export async function scrapeEpisodeSources(episodeId: string): Promise<EpisodeSources> {
  if (!episodeId) {
    return {
      episode: 0,
      videos: [],
    }
  }

  const html = await requestTextWithCache(`${animeFLVPages.BASE}/ver/${episodeId}`, { ttl: CACHE_DAYS * 24 * 60 * 60 })

  const { document } = new JSDOM(html).window

  const scrapedScript = [...document.querySelectorAll('script[type="text/javascript"]')].map(script => script.textContent).join(' ')

  /* const animeId = scrapedScript.split('var anime_id = ')[1].split(';')[0].replace(/"/g, '')
  const episodeId = scrapedScript.split('var episode_id = ')[1].split(';')[0].replace(/"/g, '') */
  const episode = +(scrapedScript?.split('var episode_number = ')?.[1]?.split(';')?.[0]?.replace(/"/g, '') ?? 0)
  const videos = JSON.parse(scrapedScript?.split('var videos = ')?.[1]?.split(';')?.[0] ?? '[]')

  return {
    episode,
    videos,
  }
}
