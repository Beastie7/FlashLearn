import React, { useState, useEffect } from 'react';
import { NeonButton } from './NeonButton';
import { Card } from './ui/card';
import { Progress } from './ui/progress';
import { ArrowLeft, RotateCcw, Check, X } from 'lucide-react';

interface Flashcard {
  id: string;
  front: string;
  back: string;
  mastered: boolean;
}

interface StudyModeScreenProps {
  cards: Flashcard[];
  deckTitle: string;
  onBack: () => void;
  onComplete: (updatedCards: Flashcard[]) => void;
}

export const StudyModeScreen: React.FC<StudyModeScreenProps> = ({ 
  cards, 
  deckTitle, 
  onBack, 
  onComplete 
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [studyCards, setStudyCards] = useState<Flashcard[]>([]);
  const [reviewQueue, setReviewQueue] = useState<Flashcard[]>([]);
  const [completedCards, setCompletedCards] = useState<Flashcard[]>([]);
  const [autoFlipTimer, setAutoFlipTimer] = useState<NodeJS.Timeout | null>(null);

  // Auto-flip timer duration in milliseconds
  const AUTO_FLIP_DELAY = 5000; // 5 seconds

  // Initialize study session with cards that aren't mastered
  useEffect(() => {
    const cardsToStudy = cards.filter(card => !card.mastered);
    setStudyCards(cardsToStudy);
    setCompletedCards(cards.filter(card => card.mastered));
  }, [cards]);

  // Auto-flip effect: flip card after delay
  useEffect(() => {
    // Clear any existing timer when card changes or flips
    if (autoFlipTimer) {
      clearTimeout(autoFlipTimer);
      setAutoFlipTimer(null);
    }

    // Only set timer if card is not flipped
    if (currentCard && !isFlipped) {
      const timer = setTimeout(() => {
        setIsFlipped(true);
      }, AUTO_FLIP_DELAY);
      setAutoFlipTimer(timer);
    }

    // Cleanup on unmount
    return () => {
      if (autoFlipTimer) {
        clearTimeout(autoFlipTimer);
      }
    };
  }, [currentIndex, isFlipped]);

  const handleCardFlip = () => {
    // Clear auto-flip timer when manually flipped
    if (autoFlipTimer) {
      clearTimeout(autoFlipTimer);
      setAutoFlipTimer(null);
    }
    setIsFlipped(!isFlipped);
  };

  const currentCard = studyCards[currentIndex];
  const totalCards = cards.length;
  const progress = ((completedCards.length + currentIndex) / totalCards) * 100;

  const handleKnown = () => {
    if (!currentCard) return;
    
    const updatedCard = { ...currentCard, mastered: true };
    setCompletedCards(prev => [...prev, updatedCard]);
    
    // Check if this is the last card
    if (currentIndex + 1 >= studyCards.length && reviewQueue.length === 0) {
      // This is the last card - complete the session
      setIsFlipped(false);
      const allUpdatedCards = cards.map(card => {
        if (card.id === currentCard.id) {
          return updatedCard;
        }
        const completed = completedCards.find(c => c.id === card.id);
        return completed || card;
      });
      onComplete(allUpdatedCards);
    } else {
      nextCard();
    }
  };

  const handleReview = () => {
    if (!currentCard) return;
    
    setReviewQueue(prev => [...prev, currentCard]);
    nextCard();
  };

  const nextCard = () => {
    setIsFlipped(false);
    
    if (currentIndex + 1 < studyCards.length) {
      setCurrentIndex(currentIndex + 1);
    } else if (reviewQueue.length > 0) {
      // Move to review queue
      setStudyCards(reviewQueue);
      setReviewQueue([]);
      setCurrentIndex(0);
    } else {
      // Session complete
      const allUpdatedCards = cards.map(card => {
        const completed = completedCards.find(c => c.id === card.id);
        return completed || card;
      });
      onComplete(allUpdatedCards);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setStudyCards(cards.filter(card => !card.mastered));
    setReviewQueue([]);
    setCompletedCards(cards.filter(card => card.mastered));
  };

  if (studyCards.length === 0) {
    return (
      <div className="min-h-screen bg-[var(--cyber-bg)] p-4 flex items-center justify-center">
        <Card className="cyber-surface p-8 text-center max-w-md neon-border-blue">
          <div className="w-16 h-16 cyber-gradient rounded-full flex items-center justify-center mx-auto mb-4 neon-glow-blue">
            <Check className="w-8 h-8 text-white" />
          </div>
          <h2 className="mb-2">Study Session Complete!</h2>
          <p className="text-muted-foreground mb-6">
            Great job! You've completed all the cards in this deck.
          </p>
          <div className="flex gap-2">
            <NeonButton onClick={onBack} className="flex-1">
              Back to Deck
            </NeonButton>
            <NeonButton variant="secondary" onClick={handleRestart} className="flex-1">
              <RotateCcw className="w-4 h-4 mr-2" />
              Study Again
            </NeonButton>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--cyber-bg)] p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button 
            onClick={onBack}
            className="p-2 rounded-lg hover:bg-secondary transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="text-center">
            <h3 className="text-sm text-muted-foreground">{deckTitle}</h3>
            <p className="text-xs text-muted-foreground">
              Card {currentIndex + 1} of {studyCards.length}
            </p>
          </div>
          <button 
            onClick={handleRestart}
            className="p-2 rounded-lg hover:bg-secondary transition-colors"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
        </div>

        {/* Flashcard */}
        <div className="mb-8">
          <Card 
            className="cyber-surface min-h-[300px] p-8 cursor-pointer transition-all duration-500 neon-border-blue hover:neon-glow-blue"
            onClick={handleCardFlip}
          >
            <div className="flex items-center justify-center h-full text-center">
              <div className="space-y-4">
                <div className="text-xs text-muted-foreground uppercase tracking-wider">
                  {isFlipped ? 'Back' : 'Front'}
                </div>
                <div className="text-lg md:text-xl">
                  {isFlipped ? currentCard?.back : currentCard?.front}
                </div>
                {!isFlipped && (
                  <div className="text-sm text-muted-foreground">
                    Tap to reveal answer
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Action Buttons */}
        {isFlipped ? (
          <div className="grid grid-cols-2 gap-4">
            <NeonButton
              variant="review"
              onClick={handleReview}
              className="flex items-center justify-center gap-2 py-4"
            >
              <X className="w-5 h-5" />
              Review Again
            </NeonButton>
            <NeonButton
              variant="success"
              onClick={handleKnown}
              className="flex items-center justify-center gap-2 py-4"
            >
              <Check className="w-5 h-5" />
              I Know This
            </NeonButton>
          </div>
        ) : (
          <div className="text-center">
            <NeonButton onClick={handleCardFlip} className="px-8 py-4">
              Reveal Answer
            </NeonButton>
          </div>
        )}

        {/* Queue Info */}
        {reviewQueue.length > 0 && (
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              {reviewQueue.length} card{reviewQueue.length === 1 ? '' : 's'} in review queue
            </p>
          </div>
        )}
      </div>
    </div>
  );
};