"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const config_1 = require("../config");
/* import { mapOriginPath } from '../utils/mapOriginPath' */
const mapOriginPath_1 = require("../../src/utils/mapOriginPath");
const enums_1 = require("./../enums");
const router = (0, express_1.Router)();
const routesDocumentation = [
    {
        route: `/episodes${enums_1.endPoints.LATEST_EPISODES}`,
        description: 'The latesd episodes',
    },
    {
        route: `/episodes${enums_1.endPoints.EPISODE_SOURCES}`,
        description: 'Get episode videos/streamings, receives episodeId as param',
    },
    {
        route: `/animes${enums_1.endPoints.LATEST_ANIMES}`,
        description: 'The latesd animes',
    },
    {
        route: `/animes${enums_1.endPoints.BROADCAST_ANIMES}`,
        description: 'In broadcast animes',
    },
    {
        route: `/animes${enums_1.endPoints.RATING_ANIMES}`,
        description: 'The latesd rating animes',
    },
    {
        route: `/animes${enums_1.endPoints.SEARCH_ANIMES}`,
        description: 'Search animes, receives :query as param',
    },
    {
        route: `/animes${enums_1.endPoints.ANIME_DIRECTORY}`,
        description: 'Get all animes, can be paginated using :page query param',
    },
    {
        route: `/animes${enums_1.endPoints.ANIME_INFO}`,
        description: 'Full anime info, receives animeId as param',
    },
    {
        route: `/animes${enums_1.endPoints.ANIME_EPISODES}`,
        description: 'Episodes of an anime, can be paginated using offset and limit query params',
    },
];
router.get('/', async (_, res) => {
    const originPath = (0, config_1.getOriginPath)();
    return res.send(routesDocumentation.map(docRoute => ({
        ...docRoute,
        route: (0, mapOriginPath_1.mapOriginPath)(originPath, `api${docRoute.route}`)
    })));
});
exports.default = router;
