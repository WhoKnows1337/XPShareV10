'use client';

import { Waves, MapPin, Users } from 'lucide-react';
import { InsightCard } from './InsightCard';
import { useTranslations } from 'next-intl';

interface WaveAlertCardProps {
  count: number;
  location: string;
  timeframe: string;
  trend?: number; // percentage increase
  onExplore?: () => void;
  delay?: number;
}

export function WaveAlertCard({
  count,
  location,
  timeframe,
  trend,
  onExplore,
  delay = 0,
}: WaveAlertCardProps) {
  const t = useTranslations('submit.insights');

  // Mini heatmap visualization
  const MiniHeatmap = () => (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>{t('waveAlert.recentActivity', 'Recent Activity')}</span>
        <span>{count} {t('waveAlert.reports', 'reports')}</span>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: 28 }).map((_, i) => {
          // Simulate heatmap intensity (more recent = more intense)
          const isRecent = i >= 21;
          const intensity = isRecent
            ? Math.random() > 0.3
              ? 'high'
              : 'medium'
            : Math.random() > 0.7
            ? 'low'
            : 'none';

          return (
            <div
              key={i}
              className={`
                aspect-square rounded-sm
                ${intensity === 'high' ? 'bg-red-500/60' : ''}
                ${intensity === 'medium' ? 'bg-observatory-gold/40' : ''}
                ${intensity === 'low' ? 'bg-observatory-accent/20' : ''}
                ${intensity === 'none' ? 'bg-slate-800' : ''}
              `}
              title={`Day ${i + 1}`}
            />
          );
        })}
      </div>
      <div className="flex items-center justify-between text-xs text-slate-600">
        <span>4 weeks ago</span>
        <span>Today</span>
      </div>
    </div>
  );

  const description = trend
    ? t(
        'waveAlert.descriptionWithTrend',
        `${count} similar experiences reported in ${location} within ${timeframe}. This is a ${trend}% increase compared to the previous period.`,
        { count, location, timeframe, trend }
      )
    : t(
        'waveAlert.description',
        `${count} similar experiences reported in ${location} within ${timeframe}.`,
        { count, location, timeframe }
      );

  return (
    <InsightCard
      type="wave-detection"
      severity="high"
      icon={Waves}
      title={t('waveAlert.title', '🌊 Wave Detection Alert!')}
      description={description}
      metric={{
        value: count,
        label: t('waveAlert.similar', 'similar reports'),
        trend: trend && trend > 0 ? 'up' : undefined,
      }}
      visual={<MiniHeatmap />}
      cta={
        onExplore
          ? {
              label: t('waveAlert.cta', 'Explore Wave Map'),
              onClick: onExplore,
            }
          : undefined
      }
      delay={delay}
    />
  );
}
