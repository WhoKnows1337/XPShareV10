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
import { Loader2 } from 'lucide-react';
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
    setTextVersionAfterAI,
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
  } = useSubmitFlowStore();
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [qualityScore, setQualityScore] = useState<any>(null);
  const [isClient, setIsClient] = useState(false);
  // ⭐ Initialize as true if segments already exist (from Step 2) or enrichment was done in Step 2
  const [initialEnhancementDone, setInitialEnhancementDone] = useState(
    () => (screen3.segments && screen3.segments.length > 0) || screen3.enrichmentCompletedInStep2
  );

  // Change detection state
  const [detectedChange, setDetectedChange] = useState<TextChange | null>(null);
  const [showReAnalysisModal, setShowReAnalysisModal] = useState(false);

  // Initialize change detection hook - only enable AFTER initial enhancement is done
  const { handleTextChange, triggerAnalysis, resetDetection } = useTextChangeDetection({
    enabled: initialEnhancementDone, // ⭐ Only activate after AI text is loaded
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

  // ⭐ Run both summary and enhancement in parallel on mount - IN THE BACKGROUND!
  // NO LOADING SCREENS - UI is shown immediately
  useEffect(() => {
    const initializeScreen = async () => {
      const tasks = [];

      // Add summary generation if needed
      if (screen1.text && !screen3.summary) {
        tasks.push(generateSummary());
      }

      // Add text enhancement if enabled and not already done
      // Skip if enrichment was completed in Step 2
      if (screen3.enhancementEnabled && screen1.text &&
          !screen3.enrichmentCompletedInStep2 &&
          (!screen3.enhancedText || !screen3.segments || screen3.segments.length === 0)) {
        tasks.push(enhanceText());
      }

      // Run both in parallel
      if (tasks.length > 0) {
        await Promise.all(tasks);
      }
    };

    initializeScreen();
  }, []); // Only run on mount

  const generateSummary = async () => {
    // Check if text is long enough before attempting summary
    if (!screen1.text || screen1.text.trim().length < 50) {
      console.log('Text too short for summary, skipping generation');
      // Don't clear the summary if it already exists from a previous run
      if (!screen3.summary) {
        setSummary('');
      }
      return;
    }

    setSummarizing(true);
    try {
      console.log('Generating summary for text:', {
        textLength: screen1.text.length,
        category: screen2.category,
        hasMetadata: !!(screen2.date || screen2.time || screen2.location)
      });

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

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Summary generation failed' }));
        console.error('Summary generation API error:', {
          status: response.status,
          error: errorData
        });
        // For summary, we can use a fallback - just take the first 200 chars
        const fallbackSummary = screen1.text.substring(0, 200) + (screen1.text.length > 200 ? '...' : '');
        setSummary(fallbackSummary);
        return;
      }

      const data = await response.json();
      console.log('Summary generated successfully:', data.summary?.substring(0, 100) + '...');
      setSummary(data.summary);
    } catch (error) {
      console.error('Summary generation error:', error);
      // Fallback summary
      const fallbackSummary = screen1.text.substring(0, 200) + (screen1.text.length > 200 ? '...' : '');
      setSummary(fallbackSummary);
    } finally {
      setSummarizing(false);
    }
  };

  const enhanceText = async () => {
    // Skip enhancement if text is too short
    if (!screen1.text || screen1.text.trim().length < 30) {
      console.log('Text too short for enhancement, skipping');
      setEnhancedText('', []);
      return;
    }

    setEnhancing(true);
    try {
      // Ensure attributes is an object with proper structure
      // ALWAYS convert confidence to decimal (0-1) for the API
      const attributesObject: Record<string, { value: string; confidence: number; isManuallyEdited: boolean }> = {};

      for (const [key, attr] of Object.entries(screen2.attributes || {})) {
        if (attr && typeof attr === 'object' && 'value' in attr) {
          // Always ensure confidence is in 0-1 range for API
          const confidenceValue = typeof attr.confidence === 'number'
            ? (attr.confidence > 1 ? attr.confidence / 100 : attr.confidence)
            : 0.95; // Default confidence

          attributesObject[key] = {
            value: String(attr.value || ''),
            confidence: confidenceValue,
            isManuallyEdited: attr.isManuallyEdited || false
          };
        }
      }

      // Log what we're sending for debugging
      console.log('Sending to enrich-text API:', {
        textLength: screen1.text.length,
        attributes: attributesObject,
        answersCount: Object.keys(screen2.extraQuestions || {}).length,
      });

      const response = await fetch('/api/submit/enrich-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: screen1.text,
          attributes: attributesObject, // Already in the correct format from screen2
          // Convert extraQuestions object to array format expected by API
          answers: Object.entries(screen2.extraQuestions || {}).map(([id, answer]) => ({
            id,
            question: id, // Using ID as question for now
            answer,
            type: typeof answer === 'boolean' ? 'boolean' :
                  typeof answer === 'number' ? 'number' : 'text'
          })),
          language: 'de',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Text enrichment failed' }));
        console.error('Text enrichment API error:', {
          status: response.status,
          error: errorData.error,
          details: errorData.details,
          sentData: {
            textLength: screen1.text?.length,
            attributesCount: Object.keys(screen2.attributes || {}).length,
            answersCount: Object.keys(screen2.extraQuestions || {}).length
          }
        });
        throw new Error(
          errorData.details
            ? `Validation failed: ${JSON.stringify(errorData.details)}`
            : errorData.error || 'Text enrichment failed'
        );
      }

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
        // ⭐ Set baseline for change detection (enriched text WITH AI)
        setTextVersionAfterAI(data.enrichedText);
        // ⭐ Mark initial enhancement as done - activate change detection now
        setInitialEnhancementDone(true);
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

      // TODO: Merge new attributes with existing ones
      // Note: setAttributes function needs to be implemented in the store
      // if (data.attributes) {
      //   setAttributes({ ...screen2.attributes, ...data.attributes });
      // }

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
    enhanceText,
    resetDetection,
  ]);

  // ⭐ REMOVED: No loading screens at all!
  // The UI is shown immediately and processing happens in the background

  return (
    <div className="space-y-4">
      {/* Editable Metadata Hero - Similar to Step 2 */}
      <EditableMetadataHero />

      {/* Text Editor Section */}
      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-text-primary">
              {t('yourText')}
            </h3>

            {/* Segmented Control - AI Mode Toggle */}
            <div className="flex flex-col items-end gap-1.5">
              <div className="inline-flex items-center bg-glass-bg/50 border border-glass-border rounded-lg p-1">
                {/* Original Mode Button */}
                <button
                  onClick={() => {
                    console.log('[Toggle] BEFORE - enhancementEnabled:', screen3.enhancementEnabled);
                    console.log('[Toggle] Calling toggleEnhancement...');
                    toggleEnhancement();
                    setTimeout(() => {
                      console.log('[Toggle] AFTER (100ms delay) - enhancementEnabled:', screen3.enhancementEnabled);
                    }, 100);
                  }}
                  disabled={isEnhancing}
                  className={`
                    px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200
                    ${!screen3.enhancementEnabled
                      ? 'bg-space-deep text-text-primary shadow-sm'
                      : 'text-text-tertiary hover:text-text-secondary'
                    }
                    ${isEnhancing ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
                  `}
                >
                  {t('original')}
                </button>

                {/* AI Mode Button */}
                <button
                  onClick={() => {
                    console.log('[Toggle] BEFORE - enhancementEnabled:', screen3.enhancementEnabled);
                    console.log('[Toggle] Calling toggleEnhancement...');
                    toggleEnhancement();
                    setTimeout(() => {
                      console.log('[Toggle] AFTER (100ms delay) - enhancementEnabled:', screen3.enhancementEnabled);
                    }, 100);
                  }}
                  disabled={isEnhancing}
                  className={`
                    px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 flex items-center gap-1.5
                    ${screen3.enhancementEnabled
                      ? 'bg-observatory-gold/20 text-observatory-gold border border-observatory-gold/30 shadow-sm'
                      : 'text-text-tertiary hover:text-text-secondary'
                    }
                    ${isEnhancing ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
                  `}
                >
                  {isEnhancing ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span>{t('loading')}</span>
                    </>
                  ) : (
                    <>
                      ✨ <span>{t('aiEnriched')}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Explanation Text */}
              <p className="text-[10px] text-text-tertiary text-right max-w-[200px] leading-tight">
                {screen3.enhancementEnabled
                  ? t('choiceSaved')
                  : t('aiAddsDetails')
                }
              </p>
            </div>
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
