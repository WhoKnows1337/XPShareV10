'use client';

import { useEffect, useState } from 'react';
import { useSubmitFlowStore } from '@/lib/stores/submitFlowStore';
import { ProgressIndicator } from '@/components/submit-observatory/ProgressIndicator';
import { TextInputScreen } from '@/components/submit-observatory/screen1/TextInputScreen';
import { AIAnalysisScreen } from '@/components/submit-observatory/screen2/AIAnalysisScreen';
import { EnhancedTextScreen } from '@/components/submit-observatory/screen3/EnhancedTextScreen';
import { FilesWitnessesScreen } from '@/components/submit-observatory/screen4/FilesWitnessesScreen';
import { SuccessScreen } from '@/components/submit-observatory/success/SuccessScreen';
import { RotateCcw } from 'lucide-react';

export default function ExperienceSubmitPage() {
  const { currentStep, loadDraft, reset } = useSubmitFlowStore();
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Load draft on mount
  useEffect(() => {
    loadDraft();
  }, [loadDraft]);

  const handleReset = () => {
    if (showResetConfirm) {
      reset();
      setShowResetConfirm(false);
    } else {
      setShowResetConfirm(true);
      // Auto-hide confirmation after 5 seconds
      setTimeout(() => setShowResetConfirm(false), 5000);
    }
  };

  return (
    <div className="min-h-screen bg-space-deep relative">
      {/* Progress Indicator - hide on success screen */}
      {currentStep <= 4 && <ProgressIndicator />}

      {/* Content Area - with top padding for fixed progress bar */}
      <div className={currentStep <= 4 ? 'pt-32 pb-20 px-4' : 'pt-20 pb-20 px-4'}>
        {currentStep === 1 && <TextInputScreen />}
        {currentStep === 2 && <AIAnalysisScreen />}
        {currentStep === 3 && <EnhancedTextScreen />}
        {currentStep === 4 && <FilesWitnessesScreen />}
        {currentStep === 5 && <SuccessScreen />}

        {/* Reset Button - Only show on steps 1-4, not on success screen */}
        {currentStep <= 4 && (
          <div className="fixed bottom-6 left-6 z-50">
            <button
              onClick={handleReset}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${
                showResetConfirm
                  ? 'bg-red-500/20 border-2 border-red-500 text-red-500 shadow-lg shadow-red-500/20'
                  : 'bg-text-primary/5 border border-text-primary/20 text-text-tertiary hover:bg-text-primary/10 hover:border-text-primary/30 hover:text-text-secondary'
              }`}
            >
              <RotateCcw className="w-4 h-4" />
              <span className="text-sm">
                {showResetConfirm ? 'Wirklich zurücksetzen?' : 'Zurücksetzen'}
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
