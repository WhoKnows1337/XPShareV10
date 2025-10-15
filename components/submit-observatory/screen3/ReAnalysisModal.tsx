'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  X,
  AlertCircle,
  CheckCircle,
  Loader2,
  ChevronRight,
  Info,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { TextChange } from '@/lib/utils/text-diff';

interface ReAnalysisModalProps {
  isOpen: boolean;
  change: TextChange | null;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
  onSkip: () => void;
}

/**
 * Modal for offering re-analysis when significant text changes are detected
 *
 * Shows:
 * - Summary of changes made
 * - What will be re-analyzed
 * - Potential impact on attributes/questions
 * - Options: Re-analyze, Skip, Cancel
 */
export function ReAnalysisModal({
  isOpen,
  change,
  onConfirm,
  onCancel,
  onSkip,
}: ReAnalysisModalProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [step, setStep] = useState<'summary' | 'analyzing' | 'complete'>('summary');

  if (!isOpen || !change) return null;

  const handleConfirm = async () => {
    setStep('analyzing');
    setIsAnalyzing(true);
    try {
      await onConfirm();
      setStep('complete');
      setTimeout(() => {
        setStep('summary');
        setIsAnalyzing(false);
      }, 1500);
    } catch (error) {
      console.error('Re-analysis failed:', error);
      setStep('summary');
      setIsAnalyzing(false);
    }
  };

  const getSeverityConfig = () => {
    if (change.severity === 'major') {
      return {
        color: 'text-red-500',
        bg: 'bg-red-950/20',
        border: 'border-red-500/30',
        icon: AlertCircle,
        title: 'Große Änderungen erkannt',
        subtitle: 'Eine neue Analyse wird empfohlen',
      };
    }
    return {
      color: 'text-yellow-500',
      bg: 'bg-yellow-950/20',
      border: 'border-yellow-500/30',
      icon: Info,
      title: 'Änderungen erkannt',
      subtitle: 'Möchtest du den Text neu analysieren lassen?',
    };
  };

  const config = getSeverityConfig();
  const Icon = config.icon;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-space-deep border border-glass-border rounded-xl shadow-2xl max-w-lg w-full overflow-hidden">
              {/* Header */}
              <div className="relative p-6 border-b border-glass-border">
                <button
                  onClick={onCancel}
                  className="absolute top-4 right-4 text-text-tertiary hover:text-text-primary transition-colors"
                  aria-label="Schließen"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="flex items-start gap-3">
                  <div className={`${config.color} mt-1`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-text-primary mb-1">
                      {config.title}
                    </h2>
                    <p className="text-sm text-text-secondary">
                      {config.subtitle}
                    </p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                {step === 'summary' && (
                  <>
                    {/* Change Summary */}
                    <div className={`${config.bg} ${config.border} border rounded-lg p-4`}>
                      <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
                        <Brain className="w-4 h-4" />
                        Zusammenfassung der Änderungen
                      </h3>

                      <div className="space-y-2 text-sm">
                        {change.wordsAdded > 0 && (
                          <div className="flex items-center justify-between">
                            <span className="text-text-secondary">Hinzugefügte Wörter</span>
                            <span className="text-green-400 font-medium">+{change.wordsAdded}</span>
                          </div>
                        )}
                        {change.wordsDeleted > 0 && (
                          <div className="flex items-center justify-between">
                            <span className="text-text-secondary">Entfernte Wörter</span>
                            <span className="text-red-400 font-medium">-{change.wordsDeleted}</span>
                          </div>
                        )}
                        {change.type && (
                          <div className="flex items-center justify-between">
                            <span className="text-text-secondary">Änderungstyp</span>
                            <span className="text-text-primary font-medium">
                              {getTypeLabel(change.type)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* What will be analyzed */}
                    <div className="bg-space-deep/60 border border-glass-border/50 rounded-lg p-4">
                      <h3 className="text-sm font-semibold text-text-primary mb-3">
                        Was wird neu analysiert?
                      </h3>
                      <ul className="space-y-2 text-sm text-text-secondary">
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-observatory-gold mt-0.5 flex-shrink-0" />
                          <span>
                            <strong className="text-text-primary">Kategorie & Attribute</strong> -
                            Form, Farbe, Dauer etc. werden neu bestimmt
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-observatory-gold mt-0.5 flex-shrink-0" />
                          <span>
                            <strong className="text-text-primary">Zusatzfragen</strong> -
                            Relevante Fragen werden aktualisiert
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-observatory-gold mt-0.5 flex-shrink-0" />
                          <span>
                            <strong className="text-text-primary">Text-Anreicherung</strong> -
                            Neue Details werden eingearbeitet
                          </span>
                        </li>
                      </ul>
                    </div>

                    {/* Important note */}
                    <div className="bg-blue-950/20 border border-blue-500/30 rounded-lg p-3">
                      <div className="flex items-start gap-2 text-xs">
                        <Info className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                        <div className="text-text-secondary">
                          <strong className="text-text-primary">Hinweis:</strong> Deine bereits
                          beantworteten Fragen und Attribute bleiben erhalten und werden nur
                          ergänzt, nicht ersetzt.
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {step === 'analyzing' && (
                  <div className="py-8 text-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                      className="inline-block mb-4"
                    >
                      <Brain className="w-12 h-12 text-observatory-gold" />
                    </motion.div>
                    <h3 className="text-lg font-semibold text-text-primary mb-2">
                      Analyse läuft...
                    </h3>
                    <p className="text-sm text-text-secondary">
                      Der Text wird neu analysiert. Dies dauert nur einen Moment.
                    </p>
                  </div>
                )}

                {step === 'complete' && (
                  <div className="py-8 text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                    >
                      <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                    </motion.div>
                    <h3 className="text-lg font-semibold text-text-primary mb-2">
                      Analyse abgeschlossen!
                    </h3>
                    <p className="text-sm text-text-secondary">
                      Dein Text wurde erfolgreich neu analysiert.
                    </p>
                  </div>
                )}
              </div>

              {/* Actions */}
              {step === 'summary' && (
                <div className="p-6 pt-0 flex items-center gap-3">
                  <Button
                    onClick={onSkip}
                    variant="outline"
                    className="flex-1"
                    disabled={isAnalyzing}
                  >
                    Überspringen
                  </Button>
                  <Button
                    onClick={handleConfirm}
                    variant="default"
                    className="flex-1 bg-observatory-gold hover:bg-observatory-gold/80 text-space-deep"
                    disabled={isAnalyzing}
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Analysiere...
                      </>
                    ) : (
                      <>
                        <Brain className="w-4 h-4 mr-2" />
                        Neu analysieren
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/**
 * Get human-readable label for change type
 */
function getTypeLabel(type: TextChange['type']): string {
  const labels: Record<TextChange['type'], string> = {
    'typo-fix': 'Tippfehler',
    'minor-edit': 'Kleine Änderung',
    addition: 'Hinzufügung',
    deletion: 'Löschung',
    'major-rewrite': 'Umfassende Überarbeitung',
  };
  return labels[type] || type;
}
