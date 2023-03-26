import { animeFLVPages } from "../enums"

interface SelectorGetter {
  (e: Element | Document, selector?: string): string
}

export const getAnimeOriginalLink: SelectorGetter = (e) => {
  return `${animeFLVPages.BASE}${e.querySelector('a')?.href ?? ''}`
}

export const getAnimeType: SelectorGetter = (e, selector = '.Type') => {
  return e.querySelector(selector)?.textContent?.trim() ?? ''
}

export const getAnimeImgLink: SelectorGetter = (e, selector = '.Image img') => {
  return `${animeFLVPages.BASE}${e.querySelector(selector)?.getAttribute('src') ?? ''}`
}

export const getAnimeTitle: SelectorGetter = (e, selector = 'h1.Title') => {
  const titleElement = e.querySelector(selector) || e.querySelector('h3.Title')
  return titleElement?.textContent?.trim() ?? ''
}

export const getAnimeShortDescription: SelectorGetter = (e, selector = '.Description p:last-of-type') => {
  return e.querySelector(selector)?.textContent?.trim() ?? ''
}

export const getAnimeRank: SelectorGetter = (e, selector = '.Vts') => {
  return e.querySelector(selector)?.textContent?.trim() ?? ''
}

export const getAnimeIdFromLink = (link: string) => {
  return link.split('anime/').pop()
}