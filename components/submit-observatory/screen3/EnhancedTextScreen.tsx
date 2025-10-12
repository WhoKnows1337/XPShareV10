'use client';

import { useEffect } from 'react';
import { useSubmitFlowStore } from '@/lib/stores/submitFlowStore';
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
      {/* Title */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-text-primary mb-2">
          {t('title', 'Zusammenfassung & Verbesserung')}
        </h1>
        <p className="text-text-secondary">
          {t('subtitle', 'Überprüfe und verfeinere deinen Beitrag')}
        </p>
      </div>

      {/* Summary Section */}
      <SummarySection onRegenerate={generateSummary} isLoading={isSummarizing} />

      {/* Metadata Section (Compact) */}
      <MetadataSection />

      {/* Enhanced Text Editor with Brain Button */}
      <div className="glass-card p-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-text-primary">
              {t('textEditor.title', 'Dein Text')}
            </h3>
            <p className="text-sm text-text-secondary mt-1">
              {screen3.enhancementEnabled
                ? t('textEditor.description', 'KI-Verbesserungen sind hervorgehoben')
                : t('textEditor.descriptionOff', 'Originaltext')}
            </p>
          </div>
          {/* Brain Button for Enhancement Toggle */}
          <button
            onClick={toggleEnhancement}
            disabled={isEnhancing}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              screen3.enhancementEnabled
                ? 'bg-success-soft/20 border-2 border-success-soft text-success-soft'
                : 'bg-text-primary/5 border-2 border-text-primary/20 text-text-secondary hover:bg-text-primary/10'
            } ${isEnhancing ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isEnhancing ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <span className="text-xl">🧠</span>
            )}
            <span className="text-sm">
              {isEnhancing
                ? t('enhancement.loading', 'Verbessere...')
                : screen3.enhancementEnabled
                ? t('enhancement.active', 'KI aktiv')
                : t('enhancement.inactive', 'KI aktivieren')}
            </span>
          </button>
        </div>
        <EnhancedTextEditor />
      </div>

      {/* Navigation */}
      <NavigationButtons onBack={goBack} onNext={goNext} canGoNext={canGoNext()} nextLabel={t('continue', 'Weiter →')} />
    </div>
  );
}
