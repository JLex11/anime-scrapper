import { JSDOM } from 'jsdom'
import { animeStatus } from '../enums'
import { getBase64Image } from '../services/getBase64Image'
import { requestTextWithCache } from '../services/requestWithCache'
import { EmisionAnime, ShortAnime } from '../types'
import { getFulfilledResults } from '../utils/getFulfilledResults'
import { animeFLVPages } from './../enums'

export async function scrapeLastAnimes (): Promise<ShortAnime[]> {
  const html = await requestTextWithCache(animeFLVPages.BASE)

  const { document } = (new JSDOM(html)).window

  const animeList = [...document.querySelectorAll('ul.ListAnimes li')]

  const mappedLastAnimes = animeList.map(async episodeItem => {
    const originalLink = `${animeFLVPages.BASE}${episodeItem.querySelector('a')?.href ?? ''}`
    const type = episodeItem.querySelector('.Type')?.textContent?.trim()
    const imageLink = `${animeFLVPages.BASE}${episodeItem.querySelector('.Image img')?.getAttribute('src') ?? ''}`
    const title = episodeItem.querySelector('.Title')?.textContent?.trim()
    const shortDescription = episodeItem.querySelector('.Description p:last-of-type')?.textContent?.trim()
    const rank = episodeItem.querySelector('.Vts')?.textContent?.trim()
    const animeId = originalLink.split('anime/').pop()

    const image = await getBase64Image(imageLink)

    return {
      originalLink,
      image,
      title,
      type,
      shortDescription,
      rank,
      animeId
    }
  })

  const results = await Promise.allSettled(mappedLastAnimes)
  const successfulResults = getFulfilledResults(results)
  return await Promise.all(successfulResults)
}

export async function scrapeEmisionAnimes (): Promise<EmisionAnime[]> {
  const html = await requestTextWithCache(animeFLVPages.BASE, { ttl: 172800 })

  const { document } = (new JSDOM(html)).window

  const emisionList = [...document.querySelectorAll('.Emision .ListSdbr li')]

  const mappedEmisionAnimes = emisionList.map(episodeItem => {
    const originalLink = `${animeFLVPages.BASE}${episodeItem.querySelector('a')?.href ?? ''}`
    const type = episodeItem.querySelector('.Type')?.textContent?.trim()
    const title = episodeItem.querySelector('a')?.textContent?.trim()
    const animeId = originalLink.split('anime/').pop()

    return {
      originalLink,
      title,
      type,
      animeId
    }
  })

  return mappedEmisionAnimes
}

export async function scrapeRatingAnimes (status: animeStatus): Promise<ShortAnime[]> {
  const html = await requestTextWithCache(`${animeFLVPages.BASE}/?status=${status}&order=rating`, { ttl: 86400 })

  const { document } = (new JSDOM(html)).window

  const animeList = [...document.querySelectorAll('ul.ListAnimes li')]

  const mappedRatingAnimes = animeList.map(async episodeItem => {
    const originalLink = `${animeFLVPages.BASE}${episodeItem.querySelector('a')?.href ?? ''}`
    const type = episodeItem.querySelector('.Type')?.textContent?.trim()
    const imageLink = `${animeFLVPages.BASE}${episodeItem.querySelector('.Image img')?.getAttribute('src') ?? ''}`
    const title = episodeItem.querySelector('.Title')?.textContent?.trim()
    const shortDescription = episodeItem.querySelector('.Description p:last-of-type')?.textContent?.trim()
    const rank = episodeItem.querySelector('.Vts')?.textContent?.trim()
    const animeId = originalLink.split('anime/').pop()

    const image = await getBase64Image(imageLink)

    return {
      originalLink,
      image,
      title,
      type,
      shortDescription,
      rank,
      animeId
    }
  })

  const results = await Promise.allSettled(mappedRatingAnimes)
  const successfulResults = getFulfilledResults(results)
  return await Promise.all(successfulResults)
}

export async function searchAnimes (query: string): Promise<ShortAnime[]> {
  const html = await requestTextWithCache(`${animeFLVPages.BASE}/browse?=${query}`, { ttl: 43200 })

  const { document } = (new JSDOM(html)).window

  const animeList = [...document.querySelectorAll('ul.ListAnimes li')]

  const mappedFoundedAnimes = animeList.map(episodeItem => {
    const originalLink = `${animeFLVPages.BASE}${episodeItem.querySelector('a')?.href ?? ''}`
    const type = episodeItem.querySelector('.Type')?.textContent?.trim()
    const image = `${animeFLVPages.BASE}${episodeItem.querySelector('.Image img')?.getAttribute('src') ?? ''}`
    const title = episodeItem.querySelector('.Title')?.textContent?.trim()
    const shortDescription = episodeItem.querySelector('.Description p:last-of-type')?.textContent?.trim()
    const rank = episodeItem.querySelector('.Vts')?.textContent?.trim()
    const animeId = originalLink.split('anime/').pop()

    return {
      originalLink,
      image,
      title,
      type,
      shortDescription,
      rank,
      animeId
    }
  })

  return mappedFoundedAnimes
}
