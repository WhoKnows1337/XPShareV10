'use client';

import { ArrowLeft, ArrowRight, Loader2, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';

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
  nextLabel,
  backLabel,
  nextLoading = false,
  showNext = true,
  showReset = false,
  resetConfirm = false,
}: NavigationButtonsProps) {
  const t = useTranslations('submit.shared.navigation');

  // Use translations as fallback for labels
  const finalNextLabel = nextLabel || t('next');
  const finalBackLabel = backLabel || t('back');

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
            {finalBackLabel}
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
            {resetConfirm ? t('confirm') : t('reset')}
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
                {t('processing')}
              </>
            ) : (
              <>
                {finalNextLabel}
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
