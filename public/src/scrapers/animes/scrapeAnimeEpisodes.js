"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scrapeAnimeEpisodes = void 0;
const jsdom_1 = require("jsdom");
//import { animeFLVPages } from '../../enums'
const requestWithCache_1 = require("../../services/requestWithCache");
//import { Episode } from '../../types.d'
const enums_1 = require("../../../api/enums");
const animeGetters_1 = require("./animeGetters");
async function scrapeAnimeEpisodes(animeId, offset, limit) {
    const originalLink = `${enums_1.animeFLVPages.BASE}/anime/${animeId}`;
    const html = await (0, requestWithCache_1.requestTextWithCache)(originalLink, { ttl: 2592000 });
    const { document } = new jsdom_1.JSDOM(html).window;
    const title = (0, animeGetters_1.getAnimeTitle)(document);
    const scrapedScript = [...document.querySelectorAll('script')].map(s => s.textContent).join(' ');
    let internAnimeId;
    let episodesIds = [];
    try {
        internAnimeId = JSON.parse(scrapedScript
            .split(/(var|let|const) *anime_info *= */)
            .pop()
            .split(/;|(var|let|const)/)
            .shift() ?? '[]');
        episodesIds = JSON.parse(scrapedScript
            .split(/(var|let|const) *episodes *= */)
            .pop()
            .split(';')
            .shift() ?? '[]');
    }
    catch (error) {
        return [];
    }
    const animeEpisodes = episodesIds.slice(offset || 0, limit || 20).map(([episodeNumber]) => {
        const episode = episodeNumber;
        const episodeId = `${animeId}-${episodeNumber}`;
        const originalLink = `${enums_1.animeFLVPages.BASE}/ver/${episodeId}`;
        const image = `https://cdn.animeflv.net/screenshots/${internAnimeId}/${episodeNumber}/th_3.jpg`;
        return {
            episodeId,
            title,
            episode,
            originalLink,
            image,
        };
    });
    return animeEpisodes;
}
exports.scrapeAnimeEpisodes = scrapeAnimeEpisodes;
