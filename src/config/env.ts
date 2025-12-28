/**
 * Configuración centralizada de variables de entorno
 * Bun carga automáticamente archivos .env, .env.local, etc.
 * No se requiere dotenv u otra librería adicional.
 */

/**
 * Obtiene una variable de entorno con validación
 * @param key - Nombre de la variable de entorno
 * @param required - Si es true, lanza error si la variable no existe
 * @returns El valor de la variable o string vacío si no es requerida
 */
function getEnvVar(key: string, required: boolean = true): string {
	const value = process.env[key]

	if (required && !value) {
		throw new Error(`Missing required environment variable: ${key}`)
	}

	return value || ''
}

// Supabase Configuration
export const SUPABASE_URL = getEnvVar('SUPABASE_URL')
export const SUPABASE_API_KEY = getEnvVar('SUPABASE_API_KEY')

// Google API Configuration
export const GOOGLE_API_KEY = getEnvVar('GOOGLE_API_KEY')
export const GOOGLE_SEARCH_ENGINE_ID = getEnvVar('GOOGLE_SEARCH_ENGINE_ID')

// Cloudflare R2 Configuration
export const R2_ACCOUNT_ID = getEnvVar('R2_ACCOUNT_ID')
export const R2_ACCESS_KEY_ID = getEnvVar('R2_ACCESS_KEY_ID')
export const R2_SECRET_ACCESS_KEY = getEnvVar('R2_SECRET_ACCESS_KEY')
export const R2_BUCKET = getEnvVar('R2_BUCKET', false) || 'anime-app'

// Server Configuration
export const PORT = process.env.PORT || '3000'
export const NODE_ENV = process.env.NODE_ENV || 'development'
export const IS_PRODUCTION = NODE_ENV === 'production'
export const IS_SERVERLESS = process.env.VERCEL_ENV !== undefined

/**
 * Valida que todas las variables de entorno críticas estén configuradas
 * Lanza un error si falta alguna variable requerida
 */
const validateEnv = () => {
	const requiredVars = [
		'SUPABASE_URL',
		'SUPABASE_API_KEY',
		'GOOGLE_API_KEY',
		'GOOGLE_SEARCH_ENGINE_ID',
		'R2_ACCOUNT_ID',
		'R2_ACCESS_KEY_ID',
		'R2_SECRET_ACCESS_KEY',
	]

	const missing = requiredVars.filter((key) => !process.env[key])

	if (missing.length > 0) {
		throw new Error(`Missing required environment variables:\n${missing.map((v) => `  - ${v}`).join('\n')}`)
	}
}

// Validar solo en producción o entornos serverless (Vercel)
// En desarrollo, las variables se validan cuando se usan (getEnvVar)
if (IS_PRODUCTION || IS_SERVERLESS) {
	validateEnv()
}
