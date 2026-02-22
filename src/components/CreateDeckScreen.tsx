import React, { useState } from 'react';
import { motion } from 'motion/react';
import { NeonButton } from './NeonButton';
import { AnimatedCard } from './AnimatedCard';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { ArrowLeft, Sparkles, Loader2, Brain, Zap, Plus, FileText, Upload, File } from 'lucide-react';

interface CreateDeckScreenProps {
  onBack: () => void;
  onCreateDeck: (title: string, description: string, cards: Array<{front: string, back: string}>) => void;
  onCreateDeckWithAI?: (topic: string, cardCount: number) => void;
  onCreateDeckFromPDF?: (file: File, cardCount: number) => void;
}

export const CreateDeckScreen: React.FC<CreateDeckScreenProps> = ({ 
  onBack, 
  onCreateDeck, 
  onCreateDeckWithAI,
  onCreateDeckFromPDF
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [cardCount, setCardCount] = useState(10);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleGenerateWithAI = async () => {
    if (!title.trim() || !onCreateDeckWithAI) return;
    
    setIsGenerating(true);
    
    try {
      await onCreateDeckWithAI(title.trim(), cardCount);
    } catch (error) {
      console.error('AI generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUploadPDF = async () => {
    if (!selectedFile || !onCreateDeckFromPDF) return;
    
    setIsGenerating(true);
    
    try {
      await onCreateDeckFromPDF(selectedFile, cardCount);
    } catch (error) {
      console.error('PDF upload failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreateEmptyDeck = () => {
    // Create deck with the title if provided, otherwise use a default title
    const deckTitle = title.trim() || `My Deck ${new Date().toLocaleDateString()}`;
    onCreateDeck(deckTitle, description, []);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
    } else {
      alert('Please select a valid PDF file');
    }
  };

  const cardCountOptions = [5, 10, 15, 20, 25];

  // Check if any generation is in progress
  const isBusy = isGenerating;

  return (
    <div className="min-h-screen bg-background overflow-auto">
      {/* Mobile-optimized container */}
      <div className="max-w-2xl mx-auto p-4 pb-24">
        {/* Header with improved mobile spacing */}
        <motion.div 
          className="flex items-center gap-3 mb-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <motion.button 
            onClick={onBack}
            className="p-3 rounded-xl hover:bg-secondary/50 transition-colors touch-manipulation"
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.05 }}
          >
            <ArrowLeft className="w-5 h-5" />
          </motion.button>
          <h1 className="text-lg sm:text-xl bg-gradient-to-r from-[var(--neon-blue)] to-[var(--neon-purple)] bg-clip-text text-transparent">
            Create New Deck
          </h1>
        </motion.div>

        {/* Main Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          <AnimatedCard 
            variant="neon" 
            className="p-6 mb-6"
            delay={0.2}
          >
            <div className="space-y-6">
              {/* Title Input */}
              <div>
                <label className="block mb-3 text-sm">
                  Deck Title
                </label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., JavaScript Fundamentals, Spanish Vocabulary..."
                  className="cyber-surface neon-border-blue focus:neon-glow-blue transition-all duration-300 text-sm py-3"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block mb-3 text-sm">
                  Description (Optional)
                </label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what this deck covers..."
                  className="cyber-surface neon-border-blue focus:neon-glow-blue transition-all duration-300 min-h-[80px] text-sm resize-none"
                />
              </div>

              {/* Card Count Selector for AI */}
              {onCreateDeckWithAI && (
                <div>
                  <label className="block mb-3 text-sm">
                    Number of Cards to Generate
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {cardCountOptions.map((count) => (
                      <motion.button
                        key={count}
                        onClick={() => setCardCount(count)}
                        className={`py-2 px-3 rounded-lg text-sm transition-all duration-200 ${
                          cardCount === count
                            ? 'cyber-gradient text-white neon-glow-blue'
                            : 'cyber-surface neon-border-blue hover:bg-secondary/50'
                        }`}
                        whileTap={{ scale: 0.95 }}
                        whileHover={{ scale: 1.05 }}
                      >
                        {count}
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </AnimatedCard>
        </motion.div>

        {/* AI Generation Info Card */}
        {onCreateDeckWithAI && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <AnimatedCard 
              variant="cyber" 
              className="p-6 mb-6"
              delay={0.3}
              glowing={true}
            >
              <div className="flex items-start gap-4">
                <motion.div
                  className="flex-shrink-0"
                  animate={{ 
                    rotate: [0, 360],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    rotate: { duration: 4, repeat: Infinity, ease: 'linear' },
                    scale: { duration: 2, repeat: Infinity, ease: 'easeInOut' }
                  }}
                >
                  <Brain className="w-6 h-6 text-white" />
                </motion.div>
                <div className="flex-1">
                  <h4 className="text-sm mb-2 text-white flex items-center gap-2">
                    AI-Powered Generation
                    <Sparkles className="w-4 h-4" />
                  </h4>
                  <p className="text-xs text-white/80 leading-relaxed">
                    Our AI will automatically create {cardCount} flashcards based on your topic. 
                    You can edit and customize them after generation.
                  </p>
                  
                  {/* Features list */}
                  <div className="mt-3 space-y-1">
                    {[
                      'Smart question generation',
                      'Contextual answers',
                      'Difficulty progression'
                    ].map((feature, index) => (
                      <motion.div
                        key={feature}
                        className="flex items-center gap-2 text-xs text-white/70"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + index * 0.1 }}
                      >
                        <Zap className="w-3 h-3" />
                        {feature}
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </AnimatedCard>
          </motion.div>
        )}

        {/* PDF Upload Info Card */}
        {onCreateDeckFromPDF && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.5 }}
          >
            <AnimatedCard 
              variant="cyber" 
              className="p-6 mb-6"
              delay={0.35}
              glowing={true}
            >
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <motion.div
                    className="flex-shrink-0"
                    animate={{ 
                      rotate: [0, 360],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ 
                      rotate: { duration: 4, repeat: Infinity, ease: 'linear' },
                      scale: { duration: 2, repeat: Infinity, ease: 'easeInOut' }
                    }}
                  >
                    <FileText className="w-6 h-6 text-white" />
                  </motion.div>
                  <div className="flex-1">
                    <h4 className="text-sm mb-2 text-white flex items-center gap-2">
                      Generate from PDF
                      <Sparkles className="w-4 h-4" />
                    </h4>
                    <p className="text-xs text-white/80 leading-relaxed">
                      Upload a PDF document and AI will extract {cardCount} flashcards from the content.
                    </p>
                    
                    {/* Features list */}
                    <div className="mt-3 space-y-1">
                      {[
                        'Automatic content extraction',
                        'Intelligent question generation',
                        'Comprehensive coverage'
                      ].map((feature, index) => (
                        <motion.div
                          key={feature}
                          className="flex items-center gap-2 text-xs text-white/70"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.45 + index * 0.1 }}
                        >
                          <Zap className="w-3 h-3" />
                          {feature}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* File Upload Section */}
                <div className="pt-4 border-t border-white/20">
                  <label className="block mb-2 text-xs text-white/80">
                    Select PDF File
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleFileChange}
                      className="hidden"
                      id="pdf-upload"
                    />
                    <label
                      htmlFor="pdf-upload"
                      className="flex items-center justify-center gap-2 p-4 rounded-lg border-2 border-dashed border-white/30 hover:border-white/50 transition-all duration-200 cursor-pointer bg-white/5 hover:bg-white/10"
                    >
                      {selectedFile ? (
                        <>
                          <File className="w-5 h-5 text-green-400" />
                          <div className="flex flex-col">
                            <span className="text-sm text-white font-medium">{selectedFile.name}</span>
                            <span className="text-xs text-white/50">{(selectedFile.size / 1024).toFixed(1)} KB</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <Upload className="w-5 h-5 text-white/70" />
                          <span className="text-sm text-white/70">Click or drag PDF here</span>
                        </>
                      )}
                    </label>
                  </div>
                  {selectedFile && (
                    <motion.div 
                      className="mt-3 p-3 bg-green-500/10 border border-green-500/30 rounded-lg"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      <p className="text-xs text-green-400 flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                        File ready - {cardCount} cards will be generated
                      </p>
                    </motion.div>
                  )}
                </div>
              </div>
            </AnimatedCard>
          </motion.div>
        )}

        {/* Action Buttons */}
        <motion.div 
          className="space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          {/* AI Generation Button */}
          {onCreateDeckWithAI && (
            <NeonButton
              onClick={handleGenerateWithAI}
              disabled={!title.trim() || isBusy}
              className="w-full py-4 flex items-center justify-center gap-3 text-sm"
              animate={true}
              glowing={!isBusy && title.trim()}
            >
              {isBusy ? (
                <motion.div
                  className="flex items-center gap-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Generating {cardCount} Cards...</span>
                  <motion.div
                    className="flex space-x-1"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    {[...Array(3)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="w-1 h-1 bg-white rounded-full"
                        animate={{
                          scale: [1, 1.5, 1],
                          opacity: [0.5, 1, 0.5],
                        }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          delay: i * 0.2,
                        }}
                      />
                    ))}
                  </motion.div>
                </motion.div>
              ) : (
                <motion.div
                  className="flex items-center gap-3"
                  whileHover={{ scale: 1.02 }}
                >
                  <Brain className="w-5 h-5" />
                  <span>Generate {cardCount} Cards with AI</span>
                  <Sparkles className="w-4 h-4" />
                </motion.div>
              )}
            </NeonButton>
          )}
          
          {/* PDF Upload Button */}
          {onCreateDeckFromPDF && (
            <NeonButton
              onClick={handleUploadPDF}
              disabled={!selectedFile || isBusy}
              className="w-full py-4 flex items-center justify-center gap-3 text-sm"
              animate={true}
              glowing={!isBusy && selectedFile}
            >
              {isBusy ? (
                <motion.div
                  className="flex items-center gap-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Processing PDF...</span>
                  <motion.div
                    className="flex space-x-1"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    {[...Array(3)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="w-1 h-1 bg-white rounded-full"
                        animate={{
                          scale: [1, 1.5, 1],
                          opacity: [0.5, 1, 0.5],
                        }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          delay: i * 0.2,
                        }}
                      />
                    ))}
                  </motion.div>
                </motion.div>
              ) : (
                <motion.div
                  className="flex items-center gap-3"
                  whileHover={{ scale: 1.02 }}
                >
                  <FileText className="w-5 h-5" />
                  <span>Extract {cardCount} Cards from PDF</span>
                  <Sparkles className="w-4 h-4" />
                </motion.div>
              )}
            </NeonButton>
          )}
          
          {/* Divider */}
          <div className="flex items-center gap-4 py-2">
            <div className="flex-1 h-px bg-white/10"></div>
            <span className="text-xs text-white/40 uppercase tracking-wider">or</span>
            <div className="flex-1 h-px bg-white/10"></div>
          </div>
          
          {/* Manual Creation Button - Improved */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <NeonButton
              variant="secondary"
              onClick={handleCreateEmptyDeck}
              disabled={isBusy}
              className="w-full py-5 flex items-center justify-center gap-3 text-sm bg-white/5 border-white/10 hover:bg-white/10"
              animate={true}
            >
              <motion.div
                className="flex items-center gap-3"
                whileHover={{ scale: 1.02 }}
              >
                <Plus className="w-5 h-5" />
                <div className="flex flex-col items-start">
                  <span>Create Empty Deck</span>
                  <span className="text-xs text-white/50">Add cards manually later</span>
                </div>
              </motion.div>
            </NeonButton>
          </motion.div>
          
          {/* Help text */}
          <motion.p 
            className="text-xs text-center text-muted-foreground px-4 leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            Choose an option above to create your flashcard deck
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
};

