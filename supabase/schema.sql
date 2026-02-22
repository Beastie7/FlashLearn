-- Database Schema for FlashLearn App
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/oopsuwjjgnbwslsmbman/sql

-- ============================================
-- 1. Create ENUMS (if needed)
-- ============================================

-- ============================================
-- 2. Create TABLES
-- ============================================

-- Decks table
CREATE TABLE IF NOT EXISTS decks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  card_count INTEGER DEFAULT 0,
  mastered_count INTEGER DEFAULT 0,
  last_studied TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cards table
CREATE TABLE IF NOT EXISTS cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deck_id UUID NOT NULL REFERENCES decks(id) ON DELETE CASCADE,
  front TEXT NOT NULL,
  back TEXT NOT NULL,
  mastered BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User progress table
CREATE TABLE IF NOT EXISTS user_progress (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  total_cards INTEGER DEFAULT 0,
  mastered_cards INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_study_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 3. Create INDEXES (for performance)
-- ============================================

-- Index for fetching decks by user
CREATE INDEX IF NOT EXISTS idx_decks_user_id ON decks(user_id);

-- Index for fetching cards by deck
CREATE INDEX IF NOT EXISTS idx_cards_deck_id ON cards(deck_id);

-- Index for user progress lookup
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);

-- ============================================
-- 4. ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE decks ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 5. CREATE RLS POLICIES
-- ============================================

-- Decks: Users can only see their own decks
CREATE POLICY "Users can view their own decks"
  ON decks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own decks"
  ON decks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own decks"
  ON decks FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own decks"
  ON decks FOR DELETE
  USING (auth.uid() = user_id);

-- Cards: Users can only see cards in their decks
CREATE POLICY "Users can view cards in their decks"
  ON cards FOR SELECT
  USING (
    deck_id IN (SELECT id FROM decks WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can insert cards to their decks"
  ON cards FOR INSERT
  WITH CHECK (
    deck_id IN (SELECT id FROM decks WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can update cards in their decks"
  ON cards FOR UPDATE
  USING (
    deck_id IN (SELECT id FROM decks WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can delete cards from their decks"
  ON cards FOR DELETE
  USING (
    deck_id IN (SELECT id FROM decks WHERE user_id = auth.uid())
  );

-- User Progress: Users can only see and update their own progress
CREATE POLICY "Users can view their own progress"
  ON user_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress"
  ON user_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress"
  ON user_progress FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================
-- 6. CREATE TRIGGERS (for updated_at)
-- ============================================

-- Trigger to update updated_at on decks
CREATE OR REPLACE FUNCTION update_decks_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_decks_updated_at ON decks;
CREATE TRIGGER set_decks_updated_at
  BEFORE UPDATE ON decks
  FOR EACH ROW
  EXECUTE FUNCTION update_decks_timestamp();

-- Trigger to update updated_at on cards
CREATE OR REPLACE FUNCTION update_cards_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_cards_updated_at ON cards;
CREATE TRIGGER set_cards_updated_at
  BEFORE UPDATE ON cards
  FOR EACH ROW
  EXECUTE FUNCTION update_cards_timestamp();

-- Trigger to update updated_at on user_progress
CREATE OR REPLACE FUNCTION update_user_progress_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_user_progress_updated_at ON user_progress;
CREATE TRIGGER set_user_progress_updated_at
  BEFORE UPDATE ON user_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_user_progress_timestamp();

-- ============================================
-- 7. CREATE FUNCTIONS (helper functions)
-- ============================================

-- Function to get a deck with all its cards
CREATE OR REPLACE FUNCTION get_deck_with_cards(deck_id UUID)
RETURNS TABLE (
  deck_data JSONB,
  cards_data JSONB[]
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    json_build_object(
      'id', d.id,
      'user_id', d.user_id,
      'title', d.title,
      'description', d.description,
      'card_count', d.card_count,
      'mastered_count', d.mastered_count,
      'last_studied', d.last_studied,
      'created_at', d.created_at,
      'updated_at', d.updated_at
    )::JSONB as deck_data,
    ARRAY(
      SELECT json_build_object(
        'id', c.id,
        'deck_id', c.deck_id,
        'front', c.front,
        'back', c.back,
        'mastered', c.mastered,
        'created_at', c.created_at,
        'updated_at', c.updated_at
      )::JSONB
      FROM cards c
      WHERE c.deck_id = deck_id
      ORDER BY c.created_at
    ) as cards_data;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 8. REMOVED: Auto-create user progress trigger
-- (User progress is now created on-demand in the app)
-- ============================================

-- NOTE: The old trigger has been removed because triggers on auth.users
-- can cause issues during signup. User progress is now created
-- automatically when the user first accesses it via the app.

-- ============================================
-- 9. SEED DATA (optional - for testing)
-- ============================================

-- Note: RLS prevents bulk inserts without proper auth
-- Only insert test data after disabling RLS or as authenticated user

-- ============================================
-- 10. VERIFICATION QUERIES
-- ============================================

-- Check if tables exist
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- Check if RLS is enabled
-- SELECT tablename, rowlevelsecurity FROM pg_tables WHERE schemaname = 'public';

-- Check RLS policies
-- SELECT policyname, tablename, cmd FROM pg_policies WHERE schemaname = 'public';

