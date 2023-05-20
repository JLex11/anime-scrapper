import { JSDOM } from 'jsdom'
//import { animeFLVPages } from '../../enums'
import { requestTextWithCache } from '../../services/requestWithCache'
//import { Episode } from '../../types.d'
import { animeFLVPages } from '../../../api/enums'
import { Episode } from '../../../api/types'
import { getAnimeTitle } from './animeGetters'

export async function scrapeAnimeEpisodes(animeId: string, offset: number, limit: number): Promise<Episode[]> {
  const originalLink = `${animeFLVPages.BASE}/anime/${animeId}`
  const html = await requestTextWithCache(originalLink, { ttl: 2592000 })

  const { document } = new JSDOM(html).window

  const title = getAnimeTitle(document)
  const scrapedScript = [...document.querySelectorAll('script')].map(s => s.textContent).join(' ')

  let internAnimeId: string | undefined
  let episodesIds: number[][] = []

  try {
    internAnimeId = JSON.parse(
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

  const animeEpisodes = episodesIds.slice(offset || 0, limit || 20).map(([episodeNumber]: number[]): Episode => {
    const episode = episodeNumber
    const episodeId = `${animeId}-${episodeNumber}`
    const originalLink = `${animeFLVPages.BASE}/ver/${episodeId}`
    const image = `https://cdn.animeflv.net/screenshots/${internAnimeId}/${episodeNumber}/th_3.jpg`

    return {
      episodeId,
      title,
      episode,
      originalLink,
      image,
    }
  })

  return animeEpisodes
}
