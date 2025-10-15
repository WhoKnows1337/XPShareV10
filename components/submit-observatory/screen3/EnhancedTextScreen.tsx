'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSubmitFlowStore } from '@/lib/stores/submitFlowStore';
import { InteractiveTextEditor } from './InteractiveTextEditor';
import { EditableMetadataHero } from './EditableMetadataHero';
import { NavigationButtons } from '../shared/NavigationButtons';
import { LoadingState } from '../shared/LoadingState';
import { EditWarningToast } from './EditWarningToast';
import { ReAnalysisModal } from './ReAnalysisModal';
import { useTextChangeDetection } from '@/lib/hooks/useTextChangeDetection';
import { useTranslations } from 'next-intl';
import { Loader2, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import type { TextChange } from '@/lib/utils/text-diff';

export function EnhancedTextScreen() {
  const t = useTranslations('submit.screen3');
  const {
    screen1,
    screen2,
    screen3,
    setSummary,
    setEnhancedText,
    setTextSegments,
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
    setCategory,
    setAttributes,
  } = useSubmitFlowStore();
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [qualityScore, setQualityScore] = useState<any>(null);
  const [isClient, setIsClient] = useState(false);

  // Change detection state
  const [detectedChange, setDetectedChange] = useState<TextChange | null>(null);
  const [showReAnalysisModal, setShowReAnalysisModal] = useState(false);

  // Initialize change detection hook
  const { handleTextChange, triggerAnalysis, resetDetection } = useTextChangeDetection({
    enabled: true,
    debounceMs: 2000,
    onChangeDetected: (change) => {
      console.log('Change detected:', change);
      setDetectedChange(change);
    },
    onReAnalysisNeeded: (change) => {
      console.log('Re-analysis needed:', change);
      setDetectedChange(change);
      setShowReAnalysisModal(true);
    },
  });

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
    if (screen3.enhancementEnabled && screen1.text &&
        (!screen3.enhancedText || !screen3.segments || screen3.segments.length === 0)) {
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
      console.log('[EnhancedTextScreen] API Response:', {
        hasSegments: !!data.segments,
        segmentsLength: data.segments?.length || 0,
        enrichedLength: data.enrichedText?.length || 0
      });

      setEnhancedText(data.enrichedText, data.highlights);

      // Save segments if available
      if (data.segments) {
        console.log('[EnhancedTextScreen] Calling setTextSegments with', data.segments.length, 'segments');
        setTextSegments(data.segments);
      } else {
        console.warn('[EnhancedTextScreen] NO SEGMENTS in API response!');
      }
    } catch (error) {
      console.error('Text enrichment error:', error);
    } finally {
      setEnhancing(false);
    }
  };

  /**
   * Handle re-analysis of edited text
   * Calls incremental analysis API to update category, attributes, and questions
   */
  const handleReAnalysis = useCallback(async () => {
    try {
      const currentText = screen3.textVersions.current || screen1.text;

      // Call incremental analysis API
      const response = await fetch('/api/submit/incremental-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalText: screen1.text,
          editedText: currentText,
          currentCategory: screen2.category,
          currentAttributes: screen2.attributes,
          currentAnswers: screen2.extraQuestions,
          language: 'de',
        }),
      });

      if (!response.ok) throw new Error('Incremental analysis failed');

      const data = await response.json();

      // Update category if changed
      if (data.category && data.category !== screen2.category) {
        setCategory(data.category);
      }

      // Merge new attributes with existing ones
      if (data.attributes) {
        setAttributes({ ...screen2.attributes, ...data.attributes });
      }

      // Re-generate enhancement with new data
      if (screen3.enhancementEnabled) {
        await enhanceText();
      }

      // Reset detection state
      resetDetection();

      console.log('Re-analysis complete:', data);
    } catch (error) {
      console.error('Re-analysis error:', error);
      // TODO: Show error toast
    }
  }, [
    screen1.text,
    screen2.category,
    screen2.attributes,
    screen2.extraQuestions,
    screen3.textVersions?.current,
    screen3.enhancementEnabled,
    setCategory,
    setAttributes,
    enhanceText,
    resetDetection,
  ]);

  // Show loading state during initial summary generation
  if (isSummarizing && !screen3.summary) {
    return (
      <LoadingState
        icon="sparkles"
        title={t('summarizing')}
        description={t('summarizingDesc')}
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
          <InteractiveTextEditor
            onTextChange={handleTextChange}
            onTextBlur={triggerAnalysis}
          />
        </div>

        {/* Navigation */}
        <NavigationButtons
          onBack={goBack}
          onNext={goNext}
          onReset={handleReset}
          canGoNext={isClient ? canGoNext() : false}
          nextLabel={t('continue')}
          showReset={true}
          resetConfirm={showResetConfirm}
        />
      </div>

      {/* Change Detection Toast */}
      <EditWarningToast
        change={detectedChange}
        onReAnalyze={() => setShowReAnalysisModal(true)}
        onDismiss={() => setDetectedChange(null)}
      />

      {/* Re-Analysis Modal */}
      <ReAnalysisModal
        isOpen={showReAnalysisModal}
        change={detectedChange}
        onConfirm={handleReAnalysis}
        onCancel={() => {
          setShowReAnalysisModal(false);
          setDetectedChange(null);
        }}
        onSkip={() => {
          setShowReAnalysisModal(false);
          resetDetection();
        }}
      />
    </div>
  );
}
