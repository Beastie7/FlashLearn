import React, { useEffect, useState } from 'react';
import { NeonButton } from './NeonButton';
import { Zap, Brain, Sparkles } from 'lucide-react';

interface OnboardingScreenProps {
  onComplete: () => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--cyber-bg)] via-[var(--background)] to-[var(--cyber-bg)] flex items-center justify-center p-4">
      <div className={`text-center transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        {/* Logo */}
        <div className="relative mb-8">
          <div className="cyber-gradient w-24 h-24 rounded-full mx-auto flex items-center justify-center neon-glow-blue mb-4">
            <Brain className="w-12 h-12 text-white" />
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-[var(--neon-purple)] rounded-full flex items-center justify-center neon-glow-purple">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl mb-4 bg-gradient-to-r from-[var(--neon-blue)] to-[var(--neon-purple)] bg-clip-text text-transparent">
          FlashLearn
        </h1>

        {/* Tagline */}
        <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-md mx-auto">
          AI-Powered Flashcards for Smarter Learning
        </p>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 max-w-2xl mx-auto">
          <div className="cyber-surface rounded-lg p-4 neon-border-blue">
            <Zap className="w-8 h-8 text-[var(--neon-blue)] mx-auto mb-2" />
            <p className="text-sm">AI-Generated Cards</p>
          </div>
          <div className="cyber-surface rounded-lg p-4 neon-border-blue">
            <Brain className="w-8 h-8 text-[var(--neon-purple)] mx-auto mb-2" />
            <p className="text-sm">Smart Learning</p>
          </div>
          <div className="cyber-surface rounded-lg p-4 neon-border-blue">
            <Sparkles className="w-8 h-8 text-[var(--neon-cyan)] mx-auto mb-2" />
            <p className="text-sm">Progress Tracking</p>
          </div>
        </div>

        {/* Get Started Button */}
        <NeonButton 
          onClick={onComplete}
          className="px-8 py-3 text-lg"
        >
          Get Started
        </NeonButton>
      </div>
    </div>
  );
};