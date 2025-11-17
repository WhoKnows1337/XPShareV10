'use client';

import { TrendingUp, Calendar } from 'lucide-react';
import { InsightCard } from './InsightCard';
import { useTranslations } from 'next-intl';

interface TemporalPatternCardProps {
  period: string; // e.g., "November 2024"
  count: number;
  trend: number; // percentage increase
  comparison: string; // e.g., "vs. previous month"
  onExplore?: () => void;
  delay?: number;
}

export function TemporalPatternCard({
  period,
  count,
  trend,
  comparison,
  onExplore,
  delay = 0,
}: TemporalPatternCardProps) {
  const t = useTranslations('submit.insights');

  // Mini timeline visualization
  const MiniTimeline = () => {
    // Simulate data for past 12 periods
    const data = Array.from({ length: 12 }).map((_, i) => {
      const isCurrentPeriod = i === 11;
      // Simulate spike in current period
      return isCurrentPeriod ? count : Math.floor(Math.random() * (count / 2));
    });

    const maxValue = Math.max(...data);

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>{t('temporal.activity')}</span>
          <span>{count} {t('temporal.reports')}</span>
        </div>
        <div className="flex items-end gap-1 h-16">
          {data.map((value, i) => {
            const height = (value / maxValue) * 100;
            const isLast = i === data.length - 1;

            return (
              <div
                key={i}
                className="flex-1 flex flex-col justify-end"
              >
                <div
                  className={`
                    rounded-t transition-all
                    ${isLast
                      ? 'bg-gradient-to-t from-observatory-gold to-observatory-accent'
                      : 'bg-slate-700'
                    }
                  `}
                  style={{ height: `${height}%` }}
                />
              </div>
            );
          })}
        </div>
        <div className="flex items-center justify-between text-xs text-slate-600">
          <span>12 months ago</span>
          <span className="text-observatory-gold">{period}</span>
        </div>
      </div>
    );
  };

  const description = t(
    'temporal.description',
    { count, period, trend, comparison }
  );

  return (
    <InsightCard
      type="temporal"
      severity="medium"
      icon={Calendar}
      title={t('temporal.title')}
      description={description}
      metric={{
        value: `+${trend}%`,
        label: t('temporal.increase'),
        trend: 'up',
      }}
      visual={<MiniTimeline />}
      cta={
        onExplore
          ? {
              label: t('temporal.cta'),
              onClick: onExplore,
            }
          : undefined
      }
      delay={delay}
    />
  );
}
