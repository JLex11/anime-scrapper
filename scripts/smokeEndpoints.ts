type CheckResult = {
	name: string
	status: 'pass' | 'fail' | 'warn' | 'skip'
	details: string
}

type HttpResponse = {
	status: number
	bodyText: string
	json: unknown | null
	headers: Headers
}

const baseUrl = process.env.BASE_URL ?? 'http://localhost:3000'
const timeoutMs = Number(process.env.SMOKE_TIMEOUT_MS ?? '20000')

const results: CheckResult[] = []

const addResult = (result: CheckResult) => {
	results.push(result)
	const prefix =
		result.status === 'pass'
			? 'PASS'
			: result.status === 'warn'
				? 'WARN'
				: result.status === 'skip'
					? 'SKIP'
					: 'FAIL'
	console.log(`[${prefix}] ${result.name} - ${result.details}`)
}

const request = async (path: string, options?: RequestInit): Promise<HttpResponse> => {
	const url = new URL(path.startsWith('/') ? path : `/${path}`, baseUrl)
	const controller = new AbortController()
	const timer = setTimeout(() => controller.abort(), timeoutMs)

	try {
		const response = await fetch(url, {
			redirect: 'manual',
			...options,
			signal: controller.signal,
		})
		const bodyText = await response.text()
		let json: unknown | null = null

		try {
			json = JSON.parse(bodyText)
		} catch {
			json = null
		}

		return {
			status: response.status,
			bodyText,
			json,
			headers: response.headers,
		}
	} finally {
		clearTimeout(timer)
	}
}

