"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const getAnimeInfo_1 = require("../controllers/animes/getAnimeInfo");
const searchAnimes_1 = require("../controllers/animes/searchAnimes");
/* import { scrapeAllAnimes } from '../scrapers/animes/scrapeAllAnimes'
import { scrapeAnimeEpisodes } from '../scrapers/animes/scrapeAnimeEpisodes'
import { scrapeEmisionAnimes } from '../scrapers/animes/scrapeEmisionAnimes'
import { scrapeLastAnimes } from '../scrapers/animes/scrapeLastAnimes'
import { scrapeRatingAnimes } from '../scrapers/animes/scrapeRatingAnimes' */
const scrapeAllAnimes_1 = require("../../src/scrapers/animes/scrapeAllAnimes");
const scrapeAnimeEpisodes_1 = require("../../src/scrapers/animes/scrapeAnimeEpisodes");
const scrapeEmisionAnimes_1 = require("../../src/scrapers/animes/scrapeEmisionAnimes");
const scrapeLastAnimes_1 = require("../../src/scrapers/animes/scrapeLastAnimes");
const scrapeRatingAnimes_1 = require("../../src/scrapers/animes/scrapeRatingAnimes");
const enums_1 = require("./../enums");
const router = (0, express_1.Router)();
router.get(enums_1.endPoints.LATEST_ANIMES, async (req, res) => {
    const { limit } = req.query;
    const latestAnimes = await (0, scrapeLastAnimes_1.scrapeLastAnimes)(Number(limit));
    return res.send(latestAnimes);
});
router.get(enums_1.endPoints.BROADCAST_ANIMES, async (req, res) => {
    const { limit } = req.query;
    const emisionAnimes = await (0, scrapeEmisionAnimes_1.scrapeEmisionAnimes)(Number(limit));
    return res.send(emisionAnimes);
});
router.get(enums_1.endPoints.RATING_ANIMES, async (req, res) => {
    const { limit } = req.query;
    const ratingAnimes = await (0, scrapeRatingAnimes_1.scrapeRatingAnimes)(enums_1.animeStatus.BROADCAST, Number(limit));
    return res.send(ratingAnimes);
});
router.get(enums_1.endPoints.SEARCH_ANIMES, async (req, res) => {
    const { query } = req.params;
    const { limit } = req.query;
    const foundAnimes = await (0, searchAnimes_1.searchAnimes)(query, Number(limit));
    return res.send(foundAnimes);
});
router.get(enums_1.endPoints.ANIME_DIRECTORY, async (req, res) => {
    const { page } = req.query;
    const foundAnimes = await (0, scrapeAllAnimes_1.scrapeAllAnimes)(Number(page) || 1);
    return res.send(foundAnimes);
});
router.get(enums_1.endPoints.ANIME_INFO, async (req, res) => {
    const { animeId } = req.params;
    const animeInfo = await (0, getAnimeInfo_1.getAnimeInfo)(animeId);
    return res.send(animeInfo);
});
router.get(enums_1.endPoints.ANIME_EPISODES, async (req, res) => {
    const { animeId } = req.params;
    const { offset, limit } = req.query;
    const animeEpisodes = await (0, scrapeAnimeEpisodes_1.scrapeAnimeEpisodes)(animeId, Number(offset), Number(limit));
    return res.send(animeEpisodes);
});
exports.default = router;
