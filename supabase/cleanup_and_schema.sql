-- CLEANUP: Run this FIRST to remove any existing objects
-- Go to Supabase SQL Editor: https://supabase.com/dashboard/project/oopsuwjjgnbwslsmbman/sql

-- Drop old tables if they exist
DROP TABLE IF EXISTS cards CASCADE;
DROP TABLE IF EXISTS decks CASCADE;
DROP TABLE IF EXISTS user_progress CASCADE;

-- Drop old functions and triggers if they exist
DROP FUNCTION IF EXISTS handle_new_user CASCADE;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE;
DROP FUNCTION IF EXISTS update_decks_timestamp CASCADE;
DROP FUNCTION IF EXISTS update_cards_timestamp CASCADE;
DROP FUNCTION IF EXISTS update_user_progress_timestamp CASCADE;
DROP FUNCTION IF EXISTS get_deck_with_cards CASCADE;

-- ============================================
-- NEW SCHEMA: Run this AFTER cleanup above
-- ============================================

-- ============================================
-- 1. Create TABLES
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
-- 2. Create INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_decks_user_id ON decks(user_id);
CREATE INDEX IF NOT EXISTS idx_cards_deck_id ON cards(deck_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);

-- ============================================
-- 3. ENABLE RLS
-- ============================================

ALTER TABLE decks ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 4. RLS POLICIES
-- ============================================

-- Decks policies
CREATE POLICY "Users can view their own decks" ON decks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own decks" ON decks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own decks" ON decks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own decks" ON decks FOR DELETE USING (auth.uid() = user_id);

-- Cards policies
CREATE POLICY "Users can view cards in their decks" ON cards FOR SELECT USING (
  deck_id IN (SELECT id FROM decks WHERE user_id = auth.uid())
);
CREATE POLICY "Users can insert cards to their decks" ON cards FOR INSERT WITH CHECK (
  deck_id IN (SELECT id FROM decks WHERE user_id = auth.uid())
);
CREATE POLICY "Users can update cards in their decks" ON cards FOR UPDATE USING (
  deck_id IN (SELECT id FROM decks WHERE user_id = auth.uid())
);
CREATE POLICY "Users can delete cards from their decks" ON cards FOR DELETE USING (
  deck_id IN (SELECT id FROM decks WHERE user_id = auth.uid())
);

-- User Progress policies
CREATE POLICY "Users can view their own progress" ON user_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own progress" ON user_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own progress" ON user_progress FOR UPDATE USING (auth.uid() = user_id);

-- ============================================
-- 5. TIMESTAMP TRIGGERS
-- ============================================

CREATE OR REPLACE FUNCTION update_decks_timestamp() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_decks_updated_at ON decks;
CREATE TRIGGER set_decks_updated_at BEFORE UPDATE ON decks FOR EACH ROW EXECUTE FUNCTION update_decks_timestamp();

CREATE OR REPLACE FUNCTION update_cards_timestamp() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_cards_updated_at ON cards;
CREATE TRIGGER set_cards_updated_at BEFORE UPDATE ON cards FOR EACH ROW EXECUTE FUNCTION update_cards_timestamp();

CREATE OR REPLACE FUNCTION update_user_progress_timestamp() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_user_progress_updated_at ON user_progress;
CREATE TRIGGER set_user_progress_updated_at BEFORE UPDATE ON user_progress FOR EACH ROW EXECUTE FUNCTION update_user_progress_timestamp();

