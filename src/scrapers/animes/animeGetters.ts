import { animeFLVPages } from '../../../api/enums'

interface SelectorGetter<T> {
  (e: Element | Document, selector?: string): T
}

export const getAnimeOriginalLink: SelectorGetter<string> = e => {
  return `${animeFLVPages.BASE}${e.querySelector('a')?.href ?? ''}`
}

export const getAnimeStatus: SelectorGetter<string> = (e, selector = '.AnmStts span') => {
  return e.querySelector(selector)?.textContent?.trim() ?? ''
}

export const getAnimeType: SelectorGetter<string> = (e, selector = '.Type') => {
  return e.querySelector(selector)?.textContent?.trim() ?? ''
}

export const getAnimeImgLink: SelectorGetter<string> = (e, selector = '.Image img') => {
  return `${animeFLVPages.BASE}${e.querySelector(selector)?.getAttribute('src') ?? ''}`
}

export const getAnimeTitle: SelectorGetter<string> = (e, selector = 'h1.Title') => {
  const titleElement = e.querySelector(selector) || e.querySelector('h3.Title')
  return titleElement?.textContent?.trim() ?? ''
}

export const getAnimeDescription: SelectorGetter<string> = (e, selector = '.Description p:last-of-type') => {
  return e.querySelector(selector)?.textContent?.trim() ?? ''
}

export const getAnimeRank: SelectorGetter<number> = (e, selector = '.Vts') => {
  return Number(e.querySelector(selector)?.textContent?.trim()) || 0
}

export const getAnimeIdFromLink = (link: string): string => {
  return link.split('anime/').pop()!
}
