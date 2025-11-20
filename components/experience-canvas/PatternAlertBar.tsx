'use client';

import { motion } from 'framer-motion';
import { TrendingUp, MapPin, Clock, Users, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface PatternAlertBarProps {
  similarCount: number;
  hasActiveWave?: boolean;
  categoryMatches?: number;
  locationMatches?: number;
  temporalMatches?: number;
  patternStrength?: number;
  category?: string;
  locationText?: string;
  timeframe?: string;
}

export function PatternAlertBar({
  similarCount,
  hasActiveWave = false,
  categoryMatches = 0,
  locationMatches = 0,
  temporalMatches = 0,
  patternStrength = 0,
  category,
  locationText,
  timeframe = '30 days',
}: PatternAlertBarProps) {
  const [dismissed, setDismissed] = useState(false);

  // Don't show if no patterns found
  if (similarCount === 0 || dismissed) return null;

  // Determine the primary insight
  const getPrimaryInsight = () => {
    if (hasActiveWave) {
      return {
        icon: <TrendingUp className="w-4 h-4" />,
        text: `Active Wave Detected`,
        subtext: `${similarCount} similar experiences in ${timeframe}`,
        variant: 'destructive' as const,
      };
    }

    if (locationMatches > 5) {
      return {
        icon: <MapPin className="w-4 h-4" />,
        text: `Geographic Cluster`,
        subtext: `${locationMatches} experiences near ${locationText?.split(',')[0]}`,
        variant: 'default' as const,
      };
    }

    if (categoryMatches > 10) {
      return {
        icon: <Sparkles className="w-4 h-4" />,
        text: `Strong ${category} Pattern`,
        subtext: `${categoryMatches} matching experiences found`,
        variant: 'secondary' as const,
      };
    }

    return {
      icon: <Users className="w-4 h-4" />,
      text: `${similarCount} Similar Experiences`,
      subtext: `Pattern strength: ${patternStrength}%`,
      variant: 'outline' as const,
    };
  };

  const insight = getPrimaryInsight();

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="sticky top-16 z-40 backdrop-blur-xl bg-gradient-to-r from-purple-900/10 via-blue-900/10 to-purple-900/10 border-b border-purple-500/20"
    >
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Primary Insight */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-500/20"
            >
              {insight.icon}
            </motion.div>

            <div className="flex items-center gap-2 flex-wrap min-w-0">
              <Badge variant={insight.variant} className="whitespace-nowrap">
                {insight.text}
              </Badge>
              <span className="text-xs text-muted-foreground truncate">
                {insight.subtext}
              </span>
            </div>
          </div>

          {/* Right: Quick Stats */}
          <div className="hidden md:flex items-center gap-4 text-xs text-muted-foreground">
            {categoryMatches > 0 && (
              <div className="flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                <span>{categoryMatches} category</span>
              </div>
            )}
            {locationMatches > 0 && (
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                <span>{locationMatches} nearby</span>
              </div>
            )}
            {temporalMatches > 0 && (
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{temporalMatches} temporal</span>
              </div>
            )}
          </div>

          {/* Dismiss Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDismissed(true)}
            className="h-7 text-xs"
          >
            Dismiss
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
