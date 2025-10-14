'use client';

import { useEffect, useState } from 'react';
import { useSubmitFlowStore } from '@/lib/stores/submitFlowStore';
import { AIResultsSection } from './AIResultsSection';
import { LoadingState } from '../shared/LoadingState';
import { RequiredQuestions } from './RequiredQuestions';
import { ExtraQuestionsPrompt } from './ExtraQuestionsPrompt';
import { ExtraQuestionsFlow } from './ExtraQuestionsFlow';
import { NavigationButtons } from '../shared/NavigationButtons';
import { useTranslations } from 'next-intl';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

export function AIAnalysisScreen() {
  const t = useTranslations('submit.screen2');
  const {
    screen1,
    screen2,
    screen3,
    updateScreen2,
    setAIResults,
    setAnalyzing,
    isAnalyzing,
    isSummarizing,
    canGoNext,
    goNext,
    goBack,
    reset,
    isDraft,
    saveDraft
  } = useSubmitFlowStore();
  const [showExtraQuestions, setShowExtraQuestions] = useState(false);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

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

  // Run AI analysis on mount if not already analyzed
  useEffect(() => {
    if (!hasAnalyzed && screen1.text && !screen2.title) {
      analyzeText();
    }
  }, []);

  const analyzeText = async () => {
    setAnalyzing(true);
    setAnalysisError(null);
    try {
      // Step 1: Complete analysis including title, category, tags, AND attributes
      const response = await fetch('/api/submit/analyze-complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: screen1.text }),
      });

      if (!response.ok) throw new Error('Analysis failed');

      const data = await response.json();

      // Store AI results including attributes
      setAIResults(data.title, data.category, data.tags, data.confidence);

      // Store extracted attributes in the correct format for the store
      if (data.attributes && Object.keys(data.attributes).length > 0) {
        const formattedAttributes: Record<string, { value: string; confidence: number; isManuallyEdited: boolean }> = {};

        for (const [key, attr] of Object.entries(data.attributes)) {
          const attrData = attr as { value: string; confidence: number };
          formattedAttributes[key] = {
            value: attrData.value,
            confidence: Math.round(attrData.confidence * 100), // Convert 0.0-1.0 to 0-100
            isManuallyEdited: false,
          };
        }

        updateScreen2({ attributes: formattedAttributes });
      }

      setHasAnalyzed(true);

      // Step 2: Generate summary with metadata (waits for completion)
      // This runs AFTER analysis so we have category available
      await generateSummary(data.category);
    } catch (error) {
      console.error('AI Analysis error:', error);
      setAnalysisError(t('error', 'KI-Analyse fehlgeschlagen. Bitte versuche es erneut.'));
    } finally {
      setAnalyzing(false);
    }
  };

  const generateSummary = async (category: string) => {
    const { setSummary, setSummarizing, screen2 } = useSubmitFlowStore.getState();

    // Don't regenerate if summary already exists
    if (useSubmitFlowStore.getState().screen3.summary) {
      return;
    }

    setSummarizing(true);
    try {
      const response = await fetch('/api/submit/generate-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: screen1.text,
          metadata: {
            category: category,
            date: screen2.date,
            time: screen2.time,
            location: screen2.location,
            duration: screen2.duration,
          }
        }),
      });

      if (!response.ok) throw new Error('Summary generation failed');

      const summaryData = await response.json();
      setSummary(summaryData.summary);
    } catch (error) {
      console.error('Summary generation error:', error);
      // Don't show error to user, they can regenerate in Step 3
    } finally {
      setSummarizing(false);
    }
  };

  // Handle navigation to next step - enrich text first
  const handleNext = async () => {
    // If summary is still being generated, wait for it
    if (isSummarizing) {
      setIsTransitioning(true);
      // Will auto-advance via useEffect below
      return;
    }

    // Start transitioning - we'll enrich the text now
    setIsTransitioning(true);

    try {
      // Enrich text with attributes and answers from questions
      const { setEnhancedText, setEnhancing } = useSubmitFlowStore.getState();
      setEnhancing(true);

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

      if (response.ok) {
        const data = await response.json();
        setEnhancedText(data.enrichedText, data.highlights);
      }

      setEnhancing(false);
    } catch (error) {
      console.error('Text enrichment error:', error);
      const { setEnhancing } = useSubmitFlowStore.getState();
      setEnhancing(false);
      // Continue anyway with original text
    }

    // Now proceed to next step
    setIsTransitioning(false);
    goNext();
  };

  // Auto-advance once summary is ready (when waiting for summary)
  useEffect(() => {
    if (isTransitioning && !isSummarizing && screen3.summary && !screen3.enhancedText) {
      // Summary is ready, now enrich text
      handleNext();
    }
  }, [isTransitioning, isSummarizing, screen3.summary, screen3.enhancedText]);

  // Show loading state during analysis
  if (isAnalyzing) {
    return (
      <LoadingState
        icon="telescope"
        title={t('analyzing')}
        description="KI erkennt Kategorie & Tags, erstellt Titel & Preview-Zusammenfassung"
      />
    );
  }

  // Show loading state when transitioning to step 3
  if (isTransitioning) {
    return (
      <LoadingState
        icon="sparkles"
        title={t('enriching', 'Reichere Text an...')}
        description={t('enrichingDesc', 'KI fügt deine Antworten aus den Fragen in den Text ein')}
      />
    );
  }

  // Show error state with retry option
  if (analysisError && !hasAnalyzed) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center gap-4 py-8"
      >
        <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg flex flex-col items-center gap-3 max-w-md">
          <AlertCircle className="w-12 h-12 text-destructive" />
          <div className="text-center">
            <h2 className="text-lg font-semibold text-destructive mb-1">
              {t('errorTitle', 'Fehler bei der Analyse')}
            </h2>
            <p className="text-text-secondary text-xs">
              {analysisError}
            </p>
          </div>
          <div className="flex gap-2 mt-2">
            <Button
              onClick={analyzeText}
              variant="default"
              size="default"
              className="group"
            >
              <RefreshCw className="w-4 h-4 transition-transform group-hover:rotate-180" />
              {t('retry', 'Erneut versuchen')}
            </Button>
            <Button
              onClick={goBack}
              variant="ghost"
              size="default"
            >
              {t('back', 'Zurück')}
            </Button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <div className="grid grid-cols-1 lg:grid-cols-[70%,30%] gap-4">
        {/* Left Column: Questions (70%) */}
        <div className="space-y-4">
          {/* Required Questions */}
          <div>
            <div className="mb-3">
              <h2 className="section-title-observatory">{t('required.title', 'Pflichtangaben')}</h2>
              <p className="text-text-secondary text-xs mt-1">
                {t('required.description', 'Diese Angaben helfen bei der Mustererkennung')}
              </p>
            </div>
            <RequiredQuestions />
          </div>

          {/* Extra Questions Prompt */}
          {!showExtraQuestions && !screen2.completedExtraQuestions && (
            <ExtraQuestionsPrompt onAccept={() => setShowExtraQuestions(true)} />
          )}

          {/* Extra Questions Flow */}
          {showExtraQuestions && (
            <ExtraQuestionsFlow onComplete={() => setShowExtraQuestions(false)} />
          )}

          {/* Navigation */}
          <NavigationButtons
            onBack={goBack}
            onNext={handleNext}
            onReset={handleReset}
            canGoNext={canGoNext()}
            nextLabel={t('continue', 'Weiter')}
            showReset={true}
            resetConfirm={showResetConfirm}
          />
        </div>

        {/* Right Column: KI Analysis Sidebar (30%) */}
        <div className="lg:sticky lg:top-4 lg:self-start">
          <AIResultsSection />
        </div>
      </div>
    </AnimatePresence>
  );
}
