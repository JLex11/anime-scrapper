declare module 'bun' {
	interface Env {
		SUPABASE_URL: string
		SUPABASE_API_KEY: string
		GOOGLE_API_KEY: string
	}
}
