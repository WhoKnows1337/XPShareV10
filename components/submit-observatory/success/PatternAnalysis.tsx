'use client';

import { TrendingUp, Clock, MapPin, Tag } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface PatternData {
  geographic?: {
    count: number;
    total: number;
    location: string;
  };
  temporal?: {
    count: number;
    total: number;
    period: string;
  };
  category?: {
    count: number;
    total: number;
    name: string;
  };
  trends?: Array<{
    label: string;
    value: string;
    change?: number;
    icon: 'trending' | 'clock';
  }>;
}

interface PatternAnalysisProps {
  data: PatternData;
}

export function PatternAnalysis({ data }: PatternAnalysisProps) {
  const t = useTranslations('submit.success.patterns');

  const hasPatterns = data.geographic || data.temporal || data.category;

  if (!hasPatterns) {
    return null;
  }

  return (
    <div className="glass-card p-6 animate-fade-in" style={{ animationDelay: '400ms' }}>
      <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
        <TrendingUp className="w-4 h-4 text-observatory-gold" />
        {t('title')}
      </h2>

      <div className="space-y-3">
        {/* Geographic Cluster */}
        {data.geographic && (
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-text-secondary flex items-center gap-1.5">
                <MapPin className="w-3 h-3" />
                {t('geographic')}
              </span>
              <span className="text-xs font-semibold text-text-primary">
                {data.geographic.count}/{data.geographic.total} {t('in')} {data.geographic.location}
              </span>
            </div>
            <div className="h-1.5 bg-space-light rounded-full overflow-hidden">
              <div
                className="h-full bg-observatory-gold transition-all"
                style={{
                  width: `${(data.geographic.count / data.geographic.total) * 100}%`,
                }}
              />
            </div>
          </div>
        )}

        {/* Time Pattern */}
        {data.temporal && (
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-text-secondary flex items-center gap-1.5">
                <Clock className="w-3 h-3" />
                {t('temporal')}
              </span>
              <span className="text-xs font-semibold text-text-primary">
                {data.temporal.count}/{data.temporal.total} {t('during')} {data.temporal.period}
              </span>
            </div>
            <div className="h-1.5 bg-space-light rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-400 transition-all"
                style={{
                  width: `${(data.temporal.count / data.temporal.total) * 100}%`,
                }}
              />
            </div>
          </div>
        )}

        {/* Category Match */}
        {data.category && (
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-text-secondary flex items-center gap-1.5">
                <Tag className="w-3 h-3" />
                {t('category')}
              </span>
              <span className="text-xs font-semibold text-text-primary">
                {data.category.count}/{data.category.total} "{data.category.name}"
              </span>
            </div>
            <div className="h-1.5 bg-space-light rounded-full overflow-hidden">
              <div
                className="h-full bg-success-soft transition-all"
                style={{
                  width: `${(data.category.count / data.category.total) * 100}%`,
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Trend Indicators */}
      {data.trends && data.trends.length > 0 && (
        <div className="mt-4 pt-4 border-t border-glass-border">
          <div className="grid grid-cols-2 gap-3">
            {data.trends.map((trend, index) => (
              <div key={index} className="flex items-start gap-2">
                {trend.icon === 'trending' ? (
                  <TrendingUp
                    className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                      trend.change && trend.change > 0 ? 'text-red-400' : 'text-observatory-gold'
                    }`}
                  />
                ) : (
                  <Clock className="w-4 h-4 text-observatory-gold flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <div
                    className={`text-xs font-semibold ${
                      trend.change && trend.change > 0 ? 'text-red-400' : 'text-observatory-gold'
                    }`}>
                    {trend.value}
                    {trend.change && (
                      <span className="ml-1">
                        ({trend.change > 0 ? '+' : ''}
                        {trend.change}%)
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-text-tertiary">{trend.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
