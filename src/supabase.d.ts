import type { AnimeImages } from './types.d'

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
					created_at: string
					updated_at: string
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
					created_at?: string | null
					updated_at?: string | null
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
					created_at?: string | null
					updated_at?: string | null
				}
				Relationships: []
			}
			episodes: {
				Row: {
					_id: number
					animeId: string | null
					episode: number | null
					episodeId: string
					image: string | null
					originalLink: string | null
					title: string | null
					created_at: string
					updated_at: string
				}
				Insert: {
					_id?: number
					animeId?: string | null
					episode?: number | null
					episodeId: string
					image?: string | null
					originalLink?: string | null
					title?: string | null
					created_at?: string | null
					updated_at?: string | null
				}
				Update: {
					_id?: number
					animeId?: string | null
					episode?: number | null
					episodeId?: string
					image?: string | null
					originalLink?: string | null
					title?: string | null
					created_at?: string | null
					updated_at?: string | null
				}
				Relationships: [
					{
						foreignKeyName: 'episodes_animeId_fkey'
						columns: ['animeId']
						referencedRelation: 'animes'
						referencedColumns: ['animeId']
					},
				]
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
