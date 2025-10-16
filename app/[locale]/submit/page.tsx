'use client';

import { useEffect } from 'react';
import { useSubmitFlowStore } from '@/lib/stores/submitFlowStore';
import { ProgressIndicator } from '@/components/submit-observatory/ProgressIndicator';
import { TextInputScreen } from '@/components/submit-observatory/screen1/TextInputScreen';
import { AIAnalysisScreen } from '@/components/submit-observatory/screen2/AIAnalysisScreen';
import { EnhancementReviewScreen } from '@/components/submit-observatory/screen3/EnhancementReviewScreen';
import { FilesWitnessesScreen } from '@/components/submit-observatory/screen4/FilesWitnessesScreen';
import { SuccessScreen } from '@/components/submit-observatory/success/SuccessScreen';
import { AnimatePresence, motion } from 'framer-motion';

export default function ExperienceSubmitPage() {
  const { currentStep, loadDraft } = useSubmitFlowStore();

  // Load draft on mount
  useEffect(() => {
    loadDraft();
  }, [loadDraft]);

  return (
    <div className="min-h-screen bg-space-deep relative flex flex-col">
      {/* Main Content - Contained within Viewport */}
      <div className="flex-1 flex items-center justify-center py-6 px-4 max-h-[calc(100vh-80px)] overflow-hidden">
        <div className="w-full max-w-4xl">
          {/* Single Integrated Card with Progress */}
          <div className="glass-card p-6 max-h-[calc(100vh-140px)] overflow-y-auto custom-scrollbar">
            {/* Progress Indicator - Inside Card, hide on success */}
            {currentStep <= 4 && <ProgressIndicator />}

            {/* Screen Content with Transitions */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{
                  duration: 0.3,
                  ease: 'easeInOut'
                }}
              >
                {currentStep === 1 && <TextInputScreen />}
                {currentStep === 2 && <AIAnalysisScreen />}
                {currentStep === 3 && <EnhancementReviewScreen />}
                {currentStep === 4 && <FilesWitnessesScreen />}
                {currentStep === 5 && <SuccessScreen />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
