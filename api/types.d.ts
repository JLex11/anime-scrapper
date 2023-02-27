interface EpisodeBase {
  orgLink?: string
  title?: string
}

export interface Episode extends EpisodeBase {
  episode: number
}

export interface LastEpisode extends EpisodeBase {
  image?: string
  episode?: string
  id?: string
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
  animeId: string
  episodeId: string
  episode: string
  videos: VideoList
}

interface AnimeBase {
  image?: string
  title?: string
  type?: string
  rank?: string
}

export interface Anime extends AnimeBase {
  description?: string
  genres: string[]
  related: string[]
  episodes: Episode[]
}

export interface ShortAnime extends AnimeBase {
  originalLink?: string
  shortDescription?: string
}

export interface EmisionAnime extends AnimeBase {
  originalLink?: string
  title?: string
  type?: string
}
