import { parentPort } from 'node:worker_threads'
import { getCarouselImages } from '../../services/getCarouselImages'

if (!parentPort) throw new Error('This script must be run as a worker thread.')

parentPort.on('message', async event => {
	const { title } = event

	try {
		const images = await getCarouselImages(title)
		parentPort?.postMessage(images)
	} catch (error) {
		console.error('Error in worker:', error)
		parentPort?.postMessage({ error: (error as Error).message })
	}
})
