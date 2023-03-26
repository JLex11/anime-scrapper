import { GoogleImage } from '../googleTypes'
import { BannerImage } from '../types'
import { getGoogleImage } from './getGoogleImage'
import { getOptimizeImage } from './getOptimizeImage'

const IMG_POSITIONS = {
  center: '50% 50%',
  top: '50% 20%'
}

function determinateImgPosition(image: GoogleImage) {
  const aspectRatioThreshold = 1.5
  
  return image?.width / image?.height >= aspectRatioThreshold
    ? IMG_POSITIONS.center
    : IMG_POSITIONS.top
}

export function buildImageObject(link: string, image?: GoogleImage): BannerImage {
  return ({
    link,
    position: image ? determinateImgPosition(image) : IMG_POSITIONS.center,
    width: image?.width,
    height: image?.height,
  })
}

const dfKeywords = ['anime', 'wallpaper']

interface GetAnimeBanners {
  (keywords: string[] | string): Promise<BannerImage[]>
}

export const getAnimeBanners: GetAnimeBanners = async (keywords) => {
  const keywordsArr = typeof keywords === 'string' ? [keywords] : keywords

  const query = [...keywordsArr, ...dfKeywords].join(' ')
  const googleImageItems = await getGoogleImage(query)

  const bannerImages: BannerImage[] = googleImageItems
    .filter(item => Boolean(item))
    .map(item => buildImageObject(item.link, item.image))
    .sort((a, b) => (b.position ?? 'b').localeCompare(a.position ?? 'a'))

  return Promise.all(bannerImages.map(async (image, index) => {
    image.link = await getOptimizeImage(
      image.link,
      `${keywordsArr.join('-')}-bannerImage-${index}`,
      {
        width: image.width,
        height: image.height,
        effort: 5
      }
    )

    return image
  }))
}