'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { FilterSortBar, type FilterOptions } from '@/components/experience-canvas/FilterSortBar';
import { MatchExplanation } from '@/components/experience-canvas/MatchExplanation';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface SimilarExperience {
  id: string;
  title: string;
  category: string;
  similarity_score?: number;
  location_text?: string;
  time_of_day?: string;
  created_at: string;
  user_profiles?: {
    username: string | null;
    display_name: string | null;
  } | null;
}

interface EnhancedListTabProps {
  experiences: SimilarExperience[];
  currentCategory: string;
  currentLocation?: string;
  currentTimeOfDay?: string;
}

export function EnhancedListTab({
  experiences,
  currentCategory,
  currentLocation,
  currentTimeOfDay,
}: EnhancedListTabProps) {
  const [filters, setFilters] = useState<FilterOptions>({
    locations: [],
    timeRange: 'all',
    minMatchScore: 0,
    sortBy: 'similarity',
  });

  // Extract unique locations from experiences
  const availableLocations = useMemo(() => {
    const locations = new Set<string>();
    experiences.forEach((exp) => {
      if (exp.location_text) {
        const location = exp.location_text.split(',')[0].trim();
        locations.add(location);
      }
    });
    return Array.from(locations).slice(0, 10); // Top 10 locations
  }, [experiences]);

  // Apply filters
  const filteredExperiences = useMemo(() => {
    let filtered = [...experiences];

    // Location filter
    if (filters.locations.length > 0) {
      filtered = filtered.filter((exp) => {
        if (!exp.location_text) return false;
        const location = exp.location_text.split(',')[0].trim();
        return filters.locations.includes(location);
      });
    }

    // Time range filter
    if (filters.timeRange !== 'all') {
      const now = new Date();
      const cutoff = new Date();
      if (filters.timeRange === '7d') {
        cutoff.setDate(now.getDate() - 7);
      } else if (filters.timeRange === '30d') {
        cutoff.setDate(now.getDate() - 30);
      }
      filtered = filtered.filter((exp) => new Date(exp.created_at) >= cutoff);
    }

    // Match score filter
    if (filters.minMatchScore > 0) {
      filtered = filtered.filter((exp) => {
        const score = exp.similarity_score ? Math.round(exp.similarity_score * 100) : 0;
        return score >= filters.minMatchScore;
      });
    }

    // Sort
    filtered.sort((a, b) => {
      if (filters.sortBy === 'similarity') {
        return (b.similarity_score || 0) - (a.similarity_score || 0);
      } else if (filters.sortBy === 'recent') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      // 'closest' - would need distance calculation, fallback to similarity
      return (b.similarity_score || 0) - (a.similarity_score || 0);
    });

    return filtered;
  }, [experiences, filters]);

  // Calculate match reasons for each experience
  const calculateMatchReasons = (exp: SimilarExperience) => {
    const reasons = [];

    // Category match
    if (exp.category === currentCategory) {
      reasons.push({
        type: 'category' as const,
        label: 'Same Category',
        value: exp.category,
        strength: 90,
      });
    }

    // Location match
    if (exp.location_text && currentLocation) {
      const expLoc = exp.location_text.split(',')[0].trim();
      const currLoc = currentLocation.split(',')[0].trim();
      if (expLoc === currLoc) {
        reasons.push({
          type: 'location' as const,
          label: 'Same Location',
          value: expLoc,
          strength: 85,
        });
      }
    }

    // Time of day match
    if (exp.time_of_day && currentTimeOfDay && exp.time_of_day === currentTimeOfDay) {
      reasons.push({
        type: 'temporal' as const,
        label: 'Same Time of Day',
        value: exp.time_of_day,
        strength: 75,
      });
    }

    // Semantic similarity (always present)
    if (exp.similarity_score) {
      reasons.push({
        type: 'semantic' as const,
        label: 'Content Similarity',
        value: `${Math.round(exp.similarity_score * 100)}% semantic match`,
        strength: Math.round(exp.similarity_score * 100),
      });
    }

    return reasons;
  };

  return (
    <div className="container mx-auto px-4 space-y-6">
      {/* Filter and Sort Bar */}
      <FilterSortBar
        availableLocations={availableLocations}
        onFilterChange={setFilters}
        totalCount={experiences.length}
        filteredCount={filteredExperiences.length}
      />

      <div className="grid grid-cols-1 gap-6">
        {/* Similar Experiences List */}
        {filteredExperiences.map((exp, index) => {
          const matchReasons = calculateMatchReasons(exp);
          const similarityScore = exp.similarity_score ? Math.round(exp.similarity_score * 100) : 0;

          return (
            <motion.div
              key={exp.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="glass-card hover:bg-white/5 transition-colors">
                <CardContent className="p-6 space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/experiences/${exp.id}`}
                        className="block group"
                      >
                        <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                          {exp.title}
                        </h3>
                      </Link>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline" className="capitalize">
                          {exp.category}
                        </Badge>
                        {exp.location_text && (
                          <Badge variant="secondary" className="text-xs">
                            {exp.location_text.split(',')[0]}
                          </Badge>
                        )}
                        {exp.user_profiles && (
                          <span className="text-xs text-muted-foreground">
                            by {exp.user_profiles.display_name || exp.user_profiles.username}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Similarity Score */}
                    {exp.similarity_score && (
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">
                          {similarityScore}%
                        </div>
                        <p className="text-xs text-muted-foreground">match</p>
                      </div>
                    )}
                  </div>

                  {/* Timestamp */}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span>
                      {formatDistanceToNow(new Date(exp.created_at), { addSuffix: true })}
                    </span>
                  </div>

                  {/* Match Explanation */}
                  {matchReasons.length > 0 && (
                    <MatchExplanation
                      experienceId={exp.id}
                      similarityScore={exp.similarity_score || 0}
                      reasons={matchReasons}
                      compact={true}
                    />
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}

        {/* Empty State */}
        {filteredExperiences.length === 0 && (
          <Card className="glass-card">
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">
                No experiences match your current filters.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Try adjusting your filters or clearing them to see more results.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
