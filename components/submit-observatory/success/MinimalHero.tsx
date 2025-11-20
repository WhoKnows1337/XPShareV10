'use client';

import { useState } from 'react';
import { CheckCircle, Trophy, ChevronDown, Zap, Award, TrendingUp } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface PublishResult {
  experienceId: string;
  xpEarned: number;
  badgesEarned: string[];
  leveledUp: boolean;
  newLevel?: number;
}

interface MinimalHeroProps {
  result: PublishResult;
  title: string;
}

export function MinimalHero({ result, title }: MinimalHeroProps) {
  const t = useTranslations('submit.success');
  const [showRewards, setShowRewards] = useState(false);

  const hasNewBadge = result.badgesEarned.length > 0;
  const hasLevelUp = result.leveledUp;

  return (
    <div className="glass-card p-4 border border-success-soft/30 animate-fade-in-up">
      <div className="flex items-center justify-between">
        {/* Left: Status */}
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-12 h-12 rounded-full
                          bg-success-soft/10 border border-success-soft/30
                          flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-success-soft animate-scale-in" />
          </div>

          <div>
            <h1 className="text-base font-semibold text-text-primary">
              {t('title')}
            </h1>
            <p className="text-xs text-text-secondary">
              "{title}" {t('isLive')}
            </p>
          </div>
        </div>

        {/* Right: Rewards Toggle */}
        <button
          onClick={() => setShowRewards(!showRewards)}
          className="flex items-center gap-2 px-3 py-1.5
                     bg-observatory-gold/10 border border-observatory-gold/30
                     rounded hover:bg-observatory-gold/20 transition-all
                     relative group">
          <Trophy className="w-4 h-4 text-observatory-gold" />
          <span className="text-xs font-semibold text-observatory-gold">
            {t('rewards.title')}
          </span>
          {(hasNewBadge || hasLevelUp) && (
            <span className="absolute -top-1 -right-1 w-2 h-2
                           bg-observatory-gold rounded-full
                           animate-pulse" />
          )}
          <ChevronDown
            className={`w-3 h-3 text-observatory-gold transition-transform
                       ${showRewards ? 'rotate-180' : ''}`}
          />
        </button>
      </div>

      {/* Expandable Rewards */}
      {showRewards && (
        <div className="mt-3 pt-3 border-t border-glass-border animate-fade-in">
          <div className="flex flex-wrap items-center gap-3">
            {/* XP */}
            <div className="flex items-center gap-2 px-3 py-1.5
                            bg-observatory-gold/10 border border-observatory-gold/30
                            rounded">
              <Zap className="w-4 h-4 text-observatory-gold" />
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-bold text-observatory-gold">
                  +{result.xpEarned}
                </span>
                <span className="text-xs text-text-tertiary">XP</span>
              </div>
            </div>

            {/* Badges */}
            {result.badgesEarned.length > 0 && (
              <div className="flex items-center gap-2 px-3 py-1.5
                              glass-card-accent rounded border border-observatory-gold/30">
                <Award className="w-4 h-4 text-observatory-gold" />
                <div>
                  <div className="text-xs font-semibold text-text-primary">
                    {result.badgesEarned.length} {result.badgesEarned.length === 1 ? 'Badge' : 'Badges'}
                  </div>
                  <div className="text-xs text-text-tertiary line-clamp-1">
                    {result.badgesEarned.join(', ')}
                  </div>
                </div>
              </div>
            )}

            {/* Level Up */}
            {result.leveledUp && result.newLevel && (
              <div className="flex items-center gap-2 px-3 py-1.5
                              border-2 border-success-soft rounded
                              bg-success-soft/5">
                <TrendingUp className="w-4 h-4 text-success-soft animate-bounce-slow" />
                <div>
                  <div className="text-xs font-semibold text-success-soft">
                    {t('rewards.levelUp')}
                  </div>
                  <div className="text-xs text-text-tertiary">
                    {t('rewards.newLevel')} {result.newLevel}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
