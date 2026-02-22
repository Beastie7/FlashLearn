import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "jsr:@supabase/supabase-js@2";
import * as kv from './kv_store.tsx';

const app = new Hono();

// Middleware
app.use('*', cors({
  origin: '*',
  allowHeaders: ['*'],
  allowMethods: ['*'],
}));
app.use('*', logger(console.log));

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

// Types
interface Flashcard {
  id: string;
  front: string;
  back: string;
  mastered: boolean;
  deck_id: string;
  created_at?: string;
}

interface Deck {
  id: string;
  title: string;
  description: string;
  user_id: string;
  created_at?: string;
  updated_at?: string;
}

interface UserProgress {
  user_id: string;
  total_cards: number;
  mastered_cards: number;
  current_streak: number;
  longest_streak: number;
  last_study_date?: string;
}

// Auth middleware
const requireAuth = async (c: any, next: any) => {
  const accessToken = c.req.header('Authorization')?.split(' ')[1];
  if (!accessToken) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const { data: { user }, error } = await supabase.auth.getUser(accessToken);
  if (error || !user?.id) {
    console.log('Authorization error:', error);
    return c.json({ error: 'Unauthorized' }, 401);
  }

  c.set('userId', user.id);
  await next();
};

// Auth Routes
// Auth Routes
app.delete('/make-server-bc46df65/auth/account', requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    
    // Use admin API to delete the user
    const { error } = await supabase.auth.admin.deleteUser(userId);
    
    if (error) {
      console.log('Delete user error:', error);
      return c.json({ error: error.message }, 400);
    }

    return c.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.log('Delete account error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

app.post('/make-server-bc46df65/auth/signup', async (c) => {
  try {
    const { email, password, name } = await c.req.json();
    
    if (!email || !password) {
      return c.json({ error: 'Email and password required' }, 400);
    }

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name: name || '' },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });

    if (error) {
      console.log('Signup error:', error);
      return c.json({ error: error.message }, 400);
    }

    // Initialize user progress
    await kv.set(`user_progress:${data.user.id}`, {
      user_id: data.user.id,
      total_cards: 0,
      mastered_cards: 0,
      current_streak: 0,
      longest_streak: 0,
      last_study_date: null
    });

    return c.json({ user: data.user });
  } catch (error) {
    console.log('Signup error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Deck Routes
app.get('/make-server-bc46df65/decks', requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const decks = await kv.getByPrefix(`deck:${userId}:`);
    
    // Get cards for each deck to calculate stats
    const decksWithStats = await Promise.all(decks.map(async (deck: Deck) => {
      const cards = await kv.getByPrefix(`card:${deck.id}:`);
      const masteredCount = cards.filter((card: Flashcard) => card.mastered).length;
      
      return {
        ...deck,
        cardCount: cards.length,
        masteredCount,
        lastStudied: deck.updated_at || 'Never'
      };
    }));

    return c.json({ decks: decksWithStats });
  } catch (error) {
    console.log('Get decks error:', error);
    return c.json({ error: 'Failed to fetch decks' }, 500);
  }
});

app.post('/make-server-bc46df65/decks', requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const { title, description, cards } = await c.req.json();
    
    if (!title) {
      return c.json({ error: 'Title is required' }, 400);
    }

    const deckId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const deck: Deck = {
      id: deckId,
      title,
      description: description || '',
      user_id: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    await kv.set(`deck:${userId}:${deckId}`, deck);

    // Add cards if provided
    if (cards && Array.isArray(cards)) {
      for (let i = 0; i < cards.length; i++) {
        const cardId = `${deckId}_${i}_${Date.now()}`;
        const card: Flashcard = {
          id: cardId,
          front: cards[i].front,
          back: cards[i].back,
          mastered: false,
          deck_id: deckId,
          created_at: new Date().toISOString()
        };
        await kv.set(`card:${deckId}:${cardId}`, card);
      }
    }

    return c.json({ deck: { ...deck, cardCount: cards?.length || 0, masteredCount: 0 } });
  } catch (error) {
    console.log('Create deck error:', error);
    return c.json({ error: 'Failed to create deck' }, 500);
  }
});

