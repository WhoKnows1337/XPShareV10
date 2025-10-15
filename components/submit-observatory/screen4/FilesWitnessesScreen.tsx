'use client';

import { useState } from 'react';
import { useSubmitFlowStore } from '@/lib/stores/submitFlowStore';
import { useTranslations } from 'next-intl';
import { FileUploadSection } from './FileUploadSection';
import { WitnessesSection } from './WitnessesSection';
import { SplitPublishButton } from './SplitPublishButton';
import { NavigationButtons } from '../shared/NavigationButtons';

export function FilesWitnessesScreen() {
  const t = useTranslations('submit.screen4');
  const { screen4, goNext, goBack, reset } = useSubmitFlowStore();
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleReset = () => {
    if (showResetConfirm) {
      reset();
      setShowResetConfirm(false);
    } else {
      setShowResetConfirm(true);
      setTimeout(() => setShowResetConfirm(false), 5000);
    }
  };

  const handlePublish = async (visibility: 'public' | 'anonymous' | 'private') => {
    // Update visibility in store
    useSubmitFlowStore.setState((state) => ({
      screen4: { ...state.screen4, visibility },
    }));

    // Navigate to success screen (this will trigger the publish API call)
    goNext();
  };

  return (
    <div className="space-y-4">
      {/* Compact Header */}
      <div className="mb-3">
        <h1 className="section-title-observatory">
          {t('title')}
        </h1>
        <p className="text-text-secondary text-xs mt-1">
          {t('subtitle')}
        </p>
      </div>

      {/* File Upload Section - Compact */}
      <FileUploadSection />

      {/* Witnesses Section - Compact */}
      <WitnessesSection />

      {/* Navigation - Compact */}
      <div className="flex items-center justify-between pt-3">
        <NavigationButtons
          onBack={goBack}
          onReset={handleReset}
          showNext={false}
          showReset={true}
          resetConfirm={showResetConfirm}
        />

        <SplitPublishButton onPublish={handlePublish} />
      </div>
    </div>
  );
}
