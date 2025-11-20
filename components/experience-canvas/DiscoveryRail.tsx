'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, MapPin, Clock, Sparkles, Eye, Users, Zap, BarChart3 } from 'lucide-react';
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

interface LocationCluster {
  location: string;
  count: number;
  lat?: number;
  lng?: number;
}

interface ImpactMetrics {
  totalViews?: number;
  totalComments?: number;
  totalLikes?: number;
  shareCount?: number;
  contributionScore?: number;
}

interface DiscoveryRailProps {
  similarCount: number;
  patternMatches?: PatternMatch[];
  similarExperiences?: SimilarExperience[];
  hasActiveWave?: boolean;
  patternStrength?: number;
  viewCount?: number;

  // New props
  locationClusters?: LocationCluster[];
  currentLocation?: {
    lat: number;
    lng: number;
    text: string;
  };
  impactMetrics?: ImpactMetrics;
}

export function DiscoveryRail({
  similarCount,
  patternMatches = [],
  similarExperiences = [],
  hasActiveWave = false,
  patternStrength = 0,
  viewCount = 0,
  locationClusters = [],
  currentLocation,
  impactMetrics,
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

      {/* Geographic Mini Map */}
      {(locationClusters.length > 0 || currentLocation) && (
        <Card className="glass-card border-blue-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-400" />
              Geographic Clusters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Mini Map Visualization */}
            <div className="relative h-32 bg-white/5 rounded-lg overflow-hidden">
              <svg viewBox="0 0 200 100" className="w-full h-full">
                {/* Map background grid */}
                <defs>
                  <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
                  </pattern>
                </defs>
                <rect width="200" height="100" fill="url(#grid)" />

                {/* Current location marker */}
                {currentLocation && (
                  <motion.circle
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    cx="100"
                    cy="50"
                    r="4"
                    fill="rgb(59, 130, 246)"
                    stroke="white"
                    strokeWidth="1"
                  />
                )}

                {/* Location clusters as circles */}
                {locationClusters.slice(0, 5).map((cluster, index) => {
                  const angle = (index / Math.max(locationClusters.length, 1)) * Math.PI * 2;
                  const radius = 30 + (index * 5);
                  const x = 100 + Math.cos(angle) * radius;
                  const y = 50 + Math.sin(angle) * radius;
                  const size = Math.min(8, 3 + cluster.count / 2);

                  return (
                    <motion.g key={index} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: index * 0.1 }}>
                      <circle
                        cx={x}
                        cy={y}
                        r={size}
                        fill="rgba(168, 85, 247, 0.3)"
                        stroke="rgb(168, 85, 247)"
                        strokeWidth="1"
                      />
                      <circle
                        cx={x}
                        cy={y}
                        r={size / 2}
                        fill="rgb(168, 85, 247)"
                      />
                    </motion.g>
                  );
                })}
              </svg>

              {/* Overlay label */}
              {currentLocation && (
                <div className="absolute bottom-2 left-2 px-2 py-1 bg-background/80 backdrop-blur rounded text-xs">
                  <MapPin className="w-3 h-3 inline mr-1 text-blue-400" />
                  {currentLocation.text.split(',')[0]}
                </div>
              )}
            </div>

            {/* Location cluster list */}
            {locationClusters.length > 0 && (
              <div className="space-y-1">
                {locationClusters.slice(0, 3).map((cluster, index) => (
                  <div key={index} className="flex items-center justify-between text-xs p-1.5 bg-white/5 rounded">
                    <span className="text-muted-foreground truncate flex-1">{cluster.location}</span>
                    <Badge variant="outline" className="text-xs ml-2">{cluster.count}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Your Impact Widget (so.md mockup style) */}
      {impactMetrics && (
        <Card className="glass-card border-yellow-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-400" />
              YOUR IMPACT
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* XP Earned */}
            <div className="text-center p-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-lg">
              <p className="text-lg font-bold text-yellow-400">+50 XP earned</p>
            </div>

            {/* Badges Count */}
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🏆</span>
                <span className="text-sm font-medium">Badges</span>
              </div>
              <Badge variant="secondary" className="text-sm">2</Badge>
            </div>

            {/* Trending Badge */}
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-2xl">📈</span>
                <span className="text-sm font-medium">Trending</span>
              </div>
              <Badge variant="outline" className="text-xs bg-gradient-to-r from-red-500/20 to-orange-500/20 border-red-500/30 text-red-400">
                Active
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
