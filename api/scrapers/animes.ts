import { JSDOM } from 'jsdom'
import { animeStatus } from '../enums'
import { getAnimeBanners } from '../services/getAnimeBanners'
import { getOptimizeImage } from '../services/getOptimizeImage'
import { requestTextWithCache } from '../services/requestWithCache'
import { AnimeImages, EmisionAnime, ShortAnime } from '../types'
import { getFulfilledResults } from '../utils/getFulfilledResults'
import { animeFLVPages } from './../enums'
import { Anime, Episode } from './../types.d'
import {
  getAnimeIdFromLink,
  getAnimeImgLink,
  getAnimeOriginalLink,
  getAnimeRank,
  getAnimeShortDescription,
  getAnimeStatus,
  getAnimeTitle,
  getAnimeType,
} from './animeGetters'

export async function scrapeLastAnimes(limit?: number) {
  const html = await requestTextWithCache(animeFLVPages.BASE)

  const { document } = new JSDOM(html).window

  const animeList = [...document.querySelectorAll('ul.ListAnimes li')]
  animeList.length = limit || 10

  const mappedLastAnimes = animeList.map<Promise<ShortAnime>>(async animeItem => {
    const originalLink = getAnimeOriginalLink(animeItem)
    const animeId = getAnimeIdFromLink(originalLink)
    return await scrapeFullAnimeInfo(animeId ?? '')
  })

  const results = await Promise.allSettled(mappedLastAnimes)
  const successfulResults = getFulfilledResults(results)
  return await Promise.all(successfulResults)
}

export async function scrapeEmisionAnimes(): Promise<EmisionAnime[]> {
  const html = await requestTextWithCache(animeFLVPages.BASE, { ttl: 172800 })

  const { document } = new JSDOM(html).window

  const emisionList = [...document.querySelectorAll('.Emision .ListSdbr li')]

  const mappedEmisionAnimes = emisionList.map<EmisionAnime>(animeItem => {
    const originalLink = getAnimeOriginalLink(animeItem)
    const type = getAnimeType(animeItem)
    const title = animeItem.querySelector('a')?.textContent?.trim()
    const animeId = getAnimeIdFromLink(originalLink)

    return {
      originalLink,
      title,
      type,
      animeId,
    }
  })

  return mappedEmisionAnimes
}

export async function scrapeRatingAnimes(
  status: animeStatus,
  limit?: number
): Promise<ShortAnime[]> {
  const html = await requestTextWithCache(
    `${animeFLVPages.BASE}/?status=${status}&order=rating`,
    {
      ttl: 86400,
    }
  )

  const { document } = new JSDOM(html).window

  const animeList = [...document.querySelectorAll('ul.ListAnimes li')]
  animeList.length = limit || 10

  const mappedRatingAnimes = animeList.map<Promise<ShortAnime>>(async animeItem => {
    const originalLink = getAnimeOriginalLink(animeItem)
    const animeId = getAnimeIdFromLink(originalLink)

    return await scrapeFullAnimeInfo(animeId ?? '')
  })

  const results = await Promise.allSettled(mappedRatingAnimes)
  const successfulResults = getFulfilledResults(results)
  return await Promise.all(successfulResults)
}

export async function scrapeFoundAnimes(query: string): Promise<ShortAnime[]> {
  const html = await requestTextWithCache(`${animeFLVPages.BASE}/browse?q=${query}`, {
    ttl: 43200,
  })

  const { document } = new JSDOM(html).window

  const animeList = [...document.querySelectorAll('ul.ListAnimes li')]

  const mappedFoundAnimes = animeList.map<Promise<ShortAnime>>(async animeItem => {
    const originalLink = getAnimeOriginalLink(animeItem)
    const type = getAnimeType(animeItem)
    const imageLink = getAnimeImgLink(animeItem)
    const title = getAnimeTitle(animeItem)
    const shortDescription = getAnimeShortDescription(animeItem)
    const rank = getAnimeRank(animeItem)
    const animeId = getAnimeIdFromLink(originalLink)

    const images: AnimeImages = {
      coverImage: await getOptimizeImage(imageLink, animeId ?? 'unknow'),
    }

    return {
      originalLink,
      images,
      title,
      type,
      shortDescription,
      rank,
      animeId,
    }
  })

  const results = await Promise.allSettled(mappedFoundAnimes)
  const successfulResults = getFulfilledResults(results)
  return await Promise.all(successfulResults)
}

export async function scrapeFullAnimeInfo(animeId: string): Promise<Anime> {
  if (!animeId.match(/^[\w-]+(?:\d+[a-z]*)?(?:-[\w-]+)*$/)) return {} as Anime

  const originalLink = `${animeFLVPages.BASE}/anime/${animeId}`
  const html = await requestTextWithCache(originalLink, { ttl: 2592000 })

  const { document } = new JSDOM(html).window

  const type = getAnimeType(document)
  const imageLink = getAnimeImgLink(document)
  const title = getAnimeTitle(document)
  const status = getAnimeStatus(document)
  const otherTitles = [...document.querySelectorAll('.TxtAlt')].map(t =>
    t.textContent?.trim()
  )
  const description = getAnimeShortDescription(document)
  const rank = document.querySelector('.vtprmd')?.textContent?.trim()
  const genres = [...document.querySelectorAll('.Nvgnrs a')].map(genre =>
    genre.textContent?.trim()
  )

  const scrapedScript = [...document.querySelectorAll('script')]
    .map(s => s.textContent)
    .join(' ')

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
    return {} as Anime
  }

  const episodesPromises = episodesIds.map(
    async ([episodeNumber]: number[]): Promise<Episode> => ({
      episode: episodeNumber,
      originalLink: `${animeFLVPages.BASE}/ver/${animeId}-${episodeNumber}`,
      title,
      image:
        internAnimeId &&
        (await getOptimizeImage(
          `https://cdn.animeflv.net/screenshots/${internAnimeId}/${episodeNumber}/th_3.jpg`,
          `${animeId}-${episodeNumber}`,
          {
            width: 450,
            height: 350,
            effort: 6,
          }
        )),
    })
  )

  const episodes = await Promise.all(episodesPromises)

  const images: AnimeImages = {
    coverImage: await getOptimizeImage(imageLink, animeId ?? 'unknow'),
    bannerImages: await getAnimeBanners(title),
  }

  return {
    originalLink,
    images,
    title,
    status,
    otherTitles,
    type,
    description,
    rank,
    animeId,
    genres,
    episodes,
  }
}