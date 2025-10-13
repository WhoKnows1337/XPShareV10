'use client';

import { ArrowLeft, ArrowRight, Loader2, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
  // Save status functionality removed per user request

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
        {/* Save status hidden per user request */}
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
