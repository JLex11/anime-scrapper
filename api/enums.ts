export enum ResponseType {
  JSON = 'json',
  TEXT = 'text',
  BUFFER = 'buffer'
}

export enum animeStatus {
  BROADCAST = '1',
  FINALIZED = '2',
  SOON = '3'
}

export enum animeFLVPages {
  BASE = 'https://www3.animeflv.net',
}

export enum endPoints {
  LATEST_EPISODES = '/latest',
  EPISODE_SOURCES = '/sources/:id',
  ANIME_INFO = '/:animeId',
  LATEST_ANIMES = '/latest',
  BROADCAST_ANIMES = '/broadcast',
  RATING_ANIMES = '/latest/rating',
  SEARCH_ANIMES = '/search/:query',
}

export enum GoogleApi {
  API_URL = 'https://www.googleapis.com/customsearch/v1?',
  SEARCH_ENGINE_ID = 'd605fa7e0557f4774'
}