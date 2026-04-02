import { Router as RouterApp, type Router as RouterType } from 'express'
import { endPoints } from '../../src/enums'
import { mapOriginPath } from '../../src/utils/mapOriginPath'

const router: RouterType = RouterApp()

const routesDocumentation = [
	{
		route: `/episodes${endPoints.LATEST_EPISODES}`,
		description: 'Obtiene los últimos episodios de anime añadidos',
		category: 'episodes'
	},
	{
		route: `/episodes${endPoints.EPISODE_BY_ID}`,
		description: 'Información completa de un episodio. Requiere el ID del episodio como parámetro',
		category: 'episodes'
	},
	{
		route: `/episodes${endPoints.EPISODE_SOURCES_BY_EPISODE_ID}`,
		description: 'Obtiene las fuentes de streaming precalculadas del episodio. Requiere el ID del episodio como parámetro',
		category: 'episodes'
	},
	{
		route: `/episodes${endPoints.EPISODE_SOURCES}`,
		description: 'Alias legado del endpoint de fuentes. Se mantiene por compatibilidad temporal',
		category: 'episodes'
	},
	{
		route: `/image${endPoints.IMAGES}`,
		description: 'Redirige (302) a una URL firmada temporal en Cloudflare R2',
		category: 'images'
	},
	{
		route: '/animes',
		description: 'Obtiene animes del feed directory. Se puede paginar con page y pageSize',
		category: 'animes'
	},
	{
		route: `/animes${endPoints.LATEST_ANIMES}`,
		description: 'Obtiene los últimos animes añadidos',
		category: 'animes'
	},
	{
		route: `/animes${endPoints.BROADCAST_ANIMES}`,
		description: 'Obtiene los animes en emisión actualmente',
		category: 'animes'
	},
	{
		route: `/animes${endPoints.RATING_ANIMES}`,
		description: 'Obtiene los animes mejor valorados',
		category: 'animes'
	},
	{
		route: `/animes${endPoints.SEARCH_ANIMES}`,
		description: 'Busca animes por nombre. Requiere el término de búsqueda como parámetro',
		category: 'animes'
	},
	{
		route: `/animes${endPoints.ANIME_INFO}`,
		description: 'Información completa de un anime. Requiere el ID del anime como parámetro',
		category: 'animes'
	},
	{
		route: `/animes${endPoints.ANIME_EPISODES}`,
		description: 'Episodios de un anime específico. Se puede paginar usando los parámetros de consulta offset y limit',
		category: 'animes'
	}
]

// Endpoint para obtener la documentación en formato JSON
router.get('/', async (_, res) => {
	const mappedRoutesDocumentations = routesDocumentation.map(docRoute => ({
		...docRoute,
		route: mapOriginPath(`api${docRoute.route}`),
	}))

	res.send(mappedRoutesDocumentations)
})

// Servir la documentación de API con interfaz de usuario
router.get('/docs', (_, res) => {
	res.redirect('/api/api-docs/')
})

export default router
