'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface DiscoveryProgressProps {
  progress: number; // 0-100
  isComplete: boolean;
}

export function DiscoveryProgress({ progress, isComplete }: DiscoveryProgressProps) {
  const [displayProgress, setDisplayProgress] = useState(0);

  useEffect(() => {
    // Smooth progress animation
    const timer = setTimeout(() => {
      setDisplayProgress(progress);
    }, 100);

    return () => clearTimeout(timer);
  }, [progress]);

  return (
    <div className="space-y-2">
      {/* Progress Bar */}
      <div className="relative h-2 bg-space-light/30 rounded-full overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-observatory-gold via-purple-500 to-blue-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${displayProgress}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />

        {/* Shimmer effect */}
        {!isComplete && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            animate={{
              x: ['-100%', '200%'],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        )}
      </div>

      {/* Progress Text */}
      <div className="flex items-center justify-between text-sm">
        <motion.span
          key={displayProgress}
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-semibold text-observatory-gold"
        >
          {Math.round(displayProgress)}%
        </motion.span>

        <span className="text-muted-foreground">
          {isComplete ? 'Complete!' : 'Analyzing...'}
        </span>
      </div>
    </div>
  );
}
