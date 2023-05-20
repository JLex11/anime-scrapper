"use strict";
/* import { animeFLVPages } from '../../enums' */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAnimeIdFromLink = exports.getAnimeRank = exports.getAnimeDescription = exports.getAnimeTitle = exports.getAnimeImgLink = exports.getAnimeType = exports.getAnimeStatus = exports.getAnimeOriginalLink = void 0;
const enums_1 = require("../../../api/enums");
const getAnimeOriginalLink = e => {
    return `${enums_1.animeFLVPages.BASE}${e.querySelector('a')?.href ?? ''}`;
};
exports.getAnimeOriginalLink = getAnimeOriginalLink;
const getAnimeStatus = (e, selector = '.AnmStts span') => {
    return e.querySelector(selector)?.textContent?.trim() ?? '';
};
exports.getAnimeStatus = getAnimeStatus;
const getAnimeType = (e, selector = '.Type') => {
    return e.querySelector(selector)?.textContent?.trim() ?? '';
};
exports.getAnimeType = getAnimeType;
const getAnimeImgLink = (e, selector = '.Image img') => {
    return `${enums_1.animeFLVPages.BASE}${e.querySelector(selector)?.getAttribute('src') ?? ''}`;
};
exports.getAnimeImgLink = getAnimeImgLink;
const getAnimeTitle = (e, selector = 'h1.Title') => {
    const titleElement = e.querySelector(selector) || e.querySelector('h3.Title');
    return titleElement?.textContent?.trim() ?? '';
};
exports.getAnimeTitle = getAnimeTitle;
const getAnimeDescription = (e, selector = '.Description p:last-of-type') => {
    return e.querySelector(selector)?.textContent?.trim() ?? '';
};
exports.getAnimeDescription = getAnimeDescription;
const getAnimeRank = (e, selector = '.Vts') => {
    return Number(e.querySelector(selector)?.textContent?.trim()) || 0;
};
exports.getAnimeRank = getAnimeRank;
const getAnimeIdFromLink = (link) => {
    return link.split('anime/').pop();
};
exports.getAnimeIdFromLink = getAnimeIdFromLink;
