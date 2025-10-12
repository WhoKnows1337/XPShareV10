'use client';

import { ArrowLeft, ArrowRight } from 'lucide-react';

interface NavigationButtonsProps {
  onBack?: () => void;
  onNext?: () => void;
  canGoBack?: boolean;
  canGoNext?: boolean;
  nextLabel?: string;
  backLabel?: string;
  nextLoading?: boolean;
}

export function NavigationButtons({
  onBack,
  onNext,
  canGoBack = true,
  canGoNext = true,
  nextLabel = 'Continue →',
  backLabel = '← Back',
  nextLoading = false,
}: NavigationButtonsProps) {
  return (
    <div className="flex items-center justify-between gap-4 pt-6">
      {/* Back Button */}
      {onBack && (
        <button
          onClick={onBack}
          disabled={!canGoBack}
          className="flex items-center gap-2 px-6 py-3 rounded-lg text-text-secondary
                     bg-text-primary/5 border border-text-primary/20
                     hover:bg-text-primary/10 hover:border-text-primary/30
                     disabled:opacity-40 disabled:cursor-not-allowed
                     transition-all duration-200 group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span className="font-medium">{backLabel}</span>
        </button>
      )}

      {/* Spacer if no back button */}
      {!onBack && <div />}

      {/* Next Button */}
      {onNext && (
        <button
          onClick={onNext}
          disabled={!canGoNext || nextLoading}
          className="btn-observatory flex items-center gap-2 group ml-auto"
        >
          {nextLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-space-deep border-t-transparent rounded-full animate-spin" />
              <span>Processing...</span>
            </>
          ) : (
            <>
              <span>{nextLabel}</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </>
          )}
        </button>
      )}
    </div>
  );
}
