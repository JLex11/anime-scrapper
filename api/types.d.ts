interface EpisodeBase {
  originalLink?: string
  title?: string
}

export interface Episode extends EpisodeBase {
  episode: number
}

export interface LastEpisode extends EpisodeBase {
  image?: string
  episode?: string
  id?: string
  animeId?: string
}

export interface EpisodeVideo {
  server: string
  title: string
  ads: number
  url?: string
  allow_mobile: boolean
  code: string
}

export interface VideoList {
  SUB?: EpisodeVideo[]
  DUB?: EpisodeVideo[]
}

export interface EpisodeSources {
  episode: string
  videos: VideoList
}

interface AnimeBase {
  image?: string
  title?: string
  type?: string
  rank?: string
  animeId?: string
}

export interface Anime extends AnimeBase {
  title: string
  description?: string
  related: string[]
  originalLink?: string
}

export interface FullAnimeInfo extends AnimeBase {
  genres: string[]
  episodes: Episode[]
}

export interface ShortAnime extends AnimeBase {
  shortDescription?: string
}

export interface EmisionAnime extends AnimeBase {
  type?: string
}
