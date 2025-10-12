'use client';

import { useEffect } from 'react';
import { useSubmitFlowStore } from '@/lib/stores/submitFlowStore';
import { ProgressIndicator } from '@/components/submit-observatory/ProgressIndicator';
import { TextInputScreen } from '@/components/submit-observatory/screen1/TextInputScreen';
import { AIAnalysisScreen } from '@/components/submit-observatory/screen2/AIAnalysisScreen';
import { EnhancedTextScreen } from '@/components/submit-observatory/screen3/EnhancedTextScreen';
import { FilesWitnessesScreen } from '@/components/submit-observatory/screen4/FilesWitnessesScreen';
import { SuccessScreen } from '@/components/submit-observatory/success/SuccessScreen';

export default function ExperienceSubmitPage() {
  const { currentStep, loadDraft } = useSubmitFlowStore();

  // Load draft on mount
  useEffect(() => {
    loadDraft();
  }, [loadDraft]);

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
      </div>
    </div>
  );
}
