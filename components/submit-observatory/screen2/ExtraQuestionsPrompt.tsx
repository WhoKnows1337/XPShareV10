'use client';

import { useTranslations } from 'next-intl';

interface ExtraQuestionsPromptProps {
  onAccept: () => void;
}

export function ExtraQuestionsPrompt({ onAccept }: ExtraQuestionsPromptProps) {
  const t = useTranslations('submit.screen2.extraPrompt');

  return (
    <div className="p-3 bg-observatory-accent/5 border border-observatory-accent/20 rounded">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-observatory-accent uppercase tracking-wide">
            +50 XP
          </span>
          <span className="text-xs text-text-secondary">
            {t('title')}
          </span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {}}
            className="px-2 py-1 text-xs text-text-tertiary hover:text-text-secondary"
          >
            {t('decline')}
          </button>
          <button
            onClick={onAccept}
            className="px-3 py-1 bg-observatory-accent/20 border border-observatory-accent/40 rounded text-xs text-observatory-accent hover:bg-observatory-accent/30"
          >
            {t('accept')}
          </button>
        </div>
      </div>
      <p className="text-[10px] text-text-tertiary leading-relaxed">
        {t('description')}
      </p>
    </div>
  );
}
