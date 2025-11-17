'use client';

import { Zap, Moon, Activity } from 'lucide-react';
import { InsightCard } from './InsightCard';
import { useTranslations } from 'next-intl';

type CorrelationType = 'solar' | 'lunar' | 'seismic';

interface CorrelationCardProps {
  type: CorrelationType;
  title: string;
  description: string;
  metric: {
    value: string | number;
    label: string;
  };
  percentage?: number; // e.g., "80% of reports during full moon"
  onExplore?: () => void;
  delay?: number;
}

const correlationIcons: Record<CorrelationType, typeof Zap> = {
  solar: Zap,
  lunar: Moon,
  seismic: Activity,
};

export function CorrelationCard({
  type,
  title,
  description,
  metric,
  percentage,
  onExplore,
  delay = 0,
}: CorrelationCardProps) {
  const t = useTranslations('submit.insights');
  const Icon = correlationIcons[type];

  // Visual representation based on type
  const Visual = () => {
    if (type === 'lunar') {
      return (
        <div className="flex items-center justify-center py-4">
          <div className="relative">
            {/* Moon phases visualization */}
            <div className="flex gap-2">
              {['🌑', '🌒', '🌓', '🌔', '🌕', '🌖', '🌗', '🌘'].map((phase, i) => (
                <div
                  key={i}
                  className={`
                    text-2xl transition-all
                    ${i === 4 ? 'scale-125 opacity-100' : 'opacity-40'}
                  `}
                >
                  {phase}
                </div>
              ))}
            </div>
            {percentage && (
              <div className="mt-2 text-center text-sm text-observatory-gold">
                {percentage}% {t('correlation.lunar.match')}
              </div>
            )}
          </div>
        </div>
      );
    }

    if (type === 'solar') {
      return (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>{t('correlation.solar.kpIndex')}</span>
            <span>{metric.value}</span>
          </div>
          <div className="relative h-12 bg-slate-900 rounded-lg overflow-hidden">
            {/* KP-Index bar visualization */}
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 transition-all"
              style={{ width: `${(Number(metric.value) / 9) * 100}%` }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-sm font-bold text-white mix-blend-difference">
                {metric.value} / 9
              </div>
            </div>
          </div>
          <div className="flex justify-between text-xs text-slate-600">
            <span>{t('correlation.solar.quiet')}</span>
            <span>{t('correlation.solar.storm')}</span>
          </div>
        </div>
      );
    }

    if (type === 'seismic') {
      return (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>{t('correlation.seismic.magnitude')}</span>
            <span>{metric.value}</span>
          </div>
          <div className="flex items-center gap-1">
            {Array.from({ length: 10 }).map((_, i) => {
              const magnitude = Number(metric.value);
              const isActive = i < magnitude;
              return (
                <div
                  key={i}
                  className={`
                    flex-1 h-8 rounded transition-all
                    ${isActive ? 'bg-orange-500/60' : 'bg-slate-800'}
                  `}
                  style={{
                    height: `${(i + 1) * 4}px`,
                  }}
                />
              );
            })}
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <InsightCard
      type="correlation"
      severity="medium"
      icon={Icon}
      title={title}
      description={description}
      metric={{
        value: metric.value,
        label: metric.label,
      }}
      visual={<Visual />}
      cta={
        onExplore
          ? {
              label: t('correlation.cta'),
              onClick: onExplore,
            }
          : undefined
      }
      delay={delay}
    />
  );
}