const run = async () => {
	let animeId = ''
	let episodeId = ''
	let coverImagePath = ''

	try {
		const routesRes = await request('/api/api-routes')
		if (routesRes.status !== 200 || !Array.isArray(routesRes.json) || routesRes.json.length === 0) {
			addResult({
				name: 'GET /api/api-routes',
				status: 'fail',
				details: `status=${routesRes.status}, expected 200 con arreglo no vacío`,
			})
		} else {
			addResult({
				name: 'GET /api/api-routes',
				status: 'pass',
				details: `${routesRes.json.length} rutas detectadas`,
			})
		}

		const notFoundRes = await request('/api/ruta-que-no-existe')
		if (notFoundRes.status === 404) {
			addResult({
				name: 'GET /api/ruta-que-no-existe',
				status: 'pass',
				details: '404 esperado',
			})
		} else {
			addResult({
				name: 'GET /api/ruta-que-no-existe',
				status: 'fail',
				details: `status=${notFoundRes.status}, expected=404`,
			})
		}

		const searchRes = await request('/api/animes/search/naruto?page=1&pageSize=1')
		if (searchRes.status !== 200 || !Array.isArray(searchRes.json) || searchRes.json.length === 0) {
			addResult({
				name: 'GET /api/animes/search/naruto',
				status: 'fail',
				details: `status=${searchRes.status}, expected 200 con resultados`,
			})
		} else {
			const anime = searchRes.json[0] as {
				animeId?: string
				images?: { coverImage?: string }
			}
			animeId = anime.animeId ?? ''
			const coverImage = anime.images?.coverImage
			if (coverImage) {
				try {
					coverImagePath = new URL(coverImage).pathname
				} catch {
					coverImagePath = coverImage
				}
			}

			addResult({
				name: 'GET /api/animes/search/naruto',
				status: 'pass',
				details: `animeId usado para pruebas: ${animeId || 'N/A'}`,
			})
		}

		if (!animeId) {
			addResult({
				name: 'Pruebas dinámicas de anime/episodios',
				status: 'skip',
				details: 'No se obtuvo animeId desde búsqueda',
			})
		} else {
			const animeInfoRes = await request(`/api/animes/${animeId}`)
			if (animeInfoRes.status === 200) {
				addResult({
					name: `GET /api/animes/${animeId}`,
					status: 'pass',
					details: 'anime info disponible',
				})
			} else {
				addResult({
					name: `GET /api/animes/${animeId}`,
					status: 'fail',
					details: `status=${animeInfoRes.status}, expected=200`,
				})
			}

			const animeEpisodesRes = await request(`/api/animes/${animeId}/episodes?offset=0&limit=1`)
			if (animeEpisodesRes.status !== 200 || !Array.isArray(animeEpisodesRes.json) || animeEpisodesRes.json.length === 0) {
				addResult({
					name: `GET /api/animes/${animeId}/episodes`,
					status: 'fail',
					details: `status=${animeEpisodesRes.status}, expected 200 con al menos 1 episodio`,
				})
			} else {
				const firstEpisode = animeEpisodesRes.json[0] as { episodeId?: string }
				episodeId = firstEpisode.episodeId ?? ''

				addResult({
					name: `GET /api/animes/${animeId}/episodes`,
					status: 'pass',
					details: `episodeId usado para pruebas: ${episodeId || 'N/A'}`,
				})
			}
		}

		if (episodeId) {
			const episodeRes = await request(`/api/episodes/${episodeId}`)
			if (episodeRes.status === 200) {
				addResult({
					name: `GET /api/episodes/${episodeId}`,
					status: 'pass',
					details: 'episodio encontrado',
				})
			} else {
				addResult({
					name: `GET /api/episodes/${episodeId}`,
					status: 'fail',
					details: `status=${episodeRes.status}, expected=200`,
				})
			}

			for (const path of [`/api/episodes/${episodeId}/sources`, `/api/episodes/sources/${episodeId}`]) {
				const sourcesRes = await request(path)
				if (sourcesRes.status === 200) {
					addResult({
						name: `GET ${path}`,
						status: 'pass',
						details: 'fuentes de streaming disponibles',
					})
				} else if (sourcesRes.status === 404) {
					addResult({
						name: `GET ${path}`,
						status: 'warn',
						details: 'sin fuentes precalculadas aún (no bloqueante)',
					})
				} else {
					addResult({
						name: `GET ${path}`,
						status: 'fail',
						details: `status=${sourcesRes.status}, expected 200 o 404`,
					})
				}
			}
		}

		if (coverImagePath) {
			const imageRes = await request(coverImagePath)
			if (imageRes.status === 302) {
				addResult({
					name: `GET ${coverImagePath}`,
					status: 'pass',
					details: 'redirección a URL firmada de imagen',
				})
			} else if (imageRes.status === 404) {
				addResult({
					name: `GET ${coverImagePath}`,
					status: 'warn',
					details: 'token de imagen no válido en esta data',
				})
			} else {
				addResult({
					name: `GET ${coverImagePath}`,
					status: 'fail',
					details: `status=${imageRes.status}, expected 302 o 404`,
				})
			}
		}

		const optionalFeedPaths = [
			'/api/animes?page=1&pageSize=3',
			'/api/animes/latest?limit=3',
			'/api/animes/broadcast?limit=3',
			'/api/animes/latest/rating?limit=3',
			'/api/episodes/latest?limit=3',
		]

		for (const path of optionalFeedPaths) {
			const feedRes = await request(path)
			if (feedRes.status === 200) {
				addResult({
					name: `GET ${path}`,
					status: 'pass',
					details: 'feed disponible',
				})
			} else if (feedRes.status === 404) {
				addResult({
					name: `GET ${path}`,
					status: 'warn',
					details: 'feed vacío/no sincronizado (esperable tras separación del engine)',
				})
			} else {
				addResult({
					name: `GET ${path}`,
					status: 'fail',
					details: `status=${feedRes.status}, expected 200 o 404`,
				})
			}
		}
	} catch (error) {
		addResult({
			name: 'Conectividad base',
			status: 'fail',
			details: `No se pudo contactar ${baseUrl}: ${(error as Error).message}`,
		})
	}

	console.log('\nResumen:')
	const passCount = results.filter(result => result.status === 'pass').length
	const warnCount = results.filter(result => result.status === 'warn').length
	const failCount = results.filter(result => result.status === 'fail').length
	const skipCount = results.filter(result => result.status === 'skip').length
	console.log(`PASS=${passCount} WARN=${warnCount} FAIL=${failCount} SKIP=${skipCount}`)

	process.exit(failCount > 0 ? 1 : 0)
}

void run()
