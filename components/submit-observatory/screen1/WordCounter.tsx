'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';

interface WordCounterProps {
  wordCount: number;
}

// Milestone System from Spec
const MILESTONES = {
  bronze: { words: 50, xp: 20, color: '#d4a574', label: '✓ OPTIMAL' },
  silver: { words: 150, xp: 50, color: '#C0C0C0', label: '✓ DETAILED' },
  gold: { words: 300, xp: 100, color: '#e8dcc0', label: '✓ COMPREHENSIVE' },
  platinum: { words: 500, xp: 200, color: '#f0f0f0', label: '✓ EXCEPTIONAL' },
};

export function WordCounter({ wordCount }: WordCounterProps) {
  const t = useTranslations('submit.screen1.wordCounter');
  // Force rebuild to clear browser cache

  const currentMilestone = useMemo(() => {
    if (wordCount >= MILESTONES.platinum.words) return MILESTONES.platinum;
    if (wordCount >= MILESTONES.gold.words) return MILESTONES.gold;
    if (wordCount >= MILESTONES.silver.words) return MILESTONES.silver;
    if (wordCount >= MILESTONES.bronze.words) return MILESTONES.bronze;
    return null;
  }, [wordCount]);

  const nextMilestone = useMemo(() => {
    if (wordCount < MILESTONES.bronze.words) return MILESTONES.bronze;
    if (wordCount < MILESTONES.silver.words) return MILESTONES.silver;
    if (wordCount < MILESTONES.gold.words) return MILESTONES.gold;
    if (wordCount < MILESTONES.platinum.words) return MILESTONES.platinum;
    return null;
  }, [wordCount]);

  const progress = useMemo(() => {
    if (!nextMilestone) return 100;
    const previousWords =
      nextMilestone === MILESTONES.bronze
        ? 0
        : nextMilestone === MILESTONES.silver
        ? MILESTONES.bronze.words
        : nextMilestone === MILESTONES.gold
        ? MILESTONES.silver.words
        : MILESTONES.gold.words;

    return ((wordCount - previousWords) / (nextMilestone.words - previousWords)) * 100;
  }, [wordCount, nextMilestone]);

  const getStatusMessage = () => {
    if (wordCount === 0) return t('start', 'Start typing your experience...');
    if (wordCount < 50) return t('moreDetail', '→ MORE DETAIL RECOMMENDED');
    if (currentMilestone) return currentMilestone.label;
    return '';
  };

  const getStatusColor = () => {
    if (wordCount < 50) return 'text-warning-soft';
    if (currentMilestone) return 'text-success-soft';
    return 'text-text-tertiary';
  };

  return (
    <div className="space-y-3">
      {/* Word Count Display */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs text-text-monospace uppercase tracking-wider">
            WORD_COUNT: {wordCount.toString().padStart(4, '0')}
          </span>
          <span className={`font-mono text-xs font-semibold uppercase tracking-wider ${getStatusColor()} transition-all duration-300`}>
            {getStatusMessage()}
          </span>
        </div>
        {nextMilestone && (
          <span className="font-mono text-xs text-text-tertiary animate-glow-pulse">
            🎯 {nextMilestone.words} {t('words', 'words')} (+{nextMilestone.xp} XP)
          </span>
        )}
      </div>

      {/* Progress Bar */}
      {nextMilestone && (
        <div className="relative">
          <div className="h-1.5 bg-text-tertiary/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-observatory-gold to-observatory-light transition-all duration-300"
              style={{
                width: `${Math.min(progress, 100)}%`,
              }}
            />
          </div>
          <div className="flex justify-between mt-1.5">
            <span className="font-mono text-[10px] text-text-tertiary">
              {wordCount}/{nextMilestone.words}
            </span>
            <span className="font-mono text-[10px] text-text-tertiary">
              {Math.round(progress)}%
            </span>
          </div>
        </div>
      )}

      {/* Milestones Display (if reached platinum) */}
      {wordCount >= MILESTONES.platinum.words && (
        <div className="flex items-center gap-2 p-3 bg-success-soft/10 border border-success-soft/20 rounded-lg animate-fly-in-up">
          <span className="text-2xl animate-scale-bounce">🏆</span>
          <div>
            <p className="font-semibold text-sm text-success-soft">
              {t('maxReached', 'Legendary Detail Reached!')}
            </p>
            <p className="text-xs text-text-secondary">
              {t('earnedXP', '🎁 +{xp} XP werden beim Veröffentlichen gutgeschrieben!', { xp: MILESTONES.platinum.xp })}
            </p>
          </div>
        </div>
      )}

      {/* Milestone Achievement Badges - TEMPORARILY DISABLED due to browser cache issue */}
      {/* {wordCount >= MILESTONES.bronze.words && wordCount < MILESTONES.silver.words && (
        <div className="flex items-center gap-2 p-2 bg-observatory-gold/10 border border-observatory-gold/20 rounded-lg animate-fly-in-right">
          <span className="text-lg">⭐</span>
          <p className="text-xs text-observatory-gold font-medium">
            {t('bronzeAchieved', '+{xp} XP für detaillierte Beschreibung!', { xp: MILESTONES.bronze.xp })}
          </p>
        </div>
      )} */}
    </div>
  );
}
