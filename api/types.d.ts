interface Episode {
  originalLink?: string
  title?: string
  image?: string
  episode?: number
}

export interface LastEpisode extends Episode {
  episodeId?: string
  animeId?: string
}

export interface EpisodeVideo {
  server: string
  title: string
  ads: number
  url?: string
  allow_mobile: boolean
  code: string
  episodeId: string
}

export interface VideoList {
  SUB?: EpisodeVideo[]
  DUB?: EpisodeVideo[]
}

export interface EpisodeSources {
  episode: number
  videos: VideoList | EpisodeVideo[] | []
}

type BannerImage = {
  link: string
  position?: string
  width?: number
  height?: number
}

type AnimeImages = {
  coverImage?: string
  bannerImages?: BannerImage[]
}

interface AnimeBase {
  images?: AnimeImages
  title?: string
  type?: string
  rank?: string
  animeId?: string
}

export type otherTitle = string | undefined
export type genre = string | undefined

export interface Anime extends AnimeBase {
  otherTitles?: otherTitle[]
  description?: string
  originalLink?: string
  status?: string
  genres: genre[]
  episodes: Episode[]
}

export interface ShortAnime extends AnimeBase {
  shortDescription?: string
}

export interface EmisionAnime extends AnimeBase {
  type?: string
}