import rateLimit from 'express-rate-limit'
import { Request, Response } from 'express'
import { logger } from '../utils/logger'

// Configuración diferente según el entorno
const isProduction = process.env.NODE_ENV === 'production'
const isServerless = process.env.VERCEL_ENV !== undefined

// Opciones para el limitador de tasa
const getRateLimitOptions = () => {
  // En entorno serverless (Vercel) usamos un límite más estricto ya que cada instancia es independiente
  if (isServerless) {
    return {
      windowMs: 60 * 1000, // 1 minuto
      max: 60, // 60 solicitudes por minuto por IP
      standardHeaders: true,
      legacyHeaders: false,
      message: {
        status: 'error',
        message: 'Demasiadas solicitudes, por favor intente más tarde',
      }
    }
  }
  
  // En Render (entorno Node.js normal) podemos ser un poco más permisivos
  return {
    windowMs: 60 * 1000, // 1 minuto
    max: 120, // 120 solicitudes por minuto por IP (el doble que en serverless)
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      status: 'error',
      message: 'Demasiadas solicitudes, por favor intente más tarde',
    }
  }
}

// Funciones para personalizar el comportamiento
const keyGenerator = (req: Request): string => {
  return req.ip || 'unknown'
}

const handler = (req: Request, res: Response): void => {
  if (isProduction) {
    logger.warn(`Rate limit excedido para IP: ${req.ip}, ruta: ${req.originalUrl}`)
  }
  
  res.status(429).json({
    status: 'error',
    message: 'Demasiadas solicitudes, por favor intente más tarde',
  })
}

// Limitador genérico para toda la API
export const apiLimiter = rateLimit({
  ...getRateLimitOptions(),
  keyGenerator,
  handler,
})

// Limitador más restrictivo para rutas sensibles (búsqueda, scraping, etc.)
export const searchLimiter = rateLimit({
  ...getRateLimitOptions(),
  max: isServerless ? 30 : 60, // La mitad del límite normal
  keyGenerator,
  handler,
})

// Limitador específico para imágenes
export const imageLimiter = rateLimit({
  ...getRateLimitOptions(),
  max: isServerless ? 100 : 200, // Más permisivo para las imágenes
  keyGenerator,
  handler,
})
