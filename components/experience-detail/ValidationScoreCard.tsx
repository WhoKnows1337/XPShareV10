'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { CheckCircle, TrendingUp, Waves, Info } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

/**
 * ValidationScoreCard - Phase 2, Task 2.1
 *
 * Primary trust signal showing similar count and match quality.
 * Displays trending/wave badges when applicable.
 *
 * @see docs/maindocs/xpresultsv2/04-components-spec.md - Section 3
 * @see docs/maindocs/xpresultsv2/09-plan.md - Phase 2, Task 2.1
 * @see docs/maindocs/xpresultsv2/07-animation-specs.md - Section 3 (Count-up animation)
 */

interface ValidationScoreCardProps {
  experienceId: string;
  simpleMode?: boolean;
}

interface ValidationAPIResponse {
  similar_count: number;
  avg_match_quality: number;
  is_trending: boolean;
  is_in_wave: boolean;
  pattern_confidence: number;
}

export function ValidationScoreCard({
  experienceId,
  simpleMode = false,
}: ValidationScoreCardProps) {
  const [hasAnimated, setHasAnimated] = useState(false);

  // Fetch validation metrics
  const { data, isLoading } = useQuery<ValidationAPIResponse>({
    queryKey: ['validation', experienceId],
    queryFn: async () => {
      const res = await fetch(`/api/experiences/${experienceId}/validation`);
      if (!res.ok) throw new Error('Failed to fetch validation data');
      return res.json();
    },
  });

  // Loading skeleton
  if (isLoading) {
    return (
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-6 w-24" />
              </div>
            </div>
            <Skeleton className="h-16 w-16 rounded-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  // Fallback auf 0 wenn API null/undefined zurückgibt
  const similar_count = data.similar_count ?? 0;
  const avg_match_quality = data.avg_match_quality ?? 0;
  const { is_trending, is_in_wave } = data;

  // Determine validation badge
  let validationBadge:
    | { type: string; label: string; icon: React.ReactNode; color: string }
    | undefined;

  if (is_trending) {
    validationBadge = {
      type: 'trending',
      label: 'Trending',
      icon: <TrendingUp className="h-3 w-3" />,
      color: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
    };
  } else if (is_in_wave) {
    validationBadge = {
      type: 'wave',
      label: 'Part of Wave',
      icon: <Waves className="h-3 w-3" />,
      color: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    };
  }

  // Count-up animation effect (runs once on mount)
  const CountUpNumber = ({ target }: { target: number }) => {
    const [count, setCount] = useState(hasAnimated ? target : 0);

    useEffect(() => {
      if (hasAnimated) {
        setCount(target);
        return;
      }

      const duration = 1000; // 1 second
      const steps = 30;
      const increment = target / steps;
      let current = 0;

      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          setCount(target);
          setHasAnimated(true);
          clearInterval(timer);
        } else {
          setCount(Math.floor(current));
        }
      }, duration / steps);

      return () => clearInterval(timer);
    }, [target]);

    return <>{Math.floor(count)}</>;
  };

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background transition-all hover:shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-center justify-between gap-6">
          {/* Left section: Similar count */}
          <div className="flex items-center gap-4 flex-1">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className="flex-shrink-0"
            >
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-primary" />
              </div>
            </motion.div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <p className="text-sm text-muted-foreground">Similar experiences</p>
                {validationBadge && (
                  <Badge
                    variant="outline"
                    className={`${validationBadge.color} flex items-center gap-1 px-2 py-0.5`}
                  >
                    {validationBadge.icon}
                    <span className="text-xs font-medium">
                      {validationBadge.label}
                    </span>
                  </Badge>
                )}
              </div>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-2xl font-bold text-foreground"
              >
                <CountUpNumber target={similar_count} />
              </motion.p>
            </div>
          </div>

          {/* Right section: Match quality ring */}
          {!simpleMode && (
            <div className="flex-shrink-0">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="relative h-16 w-16 cursor-help">
                      {/* Background ring */}
                      <svg className="h-full w-full -rotate-90" viewBox="0 0 64 64">
                        <circle
                          cx="32"
                          cy="32"
                          r="28"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="4"
                          className="text-muted/20"
                        />
                        {/* Progress ring with animation */}
                        <motion.circle
                          cx="32"
                          cy="32"
                          r="28"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="4"
                          strokeLinecap="round"
                          className="text-primary"
                          initial={{ strokeDashoffset: 176 }}
                          animate={{
                            strokeDashoffset: 176 - (176 * avg_match_quality) / 100,
                          }}
                          transition={{ duration: 1, ease: 'easeOut' }}
                          style={{
                            strokeDasharray: 176,
                          }}
                        />
                      </svg>

                      {/* Percentage text */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-sm font-bold text-foreground">
                          {avg_match_quality}%
                        </span>
                      </div>

                      {/* Pulse effect for high match quality */}
                      {avg_match_quality > 85 && (
                        <motion.div
                          className="absolute inset-0 rounded-full bg-primary/20"
                          animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.5, 0.2, 0.5],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: 'easeInOut',
                          }}
                        />
                      )}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="flex items-start gap-2 max-w-xs">
                      <Info className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div className="space-y-1">
                        <p className="font-medium">Match Quality Score</p>
                        <p className="text-sm text-muted-foreground">
                          Average similarity across {similar_count} related experiences.
                          Higher scores indicate stronger pattern matches.
                        </p>
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