app.get('/make-server-bc46df65/decks/:deckId', requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const deckId = c.req.param('deckId');
    
    const deck = await kv.get(`deck:${userId}:${deckId}`);
    if (!deck) {
      return c.json({ error: 'Deck not found' }, 404);
    }

    const cards = await kv.getByPrefix(`card:${deckId}:`);
    
    return c.json({ 
      deck: {
        ...deck,
        cards: cards.sort((a: Flashcard, b: Flashcard) => 
          (a.created_at || '').localeCompare(b.created_at || '')
        )
      }
    });
  } catch (error) {
    console.log('Get deck error:', error);
    return c.json({ error: 'Failed to fetch deck' }, 500);
  }
});

app.put('/make-server-bc46df65/decks/:deckId', requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const deckId = c.req.param('deckId');
    const { title, description, cards } = await c.req.json();
    
    const existingDeck = await kv.get(`deck:${userId}:${deckId}`);
    if (!existingDeck) {
      return c.json({ error: 'Deck not found' }, 404);
    }

    const updatedDeck: Deck = {
      ...existingDeck,
      title: title || existingDeck.title,
      description: description !== undefined ? description : existingDeck.description,
      updated_at: new Date().toISOString()
    };

    await kv.set(`deck:${userId}:${deckId}`, updatedDeck);

    // Update cards if provided
    if (cards && Array.isArray(cards)) {
      // Remove existing cards
      const existingCards = await kv.getByPrefix(`card:${deckId}:`);
      for (const card of existingCards) {
        await kv.del(`card:${deckId}:${card.id}`);
      }

      // Add new cards
      for (const card of cards) {
        await kv.set(`card:${deckId}:${card.id}`, {
          ...card,
          deck_id: deckId,
          created_at: card.created_at || new Date().toISOString()
        });
      }
    }

    return c.json({ deck: updatedDeck });
  } catch (error) {
    console.log('Update deck error:', error);
    return c.json({ error: 'Failed to update deck' }, 500);
  }
});

app.delete('/make-server-bc46df65/decks/:deckId', requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const deckId = c.req.param('deckId');
    
    const deck = await kv.get(`deck:${userId}:${deckId}`);
    if (!deck) {
      return c.json({ error: 'Deck not found' }, 404);
    }

    // Delete all cards in the deck
    const cards = await kv.getByPrefix(`card:${deckId}:`);
    for (const card of cards) {
      await kv.del(`card:${deckId}:${card.id}`);
    }

    // Delete the deck
    await kv.del(`deck:${userId}:${deckId}`);

    return c.json({ message: 'Deck deleted successfully' });
  } catch (error) {
    console.log('Delete deck error:', error);
    return c.json({ error: 'Failed to delete deck' }, 500);
  }
});

// Progress Routes
app.get('/make-server-bc46df65/progress', requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    
    // Get user progress
    let progress = await kv.get(`user_progress:${userId}`);
    if (!progress) {
      progress = {
        user_id: userId,
        total_cards: 0,
        mastered_cards: 0,
        current_streak: 0,
        longest_streak: 0,
        last_study_date: null
      };
      await kv.set(`user_progress:${userId}`, progress);
    }

    // Calculate current stats from decks
    const decks = await kv.getByPrefix(`deck:${userId}:`);
    let totalCards = 0;
    let masteredCards = 0;

    for (const deck of decks) {
      const cards = await kv.getByPrefix(`card:${deck.id}:`);
      totalCards += cards.length;
      masteredCards += cards.filter((card: Flashcard) => card.mastered).length;
    }

    // Update progress with current stats
    const updatedProgress = {
      ...progress,
      total_cards: totalCards,
      mastered_cards: masteredCards
    };
    await kv.set(`user_progress:${userId}`, updatedProgress);

    return c.json({ progress: updatedProgress });
  } catch (error) {
    console.log('Get progress error:', error);
    return c.json({ error: 'Failed to fetch progress' }, 500);
  }
});

