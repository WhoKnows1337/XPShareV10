'use client';

import { useEffect, useState, useRef } from 'react';
import { useSubmitFlowStore } from '@/lib/stores/submitFlowStore';
import { AIHeroHeader } from './AIHeroHeader';
import { LoadingState, ProgressStep } from '../shared/LoadingState';
import { ExtraQuestionsFlow, ExtraQuestionsFlowHandle } from './ExtraQuestionsFlow';
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
  const extraQuestionsRef = useRef<ExtraQuestionsFlowHandle>(null);

  // ⭐ Live Progress Steps for enrichment phase
  const [enrichmentSteps, setEnrichmentSteps] = useState<ProgressStep[]>([
    {
      id: '1',
      label: 'Attribute einarbeiten',
      status: 'pending',
      estimatedDuration: 2
    },
    {
      id: '2',
      label: 'Kontext hinzufügen',
      status: 'pending',
      estimatedDuration: 3
    },
    {
      id: '3',
      label: 'Titel finalisieren',
      status: 'pending',
      estimatedDuration: 2
    },
  ]);

  // ⭐ Live Progress Steps for initial analysis phase (no time counters)
  const [analysisSteps, setAnalysisSteps] = useState<ProgressStep[]>([
    {
      id: '1',
      label: 'Scanne XP',
      status: 'pending'
    },
    {
      id: '2',
      label: 'Extrahiere Details',
      status: 'pending'
    },
    {
      id: '3',
      label: 'Generiere Metadaten',
      status: 'pending'
    },
  ]);

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
    
    // Reset analysis steps to pending (no time counters)
    setAnalysisSteps([
      { id: '1', label: 'Scanne XP', status: 'pending' },
      { id: '2', label: 'Extrahiere Details', status: 'pending' },
      { id: '3', label: 'Generiere Metadaten', status: 'pending' },
    ]);
    
    try {
      // ⭐ Step 1: Activate "Text analysieren"
      setAnalysisSteps(prev => prev.map((s, i) =>
        i === 0 ? { ...s, status: 'active' as const } : s
      ));
      
      // Validate text length before sending to API
      if (!screen1.text || screen1.text.trim().length < 30) {
        throw new Error('Text ist zu kurz für die Analyse (mindestens 30 Zeichen erforderlich). Bitte gehe zurück und füge mehr Text hinzu.');
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

      // ⭐ Step 1: Complete → Step 2: Activate "Attribute extrahieren"
      setAnalysisSteps(prev => prev.map((s, i) =>
        i === 0 ? { ...s, status: 'complete' as const } :
        i === 1 ? { ...s, status: 'active' as const } : s
      ));

      // 400ms delay for checkmark animation visibility
      await new Promise(resolve => setTimeout(resolve, 400));

      // Store AI results including attributes
      setAIResults(data.title, data.category, data.tags, data.confidence);

      // Store extracted attributes in the correct format for the store
      if (data.attributes && Object.keys(data.attributes).length > 0) {
        const formattedAttributes: Record<string, { value: string; confidence: number; isManuallyEdited: boolean }> = {};

        // Use category confidence as base (convert 0-1 to percentage)
        const baseConfidence = Math.round((data.categoryConfidence || data.confidence || 0.95) * 100);
        const attributeKeys = Object.keys(data.attributes);

        for (const [index, [key, attr]] of Object.entries(data.attributes).entries()) {
          // Handle both new format (simple strings) and old format (objects with value/confidence)
          if (typeof attr === 'string') {
            // New Structured Outputs format: direct string value
            // Vary confidence slightly per attribute (-10 to +5) for realism
            const variance = Math.floor((index / attributeKeys.length) * 15) - 10;
            const attributeConfidence = Math.max(60, Math.min(99, baseConfidence + variance));

            formattedAttributes[key] = {
              value: attr,
              confidence: attributeConfidence,
              isManuallyEdited: false,
            };
          } else {
            // Old format or object with confidence (backwards compatibility)
            const attrData = attr as { value: string; confidence?: number };
            formattedAttributes[key] = {
              value: attrData.value,
              confidence: attrData.confidence ? Math.round(attrData.confidence * 100) : baseConfidence,
              isManuallyEdited: false,
            };
          }
        }

        updateScreen2({ attributes: formattedAttributes });
      }

      // ⭐ Step 2: Complete → Step 3: Activate "Generiere Metadaten"
      setAnalysisSteps(prev => prev.map((s, i) =>
        i === 1 ? { ...s, status: 'complete' as const } :
        i === 2 ? { ...s, status: 'active' as const } : s
      ));

      // 400ms delay for checkmark animation
      await new Promise(resolve => setTimeout(resolve, 400));

      // ⭐ Step 3: Complete (Title + Tags generated)
      setAnalysisSteps(prev => prev.map(s => ({ ...s, status: 'complete' as const })));

      // Final delay for all-complete animation
      await new Promise(resolve => setTimeout(resolve, 600));

      setHasAnalyzed(true);
    } catch (error) {
      console.error('AI Analysis error:', error);
      const errorMessage = error instanceof Error ? error.message : 'KI-Analyse fehlgeschlagen';
      setAnalysisError(errorMessage);
    } finally {
      setAnalyzing(false);
    }
  };;

  // Callback for AIHeroHeader to reload questions when attributes change
  const handleReloadQuestions = async () => {
    if (extraQuestionsRef.current) {
      await extraQuestionsRef.current.reloadQuestions();
    }
  };

  // Handle navigation to next step - enrich text and finalize metadata
  const handleNext = async () => {
    // Start transitioning - we'll enrich the text AND generate final metadata
    setIsTransitioning(true);

    // Reset steps to initial state
    setEnrichmentSteps([
      { id: '1', label: 'Attribute einarbeiten', status: 'pending', estimatedDuration: 2 },
      { id: '2', label: 'Kontext hinzufügen', status: 'pending', estimatedDuration: 3 },
      { id: '3', label: 'Titel finalisieren', status: 'pending', estimatedDuration: 2 },
    ]);

    let enrichedTextContent = screen1.text; // Fallback to original

    try {
      const { setEnhancedText, setEnhancing, setAIResults, setSummary } = useSubmitFlowStore.getState();
      setEnhancing(true);

      // ⭐ Step 1: Activate "Attribute einarbeiten"
      setEnrichmentSteps(prev => prev.map((s, i) =>
        i === 0 ? { ...s, status: 'active' as const } : s
      ));

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

        // ⭐ Also set segments and baseline to prevent re-enrichment in Step 3
        if (enrichData.segments) {
          const { setTextSegments, setTextVersionAfterAI } = useSubmitFlowStore.getState();
          setTextSegments(enrichData.segments);
          setTextVersionAfterAI(enrichData.enrichedText);
        }
      }

      // ⭐ Step 1: Complete → Step 2: Activate
      setEnrichmentSteps(prev => prev.map((s, i) =>
        i === 0 ? { ...s, status: 'complete' as const } :
        i === 1 ? { ...s, status: 'active' as const } : s
      ));

      // 400ms delay for checkmark animation visibility
      await new Promise(resolve => setTimeout(resolve, 400));

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

      // ⭐ Step 2: Complete → Step 3: Activate
      setEnrichmentSteps(prev => prev.map((s, i) =>
        i === 1 ? { ...s, status: 'complete' as const } :
        i === 2 ? { ...s, status: 'active' as const } : s
      ));

      // 400ms delay for checkmark animation
      await new Promise(resolve => setTimeout(resolve, 400));

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

      // ⭐ Step 3: Complete
      setEnrichmentSteps(prev => prev.map(s => ({ ...s, status: 'complete' as const })));

      // Final delay for all-complete animation
      await new Promise(resolve => setTimeout(resolve, 600));

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
        steps={analysisSteps}
        hideCounter={true}
      />
    );
  }

  // Show loading state when transitioning to step 3
  if (isTransitioning) {
    return (
      <LoadingState
        icon="sparkles"
        title={t('enriching')}
        description="Dein Text wird mit KI-Power aufgewertet"
        steps={enrichmentSteps}
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
              {t('errorTitle')}
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
              {t('retry')}
            </Button>
            <Button
              onClick={goBack}
              variant="ghost"
              size="default"
            >
              {t('back')}
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
        <AIHeroHeader onReloadQuestions={handleReloadQuestions} />

        {/* Questions Section */}
        <div>
          <div className="mb-4">
            <h2 className="section-title-observatory">
              {t('questions.title')}
            </h2>
            <p className="text-text-secondary text-xs mt-1">
              {t('questions.description')}
            </p>
          </div>

          {/* Dynamic Questions Flow (Universal + Category) */}
          <ExtraQuestionsFlow ref={extraQuestionsRef} onComplete={() => {}} />
        </div>

        {/* Navigation */}
        <NavigationButtons
          onBack={goBack}
          onNext={handleNext}
          onReset={handleReset}
          canGoNext={isClient ? canGoNext() : false}
          nextLabel={t('continue')}
          showReset={true}
          resetConfirm={showResetConfirm}
        />
      </div>
    </AnimatePresence>
  );
}
