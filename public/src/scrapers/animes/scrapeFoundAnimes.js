"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scrapeFoundAnimes = void 0;
const jsdom_1 = require("jsdom");
/* import { getAnimeInfo } from '../../controllers/animes/getAnimeInfo'
import { animeFLVPages } from '../../enums' */
const requestWithCache_1 = require("../../services/requestWithCache");
/* import { Anime } from '../../types.d' */
const getAnimeInfo_1 = require("../../../api/controllers/animes/getAnimeInfo");
const enums_1 = require("../../../api/enums");
const getFulfilledResults_1 = require("../../utils/getFulfilledResults");
const animeGetters_1 = require("./animeGetters");
async function scrapeFoundAnimes(query) {
    const html = await (0, requestWithCache_1.requestTextWithCache)(`${enums_1.animeFLVPages.BASE}/browse?q=${query}`, {
        ttl: 648000,
    });
    const { document } = new jsdom_1.JSDOM(html).window;
    const animeList = [...document.querySelectorAll('ul.ListAnimes li')];
    const mappedFoundAnimes = animeList.map(animeItem => {
        const originalLink = (0, animeGetters_1.getAnimeOriginalLink)(animeItem);
        const animeId = (0, animeGetters_1.getAnimeIdFromLink)(originalLink);
        return (0, getAnimeInfo_1.getAnimeInfo)(animeId);
    });
    const results = await Promise.allSettled(mappedFoundAnimes);
    return (0, getFulfilledResults_1.getFulfilledResults)(results);
}
exports.scrapeFoundAnimes = scrapeFoundAnimes;
