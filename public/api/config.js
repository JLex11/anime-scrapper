"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOriginPath = exports.setOriginPath = void 0;
let config = {
    originPath: ''
};
const setOriginPath = (url) => {
    config.originPath = url;
};
exports.setOriginPath = setOriginPath;
const getOriginPath = () => {
    return config.originPath;
};
exports.getOriginPath = getOriginPath;
