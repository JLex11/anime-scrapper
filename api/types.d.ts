import { Database } from './supabase'

interface Episode {
  originalLink?: string
  title?: string
  image?: string
  episode?: number
  episodeId?: string
  animeId?: string
}

export interface LastEpisode extends Episode {
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

type CarouselImage = {
  link: string
  position: string
  width: number
  height: number
}

type AnimeImages = {
  coverImage: string
  carouselImages: CarouselImage[]
}

export interface Anime {
  images?: AnimeImages | null
  title: string
  type?: string | null
  rank?: number | null
  animeId: string
  otherTitles?: string[] | null
  description?: string | null
  originalLink?: string | null
  status?: string | null
  genres?: string[] | null
  created_at?: string
}

export type AnimeColumns = Omit<Database['public']['Tables']['animes']['Row'], 'images'>

export type ColumnType<T> = {
  [K in keyof T]: T[K] extends string
    ? string
    : T[K] extends number | null
    ? number
    : T[K] extends (string | null)[]
    ? (string | null)[]
    : never
}
