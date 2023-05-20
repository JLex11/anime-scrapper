"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCarouselImages = exports.buildImageObject = void 0;
/* import { IMG_POSITIONS } from '../enums'
import { GoogleImage } from '../googleTypes'
import { CarouselImage } from '../types.d' */
const enums_1 = require("../../api/enums");
const getGoogleImage_1 = require("./getGoogleImage");
const getOptimizeImage_1 = require("./getOptimizeImage");
function determinateImgPosition(image) {
    const aspectRatioThreshold = 1.5;
    return image?.width / image?.height >= aspectRatioThreshold ? enums_1.IMG_POSITIONS.CENTER : enums_1.IMG_POSITIONS.TOP;
}
function buildImageObject(link, image) {
    return {
        link,
        position: image ? determinateImgPosition(image) : enums_1.IMG_POSITIONS.CENTER,
        width: image?.width || 1080,
        height: image?.height || 1920,
    };
}
exports.buildImageObject = buildImageObject;
const dfKeywords = ['anime', 'wallpaper'];
const getCarouselImages = async (keywords) => {
    const keywordsArr = typeof keywords === 'string' ? [keywords] : keywords;
    const query = [...keywordsArr, ...dfKeywords].join(' ');
    const googleImageItems = await (0, getGoogleImage_1.getGoogleImage)(query);
    const carouselImages = googleImageItems
        .filter(Boolean)
        .map((item) => buildImageObject(item.link, item.image))
        .sort((a, b) => (b.position ?? 'b').localeCompare(a.position ?? 'a'));
    carouselImages.length = 2;
    return Promise.all(carouselImages.map(async (image, index) => {
        const imageName = `${keywordsArr.join('-')}-carouselImage-${index}`;
        const options = { width: image.width, height: image.height, effort: 3 };
        image.link = (await (0, getOptimizeImage_1.getOptimizeImage)(image.link, imageName, options)) ?? image.link;
        return image;
    }));
};
exports.getCarouselImages = getCarouselImages;
