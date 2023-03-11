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
  LATEST_EPISODES = '/episodes/latest',
  EPISODE_SOURCES = '/episodes/sources/',
  ANIME_INFO = '/animes/',
  LATEST_ANIMES = '/animes/latest',
  BROADCAST_ANIMES = '/animes/broadcast',
  RATING_ANIMES = '/animes/latest/rating',
  SEARCH_ANIMES = '/animes/search/'
}
