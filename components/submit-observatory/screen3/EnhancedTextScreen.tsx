'use client';

import { useEffect } from 'react';
import { useSubmitFlowStore } from '@/lib/stores/submitFlowStore';
import { EnhancementToggle } from './EnhancementToggle';
import { SummarySection } from './SummarySection';
import { MetadataSection } from './MetadataSection';
import { EnhancedTextEditor } from './EnhancedTextEditor';
import { NavigationButtons } from '../shared/NavigationButtons';
import { useTranslations } from 'next-intl';
import { Loader2 } from 'lucide-react';

export function EnhancedTextScreen() {
  const t = useTranslations('submit.screen3');
  const {
    screen1,
    screen3,
    setSummary,
    setEnhancedText,
    toggleEnhancement,
    setSummarizing,
    setEnhancing,
    isSummarizing,
    isEnhancing,
    canGoNext,
    goNext,
    goBack,
  } = useSubmitFlowStore();

  // Generate summary on mount if not already generated
  useEffect(() => {
    if (screen1.text && !screen3.summary) {
      generateSummary();
    }
  }, []);

  // Generate enhanced text when enhancement is enabled
  useEffect(() => {
    if (screen3.enhancementEnabled && screen1.text && !screen3.enhancedText) {
      enhanceText();
    }
  }, [screen3.enhancementEnabled]);

  const generateSummary = async () => {
    setSummarizing(true);
    try {
      const response = await fetch('/api/submit/generate-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: screen1.text }),
      });

      if (!response.ok) throw new Error('Summary generation failed');

      const data = await response.json();
      setSummary(data.summary);
    } catch (error) {
      console.error('Summary generation error:', error);
    } finally {
      setSummarizing(false);
    }
  };

  const enhanceText = async () => {
    setEnhancing(true);
    try {
      const response = await fetch('/api/submit/enhance-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: screen1.text }),
      });

      if (!response.ok) throw new Error('Text enhancement failed');

      const data = await response.json();
      setEnhancedText(data.enhancedText, data.highlights);
    } catch (error) {
      console.error('Text enhancement error:', error);
    } finally {
      setEnhancing(false);
    }
  };

  // Show loading state during initial summary generation
  if (isSummarizing && !screen3.summary) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="glass-card p-12">
          <div className="flex flex-col items-center gap-6 py-12">
            <Loader2 className="w-16 h-16 text-observatory-gold animate-spin" />
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-text-primary mb-2">
                {t('summarizing', 'Erstelle Zusammenfassung...')}
              </h2>
              <p className="text-text-secondary">
                {t('summarizingDesc', 'KI erstellt eine prägnante Zusammenfassung')}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Enhancement Toggle */}
      <div className="glass-card p-6">
        <EnhancementToggle
          enabled={screen3.enhancementEnabled}
          onToggle={toggleEnhancement}
          isLoading={isEnhancing}
        />
      </div>

      {/* Summary Section */}
      <SummarySection onRegenerate={generateSummary} isLoading={isSummarizing} />

      {/* Metadata Section (Compact) */}
      <MetadataSection />

      {/* Enhanced Text Editor */}
      <div className="glass-card p-8">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-text-primary">
            {t('textEditor.title', 'Dein Text')}
          </h3>
          <p className="text-sm text-text-secondary mt-1">
            {t('textEditor.description', 'KI-Verbesserungen sind hervorgehoben')}
          </p>
        </div>
        <EnhancedTextEditor />
      </div>

      {/* Navigation */}
      <NavigationButtons onBack={goBack} onNext={goNext} canGoNext={canGoNext()} nextLabel={t('continue', 'Weiter →')} />
    </div>
  );
}
