'use client';

import { ArrowLeft, ArrowRight, Loader2, RotateCcw, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSubmitFlowStore } from '@/lib/stores/submitFlowStore';
import { useEffect, useState } from 'react';

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
  const [timeAgo, setTimeAgo] = useState<string>('');

  // Update time ago every 10 seconds
  useEffect(() => {
    const updateTimeAgo = () => {
      if (!lastSaved) {
        setTimeAgo('');
        return;
      }

      const now = new Date();
      const saved = new Date(lastSaved);
      const diffMs = now.getTime() - saved.getTime();
      const diffSec = Math.floor(diffMs / 1000);
      const diffMin = Math.floor(diffSec / 60);
      const diffHour = Math.floor(diffMin / 60);

      if (diffSec < 10) {
        setTimeAgo('Gerade gespeichert');
      } else if (diffSec < 60) {
        setTimeAgo(`Vor ${diffSec}s gespeichert`);
      } else if (diffMin < 60) {
        setTimeAgo(`Vor ${diffMin} Min`);
      } else {
        setTimeAgo(`Vor ${diffHour}h ${diffMin % 60}m`);
      }
    };

    updateTimeAgo();
    const interval = setInterval(updateTimeAgo, 10000); // Update every 10s

    return () => clearInterval(interval);
  }, [lastSaved]);

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
        {isDraft && timeAgo && (
          <div className="flex items-center gap-1.5 text-xs text-text-tertiary">
            <Save className="w-3 h-3" />
            <span>{timeAgo}</span>
          </div>
        )}
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
