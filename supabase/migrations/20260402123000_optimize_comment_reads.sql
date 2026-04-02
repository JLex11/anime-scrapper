-- =====================================================
-- COMMENT READ OPTIMIZATIONS
-- =====================================================

-- Composite indexes for the main read paths
CREATE INDEX IF NOT EXISTS idx_comments_anime_episode_parent_created_at
ON comments(anime_id, episode_id, parent_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_thread_id_created_at_asc
ON comments(thread_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_comments_user_id_created_at_desc
ON comments(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comment_likes_comment_id
ON comment_likes(comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_likes_user_id
ON comment_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_comment_mentions_comment_id
ON comment_mentions(comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_mentions_mentioned_user_id
ON comment_mentions(mentioned_user_id);
CREATE INDEX IF NOT EXISTS idx_watch_progress_user_completed_last_watched
ON watch_progress(user_id, completed, last_watched DESC);
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_created_at
ON user_favorites(user_id, created_at DESC);
-- Aggregate likes/dislikes for a set of comments
CREATE OR REPLACE FUNCTION public.get_comment_likes_counts(comment_ids UUID[])
RETURNS TABLE (
	comment_id UUID,
	like_count BIGINT,
	dislike_count BIGINT
)
LANGUAGE sql
STABLE
AS $$
	WITH requested_comments AS (
		SELECT UNNEST(comment_ids) AS comment_id
	),
	like_counts AS (
		SELECT comment_likes.comment_id, COUNT(*)::BIGINT AS like_count
		FROM comment_likes
		WHERE comment_likes.comment_id = ANY(comment_ids)
		GROUP BY comment_likes.comment_id
	),
	dislike_counts AS (
		SELECT comment_dislikes.comment_id, COUNT(*)::BIGINT AS dislike_count
		FROM comment_dislikes
		WHERE comment_dislikes.comment_id = ANY(comment_ids)
		GROUP BY comment_dislikes.comment_id
	)
	SELECT
		requested_comments.comment_id,
		COALESCE(like_counts.like_count, 0) AS like_count,
		COALESCE(dislike_counts.dislike_count, 0) AS dislike_count
	FROM requested_comments
	LEFT JOIN like_counts USING (comment_id)
	LEFT JOIN dislike_counts USING (comment_id);
$$;
-- Count replies per thread without fetching every reply row
CREATE OR REPLACE FUNCTION public.get_thread_reply_counts(thread_ids UUID[])
RETURNS TABLE (
	thread_id UUID,
	reply_count BIGINT
)
LANGUAGE sql
STABLE
AS $$
	SELECT
		comments.thread_id,
		COUNT(*)::BIGINT AS reply_count
	FROM comments
	WHERE comments.thread_id = ANY(thread_ids)
		AND comments.parent_id IS NOT NULL
	GROUP BY comments.thread_id;
$$;
-- Return only the first N replies per thread, keeping total counts available separately
CREATE OR REPLACE FUNCTION public.get_thread_reply_previews(thread_ids UUID[], per_thread_limit INTEGER DEFAULT 3)
RETURNS TABLE (
	id UUID,
	user_id UUID,
	anime_id TEXT,
	episode_id TEXT,
	parent_id UUID,
	thread_id UUID,
	content TEXT,
	edited BOOLEAN,
	created_at TIMESTAMPTZ,
	updated_at TIMESTAMPTZ,
	username TEXT,
	avatar_url TEXT,
	thread_reply_count BIGINT
)
LANGUAGE sql
STABLE
AS $$
	WITH ranked_replies AS (
		SELECT
			comments.id,
			comments.user_id,
			comments.anime_id,
			comments.episode_id,
			comments.parent_id,
			comments.thread_id,
			comments.content,
			comments.edited,
			comments.created_at,
			comments.updated_at,
			user_profiles.username,
			user_profiles.avatar_url,
			COUNT(*) OVER (PARTITION BY comments.thread_id)::BIGINT AS thread_reply_count,
			ROW_NUMBER() OVER (PARTITION BY comments.thread_id ORDER BY comments.created_at ASC) AS row_number
		FROM comments
		LEFT JOIN user_profiles ON user_profiles.id = comments.user_id
		WHERE comments.thread_id = ANY(thread_ids)
			AND comments.parent_id IS NOT NULL
	)
	SELECT
		ranked_replies.id,
		ranked_replies.user_id,
		ranked_replies.anime_id,
		ranked_replies.episode_id,
		ranked_replies.parent_id,
		ranked_replies.thread_id,
		ranked_replies.content,
		ranked_replies.edited,
		ranked_replies.created_at,
		ranked_replies.updated_at,
		ranked_replies.username,
		ranked_replies.avatar_url,
		ranked_replies.thread_reply_count
	FROM ranked_replies
	WHERE ranked_replies.row_number <= GREATEST(per_thread_limit, 0)
	ORDER BY ranked_replies.thread_id, ranked_replies.created_at ASC;
$$;
-- Return paginated user comments with reaction counts already aggregated
CREATE OR REPLACE FUNCTION public.get_user_comments_enriched(
	target_user_id UUID,
	offset_count INTEGER DEFAULT 0,
	limit_count INTEGER DEFAULT 10
)
RETURNS TABLE (
	id UUID,
	user_id UUID,
	anime_id TEXT,
	episode_id TEXT,
	parent_id UUID,
	thread_id UUID,
	content TEXT,
	edited BOOLEAN,
	created_at TIMESTAMPTZ,
	updated_at TIMESTAMPTZ,
	like_count BIGINT,
	dislike_count BIGINT,
	total_count BIGINT
)
LANGUAGE sql
STABLE
AS $$
	WITH paged_comments AS (
		SELECT
			comments.*,
			COUNT(*) OVER ()::BIGINT AS total_count
		FROM comments
		WHERE comments.user_id = target_user_id
		ORDER BY comments.created_at DESC
		OFFSET GREATEST(offset_count, 0)
		LIMIT GREATEST(limit_count, 0)
	),
	like_counts AS (
		SELECT comment_likes.comment_id, COUNT(*)::BIGINT AS like_count
		FROM comment_likes
		INNER JOIN paged_comments ON paged_comments.id = comment_likes.comment_id
		GROUP BY comment_likes.comment_id
	),
	dislike_counts AS (
		SELECT comment_dislikes.comment_id, COUNT(*)::BIGINT AS dislike_count
		FROM comment_dislikes
		INNER JOIN paged_comments ON paged_comments.id = comment_dislikes.comment_id
		GROUP BY comment_dislikes.comment_id
	)
	SELECT
		paged_comments.id,
		paged_comments.user_id,
		paged_comments.anime_id,
		paged_comments.episode_id,
		paged_comments.parent_id,
		paged_comments.thread_id,
		paged_comments.content,
		paged_comments.edited,
		paged_comments.created_at,
		paged_comments.updated_at,
		COALESCE(like_counts.like_count, 0) AS like_count,
		COALESCE(dislike_counts.dislike_count, 0) AS dislike_count,
		paged_comments.total_count
	FROM paged_comments
	LEFT JOIN like_counts ON like_counts.comment_id = paged_comments.id
	LEFT JOIN dislike_counts ON dislike_counts.comment_id = paged_comments.id
	ORDER BY paged_comments.created_at DESC;
$$;
