'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface SimilarExperience {
  id: string;
  title: string;
  category: string;
  similarity_score: number;
  shared_attributes: Record<string, string>;
  shared_count: number;
  created_at: string;
  user_profiles?: {
    username: string;
    display_name?: string;
    avatar_url?: string;
  };
}

interface AttributeBasedSimilarProps {
  experienceId: string;
  limit?: number;
}

export function AttributeBasedSimilar({ experienceId, limit = 8 }: AttributeBasedSimilarProps) {
  const [similar, setSimilar] = useState<SimilarExperience[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSimilar();
  }, [experienceId]);

  const fetchSimilar = async () => {
    try {
      setLoading(true);

      const response = await fetch(`/api/experiences/similar-by-attributes?experienceId=${experienceId}&limit=${limit}`);

      if (!response.ok) {
        throw new Error('Failed to fetch similar experiences');
      }

      const data = await response.json();
      setSimilar(data.experiences || []);
    } catch (err) {
      console.error('Error fetching similar experiences:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-observatory-gold" />
            Ähnliche Erfahrungen
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="glass-card-accent p-4">
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-3 w-3/4" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (similar.length === 0) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-observatory-gold" />
            Ähnliche Erfahrungen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-text-secondary">
            <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Noch keine ähnlichen Erfahrungen gefunden</p>
            <p className="text-xs mt-1">
              Pattern-Matching läuft im Hintergrund
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card border-observatory-gold/20">
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-observatory-gold" />
          Ähnliche Erfahrungen
        </CardTitle>
        <CardDescription className="text-xs">
          Basierend auf gemeinsamen Attributen
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {similar.map((exp, index) => (
          <motion.div
            key={exp.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link href={`/experiences/${exp.id}`}>
              <div className="glass-card-accent p-4 hover:bg-space-deep/40 transition-all group cursor-pointer">
                {/* Similarity Score */}
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-text-primary group-hover:text-observatory-gold transition-colors line-clamp-2">
                      {exp.title}
                    </h4>
                    <p className="text-xs text-text-secondary mt-1">
                      {exp.user_profiles?.display_name || exp.user_profiles?.username || 'Anonymous'}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className="shrink-0 bg-observatory-gold/10 border-observatory-gold/30 text-observatory-gold"
                  >
                    {Math.round(exp.similarity_score * 100)}%
                  </Badge>
                </div>

                {/* Shared Attributes */}
                <div className="flex items-center gap-2 flex-wrap mt-3">
                  <span className="text-xs text-text-secondary">
                    {exp.shared_count} gemeinsame{exp.shared_count === 1 ? 's' : ''} Attribut{exp.shared_count !== 1 ? 'e' : ''}:
                  </span>
                  {Object.entries(exp.shared_attributes).slice(0, 3).map(([key, value]) => (
                    <Badge
                      key={key}
                      variant="secondary"
                      className="text-xs bg-space-deep/60 border-observatory-gold/20"
                    >
                      {value}
                    </Badge>
                  ))}
                  {Object.keys(exp.shared_attributes).length > 3 && (
                    <span className="text-xs text-text-secondary">
                      +{Object.keys(exp.shared_attributes).length - 3}
                    </span>
                  )}
                </div>

                {/* Arrow indicator */}
                <div className="flex items-center justify-end mt-3">
                  <ArrowRight className="w-4 h-4 text-observatory-gold group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          </motion.div>
        ))}

        {similar.length >= limit && (
          <div className="text-center pt-2">
            <Link
              href={`/browse?similar_to=${experienceId}`}
              className="text-xs text-observatory-gold hover:underline"
            >
              Alle ähnlichen Erfahrungen anzeigen →
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
