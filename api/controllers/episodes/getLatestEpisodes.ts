import { scrapeLastEpisodes } from '../../../src/scrapers/episodes/scrapeLastEpisodes'
import { UpsertEpisodes } from '../../../src/services/database/episodes'
import { mapOriginPath } from '../../../src/utils/mapOriginPath'
import { defaultCache } from '../../../src/services/cacheService'
import { logger } from '../../../src/utils/logger'

export const getLatestEpisodes = async (limit = Number.POSITIVE_INFINITY) => {
	const cacheKey = `latestEpisodes:${limit}`
	
	// Intentar obtener del caché primero
	const cachedEpisodes = defaultCache.get(cacheKey)
	if (cachedEpisodes) {
		return cachedEpisodes
	}
	
	try {
		// Si no está en caché, hacer scrape
		const scrapedLatestEpisodes = await scrapeLastEpisodes(limit)
		
		// Asegurar actualización asíncrona de la base de datos sin bloquear la respuesta
		Promise.resolve().then(() => {
			try {
				UpsertEpisodes(scrapedLatestEpisodes)
				.catch(error => {
					logger.error(`Error al insertar episodios en base de datos: ${error}`)
				})
			} catch (error) {
				logger.error(`Error al procesar la inserción de episodios: ${error}`)
			}
		})

		// Procesar resultados
		const mappedEpisodes = scrapedLatestEpisodes.map(episode => ({
			...episode,
			image: episode.image && mapOriginPath(`api/${episode.image}`),
		}))
		
		// Guardar en caché por 5 minutos (300 segundos)
		defaultCache.set(cacheKey, mappedEpisodes, 300)
		
		return mappedEpisodes
	} catch (error) {
		logger.error(`Error al obtener los últimos episodios: ${error}`)
		throw error
	}
}
