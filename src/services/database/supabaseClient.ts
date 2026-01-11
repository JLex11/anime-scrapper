import { createClient } from '@supabase/supabase-js'
import type { Database } from '../../supabase'
import { SUPABASE_URL, SUPABASE_API_KEY } from '../../config/env'

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_API_KEY, {
	db: {
		schema: 'public',
	},
	auth: {
		persistSession: false, // No necesitamos sesiones en API
		autoRefreshToken: false,
	},
	global: {
		headers: {
			'x-client-info': 'anime-scrapper-api',
		},
	},
})
