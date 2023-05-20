import { JSDOM } from 'jsdom'
/* import { animeFLVPages } from '../../enums' */
import { getCarouselImages } from '../../services/getCarouselImages'
import { getOptimizeImage } from '../../services/getOptimizeImage'
import { requestTextWithCache } from '../../services/requestWithCache'
/* import { Anime, AnimeImages } from '../../types.d' */
import { animeFLVPages } from '../../../api/enums'
import { Anime, AnimeImages } from '../../../api/types'
import { getAnimeDescription, getAnimeImgLink, getAnimeRank, getAnimeStatus, getAnimeTitle, getAnimeType } from './animeGetters'

export async function scrapeFullAnimeInfo(animeId: string): Promise<Anime> {
  const originalLink = `${animeFLVPages.BASE}/anime/${animeId}`
  const html = await requestTextWithCache(originalLink, { ttl: 2592000 })

  const { document } = new JSDOM(html).window

  const type = getAnimeType(document)
  const imageLink = getAnimeImgLink(document)
  const title = getAnimeTitle(document)
  const status = getAnimeStatus(document)
  const otherTitles = [...document.querySelectorAll('.TxtAlt')].map(t => t.textContent?.trim()).filter(Boolean) as string[]

  const description = getAnimeDescription(document)
  const rank = getAnimeRank(document, '.vtprmd')
  const genres = [...document.querySelectorAll('.Nvgnrs a')].map(genre => genre.textContent?.trim()).filter(Boolean) as string[]

  const images: AnimeImages = {
    coverImage: (await getOptimizeImage(imageLink, animeId ?? 'unknow')) ?? '',
    carouselImages: await getCarouselImages(title),
  }

  return {
    animeId,
    title,
    type,
    rank,
    otherTitles,
    description,
    originalLink,
    status,
    genres,
    images,
  }
}
