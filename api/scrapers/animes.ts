import { JSDOM } from 'jsdom'
import sharp from 'sharp'
import { animeStatus } from '../enums'
import { requestTextWithCache } from '../services/requestWithCache'
import { EmisionAnime, ShortAnime } from '../types'

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

    const imageResponse = await fetch(imageLink)
    const imageArrayBuffer = await imageResponse.arrayBuffer()

    const outputImageBuffer = await sharp(Buffer.from(imageArrayBuffer))
      .resize(200, 300)
      .webp({ effort: 6, quality: 60 })
      .toBuffer()

    const base64Image = outputImageBuffer.toString('base64')
    const image = `data:image/webp;base64,${base64Image}`

    return {
      originalLink,
      image,
      title,
      type,
      shortDescription,
      rank
    }
  })

  return await Promise.all(mappedLastAnimes)
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

    const imageResponse = await fetch(imageLink)
    const imageArrayBuffer = await imageResponse.arrayBuffer()

    const outputImageBuffer = await sharp(Buffer.from(imageArrayBuffer))
      .resize(200, 300)
      .webp({ effort: 6, quality: 60 })
      .toBuffer()

    const base64Image = outputImageBuffer.toString('base64')
    const image = `data:image/webp;base64,${base64Image}`

    return {
      originalLink,
      image,
      title,
      type,
      shortDescription,
      rank
    }
  })

  return await Promise.all(mappedRatingAnimes)
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
