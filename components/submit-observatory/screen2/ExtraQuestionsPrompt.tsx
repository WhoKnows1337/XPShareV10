'use client';

import { useTranslations } from 'next-intl';
import { Sparkles, TrendingUp, Award, Clock } from 'lucide-react';

interface ExtraQuestionsPromptProps {
  onAccept: () => void;
}

export function ExtraQuestionsPrompt({ onAccept }: ExtraQuestionsPromptProps) {
  const t = useTranslations('submit.screen2.extraPrompt');

  return (
    <div className="glass-card p-8 border-2 border-observatory-gold/20 animate-fly-in-up">
      <div className="flex items-start gap-4 mb-6">
        <div className="flex-shrink-0 w-12 h-12 bg-observatory-gold/15 border border-observatory-gold/30 rounded-lg flex items-center justify-center animate-glow-pulse">
          <Sparkles className="w-6 h-6 text-observatory-gold" />
        </div>
        <div className="flex-1">
          <div className="inline-flex items-center gap-2 px-2 py-1 bg-observatory-gold/10 border border-observatory-gold/30 rounded-full mb-3">
            <span className="text-xs font-bold text-observatory-gold uppercase tracking-wide">
              🎁 +50 Bonus XP
            </span>
          </div>
          <h3 className="text-xl font-semibold text-text-primary mb-2">
            {t('title', '💎 Noch mehr Details? Verdiene Extra-Punkte!')}
          </h3>
          <p className="text-text-secondary text-sm">
            {t('description', 'XP-Share lebt von den oft irrelevant wirkenden Details. Beantworte optionale Zusatzfragen für bessere Pattern-Matches!')}
          </p>
        </div>
      </div>

      {/* Benefits */}
      <div className="space-y-3 mb-6 p-4 bg-text-primary/5 border border-text-primary/10 rounded-lg">
        <div className="flex items-center gap-3 text-sm text-text-secondary">
          <TrendingUp className="w-4 h-4 text-success-soft flex-shrink-0" />
          <span>{t('benefit1', '🔮 Präzisere Ähnlichkeits-Matches finden')}</span>
        </div>
        <div className="flex items-center gap-3 text-sm font-semibold text-observatory-gold">
          <Award className="w-4 h-4 flex-shrink-0 animate-glow-pulse" />
          <span>{t('benefit2', '+50 XP für jede vollständige Fragen-Seite')}</span>
        </div>
        <div className="flex items-center gap-3 text-sm text-text-secondary">
          <Award className="w-4 h-4 text-observatory-light flex-shrink-0" />
          <span>{t('benefit3', '🏆 Chance auf "Pattern Seeker" Badge')}</span>
        </div>
        <div className="flex items-center gap-3 text-sm text-text-tertiary">
          <Clock className="w-4 h-4 flex-shrink-0" />
          <span>{t('time', '⏱️ 3-5 Minuten · Überspringbar')}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={() => {}}
          className="flex-1 px-6 py-3 bg-text-primary/5 border border-text-primary/20 rounded-lg
                     text-text-secondary font-medium hover:bg-text-primary/10 transition-all hover:scale-[1.02]"
        >
          {t('decline', 'Später')}
        </button>
        <button
          onClick={onAccept}
          className="flex-1 btn-observatory animate-scale-bounce"
          style={{ animationDelay: '500ms' }}
        >
          {t('accept', '🎯 Ja, Extra-Punkte verdienen!')}
        </button>
      </div>
    </div>
  );
}
