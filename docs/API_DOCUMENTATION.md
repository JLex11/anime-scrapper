# Anime Scrapper API (Read-only)

## Introduccion

Esta API ahora es **solo lectura** sobre Supabase.
No ejecuta scraping ni optimizacion de imagenes durante una request publica.

Base URL (ejemplo local):
- `http://localhost:3000/api`

---

## Arquitectura actual

1. API HTTP (Express)
   - Expone rutas de lectura para animes, episodios y fuentes.
   - No hace fallback a scraping cuando faltan datos.
   - Si un recurso no existe en base de datos, responde `404`.

2. Supabase (fuente unica de verdad)
   - Tablas principales:
     - `animes`
     - `episodes`
     - `related_animes`
   - Tablas de feed precalculado:
     - `anime_feed_items`
     - `episode_feed_items`
   - Tabla de fuentes precalculadas:
     - `episode_sources`
   - Tabla de estado operativo del worker:
     - `sync_state`

3. Worker de scraping (separado)
   - Vive fuera de la API publica.
   - Escribe con `service_role`.
   - Alimenta feeds, detalles, episodios, fuentes e imagenes CDN.

---

## Contrato de imagenes

- La API devuelve URLs de proxy: `/api/image/{imageToken}`.
- Ese endpoint responde `302` con una URL firmada temporal hacia Cloudflare R2.
- No hay optimizacion de imagen on-demand en runtime.

---

## Endpoints

### Animes
- `GET /api/animes?page=1&pageSize=24`
- `GET /api/animes/latest?limit=15`
- `GET /api/animes/broadcast?limit=20`
- `GET /api/animes/latest/rating?limit=10`
- `GET /api/animes/search/{query}?page=1&pageSize=10`
- `GET /api/animes/{animeId}`
- `GET /api/animes/{animeId}/related`
- `GET /api/animes/{animeId}/episodes?offset=0&limit=10`

### Episodios
- `GET /api/episodes/latest?limit=30`
- `GET /api/episodes/{episodeId}`
- `GET /api/episodes/{episodeId}/sources` (ruta canonica)
- `GET /api/episodes/sources/{id}` (alias legado, deprecado)

### Imagenes
- `GET /api/image/{imageToken}` (redirect firmado a R2)

---

## Cambios de comportamiento clave

- Sin scraping on-demand:
  - antes: algunas rutas scrapeaban al vuelo y luego persistian.
  - ahora: solo se consulta Supabase.
- Sin refresco implicito:
  - la API no dispara recrawl ni jobs.
- Semantica de latencia:
  - el tiempo de respuesta depende de DB/cache HTTP, no de scraping remoto.

---

## Seguridad y permisos

- RLS orientado a consumo read-only para clientes publicos.
- Escrituras reservadas a `service_role` para el worker de ingesta.

---

## Desarrollo local

1. Configurar variables de entorno de Supabase.
2. Aplicar migraciones:
   - `supabase db push`
3. Iniciar API:
   - `bun run dev`
4. Abrir docs:
   - `http://localhost:3000/api/api-docs/`
