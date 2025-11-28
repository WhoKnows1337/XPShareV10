'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Sparkles, Search, TrendingUp, Check, MapPin, Calendar, Users } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

/**
 * PatternDiscoveryModal - Phase 4, Task 4.2
 *
 * User-triggered pattern discovery with results display.
 * Shows 5-step analysis then displays discovered patterns.
 *
 * @see docs/maindocs/xpresultsv2/09-plan.md - Phase 4
 */

interface PatternDiscoveryModalProps {
  isOpen: boolean;
  experienceId: string;
  onComplete?: () => void;
  onClose?: () => void;
}

interface LoadingStep {
  id: string;
  label: string;
  status: 'pending' | 'loading' | 'complete';
  icon: React.ReactNode;
  duration: number;
}

interface DiscoveredPattern {
  type: 'geographic' | 'temporal' | 'attribute';
  title: string;
  description: string;
  confidence: number;
  relatedCount: number;
}

export function PatternDiscoveryModal({
  isOpen,
  experienceId,
  onComplete,
  onClose,
}: PatternDiscoveryModalProps) {
  const [phase, setPhase] = useState<'discovering' | 'results'>('discovering');
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [discoveredPatterns, setDiscoveredPatterns] = useState<DiscoveredPattern[]>([]);

  const discoverySteps: LoadingStep[] = [
    {
      id: 'analyzing',
      label: 'Analyzing attributes...',
      status: 'pending',
      icon: <Sparkles className="h-12 w-12" />,
      duration: 2000,
    },
    {
      id: 'searching',
      label: 'Searching similar experiences...',
      status: 'pending',
      icon: <Search className="h-12 w-12" />,
      duration: 2500,
    },
    {
      id: 'geographic',
      label: 'Detecting geographic patterns...',
      status: 'pending',
      icon: <MapPin className="h-12 w-12" />,
      duration: 2000,
    },
    {
      id: 'temporal',
      label: 'Analyzing temporal clusters...',
      status: 'pending',
      icon: <Calendar className="h-12 w-12" />,
      duration: 2000,
    },
    {
      id: 'complete',
      label: 'Discovery complete!',
      status: 'pending',
      icon: <Check className="h-12 w-12" />,
      duration: 1000,
    },
  ];

  const [steps, setSteps] = useState<LoadingStep[]>(discoverySteps);

  useEffect(() => {
    if (!isOpen) {
      // Reset state
      setPhase('discovering');
      setSteps(discoverySteps);
      setCurrentStepIndex(0);
      setProgress(0);
      return;
    }

    // Start discovery process
    const timers: NodeJS.Timeout[] = [];
    let cumulativeTime = 0;

    steps.forEach((step, index) => {
      const loadingTimer = setTimeout(() => {
        setCurrentStepIndex(index);
        setSteps((prev) =>
          prev.map((s, idx) => {
            if (idx === index) return { ...s, status: 'loading' };
            if (idx < index) return { ...s, status: 'complete' };
            return s;
          })
        );

        const progressPercent = ((index + 1) / steps.length) * 100;
        setProgress(progressPercent);
      }, cumulativeTime);

      timers.push(loadingTimer);
      cumulativeTime += step.duration;

      const completeTimer = setTimeout(() => {
        setSteps((prev) =>
          prev.map((s, idx) => (idx === index ? { ...s, status: 'complete' } : s))
        );

        if (index === steps.length - 1) {
          // Discovery complete, show results
          setTimeout(() => {
            setPhase('results');
            // Mock discovered patterns
            setDiscoveredPatterns([
              {
                type: 'geographic',
                title: 'Geographic Cluster Detected',
                description: '15 similar experiences within 50km radius',
                confidence: 87,
                relatedCount: 15,
              },
              {
                type: 'temporal',
                title: 'Temporal Spike',
                description: '8 experiences in last 30 days',
                confidence: 92,
                relatedCount: 8,
              },
            ]);
          }, 500);
        }
      }, cumulativeTime);

      timers.push(completeTimer);
    });

    return () => {
      timers.forEach((timer) => clearTimeout(timer));
    };
  }, [isOpen]);

  const currentStep = steps[currentStepIndex];

  const getPatternIcon = (type: DiscoveredPattern['type']) => {
    switch (type) {
      case 'geographic':
        return <MapPin className="h-5 w-5" />;
      case 'temporal':
        return <Calendar className="h-5 w-5" />;
      case 'attribute':
        return <Users className="h-5 w-5" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <AnimatePresence mode="wait">
          {phase === 'discovering' ? (
            <motion.div
              key="discovering"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-6 py-8"
            >
              <DialogTitle className="sr-only">Discovering Patterns</DialogTitle>

              {/* Animated Icon */}
              <motion.div
                key={currentStep.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', duration: 0.5 }}
                className="relative"
              >
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

                <div className="relative z-10 flex items-center justify-center w-24 h-24 rounded-full bg-primary/10 text-primary">
                  {currentStep.icon}
                </div>
              </motion.div>

              {/* Step Label */}
              <motion.p
                key={currentStep.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-lg font-semibold text-center"
              >
                {currentStep.label}
              </motion.p>

              {/* Progress Bar */}
              <div className="w-full space-y-2">
                <Progress value={progress} className="h-2" />
                <p className="text-xs text-muted-foreground text-center">
                  Step {currentStepIndex + 1} of {steps.length}
                </p>
              </div>

              {/* Step Dots */}
              <div className="flex gap-2">
                {steps.map((step) => (
                  <motion.div
                    key={step.id}
                    className={`h-2 w-2 rounded-full transition-colors ${
                      step.status === 'complete'
                        ? 'bg-success'
                        : step.status === 'loading'
                        ? 'bg-primary'
                        : 'bg-muted'
                    }`}
                    animate={step.status === 'loading' ? { scale: [1, 1.3, 1] } : { scale: 1 }}
                    transition={
                      step.status === 'loading' ? { duration: 1, repeat: Infinity } : {}
                    }
                  />
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4 py-4"
            >
              <div className="text-center space-y-2">
                <div className="flex items-center justify-center">
                  <TrendingUp className="h-12 w-12 text-primary" />
                </div>
                <DialogTitle className="text-xl font-bold">Patterns Discovered!</DialogTitle>
                <p className="text-sm text-muted-foreground">
                  We found {discoveredPatterns.length} patterns related to your experience
                </p>
              </div>

              <div className="space-y-3">
                {discoveredPatterns.map((pattern, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 text-primary mt-1">
                          {getPatternIcon(pattern.type)}
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center justify-between">
                            <p className="font-semibold">{pattern.title}</p>
                            <Badge variant="secondary" className="text-xs">
                              {pattern.confidence}% confidence
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{pattern.description}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Users className="h-3 w-3" />
                            <span>{pattern.relatedCount} related experiences</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="flex gap-2">
                <Button onClick={onClose} className="flex-1">
                  Close
                </Button>
                <Button
                  onClick={() => {
                    // Navigate to patterns tab
                    onClose?.();
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  View Details
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
