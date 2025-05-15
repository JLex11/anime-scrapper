import { createClient } from '@supabase/supabase-js'
import type { Database } from '../../supabase'

export const supabase = createClient<Database>(
  process.env.SUPABASE_URL, //'https://your-supabase-url.supabase.co',
  process.env.SUPABASE_API_KEY //'public-anon-key',
)
