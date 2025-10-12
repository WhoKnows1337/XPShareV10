'use client';

import { useSubmitFlowStore } from '@/lib/stores/submitFlowStore';
import { useTranslations } from 'next-intl';

export function ProgressIndicator() {
  const { currentStep, totalSteps } = useSubmitFlowStore();
  const t = useTranslations('submit');

  const progress = (currentStep / totalSteps) * 100;

  const getStepLabel = (step: number) => {
    switch (step) {
      case 1:
        return t('progress.screen1', 'Text Input');
      case 2:
        return t('progress.screen2', 'Questions');
      case 3:
        return t('progress.screen3', 'Review');
      case 4:
        return t('progress.screen4', 'Files & Witnesses');
      default:
        return `Step ${step}`;
    }
  };

  return (
    <div className="fixed top-[60px] left-0 right-0 z-50 bg-glass-bg backdrop-blur-obs border-b border-glass-border px-5 py-4">
      <div className="max-w-3xl mx-auto">
        {/* Step Counter */}
        <div className="flex justify-between items-center mb-2">
          <span className="font-mono text-xs text-text-tertiary uppercase tracking-wider">
            {t('progress.step', { current: currentStep, total: totalSteps }, `Step ${currentStep} of ${totalSteps}`)}
          </span>
          <span className="font-mono text-xs text-text-tertiary uppercase tracking-wider">
            {t('progress.percentage', { progress: Math.round(progress) }, `Progress ${Math.round(progress)}%`)}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="relative h-0.5 bg-text-tertiary/20 rounded-full overflow-hidden">
          <div
            className="absolute left-0 top-0 h-full bg-gradient-to-r from-observatory-gold to-observatory-light transition-all duration-800 ease-in-out"
            style={{ width: `${progress}%` }}
          >
            {/* Glowing Dot */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-1 bg-observatory-light rounded-full shadow-[0_0_8px_rgba(232,220,192,0.6)]" />
          </div>
        </div>

        {/* Current Step Label */}
        <div className="mt-2 text-sm text-text-secondary font-medium">
          {getStepLabel(currentStep)}
        </div>
      </div>
    </div>
  );
}
