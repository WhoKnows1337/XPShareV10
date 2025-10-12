'use client';

import { useTranslations } from 'next-intl';
import { Sparkles, TrendingUp, Award, Clock } from 'lucide-react';

interface ExtraQuestionsPromptProps {
  onAccept: () => void;
}

export function ExtraQuestionsPrompt({ onAccept }: ExtraQuestionsPromptProps) {
  const t = useTranslations('submit.screen2.extraPrompt');

  return (
    <div className="glass-card p-8">
      <div className="flex items-start gap-4 mb-6">
        <div className="flex-shrink-0 w-12 h-12 bg-observatory-gold/15 border border-observatory-gold/30 rounded-lg flex items-center justify-center">
          <Sparkles className="w-6 h-6 text-observatory-gold" />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-text-primary mb-2">
            {t('title', '💎 Bessere Muster-Erkennung?')}
          </h3>
          <p className="text-text-secondary text-sm">
            {t('description', 'Beantworte 8-10 Fragen für erweiterte Analyse')}
          </p>
        </div>
      </div>

      {/* Benefits */}
      <div className="space-y-3 mb-6">
        <div className="flex items-center gap-3 text-sm text-text-secondary">
          <TrendingUp className="w-4 h-4 text-success-soft flex-shrink-0" />
          <span>{t('benefit1', 'Erweiterte Muster-Analyse')}</span>
        </div>
        <div className="flex items-center gap-3 text-sm text-text-secondary">
          <Award className="w-4 h-4 text-observatory-gold flex-shrink-0" />
          <span>{t('benefit2', '+100 XP total')}</span>
        </div>
        <div className="flex items-center gap-3 text-sm text-text-secondary">
          <Award className="w-4 h-4 text-observatory-gold flex-shrink-0" />
          <span>{t('benefit3', '"Pattern Seeker" Badge')}</span>
        </div>
        <div className="flex items-center gap-3 text-sm text-text-tertiary">
          <Clock className="w-4 h-4 flex-shrink-0" />
          <span>{t('time', 'Dauert ca. 5-8 Minuten')}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={() => {}}
          className="flex-1 px-6 py-3 bg-text-primary/5 border border-text-primary/20 rounded-lg
                     text-text-secondary font-medium hover:bg-text-primary/10 transition-colors"
        >
          {t('decline', 'Nein danke')}
        </button>
        <button onClick={onAccept} className="flex-1 btn-observatory">
          {t('accept', 'Ja, Fragen zeigen ↓')}
        </button>
      </div>
    </div>
  );
}
