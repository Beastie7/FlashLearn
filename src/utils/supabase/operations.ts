// Database Operations for FlashLearn App
// CRUD operations for decks, cards, and user progress

import { supabase, type Deck, type Card, type UserProgress, type DeckWithCards, type DeckStats } from './client';
import { projectId, publicAnonKey } from './info';

// ============================================
// Utility Functions
// ============================================

// Get current authenticated user ID from Supabase
async function getCurrentUserId(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id || null;
}

// Get current session
async function getCurrentSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

// ============================================
// DECK OPERATIONS
// ============================================

/**
 * Fetch all decks for the current user
 */
export async function getDecks(): Promise<DeckStats[]> {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('decks')
    .select(`
      id,
      title,
      description,
      card_count,
      mastered_count,
      last_studied,
      created_at,
      updated_at
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching decks:', error);
    throw new Error(error.message);
  }

  return data.map(deck => ({
    id: deck.id,
    title: deck.title,
    description: deck.description,
    cardCount: deck.card_count || 0,
    masteredCount: deck.mastered_count || 0,
    lastStudied: deck.last_studied
  }));
}

/**
 * Fetch a single deck by ID
 */
export async function getDeck(deckId: string): Promise<DeckWithCards | null> {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('Not authenticated');

  // Fetch deck
  const { data: deck, error: deckError } = await supabase
    .from('decks')
    .select('*')
    .eq('id', deckId)
    .eq('user_id', userId)
    .single();

  if (deckError) {
    console.error('Error fetching deck:', deckError);
    if (deckError.code === 'PGRST116') return null;
    throw new Error(deckError.message);
  }

  // Fetch cards for the deck
  const { data: cards, error: cardsError } = await supabase
    .from('cards')
    .select('*')
    .eq('deck_id', deckId)
    .order('created_at', { ascending: true });

  if (cardsError) {
    console.error('Error fetching cards:', cardsError);
    throw new Error(cardsError.message);
  }

  return {
    ...deck,
    cards: cards || []
  };
}

/**
 * Create a new deck with optional initial cards
 */
export async function createDeck(
  title: string,
  description?: string,
  cards?: { front: string; back: string }[]
): Promise<Deck> {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('Not authenticated');

  // Create the deck
  const { data: deck, error: deckError } = await supabase
    .from('decks')
    .insert({
      user_id: userId,
      title,
      description: description || null,
      card_count: cards?.length || 0,
      mastered_count: 0,
      last_studied: null
    })
    .select()
    .single();

  if (deckError) {
    console.error('Error creating deck:', deckError);
    throw new Error(deckError.message);
  }

  // If cards are provided, insert them
  if (cards && cards.length > 0) {
    const cardsData = cards.map(card => ({
      deck_id: deck.id,
      front: card.front,
      back: card.back,
      mastered: false
    }));

    const { error: cardsError } = await supabase
      .from('cards')
      .insert(cardsData);

    if (cardsError) {
      console.error('Error creating cards:', cardsError);
      // Deck was created, but cards failed - still return deck
      console.warn('Deck created but cards failed to save');
    }
  }

  return deck;
}

/**
 * Update an existing deck
 */
export async function updateDeck(
  deckId: string,
  updates: { title?: string; description?: string }
): Promise<Deck> {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('decks')
    .update({
      title: updates.title,
      description: updates.description
    })
    .eq('id', deckId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating deck:', error);
    throw new Error(error.message);
  }

  return data;
}

/**
 * Delete a deck and all its cards
 */
export async function deleteDeck(deckId: string): Promise<void> {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('Not authenticated');

  // Cards will be deleted automatically due to CASCADE
  const { error } = await supabase
    .from('decks')
    .delete()
    .eq('id', deckId)
    .eq('user_id', userId);

  if (error) {
    console.error('Error deleting deck:', error);
    throw new Error(error.message);
  }
}

/**
 * Update deck stats (card count, mastered count, last studied)
 */
export async function updateDeckStats(
  deckId: string,
  cardCount: number,
  masteredCount: number
): Promise<void> {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('decks')
    .update({
      card_count: cardCount,
      mastered_count: masteredCount,
      last_studied: new Date().toISOString()
    })
    .eq('id', deckId)
    .eq('user_id', userId);

  if (error) {
    console.error('Error updating deck stats:', error);
    throw new Error(error.message);
  }
}

// ============================================
// CARD OPERATIONS
// ============================================

/**
 * Add a card to a deck
 */
export async function addCard(
  deckId: string,
  front: string,
  back: string
): Promise<Card> {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('Not authenticated');

  // Verify user owns the deck
  const { data: deck } = await supabase
    .from('decks')
    .select('id')
    .eq('id', deckId)
    .eq('user_id', userId)
    .single();

  if (!deck) {
    throw new Error('Deck not found or access denied');
  }

  const { data, error } = await supabase
    .from('cards')
    .insert({
      deck_id: deckId,
      front,
      back,
      mastered: false
    })
    .select()
    .single();

  if (error) {
    console.error('Error adding card:', error);
    throw new Error(error.message);
  }

  return data;
}

/**
 * Update a card
 */
export async function updateCard(
  cardId: string,
  updates: { front?: string; back?: string; mastered?: boolean }
): Promise<Card> {
  const { data, error } = await supabase
    .from('cards')
    .update(updates)
    .eq('id', cardId)
    .select()
    .single();

  if (error) {
    console.error('Error updating card:', error);
    throw new Error(error.message);
  }

  return data;
}

/**
 * Delete a card
 */
export async function deleteCard(cardId: string): Promise<void> {
  const { error } = await supabase
    .from('cards')
    .delete()
    .eq('id', cardId);

  if (error) {
    console.error('Error deleting card:', error);
    throw new Error(error.message);
  }
}

/**
 * Get all cards in a deck
 */
export async function getCards(deckId: string): Promise<Card[]> {
  const { data, error } = await supabase
    .from('cards')
    .select('*')
    .eq('deck_id', deckId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching cards:', error);
    throw new Error(error.message);
  }

  return data || [];
}

/**
 * Mark multiple cards as mastered
 */
export async function markCardsMastered(
  cardIds: string[],
  mastered: boolean = true
): Promise<void> {
  const { error } = await supabase
    .from('cards')
    .update({ mastered })
    .in('id', cardIds);

  if (error) {
    console.error('Error marking cards:', error);
    throw new Error(error.message);
  }
}

// ============================================
// USER PROGRESS OPERATIONS
// ============================================

/**
 * Get user progress - creates record if it doesn't exist
 */
export async function getUserProgress(): Promise<UserProgress | null> {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('Not authenticated');

  // Try to fetch existing progress
  const { data, error } = await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (data) {
    return data;
  }

  // If no progress exists, create it
  if (error && error.code === 'PGRST116') {
    const { data: newProgress, error: insertError } = await supabase
      .from('user_progress')
      .insert({
        user_id: userId,
        total_cards: 0,
        mastered_cards: 0,
        current_streak: 0,
        longest_streak: 0
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating user progress:', insertError);
      throw new Error(insertError.message);
    }

    return newProgress;
  }

  if (error) {
    console.error('Error fetching progress:', error);
    throw new Error(error.message);
  }

  return null;
}

/**
 * Update user progress after a study session
 */
export async function updateStudyProgress(
  masteredCount: number
): Promise<UserProgress> {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('Not authenticated');

  const today = new Date().toISOString();

  // Get current progress
  const { data: currentProgress } = await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', userId)
    .single();

  let newStreak = 1;
  let longestStreak = currentProgress?.longest_streak || 0;

  if (currentProgress?.last_study_date) {
    const lastStudyDate = new Date(currentProgress.last_study_date).toDateString();
    const todayDate = new Date().toDateString();

    if (lastStudyDate === todayDate) {
      // Already studied today, keep streak
      newStreak = currentProgress.current_streak;
    } else if (
      new Date(currentProgress.last_study_date).toDateString() ===
      new Date(Date.now() - 86400000).toDateString()
    ) {
      // Studied yesterday, increment streak
      newStreak = (currentProgress.current_streak || 0) + 1;
      if (newStreak > longestStreak) {
        longestStreak = newStreak;
      }
    }
  }

  const { data, error } = await supabase
    .from('user_progress')
    .upsert({
      user_id: userId,
      mastered_cards: (currentProgress?.mastered_cards || 0) + masteredCount,
      current_streak: newStreak,
      longest_streak: longestStreak,
      last_study_date: today,
      updated_at: today
    })
    .select()
    .single();

  if (error) {
    console.error('Error updating progress:', error);
    throw new Error(error.message);
  }

  return data;
}

/**
 * Recalculate and sync all user progress from decks
 */
export async function syncUserProgress(): Promise<UserProgress> {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('Not authenticated');

  // Get all user's decks
  const { data: decks } = await supabase
    .from('decks')
    .select('id, card_count, mastered_count')
    .eq('user_id', userId);

  const totalCards = decks?.reduce((sum, d) => sum + (d.card_count || 0), 0) || 0;
  const masteredCards = decks?.reduce((sum, d) => sum + (d.mastered_count || 0), 0) || 0;

  const { data, error } = await supabase
    .from('user_progress')
    .upsert({
      user_id: userId,
      total_cards: totalCards,
      mastered_cards: masteredCards,
      updated_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) {
    console.error('Error syncing progress:', error);
    throw new Error(error.message);
  }

  return data;
}

// ============================================
// BULK OPERATIONS
// ============================================

/**
 * Create multiple cards at once
 */
export async function addCards(
  deckId: string,
  cards: { front: string; back: string }[]
): Promise<Card[]> {
  if (cards.length === 0) return [];

  const cardsData = cards.map(card => ({
    deck_id: deckId,
    front: card.front,
    back: card.back,
    mastered: false
  }));

  const { data, error } = await supabase
    .from('cards')
    .insert(cardsData)
    .select();

  if (error) {
    console.error('Error adding cards:', error);
    throw new Error(error.message);
  }

  return data;
}

/**
 * Replace all cards in a deck
 */
export async function replaceCards(
  deckId: string,
  cards: { front: string; back: string }[]
): Promise<Card[]> {
  // Delete existing cards
  await supabase.from('cards').delete().eq('deck_id', deckId);

  // Add new cards
  return addCards(deckId, cards);
}

// ============================================
// USER ACCOUNT OPERATIONS
// ============================================

/**
 * Delete user account and all associated data
 * This deletes: user_progress, decks (triggers CASCADE delete for cards)
 * Then calls server endpoint to delete auth user
 */
export async function deleteUserAccount(): Promise<void> {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('Not authenticated');

  const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-bc46df65`;

  // First, delete all user data from the database
  // Delete user_progress first (has FK to auth.users)
  const { error: progressError } = await supabase
    .from('user_progress')
    .delete()
    .eq('user_id', userId);

  if (progressError) {
    console.error('Error deleting user progress:', progressError);
    // Continue anyway - the user wants to delete their account
  }

  // Delete all user's decks (cards will be deleted via CASCADE)
  const { error: decksError } = await supabase
    .from('decks')
    .delete()
    .eq('user_id', userId);

  if (decksError) {
    console.error('Error deleting decks:', decksError);
    // Continue anyway - the user wants to delete their account
  }

  // Finally, delete the auth user via server endpoint
  const accessToken = (await getCurrentSession())?.access_token;
  if (!accessToken) {
    throw new Error('No access token available');
  }

  const response = await fetch(`${API_BASE}/auth/account`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    }
  });

  const data = await response.json();
  if (!response.ok) {
    console.error('Error deleting auth account:', data);
    throw new Error(data.error || 'Failed to delete account');
  }
}

