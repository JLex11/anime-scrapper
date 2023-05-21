import { JSDOM } from 'jsdom'
import { animeFLVPages } from '../../../api/enums'
import { Episode } from '../../../api/types'
import { getOptimizeImage } from '../../services/getOptimizeImage'
import { requestTextWithCache } from '../../services/requestWithCache'
import { getAnimeTitle } from './animeGetters'

export async function scrapeAnimeEpisodes(animeId: string, offset: number, limit: number): Promise<Episode[]> {
  const originalLink = `${animeFLVPages.BASE}/anime/${animeId}`
  const html = await requestTextWithCache(originalLink, { ttl: 2592000 })

  const { document } = new JSDOM(html).window

  const title = getAnimeTitle(document)
  const scrapedScript = [...document.querySelectorAll('script')].map(s => s.textContent).join(' ')

  let animeInfo: string | undefined
  let episodesIds: number[][] = []

  try {
    animeInfo = JSON.parse(
      scrapedScript
        .split(/(var|let|const) *anime_info *= */)
        .pop()!
        .split(/;|(var|let|const)/)
        .shift() ?? '[]'
    )

    episodesIds = JSON.parse(
      scrapedScript
        .split(/(var|let|const) *episodes *= */)
        .pop()!
        .split(';')
        .shift() ?? '[]'
    )
  } catch (error) {
    return []
  }

  const animeEpisodes = episodesIds.slice(offset || 0, limit || 20).map(async ([episodeNumber]: number[]): Promise<Episode> => {
    const episode = episodeNumber
    const episodeId = `${animeId}-${episodeNumber}`
    const originalLink = `${animeFLVPages.BASE}/ver/${episodeId}`
    const image = `https://cdn.animeflv.net/screenshots/${animeInfo?.[0] ?? 0}/${episodeNumber}/th_3.jpg`
    const optimizeImage = await getOptimizeImage(image, `episode-image-${animeId}-${episodeNumber}`, {
      width: 150,
      height: 80,
    })

    return {
      episodeId,
      animeId,
      title,
      episode,
      originalLink,
      image: optimizeImage || image,
    }
  })

  const episodesResults = await Promise.all(animeEpisodes)
  return episodesResults
}
