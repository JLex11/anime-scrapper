"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
/* import { scrapeEpisodeSources } from '../scrapers/episodes/scrapeEpisodeSources'
import { scrapeLastEpisodes } from '../scrapers/episodes/scrapeLastEpisodes' */
const scrapeEpisodeSources_1 = require("../../src/scrapers/episodes/scrapeEpisodeSources");
const scrapeLastEpisodes_1 = require("../../src/scrapers/episodes/scrapeLastEpisodes");
const enums_1 = require("./../enums");
const router = (0, express_1.Router)();
router.get(enums_1.endPoints.LATEST_EPISODES, async (req, res) => {
    const latestEpisodes = await (0, scrapeLastEpisodes_1.scrapeLastEpisodes)();
    return res.send(latestEpisodes);
});
router.get(enums_1.endPoints.EPISODE_SOURCES, async (req, res) => {
    const { id } = req.params;
    const episodeSources = await (0, scrapeEpisodeSources_1.scrapeEpisodeSources)(id);
    return res.send(episodeSources);
});
exports.default = router;
