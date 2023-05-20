"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAnimeInfo = void 0;
/* import { scrapeFullAnimeInfo } from '../../scrapers/animes/scrapeFullAnimeInfo'
import { createAnime, getAnimeBy } from '../../services/database/animes' */
const scrapeFullAnimeInfo_1 = require("../../../src/scrapers/animes/scrapeFullAnimeInfo");
const animes_1 = require("../../../src/services/database/animes");
const getAnimeInfo = async (animeId) => {
    const animeInfo = await (0, animes_1.getAnimeBy)('animeId', animeId);
    if (animeInfo.data && animeInfo.data.length > 0) {
        return animeInfo.data[0];
    }
    const scrapedAnime = await (0, scrapeFullAnimeInfo_1.scrapeFullAnimeInfo)(animeId);
    if (scrapedAnime) {
        const animeToCreate = scrapedAnime;
        (0, animes_1.createAnime)(animeToCreate).then(response => {
            console.log(response);
        });
    }
    return scrapedAnime;
};
exports.getAnimeInfo = getAnimeInfo;
