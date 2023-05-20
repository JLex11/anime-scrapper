"use strict";
/* import { getAnimesByQuery } from '../../services/database/animes' */
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchAnimes = void 0;
const animes_1 = require("../../../src/services/database/animes");
const searchAnimes = async (query, limit) => {
    const animesResponse = await (0, animes_1.getAnimesByQuery)(query, limit || 30);
    const animes = animesResponse.data;
    return animes;
};
exports.searchAnimes = searchAnimes;
