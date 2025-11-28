'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Sparkles, Search, Check } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

/**
 * DiscoveryLoadingModal - Phase 1, Task 1.2
 *
 * Shows pattern discovery progress during post-publish flow.
 * Reduced from 5 steps to 3 steps (~5 seconds total) per Exa analysis recommendations.
 *
 * @see docs/maindocs/xpresultsv2/09-plan.md - Phase 1, Task 1.2
 * @see docs/maindocs/xpresultsv2/04-components-spec.md - Section 1
 * @see docs/maindocs/xpresultsv2/07-animation-specs.md - Section 1
 */

interface DiscoveryLoadingModalProps {
  isOpen: boolean;
  onComplete?: () => void;
}

interface LoadingStep {
  id: string;
  label: string;
  status: 'pending' | 'loading' | 'complete';
  icon: React.ReactNode;
  duration: number; // milliseconds
}

export function DiscoveryLoadingModal({
  isOpen,
  onComplete,
}: DiscoveryLoadingModalProps) {
  // Step 1.2.2: Define 3 loading steps (REDUCED from 5)
  const defaultSteps: LoadingStep[] = [
    {
      id: 'analyzing',
      label: 'Analyzing your experience...',
      status: 'pending',
      icon: <Sparkles className="h-12 w-12" />,
      duration: 2000, // 2s
    },
    {
      id: 'matching',
      label: 'Finding similar patterns...',
      status: 'pending',
      icon: <Search className="h-12 w-12" />,
      duration: 2000, // 2s with count-up animation
    },
    {
      id: 'complete',
      label: 'Done!',
      status: 'pending',
      icon: <Check className="h-12 w-12" />,
      duration: 1000, // 1s success animation
    },
  ];

  // Step 1.2.3: Auto-progression state
  const [steps, setSteps] = useState<LoadingStep[]>(defaultSteps);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [matchCount, setMatchCount] = useState(0); // For count-up animation

  // Step 1.2.3: Auto-progression logic
  useEffect(() => {
    if (!isOpen) {
      // Reset state when modal closes
      setSteps(defaultSteps);
      setCurrentStepIndex(0);
      setProgress(0);
      setMatchCount(0);
      return;
    }

    // Start with first step
    setSteps((prev) =>
      prev.map((step, idx) =>
        idx === 0 ? { ...step, status: 'loading' } : step
      )
    );

    const timers: NodeJS.Timeout[] = [];
    let cumulativeTime = 0;

    steps.forEach((step, index) => {
      // Mark step as loading
      const loadingTimer = setTimeout(() => {
        setCurrentStepIndex(index);
        setSteps((prev) =>
          prev.map((s, idx) => {
            if (idx === index) return { ...s, status: 'loading' };
            if (idx < index) return { ...s, status: 'complete' };
            return s;
          })
        );

        // Update progress bar
        const progressPercent = ((index + 1) / steps.length) * 100;
        setProgress(progressPercent);

        // Step 2: Count-up animation for "Finding similar patterns"
        if (step.id === 'matching') {
          let count = 0;
          const countUpInterval = setInterval(() => {
            count = Math.min(count + 1, 12);
            setMatchCount(count);
            if (count >= 12) clearInterval(countUpInterval);
          }, step.duration / 12); // Distribute over 2s
          timers.push(countUpInterval as unknown as NodeJS.Timeout);
        }
      }, cumulativeTime);

      timers.push(loadingTimer);
      cumulativeTime += step.duration;

      // Mark step as complete
      const completeTimer = setTimeout(() => {
        setSteps((prev) =>
          prev.map((s, idx) =>
            idx === index ? { ...s, status: 'complete' } : s
          )
        );

        // Auto-dismiss after final step
        if (index === steps.length - 1) {
          setTimeout(() => {
            onComplete?.();
          }, 500); // Small delay before dismissing
        }
      }, cumulativeTime);

      timers.push(completeTimer);
    });

    return () => {
      timers.forEach((timer) => clearTimeout(timer));
    };
  }, [isOpen, onComplete]);

  const currentStep = steps[currentStepIndex];

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent
        className="sm:max-w-md border-none shadow-2xl bg-gradient-to-br from-background to-muted/20 [&>button]:hidden"
        // Disable ESC key and backdrop click
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <div className="flex flex-col items-center gap-6 py-8">
          {/* Step 1.2.4: Animated icon with pulse effect */}
          <motion.div
            key={currentStep.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: 1,
              opacity: 1,
            }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="relative"
          >
            {/* Pulse effect for loading state */}
            {currentStep.status === 'loading' && (
              <motion.div
                className="absolute inset-0 rounded-full bg-primary/20"
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.6, 0.2, 0.6],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            )}

            {/* Icon with conditional animation */}
            <motion.div
              className="relative z-10 flex items-center justify-center w-24 h-24 rounded-full bg-primary/10 text-primary"
              animate={
                currentStep.status === 'loading'
                  ? {
                      rotate: currentStep.id === 'matching' ? 360 : 0,
                    }
                  : {}
              }
              transition={
                currentStep.id === 'matching'
                  ? {
                      duration: 2,
                      repeat: Infinity,
                      ease: 'linear',
                    }
                  : {}
              }
            >
              {currentStep.icon}
            </motion.div>

            {/* Success checkmark animation for final step */}
            {currentStep.id === 'complete' && currentStep.status === 'complete' && (
              <motion.div
                className="absolute inset-0 rounded-full border-4 border-success"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1.2, opacity: 0 }}
                transition={{ duration: 0.6 }}
              />
            )}
          </motion.div>

          {/* Step 1.2.5: Step label with fade transition */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="text-center"
            >
              <p className="text-lg font-semibold text-foreground">
                {currentStep.label}
              </p>

              {/* Count-up display for Step 2 */}
              {currentStep.id === 'matching' && matchCount > 0 && (
                <motion.p
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-3xl font-bold text-primary mt-2"
                >
                  {matchCount}
                </motion.p>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Step 1.2.5: Progress bar */}
          <div className="w-full space-y-2">
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-muted-foreground text-center">
              Step {currentStepIndex + 1} of {steps.length}
            </p>
          </div>

          {/* Step indicator dots */}
          <div className="flex gap-2">
            {steps.map((step, index) => (
              <motion.div
                key={step.id}
                className={`h-2 w-2 rounded-full transition-colors ${
                  step.status === 'complete'
                    ? 'bg-success'
                    : step.status === 'loading'
                    ? 'bg-primary'
                    : 'bg-muted'
                }`}
                animate={
                  step.status === 'loading'
                    ? { scale: [1, 1.3, 1] }
                    : { scale: 1 }
                }
                transition={
                  step.status === 'loading'
                    ? { duration: 1, repeat: Infinity }
                    : {}
                }
              />
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
