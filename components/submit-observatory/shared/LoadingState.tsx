'use client';

import { motion } from 'framer-motion';
import { Brain, Sparkles, Telescope, LucideIcon, CheckCircle, Circle, Loader2, Zap } from 'lucide-react';
import { useTranslations } from 'next-intl';

export interface ProgressStep {
  id: string;
  label: string;
  status: 'pending' | 'active' | 'complete';
  estimatedDuration?: number; // in seconds
}

interface LoadingStateProps {
  icon?: 'brain' | 'sparkles' | 'telescope';
  title?: string;
  description?: string;
  showProgress?: boolean;
  progress?: number;
  steps?: ProgressStep[]; // ⭐ NEW: Live progress steps
  hideCounter?: boolean; // ⭐ Hide "Schritt X von Y" counter
}

const iconMap: Record<string, LucideIcon> = {
  brain: Brain,
  sparkles: Sparkles,
  telescope: Telescope,
};

export function LoadingState({
  icon = 'sparkles',
  title,
  description,
  showProgress = false,
  progress = 0,
  steps,
  hideCounter = false,
}: LoadingStateProps) {
  const t = useTranslations('submit.shared.loading');
  const Icon = iconMap[icon];

  // Use translations as fallback for title and description
  const finalTitle = title || t('processing');
  const finalDescription = description || t('wait');

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
          {finalTitle}
        </motion.h2>
        <motion.p
          className="text-xs text-text-secondary"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {finalDescription}
        </motion.p>
      </div>

      {/* ⭐ NEW: Live Progress Steps */}
      {steps && steps.length > 0 && (
        <motion.div
          className="w-full max-w-md space-y-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {/* Individual Steps with Icons + Time */}
          {steps.map((step, index) => (
            <StepIndicator key={step.id} step={step} index={index} />
          ))}

          {/* Global Progress Bar */}
          <GlobalProgressBar steps={steps} />

          {/* Counter + Time Remaining (optional) */}
          {!hideCounter && <StepCounter steps={steps} />}
        </motion.div>
      )}

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

// ============================================================================
// Helper Components for Live Progress Steps
// ============================================================================

/**
 * Individual Step Indicator with status icons and pulsing border
 */
function StepIndicator({ step, index }: { step: ProgressStep; index: number }) {
  // Icon based on status
  const icons = {
    pending: <Circle className="w-5 h-5 text-text-tertiary" />,
    active: <Loader2 className="w-5 h-5 text-observatory-gold animate-spin" />,
    complete: (
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", duration: 0.6 }}
      >
        <CheckCircle className="w-5 h-5 text-green-400" />
      </motion.div>
    ),
  };

  return (
    <div>
      {/* Main Step Card */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{
          opacity: step.status === 'complete' ? 0.4 : step.status === 'active' ? 1 : 0.3,
          x: 0,
          // ⭐ Pulsing border for active step (like the radar!)
          ...(step.status === 'active' && {
            boxShadow: [
              "0 0 0px rgba(212, 175, 55, 0.3)",
              "0 0 15px rgba(212, 175, 55, 0.6)",
              "0 0 0px rgba(212, 175, 55, 0.3)",
            ]
          })
        }}
        transition={step.status === 'active'
          ? {
              opacity: { delay: index * 0.1, duration: 0.5 },
              x: { delay: index * 0.1, duration: 0.5 },
              boxShadow: { duration: 2, repeat: Infinity }
            }
          : { delay: index * 0.1, duration: 0.5 }
        }
        className={`
          flex items-center gap-3 px-4 py-3 rounded-lg
          ${step.status === 'active'
            ? 'bg-observatory-gold/5 border-2 border-observatory-gold/30'
            : 'bg-space-deep/40 border border-glass-border'
          }
        `}
      >
        {/* Status Icon */}
        {icons[step.status]}

        {/* Label */}
        <span className={`
          text-sm flex-1
          ${step.status === 'active' ? 'text-text-primary font-medium' : 'text-text-secondary'}
        `}>
          {step.label}
        </span>

        {/* Estimated Time (Feature 4) */}
        {step.estimatedDuration && (
          <span className="text-xs text-text-tertiary font-mono">
            ~{step.estimatedDuration}s
          </span>
        )}

        {/* Lightning bolt for active step */}
        {step.status === 'active' && (
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <Zap className="w-4 h-4 text-observatory-gold" />
          </motion.div>
        )}
      </motion.div>

      {/* Mini Progress Bar per Step */}
      <div className="h-1 bg-glass-bg border-b border-glass-border/30 overflow-hidden rounded-b-sm">
        <motion.div
          className={`h-full ${
            step.status === 'complete'
              ? 'bg-green-400'
              : step.status === 'active'
              ? 'bg-gradient-to-r from-observatory-gold to-observatory-accent'
              : 'bg-transparent'
          }`}
          initial={{ width: '0%' }}
          animate={{
            width: step.status === 'complete' ? '100%' : step.status === 'active' ? '40%' : '0%'
          }}
          transition={{ duration: 0.5 }}
        />
      </div>
    </div>
  );
}

/**
 * Global Progress Bar showing overall completion (Feature 3)
 */
function GlobalProgressBar({ steps }: { steps: ProgressStep[] }) {
  const completedCount = steps.filter(s => s.status === 'complete').length;
  const progressPercent = (completedCount / steps.length) * 100;

  return (
    <div className="mt-4">
      <div className="h-2 bg-glass-bg border border-glass-border rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-observatory-gold via-observatory-accent to-green-400"
          initial={{ width: '0%' }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

/**
 * Step Counter with Remaining Time Display (Feature 4)
 */
function StepCounter({ steps }: { steps: ProgressStep[] }) {
  const t = useTranslations('submit.shared.loading');
  const currentStepIndex = steps.findIndex(s => s.status === 'active');
  const currentStep = currentStepIndex >= 0 ? currentStepIndex + 1 : steps.length;
  const totalSteps = steps.length;

  // Calculate remaining time (sum of pending + active steps)
  const remainingTime = steps
    .filter(s => s.status === 'active' || s.status === 'pending')
    .reduce((sum, s) => sum + (s.estimatedDuration || 0), 0);

  return (
    <motion.div
      className="flex items-center justify-center gap-3 text-xs text-text-tertiary font-mono mt-2"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
    >
      <span>
        {t('step', { current: currentStep, total: totalSteps })}
      </span>
      {remainingTime > 0 && (
        <>
          <span>•</span>
          <span className="text-observatory-gold">
            {t('timeRemaining', { time: remainingTime })}
          </span>
        </>
      )}
    </motion.div>
  );
}
