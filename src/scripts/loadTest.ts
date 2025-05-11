/**
 * Script para realizar pruebas de carga en la API
 * 
 * Ejecutar con: bun run test:performance
 */

import { logger } from '../utils/logger'

// Configuraciones
const API_BASE_URL = process.env.API_URL || 'http://localhost:3002/api'
const CONCURRENT_REQUESTS = 50
const TOTAL_REQUESTS = 500
const ENDPOINTS = [
  '/animes/latest',
  '/animes/broadcast',
  '/episodes/latest',
  '/animes?page=1'
]

// Interfaz para los resultados
interface EndpointResult {
  url: string
  successCount: number
  failCount: number
  totalTime: number
  avgResponseTime: number
  minResponseTime: number
  maxResponseTime: number
  statusCounts: Record<number, number>
}

// Función para realizar una solicitud única y medir el tiempo
async function makeRequest(url: string): Promise<{ 
  success: boolean, 
  time: number, 
  status: number 
}> {
  const start = performance.now()
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'LoadTester/1.0',
      },
    })
    const end = performance.now()
    const time = end - start
    
    return {
      success: response.ok,
      time,
      status: response.status,
    }
  } catch (error) {
    const end = performance.now()
    const time = end - start
    
    return {
      success: false,
      time,
      status: 0,
    }
  }
}

// Función para realizar pruebas en un endpoint específico
async function testEndpoint(endpoint: string): Promise<EndpointResult> {
  const url = `${API_BASE_URL}${endpoint}`
  logger.info(`Realizando prueba de carga en: ${url}`)
  
  const results: { success: boolean, time: number, status: number }[] = []
  const statusCounts: Record<number, number> = {}
  
  // Crear lotes de solicitudes
  const batches = Math.ceil(TOTAL_REQUESTS / CONCURRENT_REQUESTS)
  
  for (let i = 0; i < batches; i++) {
    const requestCount = Math.min(CONCURRENT_REQUESTS, TOTAL_REQUESTS - i * CONCURRENT_REQUESTS)
    logger.info(`Lote ${i + 1}/${batches}: Enviando ${requestCount} solicitudes...`)
    
    const requests = Array(requestCount).fill(0).map(() => makeRequest(url))
    const batchResults = await Promise.all(requests)
    
    results.push(...batchResults)
    
    // Contar códigos de estado
    batchResults.forEach(result => {
      statusCounts[result.status] = (statusCounts[result.status] || 0) + 1
    })
    
    // Pequeña pausa entre lotes para evitar bloqueos
    if (i < batches - 1) {
      await new Promise(resolve => setTimeout(resolve, 500))
    }
  }
  
  // Calcular estadísticas
  const successCount = results.filter(r => r.success).length
  const failCount = results.length - successCount
  const responseTimes = results.map(r => r.time)
  const totalTime = responseTimes.reduce((sum, time) => sum + time, 0)
  const avgResponseTime = totalTime / results.length
  const minResponseTime = Math.min(...responseTimes)
  const maxResponseTime = Math.max(...responseTimes)
  
  return {
    url,
    successCount,
    failCount,
    totalTime,
    avgResponseTime,
    minResponseTime,
    maxResponseTime,
    statusCounts,
  }
}

// Función principal
async function runLoadTest() {
  logger.info('=== INICIANDO PRUEBA DE CARGA ===')
  logger.info(`Solicitudes concurrentes: ${CONCURRENT_REQUESTS}`)
  logger.info(`Solicitudes totales por endpoint: ${TOTAL_REQUESTS}`)
  
  const startTime = performance.now()
  const results: EndpointResult[] = []
  
  // Probar cada endpoint secuencialmente
  for (const endpoint of ENDPOINTS) {
    const result = await testEndpoint(endpoint)
    results.push(result)
  }
  
  const endTime = performance.now()
  const totalTestTime = endTime - startTime
  
  // Mostrar resultados
  logger.info('\n=== RESULTADOS DE LA PRUEBA DE CARGA ===')
  logger.info(`Tiempo total de prueba: ${(totalTestTime / 1000).toFixed(2)}s`)
  
  results.forEach(result => {
    logger.info(`\nEndpoint: ${result.url}`)
    logger.info(`Éxito: ${result.successCount}/${TOTAL_REQUESTS} (${(result.successCount / TOTAL_REQUESTS * 100).toFixed(2)}%)`)
    logger.info(`Fallos: ${result.failCount}`)
    logger.info(`Tiempo total: ${(result.totalTime / 1000).toFixed(2)}s`)
    logger.info(`Tiempo medio de respuesta: ${result.avgResponseTime.toFixed(2)}ms`)
    logger.info(`Tiempo mínimo: ${result.minResponseTime.toFixed(2)}ms`)
    logger.info(`Tiempo máximo: ${result.maxResponseTime.toFixed(2)}ms`)
    logger.info(`RPS (estimado): ${(TOTAL_REQUESTS / (result.totalTime / 1000)).toFixed(2)}`)
    
    logger.info('Códigos de estado:')
    Object.entries(result.statusCounts).forEach(([status, count]) => {
      logger.info(`  ${status}: ${count}`)
    })
  })
  
  logger.info('\n=== FIN DE LA PRUEBA DE CARGA ===')
}

// Ejecutar la prueba
runLoadTest().catch(error => {
  logger.error(`Error en la prueba de carga: ${error}`)
  process.exit(1)
})
