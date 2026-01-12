-- Fix 1: Add full_anime_search as a GENERATED column instead of just a function
-- This allows Supabase to automatically compute the search text from other columns

-- First, drop the old function if it exists to avoid naming conflicts
DROP FUNCTION IF EXISTS public.full_anime_search(public.animes);

-- Add the column if it doesn't exist
ALTER TABLE public.animes 
ADD COLUMN IF NOT EXISTS full_anime_search TEXT 
GENERATED ALWAYS AS (
    title || ' ' || 
    COALESCE(description, '') || ' ' || 
    COALESCE(type, '') || ' ' || 
    COALESCE(array_to_string(genres, ', '), '') || ' ' || 
    COALESCE(array_to_string("otherTitles", ', '), '')
) STORED;

-- Create a text search index for better performance
CREATE INDEX IF NOT EXISTS idx_animes_full_search 
ON public.animes 
USING gin(to_tsvector('spanish', full_anime_search::text));

-- Fix 2: Update RLS policies for related_animes table to allow authenticated and anon users

-- Allow authenticated and anon to insert
DROP POLICY IF EXISTS "Allow authenticated insert" ON public.related_animes;
CREATE POLICY "Allow authenticated insert" ON public.related_animes
    FOR INSERT 
    TO authenticated, anon
    WITH CHECK (true);

-- Allow authenticated and anon to update
DROP POLICY IF EXISTS "Allow authenticated update" ON public.related_animes;
CREATE POLICY "Allow authenticated update" ON public.related_animes
    FOR UPDATE 
    TO authenticated, anon
    USING (true) 
    WITH CHECK (true);

-- Allow authenticated and anon to delete
DROP POLICY IF EXISTS "Allow authenticated delete" ON public.related_animes;
CREATE POLICY "Allow authenticated delete" ON public.related_animes
    FOR DELETE 
    TO authenticated, anon
    USING (true);
