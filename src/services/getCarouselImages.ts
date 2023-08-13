import { IMG_POSITIONS } from '../enums'
import { GoogleImage } from '../googleTypes'
import { CarouselImage } from '../types'
import { getGoogleImage } from './getGoogleImage'
import { getOptimizeImage } from './getOptimizeImage'

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

const dfKeywords = ['anime', 'wallpaper']

export const getCarouselImages = async (keywords: string[] | string): Promise<CarouselImage[]> => {
  const keywordsArr = Array.isArray(keywords) ? keywords : [keywords]

  const query = [...keywordsArr, ...dfKeywords].join(' ')
  const googleImageItems = await getGoogleImage(query)

  const carouselImages: CarouselImage[] = googleImageItems
    .map((item: any) => buildImageObject(item.link, item.image))
    .sort((a, b) => b.width - a.width)

  return Promise.all(
    carouselImages
      .filter(({ link }) => link !== null)
      .flatMap(async (image, index) => {
        const imageName = `${keywordsArr.join('-')}-carouselImage-${index}`
        const options = { width: image.width, height: image.height, effort: 3 }
        image.link = image.link && (await getOptimizeImage(image.link, imageName, options))
        return image
      })
  )
}
