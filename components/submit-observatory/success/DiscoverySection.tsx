'use client';

import { Globe, Clock, MapPin, Eye, ArrowRight, Filter } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { useState } from 'react';

interface SimilarExperience {
  id: string;
  title: string;
  summary: string;
  category: string;
  date: string;
  matchScore: number;
  matchReasons: string[];
  location?: string;
  viewCount?: number;
}

interface DiscoverySectionProps {
  similarExperiences: SimilarExperience[];
  experienceId: string;
}

export function DiscoverySection({ similarExperiences, experienceId }: DiscoverySectionProps) {
  const t = useTranslations('submit.success');
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const similarCount = similarExperiences.length;

  if (similarCount === 0) {
    return (
      <div className="glass-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Globe className="w-5 h-5 text-observatory-gold" />
          <h2 className="text-lg font-bold text-text-primary">
            {t('discovery.title')}
          </h2>
        </div>
        <div className="text-center py-8">
          <div className="text-4xl mb-3">🌟</div>
          <div className="text-sm text-text-secondary">
            {t('discovery.noSimilar')}
          </div>
          <p className="text-xs text-text-tertiary mt-2">
            {t('discovery.firstOfKind')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-6 animate-fade-in" style={{ animationDelay: '200ms' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-observatory-gold" />
          <h2 className="text-lg font-bold text-text-primary">
            {similarCount} {t('discovery.similarFound')}
          </h2>
        </div>
        <Link
          href={`/discover?similar=${experienceId}`}
          className="text-sm text-observatory-gold hover:underline
                     flex items-center gap-1 group">
          {t('discovery.viewAll')}
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Preview Cards - Horizontal Scroll */}
      <div className="overflow-x-auto pb-2 -mx-2 px-2 mb-4">
        <div className="flex gap-3 min-w-max">
          {similarExperiences.slice(0, 4).map((exp, index) => (
            <Link
              key={exp.id}
              href={`/experiences/${exp.id}`}
              className="glass-card-accent p-4 w-64
                         hover:bg-space-deep/60 transition-all
                         group animate-fade-in"
              style={{ animationDelay: `${300 + index * 100}ms` }}>
              {/* Timeline Badge */}
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-3 h-3 text-text-tertiary" />
                <span className="text-xs text-text-tertiary">
                  {formatDistanceToNow(new Date(exp.date), { addSuffix: true })}
                </span>
              </div>

              {/* Title */}
              <h3 className="text-sm font-semibold mb-1 line-clamp-2
                             group-hover:text-observatory-gold transition-colors">
                {exp.title}
              </h3>

              {/* Excerpt */}
              <p className="text-xs text-text-secondary line-clamp-2 mb-3">
                {exp.summary}
              </p>

              {/* Meta */}
              <div className="flex items-center justify-between text-xs mb-3">
                {exp.location && (
                  <div className="flex items-center gap-1 text-text-tertiary">
                    <MapPin className="w-3 h-3" />
                    <span className="truncate max-w-[100px]">{exp.location}</span>
                  </div>
                )}
                {exp.viewCount !== undefined && (
                  <div className="flex items-center gap-1 text-text-tertiary">
                    <Eye className="w-3 h-3" />
                    {exp.viewCount}
                  </div>
                )}
              </div>

              {/* Similarity Score */}
              <div className="pt-2 border-t border-glass-border">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1 bg-space-light rounded-full overflow-hidden">
                    <div
                      className="h-full bg-observatory-gold transition-all"
                      style={{ width: `${Math.round(exp.matchScore * 100)}%` }}
                    />
                  </div>
                  <span className="text-xs text-observatory-gold font-semibold">
                    {Math.round(exp.matchScore * 100)}%
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex gap-2 pt-4 border-t border-glass-border">
        <button
          onClick={() => setActiveFilter(activeFilter === 'location' ? null : 'location')}
          className={`px-3 py-1.5 text-xs rounded transition-all
                     flex items-center gap-1.5
                     ${
                       activeFilter === 'location'
                         ? 'bg-observatory-accent-dim text-text-primary'
                         : 'border border-glass-border hover:bg-space-mid text-text-secondary'
                     }`}>
          <MapPin className="w-3 h-3" />
          {t('discovery.filters.location')}
        </button>
        <button
          onClick={() => setActiveFilter(activeFilter === 'time' ? null : 'time')}
          className={`px-3 py-1.5 text-xs rounded transition-all
                     flex items-center gap-1.5
                     ${
                       activeFilter === 'time'
                         ? 'bg-observatory-accent-dim text-text-primary'
                         : 'border border-glass-border hover:bg-space-mid text-text-secondary'
                     }`}>
          <Clock className="w-3 h-3" />
          {t('discovery.filters.time')}
        </button>
        <button
          onClick={() => setActiveFilter(activeFilter === 'category' ? null : 'category')}
          className={`px-3 py-1.5 text-xs rounded transition-all
                     flex items-center gap-1.5
                     ${
                       activeFilter === 'category'
                         ? 'bg-observatory-accent-dim text-text-primary'
                         : 'border border-glass-border hover:bg-space-mid text-text-secondary'
                     }`}>
          <Filter className="w-3 h-3" />
          {t('discovery.filters.category')}
        </button>
      </div>
    </div>
  );
}
