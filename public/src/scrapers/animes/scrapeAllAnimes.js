"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scrapeAllAnimes = void 0;
const jsdom_1 = require("jsdom");
/* import { getAnimeInfo } from '../../controllers/animes/getAnimeInfo'
import { animeFLVPages } from '../../enums'
import { Anime } from '../../types.d' */
const getAnimeInfo_1 = require("../../../api/controllers/animes/getAnimeInfo");
const enums_1 = require("../../../api/enums");
const getFulfilledResults_1 = require("../../utils/getFulfilledResults");
const animeGetters_1 = require("./animeGetters");
async function scrapeAllAnimes(page = 1) {
    const html = await fetch(`${enums_1.animeFLVPages.BASE}/browse?page=${page}`).then(res => res.text());
    const { document } = new jsdom_1.JSDOM(html).window;
    const animeList = [...document.querySelectorAll('ul.ListAnimes li')];
    const mappedFoundAnimes = animeList.map(async (animeItem) => {
        const originalLink = (0, animeGetters_1.getAnimeOriginalLink)(animeItem);
        const animeId = (0, animeGetters_1.getAnimeIdFromLink)(originalLink);
        return await (0, getAnimeInfo_1.getAnimeInfo)(animeId);
    });
    const results = await Promise.allSettled(mappedFoundAnimes);
    return (0, getFulfilledResults_1.getFulfilledResults)(results);
}
exports.scrapeAllAnimes = scrapeAllAnimes;
