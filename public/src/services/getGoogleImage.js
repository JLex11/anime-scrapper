"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGoogleImage = void 0;
/* import { GoogleApi } from '../enums'
import { GoogleRequestConfig, GoogleSearchResponse } from './../googleTypes.d' */
const enums_1 = require("../../api/enums");
const requestWithCache_1 = require("./requestWithCache");
const getGoogleImage = async (query, config) => {
    if (!query)
        return [];
    const GOOGLE_API_KEY = 'AIzaSyDqy9qhMVsxLnEBlFYmBuOWsK8DAcAov-0'; //process.env.GOOGLE_API_KEY
    const DEFAULT_CONFIG = {
        imgOrientation: config?.imgOrientation ?? 'horizontal',
        searchType: config?.searchType ?? 'image',
        imgSize: config?.imgSize ?? 'huge',
        key: GOOGLE_API_KEY,
        cx: enums_1.GoogleApi.SEARCH_ENGINE_ID,
        num: config?.num ?? '5',
    };
    const fullConfig = {
        ...DEFAULT_CONFIG,
        q: query,
    };
    const parameters = new URLSearchParams(fullConfig);
    const searchResponse = (await (0, requestWithCache_1.requestJsonWithCache)(`${enums_1.GoogleApi.API_URL}${parameters.toString()}`));
    return searchResponse?.items ?? [];
};
exports.getGoogleImage = getGoogleImage;
