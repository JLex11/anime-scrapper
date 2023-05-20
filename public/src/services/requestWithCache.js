"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestBufferWithCache = exports.requestTextWithCache = exports.requestJsonWithCache = void 0;
const node_cache_1 = __importDefault(require("node-cache"));
const enums_1 = require("../../api/enums");
/* import { ResponseType } from '../enums' */
const cacheDefaultConfig = { stdTTL: 10800, useClones: false };
const requestCache = new node_cache_1.default(cacheDefaultConfig);
const fetchAndCache = async (url, config, responseType) => {
    const cacheKey = JSON.stringify({ url, config });
    const cachePromise = new Promise(resolve => {
        const cacheResource = requestCache.get(cacheKey);
        if (cacheResource != null) {
            resolve({
                response: null,
                resource: cacheResource,
            });
        }
    });
    const responsePromise = fetch(url, config).then(async (response) => {
        const resource = responseType === enums_1.ResponseType.JSON
            ? await response.json()
            : responseType === enums_1.ResponseType.TEXT
                ? await response.text()
                : await response.arrayBuffer();
        requestCache.set(cacheKey, resource, config?.ttl ?? cacheDefaultConfig.stdTTL);
        return { response, resource };
    }).catch(error => {
        console.error(error);
        return { response: null, resource: null };
    });
    return await Promise.race([cachePromise, responsePromise]);
};
const requestJsonWithCache = async (url, config) => {
    const { resource } = await fetchAndCache(url, config, enums_1.ResponseType.JSON);
    return resource;
};
exports.requestJsonWithCache = requestJsonWithCache;
const requestTextWithCache = async (url, config) => {
    const { resource } = await fetchAndCache(url, config, enums_1.ResponseType.TEXT);
    return resource;
};
exports.requestTextWithCache = requestTextWithCache;
const requestBufferWithCache = async (url, config) => {
    const { resource } = await fetchAndCache(url, config, enums_1.ResponseType.BUFFER);
    return resource;
};
exports.requestBufferWithCache = requestBufferWithCache;
