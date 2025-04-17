import { getCarouselImages } from '../../services/getCarouselImages'

self.onmessage = async event => {
	const { title } = event.data

	try {
		const images = await getCarouselImages(title)
		self.postMessage(images)
	} catch (error) {
		console.error('Error in worker:', error)
		self.postMessage({ error: (error as Error).message })
	}
}
