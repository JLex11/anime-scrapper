"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOptimizeImage = void 0;
const node_cache_1 = __importDefault(require("node-cache"));
const sharp_1 = __importDefault(require("sharp"));
const awsS3Service_1 = require("./awsS3Service");
const requestWithCache_1 = require("./requestWithCache");
const cacheDefaultConfig = { stdTTL: 604800, useClones: false };
const requestCache = new node_cache_1.default(cacheDefaultConfig);
const dfOptions = {
    width: 350,
    height: 500,
    effort: 4,
};
const getOptimizeImage = async (link, name, options = dfOptions) => {
    const imageArrayBuffer = await (0, requestWithCache_1.requestBufferWithCache)(link, { ttl: 86400 });
    if (!imageArrayBuffer)
        return link;
    const cacheKey = link;
    const cacheResource = requestCache.get(cacheKey);
    if (cacheResource)
        return cacheResource;
    const imageName = `${name}.webp`;
    const s3ImageUrl = await (0, awsS3Service_1.s3Request)({ operation: 'getObject', fileName: imageName });
    if (s3ImageUrl) {
        requestCache.set(cacheKey, s3ImageUrl, cacheDefaultConfig.stdTTL);
        return s3ImageUrl;
    }
    const outputImageBuffer = await getOptimizedImageBuffer(imageArrayBuffer, options);
    if (!outputImageBuffer)
        return ''; //link
    const uploadedUrl = await (0, awsS3Service_1.s3Request)({
        operation: 'putObject',
        fileName: imageName,
        fileBuffer: outputImageBuffer,
    });
    requestCache.set(cacheKey, uploadedUrl, cacheDefaultConfig.stdTTL);
    return uploadedUrl;
};
exports.getOptimizeImage = getOptimizeImage;
async function getOptimizedImageBuffer(imageArrayBuffer, options) {
    const { width, height, effort } = options;
    return (0, sharp_1.default)(Buffer.from(imageArrayBuffer))
        .resize(width, height)
        .webp({ effort })
        .toBuffer()
        .catch(error => {
        console.error(error);
        return null;
    });
}
