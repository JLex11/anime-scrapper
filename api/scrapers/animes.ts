import { JSDOM } from 'jsdom'
import { animeStatus } from '../enums'
import { getBase64Image } from '../services/getBase64Image'
import { requestTextWithCache } from '../services/requestWithCache'
import { EmisionAnime, ShortAnime } from '../types'
import { getFulfilledResults } from '../utils/getFulfilledResults'

const ANIMEFLV_BASE_URL = 'https://www3.animeflv.net'

export async function scrapeLastAnimes (): Promise<ShortAnime[]> {
  const html = await requestTextWithCache(ANIMEFLV_BASE_URL)

  const { document } = (new JSDOM(html)).window

  const animeList = [...document.querySelectorAll('ul.ListAnimes li')]

  const mappedLastAnimes = animeList.map(async episodeItem => {
    const originalLink = `${ANIMEFLV_BASE_URL}${episodeItem.querySelector('a')?.href ?? ''}`
    const type = episodeItem.querySelector('.Type')?.textContent?.trim()
    const imageLink = `${ANIMEFLV_BASE_URL}${episodeItem.querySelector('.Image img')?.getAttribute('src') ?? ''}`
    const title = episodeItem.querySelector('.Title')?.textContent?.trim()
    const shortDescription = episodeItem.querySelector('.Description p:last-of-type')?.textContent?.trim()
    const rank = episodeItem.querySelector('.Vts')?.textContent?.trim()

    const image = await getBase64Image(imageLink)

    return {
      originalLink,
      image,
      title,
      type,
      shortDescription,
      rank
    }
  })

  const results = await Promise.allSettled(mappedLastAnimes)
  const successfulResults = getFulfilledResults(results)
  return await Promise.all(successfulResults)
}

export async function scrapeEmisionAnimes (): Promise<EmisionAnime[]> {
  const html = await requestTextWithCache(ANIMEFLV_BASE_URL, { ttl: 172800 })

  const { document } = (new JSDOM(html)).window

  const emisionList = [...document.querySelectorAll('.Emision .ListSdbr li')]

  const mappedEmisionAnimes = emisionList.map(episodeItem => {
    const orgLink = `${ANIMEFLV_BASE_URL}${episodeItem.querySelector('a')?.href ?? ''}`
    const type = episodeItem.querySelector('.Type')?.textContent?.trim()
    const title = episodeItem.querySelector('a')?.textContent?.trim()

    return {
      orgLink,
      title,
      type
    }
  })

  return mappedEmisionAnimes
}

export async function scrapeRatingAnimes (status: animeStatus): Promise<ShortAnime[]> {
  const html = await requestTextWithCache(`${ANIMEFLV_BASE_URL}/?status=${status}&order=rating`, { ttl: 86400 })

  const { document } = (new JSDOM(html)).window

  const animeList = [...document.querySelectorAll('ul.ListAnimes li')]

  const mappedRatingAnimes = animeList.map(async episodeItem => {
    const originalLink = `${ANIMEFLV_BASE_URL}${episodeItem.querySelector('a')?.href ?? ''}`
    const type = episodeItem.querySelector('.Type')?.textContent?.trim()
    const imageLink = `${ANIMEFLV_BASE_URL}${episodeItem.querySelector('.Image img')?.getAttribute('src') ?? ''}`
    const title = episodeItem.querySelector('.Title')?.textContent?.trim()
    const shortDescription = episodeItem.querySelector('.Description p:last-of-type')?.textContent?.trim()
    const rank = episodeItem.querySelector('.Vts')?.textContent?.trim()

    const image = await getBase64Image(imageLink)

    return {
      originalLink,
      image,
      title,
      type,
      shortDescription,
      rank
    }
  })

  const results = await Promise.allSettled(mappedRatingAnimes)
  const successfulResults = getFulfilledResults(results)
  return await Promise.all(successfulResults)
}

export async function searchAnimes (query: string): Promise<ShortAnime[]> {
  const html = await requestTextWithCache(`${ANIMEFLV_BASE_URL}/browse?=${query}`, { ttl: 43200 })

  const { document } = (new JSDOM(html)).window

  const animeList = [...document.querySelectorAll('ul.ListAnimes li')]

  const mappedFoundedAnimes = animeList.map(episodeItem => {
    const originalLink = `${ANIMEFLV_BASE_URL}${episodeItem.querySelector('a')?.href ?? ''}`
    const type = episodeItem.querySelector('.Type')?.textContent?.trim()
    const image = `${ANIMEFLV_BASE_URL}${episodeItem.querySelector('.Image img')?.getAttribute('src') ?? ''}`
    const title = episodeItem.querySelector('.Title')?.textContent?.trim()
    const shortDescription = episodeItem.querySelector('.Description p:last-of-type')?.textContent?.trim()
    const rank = episodeItem.querySelector('.Vts')?.textContent?.trim()

    return {
      originalLink,
      image,
      title,
      type,
      shortDescription,
      rank
    }
  })

  return mappedFoundedAnimes
}
