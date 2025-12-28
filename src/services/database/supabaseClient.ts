import { createClient } from '@supabase/supabase-js'
import type { Database } from '../../supabase'
import { SUPABASE_URL, SUPABASE_API_KEY } from '../../config/env'

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_API_KEY)
