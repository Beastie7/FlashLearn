import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NeonButton } from './NeonButton';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { ArrowLeft, Play, Plus, Edit2, Trash2, RotateCcw, X, Save, AlertTriangle } from 'lucide-react';

interface Flashcard {
  id: string;
  front: string;
  back: string;
  mastered: boolean;
}

interface Deck {
  id: string;
  title: string;
  description: string;
  cards: Flashcard[];
}

interface DeckViewScreenProps {
  deck: Deck;
  onBack: () => void;
  onStartStudy: (deckId: string) => void;
  onUpdateDeck: (deck: Deck) => void;
  onDeleteDeck: (deckId: string) => void;
}

export const DeckViewScreen: React.FC<DeckViewScreenProps> = ({ 
  deck, 
  onBack, 
  onStartStudy, 
  onUpdateDeck,
  onDeleteDeck
}) => {
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [editedFront, setEditedFront] = useState('');
  const [editedBack, setEditedBack] = useState('');
  const [newCardFront, setNewCardFront] = useState('');
  const [newCardBack, setNewCardBack] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showAddCard, setShowAddCard] = useState(false);

  const masteredCount = deck.cards.filter(card => card.mastered).length;
  const progress = deck.cards.length > 0 ? (masteredCount / deck.cards.length) * 100 : 0;

  const handleAddCard = () => {
    if (!newCardFront.trim() || !newCardBack.trim()) return;
    
    const newCard: Flashcard = {
      id: Date.now().toString(),
      front: newCardFront,
      back: newCardBack,
      mastered: false
    };
    
    onUpdateDeck({
      ...deck,
      cards: [...deck.cards, newCard]
    });
    
    setNewCardFront('');
    setNewCardBack('');
  };

  const handleStartEditCard = (card: Flashcard) => {
    setEditingCardId(card.id);
    setEditedFront(card.front);
    setEditedBack(card.back);
  };

  const handleSaveEditCard = () => {
    if (!editingCardId || !editedFront.trim() || !editedBack.trim()) return;
    
    onUpdateDeck({
      ...deck,
      cards: deck.cards.map(card => 
        card.id === editingCardId
          ? { ...card, front: editedFront, back: editedBack }
          : card
      )
    });
    
    setEditingCardId(null);
    setEditedFront('');
    setEditedBack('');
  };

  const handleCancelEdit = () => {
    setEditingCardId(null);
    setEditedFront('');
    setEditedBack('');
  };

  const handleDeleteCard = (cardId: string) => {
    onUpdateDeck({
      ...deck,
      cards: deck.cards.filter(card => card.id !== cardId)
    });
  };

  const handleResetProgress = () => {
    onUpdateDeck({
      ...deck,
      cards: deck.cards.map(card => ({ ...card, mastered: false }))
    });
  };

  const handleDeleteDeck = () => {
    onDeleteDeck(deck.id);
    onBack();
  };

  return (
    <div className="min-h-screen bg-[var(--cyber-bg)] overflow-auto">
      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-[var(--cyber-surface)] border border-red-500/30 rounded-2xl p-6 max-w-sm w-full shadow-2xl shadow-red-500/20"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="p-4 bg-red-500/10 rounded-full">
                  <AlertTriangle className="w-8 h-8 text-red-500" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Delete Deck?</h3>
                  <p className="text-muted-foreground text-sm">"{deck.title}"</p>
                </div>
              </div>
              
              <p className="text-muted-foreground mb-6">
                This will permanently delete this deck and all {deck.cards.length} cards. 
                This action cannot be undone.
              </p>
              
              <div className="flex gap-4">
                <NeonButton
                  variant="secondary"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-3"
                >
                  Cancel
                </NeonButton>
                <motion.button
                  onClick={handleDeleteDeck}
                  className="flex-1 py-3 px-4 rounded-xl bg-red-500 hover:bg-red-600 text-white font-medium transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Delete Deck
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-4xl mx-auto p-4 pb-24">
        {/* Header */}
        <motion.div 
          className="flex items-center gap-3 mb-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <motion.button 
            onClick={onBack}
            className="p-3 rounded-xl hover:bg-secondary/50 transition-colors"
            whileTap={{ scale: 0.9 }}
          >
            <ArrowLeft className="w-5 h-5" />
          </motion.button>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg sm:text-xl bg-gradient-to-r from-[var(--neon-blue)] to-[var(--neon-purple)] bg-clip-text text-transparent truncate">
              {deck.title}
            </h1>
            <p className="text-sm text-muted-foreground truncate">{deck.description}</p>
          </div>
          
          {/* Delete Button */}
          <motion.button
            onClick={() => setShowDeleteConfirm(true)}
            className="p-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.05 }}
          >
            <Trash2 className="w-5 h-5" />
          </motion.button>
        </motion.div>

        {/* Stats and Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="cyber-surface p-4 sm:p-6 mb-6 neon-border-blue">
            <div className="flex flex-col gap-4">
              {/* Stats Row */}
              <div className="flex items-center justify-between">
                <div className="flex gap-6">
                  <div>
                    <p className="text-2xl">{deck.cards.length}</p>
                    <p className="text-xs text-muted-foreground">Total Cards</p>
                  </div>
                  <div>
                    <p className="text-2xl text-green-400">{masteredCount}</p>
                    <p className="text-xs text-muted-foreground">Mastered</p>
                  </div>
                  <div>
                    <p className="text-2xl text-[var(--neon-purple)]">{Math.round(progress)}%</p>
                    <p className="text-xs text-muted-foreground">Progress</p>
                  </div>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <motion.div 
                  className="h-full cyber-gradient"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2 pt-2">
                <NeonButton
                  onClick={() => onStartStudy(deck.id)}
                  disabled={deck.cards.length === 0}
                  className="flex items-center gap-2"
                  animate={true}
                  glowing={deck.cards.length > 0}
                >
                  <Play className="w-4 h-4" />
                  Study Now
                </NeonButton>
                <NeonButton
                  onClick={() => setShowAddCard(true)}
                  variant="secondary"
                  className="flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Card
                </NeonButton>
                {masteredCount > 0 && (
                  <NeonButton
                    variant="secondary"
                    onClick={handleResetProgress}
                    className="flex items-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Reset Progress
                  </NeonButton>
                )}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Add New Card */}
        <AnimatePresence>
          {showAddCard && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
            >
              <Card className="cyber-surface p-6 mb-6 neon-border-purple">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Add New Card</h3>
                  <motion.button
                    onClick={() => {
                      setShowAddCard(false);
                      setNewCardFront('');
                      setNewCardBack('');
                    }}
                    className="p-2 hover:bg-secondary rounded-lg transition-colors"
                    whileTap={{ scale: 0.9 }}
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm mb-2 text-muted-foreground">Front (Question)</label>
                    <Textarea
                      value={newCardFront}
                      onChange={(e) => setNewCardFront(e.target.value)}
                      placeholder="Enter the question or term..."
                      className="cyber-surface neon-border-blue min-h-[120px] resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-2 text-muted-foreground">Back (Answer)</label>
                    <Textarea
                      value={newCardBack}
                      onChange={(e) => setNewCardBack(e.target.value)}
                      placeholder="Enter the answer or definition..."
                      className="cyber-surface neon-border-blue min-h-[120px] resize-none"
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <NeonButton 
                    onClick={() => {
                      handleAddCard();
                      setShowAddCard(false);
                    }}
                    disabled={!newCardFront.trim() || !newCardBack.trim()}
                    className="flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Card
                  </NeonButton>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Cards Grid - Uniform Size Cards */}
        {deck.cards.length === 0 ? (
          <motion.div 
            className="text-center py-16"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <motion.div
              animate={{ 
                rotate: [0, 10, -10, 0],
                scale: [1, 1.05, 1]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            >
              <Plus className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            </motion.div>
            <h3 className="mb-2 text-xl">No cards yet</h3>
            <p className="text-muted-foreground mb-6">Add your first flashcard to get started</p>
            <NeonButton onClick={() => setShowAddCard(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Card
            </NeonButton>
          </motion.div>
        ) : (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {deck.cards.map((card, index) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="h-full"
              >
                <Card 
                  className={`cyber-surface p-4 transition-all duration-300 h-full flex flex-col ${
                    card.mastered 
                      ? 'border-green-500/30 bg-green-500/5' 
                      : 'neon-border-blue hover:neon-glow-blue'
                  }`}
                >
                  {editingCardId === card.id ? (
                    // Edit mode
                    <div className="space-y-4 flex-1 flex flex-col">
                      <div className="flex-1">
                        <label className="text-xs text-[var(--neon-blue)] block mb-1">FRONT</label>
                        <Textarea
                          value={editedFront}
                          onChange={(e) => setEditedFront(e.target.value)}
                          className="cyber-surface neon-border-blue text-sm min-h-[80px] resize-none"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="text-xs text-[var(--neon-purple)] block mb-1">BACK</label>
                        <Textarea
                          value={editedBack}
                          onChange={(e) => setEditedBack(e.target.value)}
                          className="cyber-surface neon-border-blue text-sm min-h-[80px] resize-none"
                        />
                      </div>
                      <div className="flex gap-2 justify-end pt-2">
                        <motion.button
                          onClick={handleCancelEdit}
                          className="px-4 py-2 text-sm rounded-lg hover:bg-secondary transition-colors flex items-center gap-2"
                          whileTap={{ scale: 0.95 }}
                        >
                          <X className="w-4 h-4" />
                          Cancel
                        </motion.button>
                        <motion.button
                          onClick={handleSaveEditCard}
                          disabled={!editedFront.trim() || !editedBack.trim()}
                          className="px-4 py-2 text-sm rounded-lg bg-[var(--neon-blue)] text-white hover:bg-[var(--neon-blue)]/80 transition-colors disabled:opacity-50 flex items-center gap-2"
                          whileTap={{ scale: 0.95 }}
                        >
                          <Save className="w-4 h-4" />
                          Save
                        </motion.button>
                      </div>
                    </div>
                  ) : (
                    // View mode - Uniform card layout with non-bold text
                    <div className="space-y-3 h-full flex flex-col">
                      {/* Front */}
                      <div className="flex-1 min-h-0">
                        <label className="text-xs text-[var(--neon-blue)] mb-1 block">FRONT</label>
                        <p className="break-words text-sm font-normal">{card.front}</p>
                      </div>
                      
                      {/* Divider */}
                      <div className="border-t border-border/30" />
                      
                      {/* Back */}
                      <div className="flex-1 min-h-0">
                        <label className="text-xs text-[var(--neon-purple)] mb-1 block">BACK</label>
                        <p className="break-words text-sm font-normal">{card.back}</p>
                      </div>
                      
                      {/* Mastered Badge */}
                      {card.mastered && (
                        <div className="text-xs text-green-400 flex items-center gap-1">
                          <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                          Mastered
                        </div>
                      )}
                      
                      {/* Action Buttons */}
                      <div className="flex gap-2 justify-end pt-2 border-t border-border/30 mt-auto">
                        <motion.button
                          onClick={() => handleStartEditCard(card)}
                          className="p-2 text-[var(--neon-blue)] hover:text-[var(--neon-purple)] hover:bg-[var(--neon-blue)]/10 rounded-lg transition-colors"
                          title="Edit card"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Edit2 className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          onClick={() => handleDeleteCard(card.id)}
                          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Delete card"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </div>
                  )}
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Bottom padding for navigation bar */}
        <div className="h-12" />
      </div>
    </div>
  );
};

