'use client';

import { motion } from 'framer-motion';
import { Trophy, Zap, Star } from 'lucide-react';
import { RewardsData } from './types';
import confetti from 'canvas-confetti';
import { useEffect } from 'react';

interface RewardsUnlockProps {
  rewards: RewardsData;
  show: boolean;
}

export function RewardsUnlock({ rewards, show }: RewardsUnlockProps) {
  useEffect(() => {
    if (show && rewards.xpEarned > 0) {
      // Trigger confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FFD700', '#FFA500', '#FF69B4', '#00CED1'],
      });

      // Sound effect (optional)
      if (typeof window !== 'undefined' && 'Audio' in window) {
        try {
          const audio = new Audio('/sounds/reward-unlock.mp3');
          audio.volume = 0.3;
          audio.play().catch(() => {
            // Ignore errors (user interaction required)
          });
        } catch (e) {
          // Ignore
        }
      }
    }
  }, [show, rewards.xpEarned]);

  if (!show) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.5, type: 'spring' }}
      className="glass-card p-6 space-y-4 border-2 border-observatory-gold/50 bg-gradient-to-br from-observatory-gold/10 to-purple-500/10"
    >
      <div className="text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-observatory-gold/20 mb-3"
        >
          <Trophy className="w-8 h-8 text-observatory-gold" />
        </motion.div>

        <motion.h3
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-xl font-bold mb-2"
        >
          🎉 Rewards Unlocked!
        </motion.h3>
      </div>

      {/* XP Earned */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4 }}
        className="flex items-center justify-between py-3 px-4 bg-white/5 rounded-lg"
      >
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-400" />
          <span className="font-medium">XP Earned</span>
        </div>
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.2, 1] }}
          transition={{ delay: 0.5 }}
          className="text-2xl font-bold text-observatory-gold"
        >
          +{rewards.xpEarned}
        </motion.span>
      </motion.div>

      {/* Badges Earned */}
      {rewards.badgesEarned.length > 0 && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-2"
        >
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Trophy className="w-4 h-4" />
            <span>Badges Earned</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {rewards.badgesEarned.map((badge, index) => (
              <motion.div
                key={badge}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 + index * 0.1, type: 'spring' }}
                className="px-3 py-1.5 bg-purple-500/20 text-purple-300 rounded-full text-sm font-medium border border-purple-500/30"
              >
                🏆 {badge}
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Level Up */}
      {rewards.leveledUp && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-lg border border-purple-500/30"
        >
          <Star className="w-5 h-5 text-yellow-400 animate-pulse" />
          <span className="font-bold text-lg">
            Level {rewards.newLevel}!
          </span>
          <Star className="w-5 h-5 text-yellow-400 animate-pulse" />
        </motion.div>
      )}

      {/* Current Level Progress */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="flex items-center gap-2 text-sm text-muted-foreground"
      >
        <span>Level {rewards.currentLevel}</span>
        <div className="flex gap-0.5">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full ${
                i < (rewards.currentLevel % 5)
                  ? 'bg-observatory-gold'
                  : 'bg-white/20'
              }`}
            />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
