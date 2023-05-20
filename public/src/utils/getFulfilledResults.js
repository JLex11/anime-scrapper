"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFulfilledResults = void 0;
function isFulfilled(result) {
    return result.status === 'fulfilled';
}
function getFulfilledResults(results) {
    const successfulResults = results
        .filter(isFulfilled)
        .map(result => result.value);
    return successfulResults;
}
exports.getFulfilledResults = getFulfilledResults;
