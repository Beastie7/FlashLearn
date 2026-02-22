// Supabase Client Configuration
// Modern, clean Supabase client for FlashLearn app

import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from './info';

// Environment variables (for production)
// const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
// const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Fallback to hardcoded values from info.tsx
const supabaseUrl = `https://${projectId}.supabase.co`;
const supabaseAnonKey = publicAnonKey;

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ============================================
// TypeScript Type Definitions
// ============================================

export interface Deck {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  card_count: number;
  mastered_count: number;
  last_studied: string | null;
  created_at: string;
  updated_at: string;
}

export interface Card {
  id: string;
  deck_id: string;
  front: string;
  back: string;
  mastered: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserProgress {
  user_id: string;
  total_cards: number;
  mastered_cards: number;
  current_streak: number;
  longest_streak: number;
  last_study_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface DeckWithCards extends Deck {
  cards: Card[];
}

export interface DeckStats {
  id: string;
  title: string;
  description: string | null;
  cardCount: number;
  masteredCount: number;
  lastStudied: string | null;
}

// ============================================
// Export types for external use
// ============================================

export type { Deck, Card, UserProgress, DeckWithCards, DeckStats };

