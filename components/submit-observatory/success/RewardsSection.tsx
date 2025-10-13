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
    <div className="glass-card p-8 space-y-6 border-2 border-observatory-gold/30">
      <h2 className="section-title-observatory flex items-center gap-2 animate-fly-in-up">
        <Sparkles className="w-5 h-5 text-observatory-gold animate-glow-pulse" />
        {t('title', '🎁 Deine Belohnungen')}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* XP Earned */}
        <div className="glass-card-accent p-6 text-center animate-fly-in-up border-2 border-observatory-gold/40" style={{ animationDelay: '100ms' }}>
          <div className="text-sm text-text-tertiary mb-2 uppercase tracking-wide">
            {t('xpEarned', 'XP Verdient')}
          </div>
          <div className="text-4xl font-bold text-observatory-gold mb-2 animate-scale-bounce" style={{ animationDelay: '300ms' }}>
            +{result.xpEarned}
          </div>
          <div className="text-xs text-text-tertiary">
            {t('xpSubtext', '💪 Du wirst stärker!')}
          </div>
        </div>

        {/* Level Up */}
        {result.leveledUp && result.newLevel && (
          <div className="glass-card-accent p-6 text-center border-2 border-success-soft shadow-[0_0_30px_rgba(127,176,105,0.5)] animate-fly-in-up" style={{ animationDelay: '200ms' }}>
            <TrendingUp className="w-10 h-10 text-success-soft mx-auto mb-3 animate-scale-bounce" style={{ animationDelay: '500ms' }} />
            <div className="text-3xl font-bold text-success-soft mb-2 animate-glow-pulse">
              🎉 {t('levelUp', 'Level Up!')}
            </div>
            <div className="text-lg text-text-primary font-semibold">
              {t('newLevel', 'Level')} {result.newLevel}
            </div>
            <div className="text-xs text-text-tertiary mt-2">
              {t('levelUpSubtext', 'Neue Möglichkeiten freigeschaltet!')}
            </div>
          </div>
        )}

        {/* Badges Earned */}
        {result.badgesEarned.length > 0 && (
          <div className="glass-card-accent p-6 text-center border-2 border-observatory-gold/40 animate-fly-in-up" style={{ animationDelay: '300ms' }}>
            <Award className="w-10 h-10 text-observatory-gold mx-auto mb-3 animate-scale-bounce" style={{ animationDelay: '600ms' }} />
            <div className="text-sm text-text-tertiary mb-2 uppercase tracking-wide">
              {t('badgeEarned', 'Neue Badges')}
            </div>
            <div className="text-2xl font-bold text-observatory-gold mb-2">
              🏆 {result.badgesEarned.length}
            </div>
            <div className="text-xs text-text-tertiary line-clamp-2">
              {result.badgesEarned.join(' • ')}
            </div>
          </div>
        )}

        {/* Default message if no special rewards */}
        {!result.leveledUp && result.badgesEarned.length === 0 && (
          <div className="md:col-span-2 glass-card-accent p-6 text-center animate-fly-in-up" style={{ animationDelay: '400ms' }}>
            <p className="text-sm text-text-secondary">
              {t('keepGoing', '🎯 Weiter so! Teile mehr Erfahrungen um Level und Badges freizuschalten!')}
            </p>
            <p className="text-xs text-text-tertiary mt-2">
              {t('nextMilestone', 'Nächstes Level bei 500 XP')}
            </p>
          </div>
        )}
      </div>

      {/* Progress Info */}
      <div className="pt-4 border-t border-glass-border animate-fly-in-up" style={{ animationDelay: '500ms' }}>
        <div className="flex items-center justify-between text-sm p-3 bg-observatory-gold/5 border border-observatory-gold/20 rounded-lg">
          <span className="text-text-secondary">
            {t('progressInfo', '💫 Deine Beiträge helfen der Community, Muster zu erkennen')}
          </span>
          <span className="text-observatory-gold font-semibold">
            {t('thankYou', '🙏 Danke!')}
          </span>
        </div>
      </div>
    </div>
  );
}
