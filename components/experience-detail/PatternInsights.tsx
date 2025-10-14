'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, TrendingUp, MapPin, Clock, Sparkles } from 'lucide-react';
import Link from 'next/link';

interface PatternInsight {
  id: string;
  experience_id: string;
  pattern_type: 'attribute_correlation' | 'category_correlation' | 'geographic_cluster' | 'temporal_pattern' | 'co_occurrence';
  insight_data: {
    similar_experiences?: Array<{
      experience_id: string;
      similarity_score: number;
      shared_count: number;
    }>;
    correlations?: Array<{
      attribute_key: string;
      attribute_value: string;
      percentage: number;
    }>;
    geographic?: Array<{
      location: string;
      count: number;
    }>;
  };
  strength: number;
  created_at: string;
  expires_at: string;
}

interface PatternInsightsProps {
  experienceId: string;
}

export function PatternInsights({ experienceId }: PatternInsightsProps) {
  const [insights, setInsights] = useState<PatternInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchInsights();
  }, [experienceId]);

  const fetchInsights = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/patterns/analyze?experienceId=${experienceId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch insights');
      }

      const data = await response.json();
      setInsights(data.insights || []);
    } catch (err: any) {
      console.error('Error fetching pattern insights:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-observatory-gold" />
            Pattern Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-observatory-gold" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="glass-card border-red-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-400">
            <Sparkles className="w-5 h-5" />
            Pattern Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-text-secondary">
            Pattern-Analyse konnte nicht geladen werden.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (insights.length === 0) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-observatory-gold" />
            Pattern Insights
          </CardTitle>
          <CardDescription>
            Muster werden im Hintergrund analysiert...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-text-secondary">
            Pattern-Erkenntnisse werden nach der Veröffentlichung generiert und erscheinen hier.
          </p>
        </CardContent>
      </Card>
    );
  }

  const correlationInsight = insights.find(i => i.pattern_type === 'attribute_correlation');
  const similarExperiences = correlationInsight?.insight_data?.similar_experiences || [];

  return (
    <div className="space-y-4">
      {/* Similar Experiences */}
      {similarExperiences.length > 0 && (
        <Card className="glass-card border-observatory-gold/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="w-5 h-5 text-observatory-gold" />
              Ähnliche Erfahrungen
            </CardTitle>
            <CardDescription>
              {similarExperiences.length} Erfahrungen mit ähnlichen Attributen gefunden
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {similarExperiences.slice(0, 5).map((similar) => (
              <Link
                key={similar.experience_id}
                href={`/experiences/${similar.experience_id}`}
                className="block"
              >
                <div className="glass-card-accent p-4 hover:bg-space-deep/40 transition-all group">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className="text-xs bg-observatory-gold/10 border-observatory-gold/30"
                        >
                          {Math.round(similar.similarity_score * 100)}% ähnlich
                        </Badge>
                        <span className="text-xs text-text-secondary">
                          {similar.shared_count} gemeinsame Attribute
                        </span>
                      </div>
                    </div>
                    <span className="text-observatory-gold group-hover:translate-x-1 transition-transform">
                      →
                    </span>
                  </div>
                </div>
              </Link>
            ))}

            {similarExperiences.length > 5 && (
              <p className="text-xs text-text-secondary text-center pt-2">
                +{similarExperiences.length - 5} weitere ähnliche Erfahrungen
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Pattern Strength Badge */}
      {correlationInsight && (
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-observatory-gold/10 border border-observatory-gold/30 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-observatory-gold" />
                </div>
                <div>
                  <p className="text-sm font-medium text-text-primary">
                    Pattern Stärke
                  </p>
                  <p className="text-xs text-text-secondary">
                    Basierend auf Attribut-Korrelationen
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-observatory-gold">
                  {Math.round(correlationInsight.strength * 100)}%
                </p>
                <p className="text-xs text-text-secondary">
                  Übereinstimmung
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info Footer */}
      <div className="text-center">
        <p className="text-xs text-text-secondary">
          Pattern-Insights werden automatisch im Hintergrund generiert und alle 30 Tage aktualisiert.
        </p>
      </div>
    </div>
  );
}
