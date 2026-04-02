-- =====================================================
-- COMMENT DISLIKES MIGRATION
-- =====================================================
-- Add dislike functionality to comments system

-- =====================================================
-- COMMENT DISLIKES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS comment_dislikes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  comment_id UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, comment_id)  -- One dislike per user per comment
);
-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================
-- Index for comment dislikes count aggregation
CREATE INDEX IF NOT EXISTS idx_comment_dislikes_comment_id ON comment_dislikes(comment_id);
-- Index for user's disliked comments
CREATE INDEX IF NOT EXISTS idx_comment_dislikes_user_id ON comment_dislikes(user_id);
-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================
ALTER TABLE comment_dislikes ENABLE ROW LEVEL SECURITY;
-- Comment Dislikes: Anyone can view
DROP POLICY IF EXISTS "Comment dislikes are viewable by everyone" ON comment_dislikes;
CREATE POLICY "Comment dislikes are viewable by everyone"
  ON comment_dislikes FOR SELECT
  USING (true);
-- Comment Dislikes: Authenticated users can create
DROP POLICY IF EXISTS "Authenticated users can dislike comments" ON comment_dislikes;
CREATE POLICY "Authenticated users can dislike comments"
  ON comment_dislikes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);
-- Comment Dislikes: Users can delete their own dislikes
DROP POLICY IF EXISTS "Users can remove dislikes" ON comment_dislikes;
CREATE POLICY "Users can remove dislikes"
  ON comment_dislikes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
