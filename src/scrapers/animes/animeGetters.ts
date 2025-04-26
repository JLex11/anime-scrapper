import { animeFLVPages } from '../../enums'

type SelectorGetter<T> = (e: Element | Document, selector?: string) => T

export const getOriginalLink: SelectorGetter<string> = e => {
	return `${animeFLVPages.BASE}${e.querySelector('a')?.href ?? ''}`
}

export const getStatus: SelectorGetter<string> = (e, selector = '.AnmStts span') => {
	return e.querySelector(selector)?.textContent?.trim() ?? ''
}

export const getType: SelectorGetter<string> = (e, selector = '.Type') => {
	return e.querySelector(selector)?.textContent?.trim() ?? ''
}

export const getImgLink: SelectorGetter<string> = (e, selector = '.Image img') => {
	return `${animeFLVPages.BASE}${e.querySelector(selector)?.getAttribute('src') ?? ''}`
}

export const getTitle: SelectorGetter<string> = (e, selector = 'h1.Title') => {
	const titleElement = e.querySelector(selector) || e.querySelector('h3.Title')
	return titleElement?.textContent?.trim() ?? ''
}

export const getDescription: SelectorGetter<string> = (e, selector = '.Description p:last-of-type') => {
	return e.querySelector(selector)?.textContent?.trim() ?? ''
}

export const getRank: SelectorGetter<number> = (e, selector = '.Vts') => {
	return Number(e.querySelector(selector)?.textContent?.trim()) || 0
}

export const getIdFromLink = (link: string): string => {
	return link.split('anime/').pop() ?? ''
}

export const getOtherTitles: SelectorGetter<string[]> = (e, selector = '.TxtAlt') => {
	return [...e.querySelectorAll(selector)].map(t => t.textContent?.trim()).filter(Boolean) as string[]
}

export const getGenres: SelectorGetter<string[]> = (e, selector = '.Nvgnrs a') => {
	return [...e.querySelectorAll(selector)].map(genre => genre.textContent?.trim()).filter(Boolean) as string[]
}

export const animeGetter = (e: Element | Document) => {
	return {
		originalLink: () => getOriginalLink(e),
		status: (selector = '.AnmStts span') => getStatus(e, selector),
		type: (selector = '.Type') => getType(e, selector),
		imgLink: (selector = '.Image img') => getImgLink(e, selector),
		title: (selector = 'h1.Title') => getTitle(e, selector),
		description: (selector = '.Description p:last-of-type') => getDescription(e, selector),
		rank: (selector = '.Vts') => getRank(e, selector),
		idFromLink: (link: string) => getIdFromLink(link),
		otherTitles: (selector = '.TxtAlt') => getOtherTitles(e, selector),
		genres: (selector = '.Nvgnrs a') => getGenres(e, selector),
	}
}
