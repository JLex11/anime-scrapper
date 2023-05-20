"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleApi = exports.endPoints = exports.animeFLVPages = exports.IMG_POSITIONS = exports.animeStatus = exports.ResponseType = void 0;
var ResponseType;
(function (ResponseType) {
    ResponseType["JSON"] = "json";
    ResponseType["TEXT"] = "text";
    ResponseType["BUFFER"] = "buffer";
})(ResponseType = exports.ResponseType || (exports.ResponseType = {}));
var animeStatus;
(function (animeStatus) {
    animeStatus["BROADCAST"] = "1";
    animeStatus["FINALIZED"] = "2";
    animeStatus["SOON"] = "3";
})(animeStatus = exports.animeStatus || (exports.animeStatus = {}));
var IMG_POSITIONS;
(function (IMG_POSITIONS) {
    IMG_POSITIONS["CENTER"] = "50% 50%";
    IMG_POSITIONS["TOP"] = "50% 20%";
})(IMG_POSITIONS = exports.IMG_POSITIONS || (exports.IMG_POSITIONS = {}));
var animeFLVPages;
(function (animeFLVPages) {
    animeFLVPages["BASE"] = "https://www3.animeflv.net";
})(animeFLVPages = exports.animeFLVPages || (exports.animeFLVPages = {}));
var endPoints;
(function (endPoints) {
    endPoints["LATEST_EPISODES"] = "/latest";
    endPoints["EPISODE_SOURCES"] = "/sources/:id";
    endPoints["ANIME_INFO"] = "/:animeId";
    endPoints["ANIME_EPISODES"] = "/:animeId/episodes";
    endPoints["LATEST_ANIMES"] = "/latest";
    endPoints["RATING_ANIMES"] = "/latest/rating";
    endPoints["BROADCAST_ANIMES"] = "/broadcast";
    endPoints["SEARCH_ANIMES"] = "/search/:query";
    endPoints["ANIME_DIRECTORY"] = "/directory";
})(endPoints = exports.endPoints || (exports.endPoints = {}));
var GoogleApi;
(function (GoogleApi) {
    GoogleApi["API_URL"] = "https://www.googleapis.com/customsearch/v1?";
    GoogleApi["SEARCH_ENGINE_ID"] = "d605fa7e0557f4774";
})(GoogleApi = exports.GoogleApi || (exports.GoogleApi = {}));
