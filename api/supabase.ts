import { AnimeImages } from './types.d'

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export interface Database {
  public: {
    Tables: {
      animes: {
        Row: {
          animeId: string
          description: string | null
          genres: string[] | null
          images: AnimeImages | null
          originalLink: string | null
          otherTitles: string[] | null
          rank: number | null
          status: string | null
          title: string
          type: string | null
        }
        Insert: {
          animeId: string
          description?: string | null
          genres?: string[] | null
          images?: AnimeImages | null
          originalLink?: string | null
          otherTitles?: string[] | null
          rank?: number | null
          status?: string | null
          title?: string
          type?: string | null
        }
        Update: {
          animeId?: string
          description?: string | null
          genres?: string[] | null
          images?: AnimeImages | null
          originalLink?: string | null
          otherTitles?: string[] | null
          rank?: number | null
          status?: string | null
          title?: string
          type?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
