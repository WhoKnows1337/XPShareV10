'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';

interface WordCounterProps {
  wordCount: number;
}

// Character Milestones (50 chars minimum)
const MILESTONES = {
  bronze: { chars: 50, xp: 20, label: '✓ OPTIMAL' },
  silver: { chars: 150, xp: 50, label: '✓ DETAILED' },
  gold: { chars: 300, xp: 100, label: '✓ COMPREHENSIVE' },
  platinum: { chars: 500, xp: 200, label: '✓ EXCEPTIONAL' },
};

export function WordCounter({ wordCount }: WordCounterProps) {
  const t = useTranslations('submit.screen1.wordCounter');

  // Estimate char count (rough: 5 chars per word)
  const charCount = wordCount * 5;

  const currentMilestone = useMemo(() => {
    if (charCount >= MILESTONES.platinum.chars) return MILESTONES.platinum;
    if (charCount >= MILESTONES.gold.chars) return MILESTONES.gold;
    if (charCount >= MILESTONES.silver.chars) return MILESTONES.silver;
    if (charCount >= MILESTONES.bronze.chars) return MILESTONES.bronze;
    return null;
  }, [charCount]);

  const nextMilestone = useMemo(() => {
    if (charCount < MILESTONES.bronze.chars) return MILESTONES.bronze;
    if (charCount < MILESTONES.silver.chars) return MILESTONES.silver;
    if (charCount < MILESTONES.gold.chars) return MILESTONES.gold;
    if (charCount < MILESTONES.platinum.chars) return MILESTONES.platinum;
    return null;
  }, [charCount]);

  const getStatusMessage = () => {
    if (charCount === 0) return t('start', 'Start typing...');
    if (charCount < 50) return t('moreDetail', '→ MORE DETAIL');
    if (currentMilestone) return currentMilestone.label;
    return '';
  };

  const getStatusColor = () => {
    if (charCount < 50) return 'text-warning-soft';
    if (currentMilestone) return 'text-success-soft';
    return 'text-text-tertiary';
  };

  return (
    <div className="flex items-center gap-3">
      {/* Character Count */}
      <motion.span
        key={charCount}
        initial={{ scale: 1.1, opacity: 0.7 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="font-mono text-xs text-text-monospace uppercase tracking-wider"
      >
        {charCount.toString().padStart(3, '0')} CHARS
      </motion.span>

      {/* Status */}
      <AnimatePresence mode="wait">
        <motion.span
          key={getStatusMessage()}
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 5 }}
          transition={{ duration: 0.2 }}
          className={`text-xs font-medium uppercase tracking-wide ${getStatusColor()}`}
        >
          {getStatusMessage()}
        </motion.span>
      </AnimatePresence>

      {/* Next Milestone */}
      <AnimatePresence>
        {nextMilestone && charCount > 0 && (
          <motion.span
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.2 }}
            className="font-mono text-xs text-text-tertiary"
          >
            → {nextMilestone.chars} (+{nextMilestone.xp}XP)
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}
