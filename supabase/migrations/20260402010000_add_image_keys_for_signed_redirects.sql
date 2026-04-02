-- Image keys for signed redirects via /api/image/:token

ALTER TABLE public.animes
ADD COLUMN IF NOT EXISTS cover_image_key TEXT;

ALTER TABLE public.animes
ADD COLUMN IF NOT EXISTS carousel_image_keys JSONB NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE public.episodes
ADD COLUMN IF NOT EXISTS image_key TEXT;

CREATE INDEX IF NOT EXISTS idx_episodes_image_key
ON public.episodes (image_key);

-- Safe backfill from legacy local URLs:
-- /api/image/<object-key>?...

UPDATE public.animes
SET cover_image_key = NULLIF(split_part(split_part(images->>'coverImage', '/api/image/', 2), '?', 1), '')
WHERE cover_image_key IS NULL
  AND images ? 'coverImage'
  AND (images->>'coverImage') LIKE '%/api/image/%';

UPDATE public.animes
SET carousel_image_keys = COALESCE(
	(
		SELECT jsonb_agg(extracted_key)
		FROM (
			SELECT NULLIF(
				split_part(split_part(item->>'link', '/api/image/', 2), '?', 1),
				''
			) AS extracted_key
			FROM jsonb_array_elements(COALESCE(images->'carouselImages', '[]'::jsonb)) item
			WHERE item->>'link' LIKE '%/api/image/%'
		) extracted
		WHERE extracted.extracted_key IS NOT NULL
	),
	'[]'::jsonb
)
WHERE (carousel_image_keys IS NULL OR carousel_image_keys = '[]'::jsonb)
  AND images ? 'carouselImages';

UPDATE public.episodes
SET image_key = NULLIF(split_part(split_part(image, '/api/image/', 2), '?', 1), '')
WHERE image_key IS NULL
  AND image LIKE '%/api/image/%';

-- Additional fallback for relative persisted keys (image/<object-key>)
UPDATE public.episodes
SET image_key = NULLIF(split_part(split_part(image, 'image/', 2), '?', 1), '')
WHERE image_key IS NULL
  AND image LIKE 'image/%';
