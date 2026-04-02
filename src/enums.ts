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
	EPISODE_SOURCES_BY_EPISODE_ID = '/:episodeId/sources',
	EPISODE_SOURCES = '/sources/:id',
	ANIME_INFO = '/:animeId',
	ANIME_EPISODES = '/:animeId/episodes',
	ANIME_RELATED = '/:animeId/related',
	LATEST_ANIMES = '/latest',
	RATING_ANIMES = '/latest/rating',
	BROADCAST_ANIMES = '/broadcast',
	SEARCH_ANIMES = '/search/:query',
	ANIME_DIRECTORY = '/directory',
	IMAGES = '/:imageToken',
}

export enum GoogleApi {
	API_URL = 'https://www.googleapis.com/customsearch/v1?',
}
