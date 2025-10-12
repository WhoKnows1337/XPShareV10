'use client';

import { Sparkles, Award, TrendingUp } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface PublishResult {
  experienceId: string;
  xpEarned: number;
  badgesEarned: string[];
  leveledUp: boolean;
  newLevel?: number;
}

interface RewardsSectionProps {
  result: PublishResult;
}

export function RewardsSection({ result }: RewardsSectionProps) {
  const t = useTranslations('submit.success.rewards');

  return (
    <div className="glass-card p-8 space-y-6">
      <h2 className="section-title-observatory flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-observatory-gold" />
        {t('title', 'Belohnungen')}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* XP Earned */}
        <div className="glass-card-accent p-6 text-center">
          <div className="text-3xl font-bold text-observatory-gold mb-2">
            +{result.xpEarned} XP
          </div>
          <div className="text-sm text-text-tertiary">
            {t('xpEarned', 'Erfahrungspunkte verdient')}
          </div>
        </div>

        {/* Level Up */}
        {result.leveledUp && result.newLevel && (
          <div className="glass-card-accent p-6 text-center border-l-4 border-success-soft animate-bounce-in">
            <TrendingUp className="w-8 h-8 text-success-soft mx-auto mb-2" />
            <div className="text-2xl font-bold text-success-soft mb-1">
              {t('levelUp', 'Level Up!')}
            </div>
            <div className="text-sm text-text-tertiary">
              {t('newLevel', 'Neues Level')}: {result.newLevel}
            </div>
          </div>
        )}

        {/* Badges Earned */}
        {result.badgesEarned.length > 0 && (
          <div className="glass-card-accent p-6 text-center border-l-4 border-observatory-gold animate-bounce-in">
            <Award className="w-8 h-8 text-observatory-gold mx-auto mb-2" />
            <div className="text-lg font-bold text-text-primary mb-1">
              {result.badgesEarned.length} {t('badge', 'Abzeichen')}
            </div>
            <div className="text-xs text-text-tertiary">
              {result.badgesEarned.join(', ')}
            </div>
          </div>
        )}

        {/* Default message if no special rewards */}
        {!result.leveledUp && result.badgesEarned.length === 0 && (
          <div className="md:col-span-2 glass-card-accent p-6 text-center">
            <div className="text-sm text-text-secondary">
              {t('keepGoing', 'Teile mehr Erfahrungen um Level und Abzeichen freizuschalten!')}
            </div>
          </div>
        )}
      </div>

      {/* Progress Info */}
      <div className="pt-4 border-t border-glass-border">
        <div className="flex items-center justify-between text-sm">
          <span className="text-text-tertiary">
            {t('progressInfo', 'Deine Beiträge helfen der Community, Muster zu erkennen')}
          </span>
          <span className="text-observatory-gold font-medium">
            {t('thankYou', 'Vielen Dank!')}
          </span>
        </div>
      </div>
    </div>
  );
}
