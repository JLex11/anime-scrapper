export enum ResponseType {
	JSON = 'json',
	TEXT = 'text',
	BUFFER = 'buffer',
}

export enum animeStatus {
	BROADCAST = '1',
	FINALIZED = '2',
	SOON = '3',
}

export enum IMG_POSITIONS {
	CENTER = '50% 50%',
	TOP = '50% 20%',
}

export enum LANDSCAPE_DIMENSIONS {
	WIDTH = 1536,
	HEIGHT = 768,
}

export enum animeFLVPages {
	BASE = 'https://www3.animeflv.net',
}

export enum endPoints {
	LATEST_EPISODES = '/latest',
	EPISODE_BY_ID = '/:episodeId',
	EPISODE_SOURCES = '/sources/:id',
	ANIME_INFO = '/:animeId',
	ANIME_EPISODES = '/:animeId/episodes',
	LATEST_ANIMES = '/latest',
	RATING_ANIMES = '/latest/rating',
	BROADCAST_ANIMES = '/broadcast',
	SEARCH_ANIMES = '/search/:query',
	ANIME_DIRECTORY = '/directory',
	IMAGES = '/image/:imgFilename',
	PROCESS_IMAGES = '/process-image',
}

export enum GoogleApi {
	API_URL = 'https://www.googleapis.com/customsearch/v1?',
	SEARCH_ENGINE_ID = 'd605fa7e0557f4774',
}
