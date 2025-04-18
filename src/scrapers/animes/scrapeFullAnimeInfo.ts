import { JSDOM } from 'jsdom'
import { Worker } from 'node:worker_threads'
import { animeFLVPages } from '../../enums'
import { getOptimizedImage } from '../../services/getOptimizeImage'
import { requestTextWithCache } from '../../services/requestWithCache'
import type { AnimeImages, AnimeWithoutDates, CarouselImage } from '../../types'
import { animeGetter } from './animeGetters'

const CACHE_TIME = 6 * 60 * 60 // -> 6 hours

function createWorkerForCarouselImages(title: string): Promise<CarouselImage[]> {
	return new Promise((resolve, reject) => {
		// Use __dirname for Node.js path resolution
		const worker = new Worker(new URL('./getCarouselImagesWorker.ts', `file://${__dirname}/`).href)

		worker.on('message', resolve) // Use 'message' event for Node.js workers
		worker.on('error', reject) // Use 'error' event for Node.js workers
		worker.postMessage({ title })
	})
}

export async function scrapeFullAnimeInfo(animeId: string, extractImages = true): Promise<AnimeWithoutDates | null> {
	const originalLink = `${animeFLVPages.BASE}/anime/${animeId}`
	const html = await requestTextWithCache(originalLink, { ttl: CACHE_TIME })
	if (!html) return null
	const { document } = new JSDOM(html).window

	const getOfAnime = animeGetter(document)
	const type = getOfAnime.type()
	const imageLink = getOfAnime.imgLink()
	const title = getOfAnime.title()
	const status = getOfAnime.status()
	const otherTitles = getOfAnime.otherTitles()
	const description = getOfAnime.description()
	const rank = getOfAnime.rank('.vtprmd')
	const genres = getOfAnime.genres()

	const anime: AnimeWithoutDates = {
		animeId,
		title,
		type,
		rank,
		otherTitles,
		description,
		originalLink,
		status,
		genres,
		images: null,
	}

	if (extractImages) {
		const images: AnimeImages = {
			coverImage: await getOptimizedImage(imageLink, animeId),
			carouselImages: await createWorkerForCarouselImages(title),
		}

		anime.images = images
	}

	return anime
}
