'use client';

import { useSubmitFlowStore } from '@/lib/stores/submitFlowStore';
import { useTranslations } from 'next-intl';
import { Calendar, Clock, MapPin, Timer } from 'lucide-react';

export function RequiredQuestions() {
  const t = useTranslations('submit.screen2.required');
  const { screen2, updateScreen2 } = useSubmitFlowStore();

  return (
    <div className="space-y-6">
      {/* Date */}
      <div>
        <label className="flex items-center gap-2 text-sm font-semibold text-text-primary mb-3">
          <Calendar className="w-4 h-4 text-observatory-gold" />
          {t('date', 'Wann?')}
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            type="date"
            value={screen2.date}
            onChange={(e) => updateScreen2({ date: e.target.value })}
            className="input-observatory"
            required
          />
          <input
            type="time"
            value={screen2.time}
            onChange={(e) => updateScreen2({ time: e.target.value })}
            className="input-observatory"
            required
          />
        </div>
      </div>

      {/* Location */}
      <div>
        <label className="flex items-center gap-2 text-sm font-semibold text-text-primary mb-3">
          <MapPin className="w-4 h-4 text-observatory-gold" />
          {t('location', 'Wo?')}
        </label>
        <input
          type="text"
          value={screen2.location}
          onChange={(e) => updateScreen2({ location: e.target.value })}
          placeholder={t('locationPlaceholder', 'Berlin, Germany')}
          className="input-observatory"
          required
        />
      </div>

      {/* Duration */}
      <div>
        <label className="flex items-center gap-2 text-sm font-semibold text-text-primary mb-3">
          <Timer className="w-4 h-4 text-observatory-gold" />
          {t('duration', 'Dauer?')}
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { value: 'less_than_1min', label: t('less1min', '<1 Min') },
            { value: '1_to_5min', label: t('1to5min', '1-5 Min') },
            { value: 'more_than_5min', label: t('more5min', '>5 Min') },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => updateScreen2({ duration: option.value as any })}
              className={`
                flex items-center justify-center gap-2 px-4 py-3 rounded-lg border transition-all
                ${
                  screen2.duration === option.value
                    ? 'bg-observatory-gold/15 border-observatory-gold/40 text-observatory-gold font-semibold'
                    : 'bg-text-primary/5 border-text-primary/20 text-text-secondary hover:bg-text-primary/10'
                }
              `}
            >
              <div
                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  screen2.duration === option.value ? 'border-observatory-gold' : 'border-text-tertiary'
                }`}
              >
                {screen2.duration === option.value && (
                  <div className="w-2 h-2 rounded-full bg-observatory-gold" />
                )}
              </div>
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
