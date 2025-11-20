'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, Zap, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface JustPublishedBannerProps {
  xpEarned: number;
  badgesEarned: Array<{
    name: string;
    icon: string;
    rarity: string;
  }>;
  leveledUp: boolean;
  newLevel?: number;
}

export function JustPublishedBanner({
  xpEarned,
  badgesEarned,
  leveledUp,
  newLevel,
}: JustPublishedBannerProps) {
  const [dismissed, setDismissed] = useState(false);
  const [showRewards, setShowRewards] = useState(false);

  if (dismissed) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="glass-card-success border-b sticky top-0 z-50 backdrop-blur-xl"
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Success Icon + Message */}
          <div className="flex items-center gap-3">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-success-soft/20"
            >
              <span className="text-2xl">🎉</span>
            </motion.div>
            <div>
              <p className="font-semibold text-sm sm:text-base">Your experience is live!</p>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground flex-wrap">
                <span className="flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  +{xpEarned} XP
                </span>
                {badgesEarned.length > 0 && (
                  <>
                    <span>•</span>
                    <span>{badgesEarned.length} new badge{badgesEarned.length > 1 ? 's' : ''}</span>
                  </>
                )}
                {leveledUp && newLevel && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-primary">
                      <TrendingUp className="w-3 h-3" />
                      Level {newLevel}!
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            {(badgesEarned.length > 0 || leveledUp) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowRewards(!showRewards)}
                className="hidden sm:flex"
              >
                <Trophy className="w-4 h-4 mr-2" />
                {showRewards ? 'Hide' : 'View'} Rewards
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDismissed(true)}
              className="h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Expandable Rewards Section */}
        <AnimatePresence>
          {showRewards && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-4 overflow-hidden"
            >
              <div className="glass-card p-4 space-y-3">
                {/* XP Progress */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">XP Earned</span>
                    <span className="font-semibold">+{xpEarned} XP</span>
                  </div>
                  {leveledUp && newLevel && (
                    <div className="flex items-center gap-2 text-sm text-primary">
                      <TrendingUp className="w-4 h-4" />
                      <span className="font-semibold">Level Up! You reached Level {newLevel}</span>
                    </div>
                  )}
                </div>

                {/* Badges Earned */}
                {badgesEarned.length > 0 && (
                  <>
                    <div className="h-px bg-border" />
                    <div className="space-y-2">
                      <p className="text-sm font-semibold">New Badges</p>
                      <div className="flex flex-wrap gap-2">
                        {badgesEarned.map((badge, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-2 glass-card p-2 pr-3"
                          >
                            <span className="text-2xl">{badge.icon}</span>
                            <div>
                              <p className="text-sm font-medium">{badge.name}</p>
                              <Badge variant="outline" className="text-xs">
                                {badge.rarity}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
