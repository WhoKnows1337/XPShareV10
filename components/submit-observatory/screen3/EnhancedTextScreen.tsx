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
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-text-primary">
              {t('textEditor.title', 'Dein Text')}
            </h3>
            <p className="text-sm text-text-secondary mt-1">
              {screen3.enhancementEnabled
                ? t('textEditor.description', '✨ KI-Verbesserungen sind grün hervorgehoben')
                : t('textEditor.descriptionOff', 'Originaltext ohne Änderungen')}
            </p>
          </div>
          {/* Brain Button for Enhancement Toggle */}
          <div className="relative group">
            <button
              onClick={toggleEnhancement}
              disabled={isEnhancing}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                screen3.enhancementEnabled
                  ? 'bg-success-soft/20 border-2 border-success-soft text-success-soft shadow-[0_0_15px_rgba(127,176,105,0.3)] animate-pulse-glow'
                  : 'bg-text-primary/5 border-2 border-text-primary/20 text-text-secondary hover:bg-text-primary/10 hover:scale-105'
              } ${isEnhancing ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isEnhancing ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <span className="text-xl">{screen3.enhancementEnabled ? '🧠✓' : '🧠'}</span>
              )}
              <span className="text-sm">
                {isEnhancing
                  ? t('enhancement.loading', 'Verbessere...')
                  : screen3.enhancementEnabled
                  ? t('enhancement.active', 'KI aktiv')
                  : t('enhancement.inactive', 'KI aktivieren')}
              </span>
            </button>
            {/* Tooltip */}
            <div className="absolute right-0 top-full mt-2 w-64 p-3 bg-space-mid border border-text-primary/20 rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 shadow-xl">
              <p className="text-xs text-text-secondary leading-relaxed">
                {t(
                  'enhancement.tooltip',
                  '💡 KI verbessert Lesbarkeit und Struktur. Deine Geschichte bleibt unverändert - nur besser formuliert!'
                )}
              </p>
              <p className="text-xs text-text-tertiary mt-2">
                {t('enhancement.tooltipDetail', 'Du kannst jederzeit zwischen Original und Enhanced umschalten.')}
              </p>
            </div>
          </div>
        </div>
        {/* Enhancement Info Box */}
        {screen3.enhancementEnabled && (
          <div className="mb-4 p-3 bg-success-soft/10 border border-success-soft/20 rounded-lg animate-fly-in-up">
            <p className="text-xs text-success-soft">
              {t(
                'enhancement.activeInfo',
                '✅ Text wurde mit KI optimiert. Die KI hat Struktur und Lesbarkeit verbessert, basierend auf deinen Zusatzinformationen.'
              )}
            </p>
          </div>
        )}
        <EnhancedTextEditor />
      </div>

      {/* Navigation */}
      <NavigationButtons onBack={goBack} onNext={goNext} canGoNext={canGoNext()} nextLabel={t('continue', 'Weiter →')} />
    </div>
  );
}
