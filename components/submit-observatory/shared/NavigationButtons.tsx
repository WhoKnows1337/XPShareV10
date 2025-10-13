'use client';

import { ArrowLeft, ArrowRight, Loader2, RotateCcw, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSubmitFlowStore } from '@/lib/stores/submitFlowStore';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface NavigationButtonsProps {
  onBack?: () => void;
  onNext?: () => void;
  onReset?: () => void;
  canGoBack?: boolean;
  canGoNext?: boolean;
  nextLabel?: string;
  backLabel?: string;
  nextLoading?: boolean;
  showNext?: boolean;
  showReset?: boolean;
  resetConfirm?: boolean;
}

export function NavigationButtons({
  onBack,
  onNext,
  onReset,
  canGoBack = true,
  canGoNext = true,
  nextLabel = 'Weiter',
  backLabel = 'Zurück',
  nextLoading = false,
  showNext = true,
  showReset = false,
  resetConfirm = false,
}: NavigationButtonsProps) {
  const { lastSaved, isDraft } = useSubmitFlowStore();
  const [showSaveStatus, setShowSaveStatus] = useState(false);

  // Show save status briefly when lastSaved changes
  useEffect(() => {
    if (!lastSaved || !isDraft) {
      setShowSaveStatus(false);
      return;
    }

    // Show the status
    setShowSaveStatus(true);

    // Hide after 3 seconds
    const timeout = setTimeout(() => {
      setShowSaveStatus(false);
    }, 3000);

    return () => clearTimeout(timeout);
  }, [lastSaved, isDraft]);

  return (
    <div className="grid grid-cols-3 gap-4 pt-6">
      {/* Left Column: Back Button + Reset Button */}
      <div className="flex items-center gap-2 justify-start">
        {onBack && (
          <Button
            variant="ghost"
            size="default"
            onClick={onBack}
            disabled={!canGoBack}
            className="group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            {backLabel}
          </Button>
        )}
        {showReset && onReset && (
          <Button
            variant={resetConfirm ? "destructive" : "ghost"}
            size="sm"
            onClick={onReset}
            className="text-xs"
          >
            <RotateCcw className="w-3 h-3" />
            {resetConfirm ? 'Sicher?' : 'Reset'}
          </Button>
        )}
      </div>

      {/* Center Column: Draft Status */}
      <div className="flex items-center justify-center">
        <AnimatePresence>
          {showSaveStatus && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-1.5 text-xs text-success-soft"
            >
              <Save className="w-3 h-3" />
              <span>Gespeichert</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Right Column: Next Button */}
      <div className="flex justify-end">
        {onNext && showNext && (
          <Button
            variant="default"
            size="default"
            onClick={onNext}
            disabled={!canGoNext || nextLoading}
            className="group"
          >
            {nextLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                {nextLabel}
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
