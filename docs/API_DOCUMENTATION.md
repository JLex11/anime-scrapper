# Anime Scrapper API Documentation

## Introducción

Esta documentación describe los endpoints y la arquitectura del servicio `anime-scrapper`.
La API es un wrapper sobre scraping de animeflv.net + Supabase (Postgres) + Cloudflare R2 (imágenes).

Base URL (ejemplo):
- `http://localhost:3000/api`

---

## Arquitectura general

1. Express HTTP server (`api/index.ts`)
   - Middlewares:
     - `compression` para GZIP.
     - `cors` con configuración liberal.
     - `express.json` body parser.
     - `expressCacheMiddleware` (cache en memoria para GETs sin Authorization).
   - Rutas:
     - `/api/api-routes` (JSON y redirect a docs).
     - `/api/animes` (animes + alternativos).
     - `/api/episodes` (episodios y fuentes).
     - `/api/image` (servicio de imágenes optimizadas/Cloudflare R2).

2. Cache local (`src/services/cacheService.ts`)
   - `defaultCache`: 1 hora
   - `longTermCache`: 24 horas
   - `searchCache`: 30 minutos
   - + `expressCacheMiddleware` con `X-Cache` (HIT/MISS) y key = URL completa.

3. Persistencia y búsqueda (Supabase)
   - Tablas principales (ver `src/supabase.d.ts`):
     - `animes`: animeId, metadata, imágenes, `full_anime_search` (generated).
     - `related_animes`: relaciones many-to-many.
     - `episodes`: episodios y miniaturas.
   - RPC:
     - `search_animes` (full text + paging).
     - `update_anime_images_json`.

4. Scrapers (happy-dom + html parsing)
   - Enlaces base `https://www3.animeflv.net`.
   - Scrapes:
     - `scrapeAllAnimes` (browse?) with `page`.
     - `scrapeLastAnimes` (top `ul.ListAnimes`).
     - `scrapeEmisionAnimes` (section `.Emision .ListSdbr`).
     - `scrapeRatingAnimes` (browse/status={status}/order=rating).
     - `scrapeFullAnimeInfo` (detalle anime + llamadas a imagenes).
     - `scrapeAnimeEpisodes` (parse script `anime_info` y `episodes` en page anime).
     - `scrapeLastEpisodes` (home page `ul.ListEpisodios`).

5. Optimización y CDN de imágenes
   - `src/services/getOptimizeImage.ts`:
     - Busca en Cloudflare R2 Imagen ya optimizada con `s3HeadOperation`.
     - Si no existe: `fetch` original -> `sharp` (`optimizeImage`) -> `s3PutOperation`.
   - `src/services/cloudflareR2.ts`: operaciones S3 (head/get/put).
   - `src/services/getCarouselImages.ts`: usa Google Image API (`getGoogleImage`) + validación + optimización.

---

## Flujo de datos (ejemplo `/api/animes/{animeId}`)

1. Requiere `GET /api/animes/:animeId`.
2. `animesRouter` llama `getAnimeInfo(animeId)`.
3. `getAnimeInfo` consulta DB `getAnimeBy('animeId', animeId)`.
   - Si hay `images.carouselImages`, retorna mapeo con `mapAnimeImages`.
   - Sino, hace scraping completo `scrapeFullAnimeInfo`.
4. `scrapeFullAnimeInfo`:
   - fetch `https://www3.animeflv.net/anime/{animeId}` / cache 1h.
   - parsea con `animeGetter(...)` datos (title, genres, related, etc).
   - extrae imágenes `getOptimizedImage` y `getCarouselImages` si `extractImages`.
5. Upsert en DB (`UpsertAnimes`) y retorna el objeto mapeado.
6. Respuesta final se devuelve con JSON.

### ßcache y DB
- `getAnimeInfo` refresca DB si no hay data ó está incompleta.
- `searchAnimes` adicional usa `searchCache` local 5 minutos.

---

## Capa de caché y idempotencia

- `expressCacheMiddleware` captura respuestas exitosas (status 2xx) y se devuelve con X-Cache=HIT.
- Babel de request con `requestTextWithCache`/`requestJsonWithCache` usa `defaultCache`.
- `scrapeLastEpisodes` almacena respuesta final en un key `latestEpisodes:{limit}`.

---

## Conexión con Supabase

- `src/services/database/supabaseClient.ts` crea cliente mediante claves de env.
- `src/services/database/animes.ts` y `episodes.ts` encapsulan CRUD, búsqueda, upsert.
- Funciones importantes:
  - `getAnimesByQuery` con `rpc('search_animes')`.
  - `UpsertAnimes` (inserta + related trailing).
  - `getEpisodeBy`, `UpsertEpisodes`.

---

## Eventos de error / logging

- `logger` centralizado en `src/utils/logger.ts` (console + niveles).
- Catch blocks en controladores describen errores puntuales.
- Rutas 404 definidas para resultados vacíos.
- Catch global en `api/index.ts` devuelve 500 y mensaje en prod/dev.

---

## Endpoints (resumen)

### 1. GET `/api/animes`
- Descripción: Lista de animes paginada.
- Query params:
  - `page` (integer, opcional, default: 1)
- Respuestas:
  - `200`: array `Anime`
  - `404`: no se encontraron animes
  - `500`: error

### 2. GET `/api/animes/latest`
- Descripción: Últimos animes añadidos.
- Query params:
  - `limit` (integer, opcional)

### 3. GET `/api/animes/broadcast`
- Animes en emisión.

### 4. GET `/api/animes/latest/rating`
- Animes mejor valorados.

### 5. GET `/api/animes/search/{query}`
- Path: `query`.
- Query: `page`, `pageSize`.
- Retorna `Anime[]`.

### 6. GET `/api/animes/{animeId}`
- Detalle de anime.

### 7. GET `/api/animes/{animeId}/related`
- Animes relacionados.

### 8. GET `/api/animes/{animeId}/episodes`
- Path: `animeId`.
- Query: `offset`, `limit`.

### 9. GET `/api/episodes/latest`
- Últimos episodios.

### 10. GET `/api/episodes/{episodeId}`
- Episodio por ID.

### 11. GET `/api/episodes/sources/{id}`
- Fuentes de episodios.

### 12. GET `/api/image/{imgFilename}`
- Path: `imgFilename`.
- Query:
  - `width`, `height`, `format`, `quality`.
- Retorna imagen binaria.

---

## Esquemas de datos

### Anime
- `animeId`: string
- `title`: string
- `images`: { coverImage?, carouselImages? }
- `type`, `rank`, `genres`, `description`, `originalLink`, `status`, `otherTitles`, `relatedAnimes`, `created_at`, `updated_at`.

### RelatedAnime
- `animeId`, `title`, `relation`.

### Episode
- `episodeId`, `animeId`, `episode`, `title`, `originalLink`, `image`, `created_at`, `updated_at`.

### EpisodeSources
- `episode`, `videos` (puede ser object con `SUB`/`DUB` o array `EpisodeVideo[]`).

---

## Cómo correr localmente

1. Configurar variables de entorno (ver `src/config/env.ts` y `.env.local`)
2. `bun install` (o `npm install` si procede)
3. `bun run dev` o `bun run start`
4. Abrir `http://localhost:3000/api` -> será redirigido a `/api/api-docs` si se ha hecho build.

---

## Consejos de mantenimiento

- Agregar instrumentación para métricas y tiempos en endpoints críticos.
- Implementar límite de rate-limiting si se expone públicamente.
- Extraer `getAnimeInfo` a un servicio independiente de cache/DB para pruebas unitarias.
