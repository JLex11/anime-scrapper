import { animeFLVPages } from '../../enums'

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

export const getAnimeOtherTitles: SelectorGetter<string[]> = (e, selector = '.TxtAlt') => {
  return [...e.querySelectorAll(selector)].map(t => t.textContent?.trim()).filter(Boolean) as string[]
}

export const getAnimeGenres: SelectorGetter<string[]> = (e, selector = '.Nvgnrs a') => {
  return [...e.querySelectorAll(selector)].map(genre => genre.textContent?.trim()).filter(Boolean) as string[]
}

export const animeGetter = (e: Element | Document) => {
  return {
    originalLink: () => getAnimeOriginalLink(e),
    status: (selector = '.AnmStts span') => getAnimeStatus(e, selector),
    type: (selector = '.Type') => getAnimeType(e, selector),
    imgLink: (selector = '.Image img') => getAnimeImgLink(e, selector),
    title: (selector = 'h1.Title') => getAnimeTitle(e, selector),
    description: (selector = '.Description p:last-of-type') => getAnimeDescription(e, selector),
    rank: (selector = '.Vts') => getAnimeRank(e, selector),
    idFromLink: (link: string) => getAnimeIdFromLink(link),
    otherTitles: (selector = '.TxtAlt') => getAnimeOtherTitles(e, selector),
    genres: (selector = '.Nvgnrs a') => getAnimeGenres(e, selector)
  }
}