"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scrapeLastEpisodes = void 0;
const jsdom_1 = require("jsdom");
/* import { animeFLVPages } from '../../enums' */
const enums_1 = require("../../../api/enums");
const getOptimizeImage_1 = require("../../services/getOptimizeImage");
const requestWithCache_1 = require("../../services/requestWithCache");
/* import { LastEpisode } from '../../types.d' */
async function scrapeLastEpisodes() {
    const html = await (0, requestWithCache_1.requestTextWithCache)(enums_1.animeFLVPages.BASE);
    const { document } = new jsdom_1.JSDOM(html).window;
    const episodesList = [...document.querySelectorAll('ul.ListEpisodios li')];
    const mappedLastEpidodes = episodesList.map(async (episodeItem) => {
        const originalLink = `${enums_1.animeFLVPages.BASE}${episodeItem.querySelector('a')?.href ?? ''}`;
        const imageLink = `${enums_1.animeFLVPages.BASE}${episodeItem.querySelector('.Image img')?.getAttribute('src') ?? ''}`;
        const episode = Number(episodeItem.querySelector('.Capi')?.textContent?.replace(/[^0-9]/g, '') ?? 0);
        const title = episodeItem.querySelector('.Title')?.textContent?.trim();
        const episodeId = originalLink.split('ver/').pop();
        const animeId = title
            ?.replace(/[^a-zA-Z0-9 ]/g, '')
            .replace(/ /g, '-')
            .toLowerCase();
        const imageName = episodeId ?? animeId ?? 'unknown';
        const imageOptions = { width: 350, height: 250, effort: 4 };
        const image = await (0, getOptimizeImage_1.getOptimizeImage)(imageLink, imageName, imageOptions);
        return {
            originalLink,
            image,
            episode,
            title,
            episodeId,
            animeId,
        };
    });
    const results = await Promise.all(mappedLastEpidodes);
    //const successfulResults = getFulfilledResults(results)
    return results; /* await Promise.all(successfulResults) */
}
exports.scrapeLastEpisodes = scrapeLastEpisodes;
