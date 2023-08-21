import { Database } from './supabase'

interface Episode {
  originalLink: string
  title: string
  image?: string | null
  episode: number
  episodeId: string
  animeId: string
  created_at?: string
  updated_at?: string
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
  link: string | null
  position: string
  width: number
  height: number
}

type AnimeImages = {
  coverImage: string | null
  carouselImages: CarouselImage[]
}

export interface Anime {
  images?: AnimeImages
  title: string
  type?: string | null
  rank?: number | null
  animeId: string
  otherTitles?: string[] | null
  description?: string | null
  originalLink?: string | null
  status?: string | null
  genres?: string[] | null
  created_at: string
  updated_at: string
}

export type AnimeWithoutDates = Omit<Anime, 'created_at' | 'updated_at'>

export type AnimeColumns = Omit<Database['public']['Tables']['animes']['Row'], 'images'>
export type EpisodeColumns = Omit<Database['public']['Tables']['episodes']['Row'], 'image'>

export type ColumnType<T> = {
  [K in keyof T]: T[K] extends string
    ? string
    : T[K] extends number | null
    ? number
    : T[K] extends (string | null)[]
    ? (string | null)[]
    : any
}
