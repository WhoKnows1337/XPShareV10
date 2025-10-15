'use client';

import { useTranslations } from 'next-intl';
import { Sparkles, Loader2 } from 'lucide-react';

interface EnhancementToggleProps {
  enabled: boolean;
  onToggle: () => void;
  isLoading?: boolean;
}

export function EnhancementToggle({ enabled, onToggle, isLoading = false }: EnhancementToggleProps) {
  const t = useTranslations('submit.screen3.toggle');

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className={`flex items-center justify-center w-10 h-10 rounded-lg ${enabled ? 'bg-observatory-gold/15' : 'bg-text-primary/5'}`}>
          {isLoading ? <Loader2 className="w-5 h-5 text-observatory-gold animate-spin" /> : <Sparkles className={`w-5 h-5 ${enabled ? 'text-observatory-gold' : 'text-text-tertiary'}`} />}
        </div>
        <div>
          <h4 className="font-semibold text-text-primary">
            {t('title')}
          </h4>
          <p className="text-sm text-text-secondary">
            {t('description')}
          </p>
        </div>
      </div>

      {/* Toggle Switch */}
      <button
        onClick={onToggle}
        disabled={isLoading}
        className={`
          relative w-14 h-7 rounded-full transition-all duration-300
          ${enabled ? 'bg-observatory-gold/30 border-observatory-gold shadow-[0_0_10px_rgba(212,165,116,0.5)]' : 'bg-text-primary/10 border-text-primary/30'}
          border
          ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        <div
          className={`
            absolute top-0.5 w-6 h-6 bg-text-primary rounded-full transition-all duration-300
            ${enabled ? 'left-7 bg-observatory-gold' : 'left-0.5'}
          `}
        />
      </button>
    </div>
  );
}
