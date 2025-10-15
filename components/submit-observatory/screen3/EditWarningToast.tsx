'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Brain, X, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { TextChange } from '@/lib/utils/text-diff';

interface EditWarningToastProps {
  change: TextChange | null;
  onReAnalyze?: () => void;
  onDismiss?: () => void;
  autoHideMs?: number;
}

/**
 * Toast notification for text changes
 * Shows when user makes significant edits that may require re-analysis
 */
export function EditWarningToast({
  change,
  onReAnalyze,
  onDismiss,
  autoHideMs = 10000,
}: EditWarningToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (change && change.needsReAnalysis) {
      setIsVisible(true);
      setProgress(100);

      // Auto-hide timer
      const hideTimer = setTimeout(() => {
        setIsVisible(false);
      }, autoHideMs);

      // Progress animation
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.max(0, prev - (100 / (autoHideMs / 100))));
      }, 100);

      return () => {
        clearTimeout(hideTimer);
        clearInterval(progressInterval);
      };
    }
  }, [change, autoHideMs]);

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  const handleReAnalyze = () => {
    setIsVisible(false);
    onReAnalyze?.();
  };

  if (!change) return null;

  const getSeverityConfig = (severity: TextChange['severity']) => {
    switch (severity) {
      case 'major':
        return {
          icon: AlertCircle,
          iconColor: 'text-red-500',
          bgColor: 'bg-red-950/90',
          borderColor: 'border-red-500/30',
          title: 'Große Änderungen erkannt',
          description: 'Neue Analyse empfohlen',
        };
      case 'moderate':
        return {
          icon: AlertCircle,
          iconColor: 'text-yellow-500',
          bgColor: 'bg-yellow-950/90',
          borderColor: 'border-yellow-500/30',
          title: 'Änderungen erkannt',
          description: 'Möchtest du den Text neu analysieren?',
        };
      default:
        return {
          icon: AlertCircle,
          iconColor: 'text-blue-500',
          bgColor: 'bg-blue-950/90',
          borderColor: 'border-blue-500/30',
          title: 'Text aktualisiert',
          description: 'Änderungen gespeichert',
        };
    }
  };

  const config = getSeverityConfig(change.severity);
  const Icon = config.icon;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.95 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="fixed bottom-6 right-6 z-50 max-w-md"
        >
          <div
            className={`${config.bgColor} ${config.borderColor} border backdrop-blur-xl rounded-lg shadow-2xl overflow-hidden`}
          >
            {/* Progress bar */}
            <div className="h-1 bg-glass-border/30 overflow-hidden">
              <motion.div
                className="h-full bg-observatory-gold"
                initial={{ width: '100%' }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.1, ease: 'linear' }}
              />
            </div>

            <div className="p-4">
              {/* Header */}
              <div className="flex items-start gap-3">
                <div className={`${config.iconColor} mt-0.5 flex-shrink-0`}>
                  <Icon className="w-5 h-5" />
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-text-primary mb-1">
                    {config.title}
                  </h4>
                  <p className="text-xs text-text-secondary mb-3">
                    {config.description}
                  </p>

                  {/* Change Details */}
                  <div className="space-y-1 mb-3">
                    {change.wordsAdded > 0 && (
                      <div className="text-xs text-text-tertiary flex items-center gap-2">
                        <span className="text-green-400">+{change.wordsAdded} Wörter</span>
                        <span className="text-text-tertiary/40">hinzugefügt</span>
                      </div>
                    )}
                    {change.wordsDeleted > 0 && (
                      <div className="text-xs text-text-tertiary flex items-center gap-2">
                        <span className="text-red-400">-{change.wordsDeleted} Wörter</span>
                        <span className="text-text-tertiary/40">entfernt</span>
                      </div>
                    )}
                    {change.type && (
                      <div className="text-xs text-text-tertiary">
                        Art: {getTypeLabel(change.type)}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {change.needsReAnalysis && onReAnalyze && (
                      <Button
                        onClick={handleReAnalyze}
                        size="sm"
                        variant="default"
                        className="text-xs h-8 bg-observatory-gold hover:bg-observatory-gold/80 text-space-deep"
                      >
                        <Brain className="w-3 h-3 mr-1.5" />
                        Neu analysieren
                        <ChevronRight className="w-3 h-3 ml-1" />
                      </Button>
                    )}
                    <Button
                      onClick={handleDismiss}
                      size="sm"
                      variant="ghost"
                      className="text-xs h-8"
                    >
                      Später
                    </Button>
                  </div>
                </div>

                {/* Close button */}
                <button
                  onClick={handleDismiss}
                  className="text-text-tertiary hover:text-text-primary transition-colors flex-shrink-0"
                  aria-label="Schließen"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Get human-readable label for change type
 */
function getTypeLabel(type: TextChange['type']): string {
  const labels: Record<TextChange['type'], string> = {
    'typo-fix': 'Tippfehler-Korrektur',
    'minor-edit': 'Kleine Änderung',
    addition: 'Hinzufügung',
    deletion: 'Löschung',
    'major-rewrite': 'Umfassende Überarbeitung',
  };
  return labels[type] || type;
}
