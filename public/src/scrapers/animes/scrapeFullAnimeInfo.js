"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scrapeFullAnimeInfo = void 0;
const jsdom_1 = require("jsdom");
/* import { animeFLVPages } from '../../enums' */
const getCarouselImages_1 = require("../../services/getCarouselImages");
const getOptimizeImage_1 = require("../../services/getOptimizeImage");
const requestWithCache_1 = require("../../services/requestWithCache");
/* import { Anime, AnimeImages } from '../../types.d' */
const enums_1 = require("../../../api/enums");
const animeGetters_1 = require("./animeGetters");
async function scrapeFullAnimeInfo(animeId) {
    const originalLink = `${enums_1.animeFLVPages.BASE}/anime/${animeId}`;
    const html = await (0, requestWithCache_1.requestTextWithCache)(originalLink, { ttl: 2592000 });
    const { document } = new jsdom_1.JSDOM(html).window;
    const type = (0, animeGetters_1.getAnimeType)(document);
    const imageLink = (0, animeGetters_1.getAnimeImgLink)(document);
    const title = (0, animeGetters_1.getAnimeTitle)(document);
    const status = (0, animeGetters_1.getAnimeStatus)(document);
    const otherTitles = [...document.querySelectorAll('.TxtAlt')].map(t => t.textContent?.trim()).filter(Boolean);
    const description = (0, animeGetters_1.getAnimeDescription)(document);
    const rank = (0, animeGetters_1.getAnimeRank)(document, '.vtprmd');
    const genres = [...document.querySelectorAll('.Nvgnrs a')].map(genre => genre.textContent?.trim()).filter(Boolean);
    const images = {
        coverImage: (await (0, getOptimizeImage_1.getOptimizeImage)(imageLink, animeId ?? 'unknow')) ?? '',
        carouselImages: await (0, getCarouselImages_1.getCarouselImages)(title),
    };
    return {
        animeId,
        title,
        type,
        rank,
        otherTitles,
        description,
        originalLink,
        status,
        genres,
        images,
    };
}
exports.scrapeFullAnimeInfo = scrapeFullAnimeInfo;
