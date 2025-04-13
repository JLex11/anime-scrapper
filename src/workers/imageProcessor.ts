import { updateAnimeJsonImages } from '../services/database/animes'
import { getCarouselImages } from '../services/getCarouselImages'
import { consumeQueue } from '../services/messageQueue'

consumeQueue(async message => {
	const { animeId, query } = message

	try {
		const carouselImages = await getCarouselImages(query)
		if (!carouselImages) {
			console.error('No se encontraron imágenes para el anime:', animeId)
			return
		}

		await updateAnimeJsonImages(animeId, 'carouselImages', carouselImages)

		console.log(`Imágenes procesadas para el anime ${animeId}`)
	} catch (error) {
		console.error('Error procesando imágenes:', error)
	}
})
