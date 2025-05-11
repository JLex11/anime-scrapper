import winston from 'winston'
import path from 'node:path'

// Determinar el entorno
const isProduction = process.env.NODE_ENV === 'production'
const isServerless = process.env.VERCEL_ENV !== undefined

// Función para obtener la ruta a los archivos de log
const getLogFilePath = (filename: string): string => {
  // En entorno serverless no usamos archivos
  if (isServerless) return ''
  
  // Construir ruta absoluta a la carpeta de logs
  return path.join(process.cwd(), 'src', '_logs', filename)
}

// Configuración del formato de log
const logFormat = winston.format.printf(({ level, message, timestamp, ...meta }) => {
  return `${timestamp} ${level.toUpperCase()}: ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ''}`
})

// Definir los transportes según el entorno
const transports: winston.transport[] = [
  // Consola para todos los entornos
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  })
]

// Solo agregar transportes de archivo si no estamos en serverless
if (!isServerless) {
  transports.push(
    new winston.transports.File({ 
      filename: getLogFilePath('error.log'), 
      level: 'error'
    }),
    new winston.transports.File({ 
      filename: getLogFilePath('combined.log') 
    })
  )
}

// Crear el logger
export const logger = winston.createLogger({
  level: isProduction ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    logFormat
  ),
  defaultMeta: { service: 'anime-scrapper-api' },
  transports
})

export default logger
