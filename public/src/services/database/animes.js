"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAnime = exports.updateAnime = exports.createAnime = exports.getAnimesByQuery = exports.getAnimeBy = exports.getAnimes = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
/* import { Database } from '../../supabase'
import { AnimeColumns, ColumnType } from '../../types.d' */
const supabase = (0, supabase_js_1.createClient)('https://qyuxymbzzxwnrgqxjloe.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF5dXh5bWJ6enh3bnJncXhqbG9lIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NzkzMjUwNTMsImV4cCI6MTk5NDkwMTA1M30.-CWwL2b6hVFoD9g5JgFJVYUMGds9ucc28pUaxABHIRA');
/* Get Animes */
const getAnimes = async () => {
    const animesResponse = await supabase.from('animes').select();
    return animesResponse;
};
exports.getAnimes = getAnimes;
/* Get Anime */
const getAnimeBy = async (column, value) => {
    const anime = await supabase.from('animes').select().eq(column, value);
    return anime;
};
exports.getAnimeBy = getAnimeBy;
/* Get Animes by matches */
const getAnimesByQuery = async (query, limit) => {
    const columnsToSearch = ['title', 'description', /* 'genres', 'otherTitles', */ 'type'];
    const orQuery = columnsToSearch.map(column => `${column}.ilike.%${query}%`).join(',');
    const animes = await supabase.from('animes').select().or(orQuery).limit(limit || 30);
    return animes;
};
exports.getAnimesByQuery = getAnimesByQuery;
const createAnime = async (anime) => {
    const newAnime = await supabase.from('animes').insert(anime);
    return newAnime;
};
exports.createAnime = createAnime;
const updateAnime = async (animeId, anime) => {
    const updatedAnime = await supabase.from('animes').update(anime).eq('animeId', animeId);
    return updatedAnime;
};
exports.updateAnime = updateAnime;
/* Delete Anime */
const deleteAnime = async (animeId) => {
    const deletedAnime = await supabase.from('animes').delete().eq('animeId', animeId);
    return deletedAnime;
};
exports.deleteAnime = deleteAnime;
