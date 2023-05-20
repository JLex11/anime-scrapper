"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scrapeEpisodeSources = void 0;
const jsdom_1 = require("jsdom");
/* import { animeFLVPages } from '../../enums' */
const enums_1 = require("../../../api/enums");
const requestWithCache_1 = require("../../services/requestWithCache");
/* import { EpisodeSources } from '../../types.d' */
async function scrapeEpisodeSources(episodeId) {
    if (!episodeId) {
        return {
            episode: 0,
            videos: [],
        };
    }
    const html = await (0, requestWithCache_1.requestTextWithCache)(`${enums_1.animeFLVPages.BASE}/ver/${episodeId}`, { ttl: 259200 });
    const { document } = new jsdom_1.JSDOM(html).window;
    const scrapedScript = [...document.querySelectorAll('script[type="text/javascript"]')]
        .map(script => script.textContent)
        .join(' ');
    /* const animeId = scrapedScript.split('var anime_id = ')[1].split(';')[0].replace(/"/g, '')
    const episodeId = scrapedScript.split('var episode_id = ')[1].split(';')[0].replace(/"/g, '') */
    const episode = +(scrapedScript?.split('var episode_number = ')?.[1]?.split(';')?.[0]?.replace(/"/g, '') ?? 0);
    const videos = JSON.parse(scrapedScript?.split('var videos = ')?.[1]?.split(';')?.[0] ?? '[]');
    return {
        episode,
        videos,
    };
}
exports.scrapeEpisodeSources = scrapeEpisodeSources;
