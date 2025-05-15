// Crea un archivo con la configuración remota
import { writeFileSync } from 'fs'
import { config } from 'dotenv'

config() // Carga variables de .env

const content = `
import { createClient } from '@supabase/supabase-js'
import type { Database } from '../../supabase'

export const supabase = createClient<Database>(
  '\${process.env.SUPABASE_URL}',
  '\${process.env.SUPABASE_KEY}'
)
`

writeFileSync('./src/services/database/supabaseClient.ts', content)
console.log('✅ Configuración de Supabase remota aplicada correctamente')
