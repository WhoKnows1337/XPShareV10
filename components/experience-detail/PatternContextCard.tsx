'use client';

import { motion } from 'framer-motion';
import { TrendingUp, MapPin, Clock, Tag, Bell, Map, MessageCircle, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

interface PatternContextCardProps {
  similarCount: number;
  trendPercentage?: number;
  trendTimeframe?: string;
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
  patternId?: string;
  experienceId: string;
  categoryId?: string;
}

export function PatternContextCard({
  similarCount,
  trendPercentage,
  trendTimeframe = 'last 7 days',
  geographic,
  temporal,
  category,
  patternId,
  experienceId,
  categoryId,
}: PatternContextCardProps) {
  const hasActivePattern = similarCount > 5 || (trendPercentage && trendPercentage > 20);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="glass-card p-4 sm:p-6 space-y-4"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-5 h-5 text-observatory-gold" />
            <h2 className="font-semibold text-base sm:text-lg">
              {hasActivePattern ? 'Active Pattern' : 'Pattern Context'}
            </h2>
          </div>
          <p className="text-sm text-muted-foreground">
            This experience is part of a larger pattern
          </p>
        </div>
        {hasActivePattern && (
          <Badge variant="destructive" className="shrink-0 animate-pulse">
            Hot
          </Badge>
        )}
      </div>

      {/* Mini Visualizations Row */}
      <div className="grid grid-cols-2 gap-3">
        {/* Mini Heatmap */}
        {geographic && (
          <div className="glass-card p-3 space-y-2">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="w-3 h-3" />
              <span>Geographic</span>
            </div>
            {/* Simplified heatmap visualization */}
            <div className="relative h-16 bg-space-light/30 rounded overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl mb-1">📍</div>
                  <div className="text-xs font-medium">{geographic.location}</div>
                </div>
              </div>
              {/* Dots representing other reports */}
              <div className="absolute top-2 left-2 w-2 h-2 rounded-full bg-observatory-gold/60" />
              <div className="absolute top-3 right-4 w-2 h-2 rounded-full bg-observatory-gold/60" />
              <div className="absolute bottom-3 left-1/3 w-2 h-2 rounded-full bg-observatory-gold/60" />
            </div>
            <div className="text-xs text-center">
              <span className="font-semibold">{geographic.count}</span>
              <span className="text-muted-foreground">/{geographic.total} in area</span>
            </div>
          </div>
        )}

        {/* Mini Timeline */}
        {temporal && (
          <div className="glass-card p-3 space-y-2">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              <span>Temporal</span>
            </div>
            {/* Simplified timeline chart */}
            <div className="h-16 flex items-end justify-between gap-1">
              {[20, 30, 15, 40, 25, 50, 70, 85, 90, 75, 60, 80].map((height, idx) => (
                <div
                  key={idx}
                  className="flex-1 bg-gradient-to-t from-blue-500/60 to-blue-400/40 rounded-t transition-all hover:from-blue-500/80 hover:to-blue-400/60"
                  style={{ height: `${height}%` }}
                />
              ))}
            </div>
            <div className="text-xs text-center">
              <span className="font-semibold">{temporal.count}</span>
              <span className="text-muted-foreground">/{temporal.total} {temporal.period}</span>
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Similar Experiences</span>
          <span className="font-semibold">{similarCount} found</span>
        </div>

        {trendPercentage !== undefined && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Trend</span>
            <span className={`font-semibold ${trendPercentage > 0 ? 'text-red-400' : 'text-green-400'}`}>
              {trendPercentage > 0 ? '+' : ''}{trendPercentage}% ({trendTimeframe})
            </span>
          </div>
        )}

        {category && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-1">
              <Tag className="w-3 h-3" />
              Category Match
            </span>
            <span className="font-semibold">
              {category.count}/{category.total} &quot;{category.name}&quot;
            </span>
          </div>
        )}
      </div>

      {/* Pattern Strength Bars */}
      <div className="space-y-2">
        {geographic && (
          <div>
            <div className="flex items-center justify-between mb-1 text-xs">
              <span className="text-muted-foreground">📍 {geographic.location}</span>
              <span className="font-semibold">{Math.round((geographic.count / geographic.total) * 100)}%</span>
            </div>
            <div className="h-1.5 bg-space-light rounded-full overflow-hidden">
              <div
                className="h-full bg-observatory-gold transition-all"
                style={{ width: `${(geographic.count / geographic.total) * 100}%` }}
              />
            </div>
          </div>
        )}

        {temporal && (
          <div>
            <div className="flex items-center justify-between mb-1 text-xs">
              <span className="text-muted-foreground">🕐 {temporal.period}</span>
              <span className="font-semibold">{Math.round((temporal.count / temporal.total) * 100)}%</span>
            </div>
            <div className="h-1.5 bg-space-light rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-400 transition-all"
                style={{ width: `${(temporal.count / temporal.total) * 100}%` }}
              />
            </div>
          </div>
        )}

        {category && (
          <div>
            <div className="flex items-center justify-between mb-1 text-xs">
              <span className="text-muted-foreground">🏷️ {category.name}</span>
              <span className="font-semibold">{Math.round((category.count / category.total) * 100)}%</span>
            </div>
            <div className="h-1.5 bg-space-light rounded-full overflow-hidden">
              <div
                className="h-full bg-success-soft transition-all"
                style={{ width: `${(category.count / category.total) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="pt-2 space-y-2">
        <Button variant="outline" className="w-full justify-between group" asChild>
          <Link href={`/patterns/${patternId || 'explore'}?experience=${experienceId}`}>
            <span>Explore Full Pattern</span>
            <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </Button>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-3 gap-2">
          <Button variant="ghost" size="sm" className="text-xs" asChild>
            <Link href={`/patterns/${patternId}?follow=true`}>
              <Bell className="w-3 h-3 mr-1" />
              Follow
            </Link>
          </Button>
          <Button variant="ghost" size="sm" className="text-xs" asChild>
            <Link href={`/map?pattern=${patternId}`}>
              <Map className="w-3 h-3 mr-1" />
              Map
            </Link>
          </Button>
          <Button variant="ghost" size="sm" className="text-xs" asChild>
            <Link href={`/discussions?topic=${categoryId}`}>
              <MessageCircle className="w-3 h-3 mr-1" />
              Discuss
            </Link>
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
