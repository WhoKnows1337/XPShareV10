'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, TrendingUp, Globe, Check, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface DiscoveryStep {
  id: string;
  label: string;
  status: 'pending' | 'active' | 'completed';
  icon: typeof Users;
  count?: number;
  insights?: number;
  correlations?: number;
}

interface DiscoveryLoadingScreenProps {
  steps: DiscoveryStep[];
  onComplete?: () => void;
}

export function DiscoveryLoadingScreen({ steps, onComplete }: DiscoveryLoadingScreenProps) {
  const t = useTranslations('submit');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const completedSteps = steps.filter(s => s.status === 'completed').length;
    const newProgress = (completedSteps / steps.length) * 100;
    setProgress(newProgress);

    if (newProgress === 100 && onComplete) {
      setTimeout(onComplete, 500);
    }
  }, [steps, onComplete]);

  return (
    <div className="flex flex-col items-center justify-center gap-6 py-12">
      <div className="w-full max-w-2xl">
        {/* Radar Animation */}
        <div className="relative mb-6 flex justify-center">
          <div className="relative w-32 h-32">
            {/* Outer rings */}
            {[1, 2, 3].map((ring) => (
              <motion.div
                key={ring}
                className="absolute inset-0 rounded-full border-2 border-observatory-gold/20"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{
                  scale: 1 + (ring * 0.3),
                  opacity: [0, 0.5, 0]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: ring * 0.4,
                  ease: "easeOut"
                }}
              />
            ))}

            {/* Center pulse */}
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              animate={{
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-observatory-gold/40 to-observatory-accent/40 backdrop-blur-xl flex items-center justify-center">
                <Globe className="w-8 h-8 text-observatory-gold" />
              </div>
            </motion.div>

            {/* Scanning line */}
            <motion.div
              className="absolute inset-0"
              animate={{ rotate: 360 }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "linear"
              }}
            >
              <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-observatory-gold to-transparent"
                   style={{ transformOrigin: 'center' }}
              />
            </motion.div>
          </div>
        </div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-4"
        >
          <h2 className="text-lg font-semibold bg-gradient-to-r from-observatory-gold via-observatory-accent to-observatory-gold bg-clip-text text-transparent mb-2">
            {t('discoveryLoading.title')}
          </h2>
          <p className="text-xs text-slate-400">
            {t('discoveryLoading.description')}
          </p>
        </motion.div>

        {/* Steps */}
        <div className="space-y-3 mb-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isCompleted = step.status === 'completed';
            const isActive = step.status === 'active';

            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.2 }}
                className={`
                  relative p-3 rounded-lg border-2 transition-all
                  ${isActive ? 'border-observatory-gold/60 bg-observatory-gold/5' : ''}
                  ${isCompleted ? 'border-green-500/40 bg-green-500/5' : ''}
                  ${step.status === 'pending' ? 'border-slate-800 bg-slate-900/50' : ''}
                `}
              >
                {isActive && (
                  <motion.div
                    className="absolute inset-0 rounded-xl"
                    animate={{
                      boxShadow: [
                        '0 0 0px rgba(212, 175, 55, 0.3)',
                        '0 0 20px rgba(212, 175, 55, 0.6)',
                        '0 0 0px rgba(212, 175, 55, 0.3)',
                      ]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                )}

                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`
                      p-2 rounded-lg
                      ${isCompleted ? 'bg-green-500/20' : ''}
                      ${isActive ? 'bg-observatory-gold/20' : ''}
                      ${step.status === 'pending' ? 'bg-slate-800' : ''}
                    `}>
                      {isCompleted ? (
                        <Check className="w-5 h-5 text-green-400" />
                      ) : isActive ? (
                        <Loader2 className="w-5 h-5 text-observatory-gold animate-spin" />
                      ) : (
                        <Icon className="w-5 h-5 text-slate-500" />
                      )}
                    </div>
                    <span className={`
                      text-sm font-medium
                      ${isCompleted ? 'text-green-400' : ''}
                      ${isActive ? 'text-observatory-gold' : ''}
                      ${step.status === 'pending' ? 'text-slate-500' : ''}
                    `}>
                      {step.label}
                    </span>
                  </div>

                  {/* Live counter */}
                  {isCompleted && (step.count !== undefined || step.insights !== undefined || step.correlations !== undefined) && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="flex items-center gap-2"
                    >
                      {step.count !== undefined && (
                        <span className="px-3 py-1 rounded-full bg-observatory-gold/20 text-observatory-gold text-sm font-semibold">
                          {step.count} found
                        </span>
                      )}
                      {step.insights !== undefined && (
                        <span className="px-3 py-1 rounded-full bg-observatory-accent/20 text-observatory-accent text-sm font-semibold">
                          {step.insights} {step.insights === 1 ? 'pattern' : 'patterns'}
                        </span>
                      )}
                      {step.correlations !== undefined && (
                        <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-400 text-sm font-semibold">
                          {step.correlations} {step.correlations === 1 ? 'correlation' : 'correlations'}
                        </span>
                      )}
                    </motion.div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Progress Bar */}
        <div className="relative">
          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-observatory-gold via-observatory-accent to-green-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
          <div className="mt-2 text-center text-sm text-slate-400">
            {Math.round(progress)}% complete
          </div>
        </div>
      </div>
    </div>
  );
}
