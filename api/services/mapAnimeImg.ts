import { GoogleImage } from '../googleTypes'
import { Anime, BannerImage } from '../types'
import { getGoogleImage } from './getGoogleImage'

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

function buildImageObject(link: string, image?: GoogleImage): BannerImage {
  return ({
    link,
    position: image ? determinateImgPosition(image) : IMG_POSITIONS.center,
    width: image?.width,
    height: image?.height,
  })
}

const dfWords = ['anime', 'wallpaper']

interface MapAnimeImg {
  (animes: Anime[], keywords: string[], num?: string): Promise<Anime[]>
}

export const mapAnimeImg: MapAnimeImg = async (animes, keywords = dfWords, num) => {
  const promises = animes.map(async (anime) => {
    const query = `${anime?.title} ${keywords.join(' ')}`
    const googleImageItems = await getGoogleImage(query, { num })

    const bannerImages: BannerImage[] = googleImageItems
      .filter(Boolean)
      .sort((a, b) => b.image.width - a.image.width)
      .map(image => buildImageObject(image.link, image.image))

    return {
      ...anime,
      bannerImages: !bannerImages.length
        ? await Promise.all(bannerImages)
        : [buildImageObject(anime.image ?? '')]
    }
  })

  return Promise.all(promises)
}