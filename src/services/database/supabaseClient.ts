import { createClient } from '@supabase/supabase-js'
import type { Database } from '../../supabase'

export const supabase = createClient<Database>(
	'https://qyuxymbzzxwnrgqxjloe.supabase.co',
	'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF5dXh5bWJ6enh3bnJncXhqbG9lIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NzkzMjUwNTMsImV4cCI6MTk5NDkwMTA1M30.-CWwL2b6hVFoD9g5JgFJVYUMGds9ucc28pUaxABHIRA'
)
