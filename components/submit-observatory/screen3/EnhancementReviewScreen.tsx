'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Info, Sparkles, FileText, Check } from 'lucide-react';
import { useSubmitFlowStore } from '@/lib/stores/submitFlowStore';
import { InteractiveTextEditor } from './InteractiveTextEditor';
import { cn } from '@/lib/utils';

type SaveChoice = 'enhanced' | 'original';

export function EnhancementReviewScreen() {
  const { screen1, screen3, updateScreen3, setEnhancementEnabled, goNext, goBack } = useSubmitFlowStore();

  const [saveChoice, setSaveChoice] = useState<SaveChoice>('enhanced');

  // Sync enhancement toggle with save choice
  useEffect(() => {
    setEnhancementEnabled(saveChoice === 'enhanced');
  }, [saveChoice, setEnhancementEnabled]);

  const handleChoiceChange = (choice: SaveChoice) => {
    setSaveChoice(choice);
    // The InteractiveTextEditor will automatically update based on screen3.enhancementEnabled
  };

  const handleContinue = () => {
    // Get final text from store (InteractiveTextEditor updates it)
    const finalText = screen3.textVersions?.current ||
                     (saveChoice === 'enhanced' ? screen3.enhancedText : screen1.text);

    updateScreen3({
      finalText,
      wasEnhanced: saveChoice === 'enhanced',
      wasEdited: finalText !== (saveChoice === 'enhanced' ? screen3.enhancedText : screen1.text),
    });
    goNext();
  };

  return (
    <div className="space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar">
      {/* Compact Trust Info Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-3 rounded-lg bg-observatory-accent/10 border border-observatory-accent/30"
      >
        <div className="flex gap-3">
          <Info className="w-4 h-4 text-observatory-accent flex-shrink-0 mt-0.5" />
          <div className="space-y-2">
            <h3 className="font-semibold text-sm text-text-primary">
              So haben wir deine Erfahrung verbessert:
            </h3>
            <ul className="space-y-1 text-xs text-text-secondary">
              <li className="flex items-start gap-1.5">
                <Check className="w-3 h-3 text-success-soft flex-shrink-0 mt-0.5" />
                <span>Deine Antworten auf unsere Fragen wurden hinzugefügt</span>
              </li>
              <li className="flex items-start gap-1.5">
                <Check className="w-3 h-3 text-success-soft flex-shrink-0 mt-0.5" />
                <span>Dein ursprünglicher Text wurde nicht verändert</span>
              </li>
              <li className="flex items-start gap-1.5">
                <Check className="w-3 h-3 text-success-soft flex-shrink-0 mt-0.5" />
                <span>Aus deinem Text wurde nichts gelöscht</span>
              </li>
            </ul>
            <p className="text-xs text-text-tertiary italic pt-1">
              Du entscheidest, welche Version gespeichert wird.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Compact Choice Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="mb-2"
      >
        <h2 className="section-title-observatory text-base">
          Wie möchtest du deine Erfahrung speichern?
        </h2>
      </motion.div>

      {/* Radio Card Group - Side by Side */}
      <motion.div
        className="grid grid-cols-2 gap-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {/* Enhanced Card */}
        <motion.button
          onClick={() => handleChoiceChange('enhanced')}
          className={cn(
            'relative p-3 rounded-lg border-2 transition-all text-left',
            'hover:border-observatory-accent/50',
            saveChoice === 'enhanced'
              ? 'border-observatory-accent bg-observatory-accent/10'
              : 'border-white/10 bg-glass-bg'
          )}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          {/* Radio Indicator */}
          <div className="absolute top-2 right-2">
            <div
              className={cn(
                'w-4 h-4 rounded-full border-2 flex items-center justify-center',
                saveChoice === 'enhanced'
                  ? 'border-observatory-accent bg-observatory-accent'
                  : 'border-white/30'
              )}
            >
              <AnimatePresence>
                {saveChoice === 'enhanced' && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="w-2 h-2 rounded-full bg-dark"
                  />
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="space-y-1.5 pr-6">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-observatory-accent" />
              <h3 className="text-sm font-semibold text-observatory-accent">
                MIT AI-ERGÄNZUNGEN
              </h3>
            </div>

            <p className="text-xs text-text-tertiary">
              Dein Text + Fragen-Antworten
            </p>
          </div>
        </motion.button>

        {/* Original Card */}
        <motion.button
          onClick={() => handleChoiceChange('original')}
          className={cn(
            'relative p-3 rounded-lg border-2 transition-all text-left',
            'hover:border-white/30',
            saveChoice === 'original'
              ? 'border-white bg-white/10'
              : 'border-white/10 bg-glass-bg'
          )}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          {/* Radio Indicator */}
          <div className="absolute top-2 right-2">
            <div
              className={cn(
                'w-4 h-4 rounded-full border-2 flex items-center justify-center',
                saveChoice === 'original'
                  ? 'border-white bg-white'
                  : 'border-white/30'
              )}
            >
              <AnimatePresence>
                {saveChoice === 'original' && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="w-2 h-2 rounded-full bg-dark"
                  />
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="space-y-1.5 pr-6">
            <div className="flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-text-primary" />
              <h3 className="text-sm font-semibold text-text-primary">
                NUR ORIGINAL
              </h3>
            </div>

            <p className="text-xs text-text-tertiary">
              Nur dein ursprünglicher Text
            </p>
          </div>
        </motion.button>
      </motion.div>

      {/* Preview & Edit Section mit InteractiveTextEditor */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="space-y-2"
      >
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-text-primary">
            Vorschau & Bearbeiten
          </h3>
          <span className="text-xs text-text-tertiary">
            (ändert sich automatisch)
          </span>
        </div>

        {/* Der existierende InteractiveTextEditor */}
        <AnimatePresence mode="wait">
          <motion.div
            key={saveChoice}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
          >
            <InteractiveTextEditor />
          </motion.div>
        </AnimatePresence>

        {/* Info about choice */}
        <motion.p
          key={saveChoice}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xs text-text-tertiary"
        >
          {saveChoice === 'enhanced' ? (
            <>
              💡 <span className="text-yellow-500">Gold</span> = AI hinzugefügt,{' '}
              <span className="text-blue-500">Blau</span> = Du bearbeitet. Klicke zum Entfernen!
            </>
          ) : (
            <>
              💡 Dein Original-Text ohne AI-Ergänzungen
            </>
          )}
        </motion.p>
      </motion.div>

      {/* Navigation Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <motion.button
          onClick={goBack}
          className="py-3 rounded-lg font-semibold text-sm bg-glass-bg border border-glass-border text-text-primary hover:bg-white/10 transition-all"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          ← Zurück
        </motion.button>

        <motion.button
          onClick={handleContinue}
          className={cn(
            'py-3 rounded-lg font-semibold text-sm',
            'transition-all',
            saveChoice === 'enhanced'
              ? 'bg-observatory-accent text-white hover:bg-observatory-accent/90'
              : 'bg-white text-dark hover:bg-white/90'
          )}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          Weiter zu Medien & Zeugen →
        </motion.button>
      </div>
    </div>
  );
}
