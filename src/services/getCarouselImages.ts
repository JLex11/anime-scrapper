import { IMG_POSITIONS, LANDSCAPE_DIMENSIONS } from '../enums'
import type { GoogleImage, GoogleImageSearchItem } from '../googleTypes'
import type { CarouselImage } from '../types'
import { getGoogleImage } from './getGoogleImage'
import { getOptimizedImage } from './getOptimizeImage'

function determinateImgPosition(image: GoogleImage) {
	const aspectRatioThreshold = 1.5
	return image?.width / image?.height >= aspectRatioThreshold ? IMG_POSITIONS.CENTER : IMG_POSITIONS.TOP
}

export function buildImageObject(link: string, image?: GoogleImage): CarouselImage {
	return {
		link,
		position: image ? determinateImgPosition(image) : IMG_POSITIONS.CENTER,
		width: image?.width || 1080,
		height: image?.height || 1920,
	}
}

const predefinedWords = ['anime']

export const getCarouselImages = async (keywords: string[] | string): Promise<CarouselImage[]> => {
	const keywordsArr = Array.isArray(keywords) ? keywords : [keywords]

	const query = [...keywordsArr, ...predefinedWords].join(' ')
	const googleImageItems = await getGoogleImage(query)

	const carouselImages: CarouselImage[] = googleImageItems
		.map((item: GoogleImageSearchItem) => buildImageObject(item.link, item.image))
		.sort((a, b) => b.width - a.width)

	const optimizedImages = carouselImages.map(async (image, index) => {
		const imageName = `${keywordsArr.join('-')}-carouselImage-${index}`
		const options = { width: LANDSCAPE_DIMENSIONS.WIDTH, height: LANDSCAPE_DIMENSIONS.HEIGHT, effort: 6 }
		if (!image.link) return

		image.link = image.link && (await getOptimizedImage(image.link, imageName, options))
		return image
	})

	return Promise.all(optimizedImages).then(images => images.filter(Boolean) as CarouselImage[])
}
