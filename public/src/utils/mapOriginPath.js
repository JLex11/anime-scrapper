"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapOriginPath = void 0;
const mapOriginPath = (originPath, relativePath = '') => {
    try {
        return new URL(relativePath, originPath).toString();
    }
    catch (e) {
        console.error(e);
        return originPath;
    }
};
exports.mapOriginPath = mapOriginPath;
