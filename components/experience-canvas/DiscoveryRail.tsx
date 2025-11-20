'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, MapPin, Clock, Sparkles, Eye, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface PatternMatch {
  type: 'category' | 'location' | 'temporal' | 'semantic';
  strength: number;
  count: number;
  label: string;
  description?: string;
}

interface SimilarExperience {
  id: string;
  title: string;
  category: string;
  similarity_score?: number;
  user_profiles?: {
    username: string | null;
    display_name: string | null;
  } | null;
}

interface DiscoveryRailProps {
  similarCount: number;
  patternMatches?: PatternMatch[];
  similarExperiences?: SimilarExperience[];
  hasActiveWave?: boolean;
  patternStrength?: number;
  viewCount?: number;
}

export function DiscoveryRail({
  similarCount,
  patternMatches = [],
  similarExperiences = [],
  hasActiveWave = false,
  patternStrength = 0,
  viewCount = 0,
}: DiscoveryRailProps) {
  return (
    <div className="space-y-4">
      {/* Pattern Strength Card */}
      <Card className="glass-card border-purple-500/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            Pattern Intelligence
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Overall Strength */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Pattern Strength</span>
              <span className="font-semibold">{patternStrength}%</span>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${patternStrength}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
              />
            </div>
          </div>

          {/* Similar Count */}
          <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">Similar Experiences</span>
            </div>
            <Badge variant="secondary">{similarCount}</Badge>
          </div>

          {/* Active Wave Badge */}
          {hasActiveWave && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex items-center gap-2 p-3 bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/30 rounded-lg"
            >
              <TrendingUp className="w-4 h-4 text-red-400" />
              <div className="flex-1">
                <p className="text-xs font-semibold">Active Wave</p>
                <p className="text-xs text-muted-foreground">High activity detected</p>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Pattern Matches */}
      {patternMatches.length > 0 && (
        <Card className="glass-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Pattern Matches</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {patternMatches.map((match, index) => (
              <motion.div
                key={match.type}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center gap-2">
                  {match.type === 'category' && <Sparkles className="w-3 h-3 text-purple-400" />}
                  {match.type === 'location' && <MapPin className="w-3 h-3 text-blue-400" />}
                  {match.type === 'temporal' && <Clock className="w-3 h-3 text-orange-400" />}
                  {match.type === 'semantic' && <Eye className="w-3 h-3 text-green-400" />}
                  <div className="flex-1">
                    <p className="text-xs font-medium">{match.label}</p>
                    {match.description && (
                      <p className="text-xs text-muted-foreground">{match.description}</p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold">{match.count}</p>
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-1 h-1 rounded-full ${
                          i < Math.floor(match.strength / 20)
                            ? 'bg-observatory-gold'
                            : 'bg-white/20'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Similar Experiences Preview */}
      {similarExperiences.length > 0 && (
        <Card className="glass-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Similar Experiences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {similarExperiences.slice(0, 5).map((exp, index) => (
              <motion.div
                key={exp.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  href={`/experiences/${exp.id}`}
                  className="block p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{exp.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {exp.category}
                        </Badge>
                        {exp.similarity_score && (
                          <span className="text-xs text-muted-foreground">
                            {Math.round(exp.similarity_score * 100)}% match
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}

            {similarExperiences.length > 5 && (
              <Link
                href={`#similar-experiences`}
                className="block text-xs text-center text-primary hover:underline pt-2"
              >
                View all {similarExperiences.length} similar experiences →
              </Link>
            )}
          </CardContent>
        </Card>
      )}

      {/* Live Stats */}
      <Card className="glass-card border-green-500/20">
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs text-muted-foreground">Live Views</span>
            </div>
            <span className="text-sm font-semibold">{viewCount || 0}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