app.post('/make-server-bc46df65/progress/study-session', requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const { deckId, masteredCards } = await c.req.json();
    
    // Update user progress
    let progress = await kv.get(`user_progress:${userId}`) || {
      user_id: userId,
      total_cards: 0,
      mastered_cards: 0,
      current_streak: 0,
      longest_streak: 0,
      last_study_date: null
    };

    const today = new Date().toDateString();
    const lastStudyDate = progress.last_study_date ? new Date(progress.last_study_date).toDateString() : null;
    
    // Update streak
    if (lastStudyDate === today) {
      // Already studied today, no streak change
    } else if (lastStudyDate === new Date(Date.now() - 86400000).toDateString()) {
      // Studied yesterday, continue streak
      progress.current_streak += 1;
    } else {
      // New streak starts
      progress.current_streak = 1;
    }

    // Update longest streak
    if (progress.current_streak > progress.longest_streak) {
      progress.longest_streak = progress.current_streak;
    }

    progress.last_study_date = new Date().toISOString();
    await kv.set(`user_progress:${userId}`, progress);

    return c.json({ progress });
  } catch (error) {
    console.log('Update study session error:', error);
    return c.json({ error: 'Failed to update study session' }, 500);
  }
});

// AI Generation Route
app.post('/make-server-bc46df65/ai/generate-flashcards', async (c) => {
  try {
    const { topic, count = 10, difficulty = 'medium', language = 'english' } = await c.req.json();
    
    if (!topic || !topic.trim()) {
      return c.json({ error: 'Topic is required' }, 400);
    }

    const openrouterKey = Deno.env.get('OPENROUTER_API_KEY');
    if (!openrouterKey) {
      console.log('OpenRouter API key not configured');
      return c.json({ error: 'AI service not configured. Please add OPENROUTER_API_KEY.' }, 500);
    }
    
    // Log masked API key for debugging
    console.log('OpenRouter API Key present:', openrouterKey ? `${openrouterKey.substring(0, 7)}...${openrouterKey.substring(openrouterKey.length - 4)}` : 'NOT SET');
    console.log('API Key length:', openrouterKey?.length);

    // Call OpenRouter API to generate flashcards
    const prompt = `Generate ${count} educational flashcards about "${topic}".
    
Difficulty level: ${difficulty}
Language: ${language}

Requirements:
- Each flashcard should have a clear, concise question on the front
- Each answer on the back should be informative but not too long (2-3 sentences max)
- Cover different aspects of the topic
- Make questions progressively challenging
- Ensure questions test understanding, not just memorization

Return ONLY a valid JSON array with this exact format:
[
  {
    "front": "Question here?",
    "back": "Answer here."
  }
]

Do not include any markdown, explanations, or additional text. Just the JSON array.`;
 
    console.log('Calling OpenRouter API for topic:', topic);
    
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openrouterKey}`,
        'HTTP-Referer': 'https://flashlearn.app',
        'X-Title': 'FlashLearn AI Generator'
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert educational content creator specializing in creating effective flashcards for learning. Always respond with valid JSON only.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.8,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.log('OpenRouter API HTTP Status:', response.status);
      console.log('OpenRouter API Error Response:', errorData);
      
      // Try to parse error details
      let errorMessage = `AI generation failed (${response.status})`;
      try {
        const errorJson = JSON.parse(errorData);
        errorMessage = errorJson.error?.message || errorMessage;
        console.log('Parsed error:', errorJson);
      } catch (e) {
        console.log('Could not parse error response as JSON');
      }
      
      return c.json({ 
        error: errorMessage
      }, response.status);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      console.log('No content in OpenRouter response:', data);
      return c.json({ error: 'AI service returned no content' }, 500);
    }

    // Parse the JSON response
    let flashcards;
    try {
      // Remove markdown code blocks if present
      const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      flashcards = JSON.parse(cleanContent);
      
      if (!Array.isArray(flashcards)) {
        throw new Error('Response is not an array');
      }
      
      // Validate flashcard format
      flashcards = flashcards
        .filter(card => card.front && card.back)
        .map(card => ({
          front: String(card.front).trim(),
          back: String(card.back).trim()
        }))
        .slice(0, count); // Ensure we don't exceed requested count
      
      if (flashcards.length === 0) {
        throw new Error('No valid flashcards generated');
      }
      
    } catch (parseError) {
      console.log('Failed to parse AI response:', content, parseError);
      return c.json({ 
        error: 'Failed to parse AI-generated flashcards. Please try again.' 
      }, 500);
    }

    console.log(`Successfully generated ${flashcards.length} flashcards for topic: ${topic}`);
    
    return c.json({ 
      flashcards,
      metadata: {
        topic,
        count: flashcards.length,
        difficulty,
        generatedAt: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.log('AI generation error:', error);
    return c.json({ 
      error: `Failed to generate flashcards: ${error.message}` 
    }, 500);
  }
});

// PDF Flashcard Generation Route
app.post('/make-server-bc46df65/ai/generate-flashcards-from-pdf', async (c) => {
  try {
    const { file, fileName, count = 10, difficulty = 'medium', language = 'english' } = await c.req.json();
    
    if (!file || !fileName) {
      return c.json({ error: 'PDF file is required' }, 400);
    }

    const openrouterKey = Deno.env.get('OPENROUTER_API_KEY');
    if (!openrouterKey) {
      console.log('OpenRouter API key not configured');
      return c.json({ error: 'AI service not configured. Please add OPENROUTER_API_KEY.' }, 500);
    }
    
    console.log('Processing PDF file:', fileName);
    console.log('Generating', count, 'flashcards from PDF');

    // Use AI to extract content and generate flashcards directly from the base64 PDF
    // The AI will "read" the PDF content through its vision/multimodal capabilities
    const prompt = `Extract the educational content from this PDF document and generate ${count} flashcards.

File name: ${fileName}
Difficulty level: ${difficulty}
Language: ${language}

Instructions:
1. Analyze the PDF content thoroughly
2. Generate ${count} educational flashcards based on the material
3. Each flashcard should have a clear question on the front
4. Answers should be informative but concise (2-3 sentences max)
5. Cover the main topics and concepts in the document
6. Progress from basic to more advanced concepts

Return ONLY a valid JSON array with this exact format:
[
  {
    "front": "Question here?",
    "back": "Answer here."
  }
]

Do not include any markdown code blocks, explanations, or additional text. Just the raw JSON array.`;

    // For PDF processing, we'll send the base64 data to the AI
    // Note: We're using a text-based approach since GPT-4o-mini supports vision
    // If the file is large, we extract key portions in the prompt
    
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openrouterKey}`,
        'HTTP-Referer': 'https://flashlearn.app',
        'X-Title': 'FlashLearn PDF Generator'
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert educational content creator specializing in creating effective flashcards from documents. You have advanced PDF reading capabilities. Always respond with valid JSON only.'
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: prompt
              },
              {
                type: 'document',
                document: {
                  data: file, // base64 encoded PDF
                  format: 'pdf'
                }
              }
            ]
          }
        ],
        temperature: 0.7,
        max_tokens: 2500
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.log('OpenRouter API HTTP Status:', response.status);
      console.log('OpenRouter API Error Response:', errorData);
      
      let errorMessage = `PDF processing failed (${response.status})`;
      try {
        const errorJson = JSON.parse(errorData);
        errorMessage = errorJson.error?.message || errorMessage;
      } catch (e) {
        // Use default error message
      }
      
      return c.json({ 
        error: errorMessage
      }, response.status);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      console.log('No content in OpenRouter response:', data);
      return c.json({ error: 'AI service returned no content' }, 500);
    }

    // Parse the JSON response
    let flashcards;
    try {
      // Remove markdown code blocks if present
      const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      flashcards = JSON.parse(cleanContent);
      
      if (!Array.isArray(flashcards)) {
        throw new Error('Response is not an array');
      }
      
      // Validate flashcard format
      flashcards = flashcards
        .filter(card => card.front && card.back)
        .map(card => ({
          front: String(card.front).trim(),
          back: String(card.back).trim()
        }))
        .slice(0, count);
      
      if (flashcards.length === 0) {
        throw new Error('No valid flashcards generated from PDF');
      }
      
    } catch (parseError) {
      console.log('Failed to parse AI response:', content, parseError);
      return c.json({ 
        error: 'Failed to parse AI-generated flashcards from PDF. Please try a different file.' 
      }, 500);
    }

    console.log(`Successfully generated ${flashcards.length} flashcards from PDF: ${fileName}`);
    
    return c.json({ 
      flashcards,
      metadata: {
        source: fileName,
        count: flashcards.length,
        difficulty,
        generatedAt: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.log('PDF generation error:', error);
    return c.json({ 
      error: `Failed to generate flashcards from PDF: ${error.message}` 
    }, 500);
  }
});

// Health check
app.get('/make-server-bc46df65/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

Deno.serve(app.fetch);