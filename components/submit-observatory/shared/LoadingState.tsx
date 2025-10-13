'use client';

import { motion } from 'framer-motion';
import { Brain, Sparkles, Telescope, LucideIcon } from 'lucide-react';

interface LoadingStateProps {
  icon?: 'brain' | 'sparkles' | 'telescope';
  title?: string;
  description?: string;
  showProgress?: boolean;
  progress?: number;
}

const iconMap: Record<string, LucideIcon> = {
  brain: Brain,
  sparkles: Sparkles,
  telescope: Telescope,
};

export function LoadingState({
  icon = 'sparkles',
  title = 'Verarbeite...',
  description = 'Einen Moment bitte',
  showProgress = false,
  progress = 0,
}: LoadingStateProps) {
  const Icon = iconMap[icon];

  return (
    <div className="flex flex-col items-center justify-center gap-6 py-12">
      {/* Pulse Wave Animation Container */}
      <div className="relative w-32 h-32 flex items-center justify-center">
        {/* Pulse Wave 1 (outermost) */}
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-observatory-accent"
          initial={{ scale: 0.5, opacity: 0.6 }}
          animate={{
            scale: [0.5, 1.8, 1.8],
            opacity: [0.6, 0.2, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeOut',
          }}
        />

        {/* Pulse Wave 2 (middle) */}
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-observatory-accent"
          initial={{ scale: 0.5, opacity: 0.6 }}
          animate={{
            scale: [0.5, 1.8, 1.8],
            opacity: [0.6, 0.2, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeOut',
            delay: 0.4,
          }}
        />

        {/* Pulse Wave 3 (inner) */}
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-observatory-accent"
          initial={{ scale: 0.5, opacity: 0.6 }}
          animate={{
            scale: [0.5, 1.8, 1.8],
            opacity: [0.6, 0.2, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeOut',
            delay: 0.8,
          }}
        />

        {/* Center Icon with Glow */}
        <motion.div
          className="relative z-10 w-16 h-16 flex items-center justify-center rounded-full bg-observatory-accent/10 backdrop-blur-sm border border-observatory-accent/30"
          animate={{
            boxShadow: [
              '0 0 20px rgba(139, 157, 195, 0.3)',
              '0 0 40px rgba(139, 157, 195, 0.5)',
              '0 0 20px rgba(139, 157, 195, 0.3)',
            ],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <Icon className="w-8 h-8 text-observatory-accent" />
          </motion.div>
        </motion.div>
      </div>

      {/* Text Content */}
      <div className="text-center space-y-2 max-w-md">
        <motion.h2
          className="text-lg font-semibold text-text-primary"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {title}
        </motion.h2>
        <motion.p
          className="text-xs text-text-secondary"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {description}
        </motion.p>
      </div>

      {/* Optional Progress Bar */}
      {showProgress && (
        <motion.div
          className="w-64 space-y-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="h-2 bg-glass-bg border border-glass-border rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-observatory-accent to-observatory-accent/60"
              initial={{ width: '0%' }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
          <p className="text-xs text-text-tertiary text-center font-mono">
            {progress}%
          </p>
        </motion.div>
      )}
    </div>
  );
}
