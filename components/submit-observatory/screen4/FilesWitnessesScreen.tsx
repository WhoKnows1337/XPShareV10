'use client';

import { useSubmitFlowStore } from '@/lib/stores/submitFlowStore';
import { useTranslations } from 'next-intl';
import { FileUploadSection } from './FileUploadSection';
import { WitnessesSection } from './WitnessesSection';
import { SplitPublishButton } from './SplitPublishButton';
import { NavigationButtons } from '../shared/NavigationButtons';

export function FilesWitnessesScreen() {
  const t = useTranslations('submit.screen4');
  const { screen4, goNext, goBack } = useSubmitFlowStore();

  const handlePublish = async (visibility: 'public' | 'anonymous' | 'private') => {
    // Update visibility in store
    useSubmitFlowStore.setState((state) => ({
      screen4: { ...state.screen4, visibility },
    }));

    // Navigate to success screen (this will trigger the publish API call)
    goNext();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <h1 className="text-3xl font-bold text-text-primary">
          {t('title', 'Medien & Zeugen')}
        </h1>
        <p className="text-text-secondary text-lg">
          {t('subtitle', 'Füge Dateien hinzu und lade Zeugen ein (optional)')}
        </p>
      </div>

      {/* File Upload Section */}
      <FileUploadSection />

      {/* Witnesses Section */}
      <WitnessesSection />

      {/* Navigation */}
      <div className="flex items-center justify-between pt-6">
        <NavigationButtons
          onBack={goBack}
          showNext={false}
        />

        <SplitPublishButton onPublish={handlePublish} />
      </div>
    </div>
  );
}
