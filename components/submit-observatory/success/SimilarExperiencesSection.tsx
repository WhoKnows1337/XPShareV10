'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { GitBranch, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface SimilarExperience {
  id: string;
  title: string;
  summary: string;
  category: string;
  date: string;
  matchScore: number;
  matchReasons: string[];
}

interface SimilarExperiencesSectionProps {
  experienceId: string;
}

export function SimilarExperiencesSection({ experienceId }: SimilarExperiencesSectionProps) {
  const t = useTranslations('submit.success.similar');
  const [similar, setSimilar] = useState<SimilarExperience[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSimilarExperiences();
  }, [experienceId]);

  const fetchSimilarExperiences = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/submit/find-similar?experienceId=${experienceId}`);
      if (response.ok) {
        const data = await response.json();
        setSimilar(data.similar || []);
      }
    } catch (error) {
      console.error('Failed to fetch similar experiences:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="glass-card p-8">
        <h2 className="section-title-observatory mb-6 flex items-center gap-2">
          <GitBranch className="w-5 h-5 text-observatory-gold" />
          {t('title', 'Ähnliche Erfahrungen')}
        </h2>
        <div className="text-center py-8 text-text-tertiary">
          {t('loading', 'Suche ähnliche Muster...')}
        </div>
      </div>
    );
  }

  if (similar.length === 0) {
    return (
      <div className="glass-card p-8">
        <h2 className="section-title-observatory mb-6 flex items-center gap-2">
          <GitBranch className="w-5 h-5 text-observatory-gold" />
          {t('title', 'Ähnliche Erfahrungen')}
        </h2>
        <div className="text-center py-8">
          <div className="text-4xl mb-3">🌟</div>
          <div className="text-text-secondary">
            {t('noSimilar', 'Deine Erfahrung ist einzigartig! Noch keine ähnlichen Muster gefunden.')}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-8">
      <h2 className="section-title-observatory mb-6 flex items-center gap-2">
        <GitBranch className="w-5 h-5 text-observatory-gold" />
        {t('title', 'Ähnliche Erfahrungen')}
      </h2>

      <p className="text-sm text-text-secondary mb-6">
        {t(
          'description',
          'Diese Erfahrungen haben ähnliche Muster oder Merkmale wie deine. Erkunde sie, um mehr zu erfahren.'
        )}
      </p>

      <div className="space-y-4">
        {similar.map((exp) => (
          <Link
            key={exp.id}
            href={`/experiences/${exp.id}`}
            className="block glass-card-accent p-5 hover:bg-space-deep/40 transition-all group"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-text-primary group-hover:text-observatory-gold transition-colors">
                    {exp.title}
                  </h3>
                  <span className="badge-observatory text-xs">
                    {Math.round(exp.matchScore * 100)}% Match
                  </span>
                </div>
                <p className="text-sm text-text-secondary mb-3 line-clamp-2">
                  {exp.summary}
                </p>
                <div className="flex flex-wrap items-center gap-3 text-xs text-text-tertiary">
                  <span className="px-2 py-1 bg-observatory-gold/10 border border-observatory-gold/30 rounded">
                    {exp.category}
                  </span>
                  <span>{new Date(exp.date).toLocaleDateString()}</span>
                  {exp.matchReasons.length > 0 && (
                    <span className="text-observatory-gold">
                      • {exp.matchReasons.join(', ')}
                    </span>
                  )}
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-text-tertiary group-hover:text-observatory-gold group-hover:translate-x-1 transition-all flex-shrink-0" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
