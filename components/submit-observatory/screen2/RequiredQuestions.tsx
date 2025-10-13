'use client';

import { useSubmitFlowStore } from '@/lib/stores/submitFlowStore';
import { useTranslations } from 'next-intl';

export function RequiredQuestions() {
  const t = useTranslations('submit.screen2.required');
  const { screen2, updateScreen2 } = useSubmitFlowStore();

  return (
    <div className="space-y-3">
      {/* Top Row: Date+Time and Location in 2 columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Date + Time */}
        <div>
          <label className="text-xs font-medium text-text-secondary uppercase mb-1 block">
            {t('date', 'Wann?')}
          </label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="date"
              value={screen2.date}
              onChange={(e) => updateScreen2({ date: e.target.value })}
              className="input-observatory text-xs"
              required
            />
            <input
              type="time"
              value={screen2.time}
              onChange={(e) => updateScreen2({ time: e.target.value })}
              className="input-observatory text-xs"
              required
            />
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="text-xs font-medium text-text-secondary uppercase mb-1 block">
            {t('location', 'Wo?')}
          </label>
          <input
            type="text"
            value={screen2.location}
            onChange={(e) => updateScreen2({ location: e.target.value })}
            placeholder={t('locationPlaceholder', 'Berlin, Germany')}
            className="input-observatory text-xs"
            required
          />
        </div>
      </div>

      {/* Duration - Full Width */}
      <div>
        <label className="text-xs font-medium text-text-secondary uppercase mb-1 block">
          {t('duration', 'Dauer?')}
        </label>
        <div className="flex gap-2">
          {[
            { value: 'less_than_1min', label: t('less1min', '<1m') },
            { value: '1_to_5min', label: t('1to5min', '1-5m') },
            { value: 'more_than_5min', label: t('more5min', '>5m') },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => updateScreen2({ duration: option.value as any })}
              className={`
                flex-1 px-2 py-1.5 rounded text-xs border transition-all
                ${
                  screen2.duration === option.value
                    ? 'bg-observatory-accent/20 border-observatory-accent/40 text-observatory-accent'
                    : 'bg-glass-bg border-glass-border text-text-tertiary hover:border-observatory-accent/30'
                }
              `}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
