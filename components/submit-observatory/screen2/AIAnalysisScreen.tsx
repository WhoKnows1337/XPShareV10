'use client';

import { useEffect, useState } from 'react';
import { useSubmitFlowStore } from '@/lib/stores/submitFlowStore';
import { AIHeroHeader } from './AIHeroHeader';
import { LoadingState } from '../shared/LoadingState';
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
    canGoNext,
    goNext,
    goBack,
    reset,
    isDraft,
    saveDraft
  } = useSubmitFlowStore();
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
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
      // Validate text length before sending to API
      if (!screen1.text || screen1.text.trim().length < 50) {
        throw new Error('Text ist zu kurz für die Analyse (mindestens 50 Zeichen erforderlich). Bitte gehe zurück und füge mehr Text hinzu.');
      }

      // Step 1: Complete analysis including title, category, tags, AND attributes
      const response = await fetch('/api/submit/analyze-complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: screen1.text }),
      });

      if (!response.ok) {
        // Get the actual error message from the API
        const errorData = await response.json().catch(() => ({ error: 'Analysis failed' }));
        throw new Error(errorData.error || `Analysis failed with status ${response.status}`);
      }

      const data = await response.json();

      // Store AI results including attributes
      setAIResults(data.title, data.category, data.tags, data.confidence);

      // Store extracted attributes in the correct format for the store
      if (data.attributes && Object.keys(data.attributes).length > 0) {
        const formattedAttributes: Record<string, { value: string; confidence: number; isManuallyEdited: boolean }> = {};

        for (const [key, attr] of Object.entries(data.attributes)) {
          // Handle both new format (simple strings) and old format (objects with value/confidence)
          if (typeof attr === 'string') {
            // New Structured Outputs format: direct string value
            formattedAttributes[key] = {
              value: attr,
              confidence: 95, // Structured Outputs = very reliable (schema-compliant)
              isManuallyEdited: false,
            };
          } else {
            // Old format or object with confidence (backwards compatibility)
            const attrData = attr as { value: string; confidence?: number };
            formattedAttributes[key] = {
              value: attrData.value,
              confidence: attrData.confidence ? Math.round(attrData.confidence * 100) : 95,
              isManuallyEdited: false,
            };
          }
        }

        updateScreen2({ attributes: formattedAttributes });
      }

      // Store summary directly from analyze-complete (no separate API call needed!)
      if (data.summary) {
        const { setSummary } = useSubmitFlowStore.getState();
        setSummary(data.summary);
      }

      setHasAnalyzed(true);
    } catch (error) {
      console.error('AI Analysis error:', error);
      const errorMessage = error instanceof Error ? error.message : 'KI-Analyse fehlgeschlagen';
      setAnalysisError(errorMessage);
    } finally {
      setAnalyzing(false);
    }
  };

  // Handle navigation to next step - enrich text and finalize metadata
  const handleNext = async () => {
    // Start transitioning - we'll enrich the text AND generate final metadata
    setIsTransitioning(true);

    let enrichedTextContent = screen1.text; // Fallback to original

    try {
      const { setEnhancedText, setEnhancing, setAIResults, setSummary } = useSubmitFlowStore.getState();
      setEnhancing(true);

      // Step 1: Enrich text with attributes and answers from questions
      const enrichResponse = await fetch('/api/submit/enrich-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: screen1.text,
          attributes: screen2.attributes,
          answers: screen2.extraQuestions,
          language: 'de',
        }),
      });

      if (enrichResponse.ok) {
        const enrichData = await enrichResponse.json();
        enrichedTextContent = enrichData.enrichedText;
        setEnhancedText(enrichData.enrichedText, enrichData.highlights);
      }

      setEnhancing(false);

      // Step 2: Generate final metadata (Title, Summary, Tags) based on enriched text
      const metadataResponse = await fetch('/api/submit/finalize-metadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enhancedText: enrichedTextContent,
          originalText: screen1.text,
          category: screen2.category,
          metadata: {
            date: screen2.date,
            time: screen2.time,
            location: screen2.location,
            duration: screen2.duration,
          },
          attributes: screen2.attributes,
          language: 'de',
        }),
      });

      if (metadataResponse.ok) {
        const metadataData = await metadataResponse.json();

        // Update title, summary, and tags with final metadata
        setAIResults(
          metadataData.title,
          screen2.category,
          metadataData.tags,
          metadataData.qualityScore?.title || 100
        );
        setSummary(metadataData.summary);
      }

    } catch (error) {
      console.error('Transition error:', error);
      const { setEnhancing } = useSubmitFlowStore.getState();
      setEnhancing(false);
      // Continue anyway with existing data
    }

    // Now proceed to next step
    setIsTransitioning(false);
    goNext();
  };

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
        title={t('enriching', '✨ KI vervollständigt deine Experience...')}
        description={t('enrichingDesc', 'Text wird angereichert und finale Metadaten (Titel, Zusammenfassung, Tags) werden generiert')}
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
      <div className="space-y-6">
        {/* Hero Header: AI Analysis Results */}
        <AIHeroHeader />

        {/* Questions Section */}
        <div>
          <div className="mb-4">
            <h2 className="section-title-observatory">
              {t('questions.title', 'Fragen zur Experience')}
            </h2>
            <p className="text-text-secondary text-xs mt-1">
              {t('questions.description', 'Beantworte die Fragen um Pattern-Matching zu verbessern')}
            </p>
          </div>

          {/* Dynamic Questions Flow (Universal + Category) */}
          <ExtraQuestionsFlow onComplete={() => {}} />
        </div>

        {/* Navigation */}
        <NavigationButtons
          onBack={goBack}
          onNext={handleNext}
          onReset={handleReset}
          canGoNext={isClient ? canGoNext() : false}
          nextLabel={t('continue', 'Weiter zum Editor')}
          showReset={true}
          resetConfirm={showResetConfirm}
        />
      </div>
    </AnimatePresence>
  );
}
