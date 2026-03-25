-- Enable pg_trgm extension for fuzzy/similarity search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create GIN trigram index on the full_anime_search column for fast similarity lookups
CREATE INDEX IF NOT EXISTS idx_animes_trgm_search
ON public.animes
USING gin((full_anime_search::text) gin_trgm_ops);

-- Create hybrid search function: FTS (Spanish) + trigram similarity fallback
-- Returns results ranked by relevance, searching across title, description, genres, etc.
CREATE OR REPLACE FUNCTION public.search_animes(
    search_query TEXT,
    result_limit INT DEFAULT 10,
    result_offset INT DEFAULT 0
)
RETURNS TABLE (
    "animeId" VARCHAR,
    title VARCHAR,
    type VARCHAR,
    status VARCHAR,
    genres TEXT[],
    images JSONB,
    description TEXT,
    "otherTitles" TEXT[],
    rank REAL,
    relevance REAL
)
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
    fts_count INT;
BEGIN
    -- First try: Full-text search with Spanish config (exact/stemmed matches)
    RETURN QUERY
    SELECT
        a."animeId",
        a.title,
        a.type,
        a.status,
        a.genres,
        a.images,
        a.description,
        a."otherTitles",
        a.rank,
        ts_rank(
            to_tsvector('spanish', a.full_anime_search::text),
            websearch_to_tsquery('spanish', search_query)
        )::REAL AS relevance
    FROM public.animes a
    WHERE to_tsvector('spanish', a.full_anime_search::text) @@ websearch_to_tsquery('spanish', search_query)
    ORDER BY relevance DESC
    LIMIT result_limit
    OFFSET result_offset;

    -- Check how many FTS results we got
    GET DIAGNOSTICS fts_count = ROW_COUNT;

    -- If FTS returned enough results, we're done
    IF fts_count >= result_limit THEN
        RETURN;
    END IF;

    -- Second try: Trigram similarity search (fuzzy/partial matches)
    -- Only return results not already found by FTS
    RETURN QUERY
    SELECT
        a."animeId",
        a.title,
        a.type,
        a.status,
        a.genres,
        a.images,
        a.description,
        a."otherTitles",
        a.rank,
        similarity(a.full_anime_search::text, search_query)::REAL AS relevance
    FROM public.animes a
    WHERE
        similarity(a.full_anime_search::text, search_query) > 0.05
        AND NOT (
            to_tsvector('spanish', a.full_anime_search::text) @@ websearch_to_tsquery('spanish', search_query)
        )
    ORDER BY relevance DESC
    LIMIT (result_limit - fts_count)
    OFFSET GREATEST(0, result_offset - fts_count);

    RETURN;
END;
$$;
