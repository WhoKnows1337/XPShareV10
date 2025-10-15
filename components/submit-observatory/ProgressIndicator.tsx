'use client';

import { useSubmitFlowStore } from '@/lib/stores/submitFlowStore';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';

export function ProgressIndicator() {
  const { currentStep, totalSteps } = useSubmitFlowStore();
  const t = useTranslations('submit');

  const progress = (currentStep / totalSteps) * 100;

  const getStepLabel = (step: number) => {
    switch (step) {
      case 1:
        return t('progress.screen1');
      case 2:
        return t('progress.screen2');
      case 3:
        return t('progress.screen3');
      case 4:
        return t('progress.screen4');
      default:
        return `Step ${step}`;
    }
  };

  return (
    <div className="mb-4 pb-4 border-b border-glass-border">
      {/* Compact Step Counter + Label */}
      <div className="flex items-center justify-between mb-2">
        <motion.span
          key={`step-${currentStep}`}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="font-mono text-xs text-text-tertiary uppercase tracking-wider"
        >
          {t('progress.step', { current: currentStep, total: totalSteps })}
        </motion.span>
        <AnimatePresence mode="wait">
          <motion.span
            key={currentStep}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            transition={{ duration: 0.2 }}
            className="text-xs text-text-secondary font-mono"
          >
            {getStepLabel(currentStep)}
          </motion.span>
        </AnimatePresence>
      </div>

      {/* Progress Bar with Animated Gradient */}
      <div className="relative h-1 bg-observatory-accent-dim rounded-full overflow-hidden">
        <motion.div
          className="absolute left-0 top-0 h-full bg-gradient-to-r from-observatory-accent via-[#9badcc] to-observatory-accent-soft"
          initial={{ width: 0 }}
          animate={{
            width: `${progress}%`,
            boxShadow: [
              '0 0 8px rgba(139, 157, 195, 0.3)',
              '0 0 16px rgba(139, 157, 195, 0.5)',
              '0 0 8px rgba(139, 157, 195, 0.3)',
            ]
          }}
          transition={{
            width: { duration: 0.5, ease: 'easeOut' },
            boxShadow: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' }
          }}
          style={{
            backgroundSize: '200% 100%',
            animation: 'gradient-shift 3s ease-in-out infinite',
          }}
        />
      </div>
    </div>
  );
}
