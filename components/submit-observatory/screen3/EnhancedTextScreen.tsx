'use client';

import { useEffect, useState } from 'react';
import { useSubmitFlowStore } from '@/lib/stores/submitFlowStore';
import { EnhancedTextEditor } from './EnhancedTextEditor';
import { EditableMetadataHero } from './EditableMetadataHero';
import { NavigationButtons } from '../shared/NavigationButtons';
import { LoadingState } from '../shared/LoadingState';
import { useTranslations } from 'next-intl';
import { Loader2, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export function EnhancedTextScreen() {
  const t = useTranslations('submit.screen3');
  const {
    screen1,
    screen2,
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
    reset,
    isDraft,
    saveDraft,
  } = useSubmitFlowStore();
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [qualityScore, setQualityScore] = useState<any>(null);
  const [isClient, setIsClient] = useState(false);

  // Hydration fix: Only compute canGoNext on client
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Auto-save every 30 seconds if there are changes
  useEffect(() => {
    if (!isDraft) return;

    const interval = setInterval(() => {
      saveDraft();
    }, 30000);

    return () => clearInterval(interval);
  }, [isDraft, saveDraft]);

  const handleReset = () => {
    if (showResetConfirm) {
      reset();
      setShowResetConfirm(false);
    } else {
      setShowResetConfirm(true);
      setTimeout(() => setShowResetConfirm(false), 5000);
    }
  };

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
        body: JSON.stringify({
          text: screen1.text,
          metadata: {
            category: screen2.category,
            date: screen2.date,
            time: screen2.time,
            location: screen2.location,
            duration: screen2.duration,
          }
        }),
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
      const response = await fetch('/api/submit/enrich-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: screen1.text,
          attributes: screen2.attributes,
          answers: screen2.extraQuestions,
          language: 'de',
        }),
      });

      if (!response.ok) throw new Error('Text enrichment failed');

      const data = await response.json();
      setEnhancedText(data.enrichedText, data.highlights);
    } catch (error) {
      console.error('Text enrichment error:', error);
    } finally {
      setEnhancing(false);
    }
  };

  // Show loading state during initial summary generation
  if (isSummarizing && !screen3.summary) {
    return (
      <LoadingState
        icon="sparkles"
        title={t('summarizing', 'Erstelle Preview...')}
        description={t('summarizingDesc', 'KI generiert eine kompakte Zusammenfassung für den Feed')}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Editable Metadata Hero - Similar to Step 2 */}
      <EditableMetadataHero />

      {/* Text Editor Section */}
      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-text-primary">
                Dein Text
              </h3>
              <p className="text-xs text-text-secondary mt-0.5">
                {screen3.enhancementEnabled
                  ? '✨ KI-Anreicherungen aktiv'
                  : 'Originaltext'}
              </p>
            </div>
            {/* Brain Button - Toggle AI Enhancement */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={toggleEnhancement}
                disabled={isEnhancing}
                variant={screen3.enhancementEnabled ? "default" : "outline"}
                size="sm"
                className="text-xs"
              >
                {isEnhancing ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <Brain className="w-3 h-3" />
                    {screen3.enhancementEnabled ? 'AI On' : 'AI Off'}
                  </>
                )}
              </Button>
            </motion.div>
          </div>
          <EnhancedTextEditor />
        </div>

        {/* Navigation */}
        <NavigationButtons
          onBack={goBack}
          onNext={goNext}
          onReset={handleReset}
          canGoNext={isClient ? canGoNext() : false}
          nextLabel={t('continue', 'Weiter')}
          showReset={true}
          resetConfirm={showResetConfirm}
        />
      </div>
    </div>
  );
}
