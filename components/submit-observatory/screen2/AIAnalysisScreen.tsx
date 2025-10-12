'use client';

import { useEffect, useState } from 'react';
import { useSubmitFlowStore } from '@/lib/stores/submitFlowStore';
import { AIResultsSection } from './AIResultsSection';
import { RequiredQuestions } from './RequiredQuestions';
import { ExtraQuestionsPrompt } from './ExtraQuestionsPrompt';
import { ExtraQuestionsFlow } from './ExtraQuestionsFlow';
import { ContinueButton } from '../shared/ContinueButton';
import { NavigationButtons } from '../shared/NavigationButtons';
import { useTranslations } from 'next-intl';
import { Loader2 } from 'lucide-react';

export function AIAnalysisScreen() {
  const t = useTranslations('submit.screen2');
  const { screen1, screen2, updateScreen2, setAIResults, setAnalyzing, isAnalyzing, canGoNext, goNext, goBack } =
    useSubmitFlowStore();
  const [showExtraQuestions, setShowExtraQuestions] = useState(false);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);

  // Run AI analysis on mount if not already analyzed
  useEffect(() => {
    if (!hasAnalyzed && screen1.text && !screen2.title) {
      analyzeText();
    }
  }, []);

  const analyzeText = async () => {
    setAnalyzing(true);
    try {
      const response = await fetch('/api/submit/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: screen1.text }),
      });

      if (!response.ok) throw new Error('Analysis failed');

      const data = await response.json();
      setAIResults(data.title, data.category, data.tags);
      setHasAnalyzed(true);
    } catch (error) {
      console.error('AI Analysis error:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  // Show loading state during analysis
  if (isAnalyzing) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="glass-card p-12">
          <div className="flex flex-col items-center gap-6 py-12">
            <Loader2 className="w-16 h-16 text-observatory-gold animate-spin" />
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-text-primary mb-2">
                {t('analyzing', 'Analysiere deine Erfahrung...')}
              </h2>
              <p className="text-text-secondary">
                {t('analyzingDesc', 'KI extrahiert Titel, Kategorie und Tags')}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* AI Results Section */}
      <AIResultsSection />

      {/* Required Questions */}
      <div className="glass-card p-8">
        <div className="mb-6">
          <h2 className="section-title-observatory">{t('required.title', 'Pflichtangaben')}</h2>
          <p className="text-text-secondary text-sm mt-2">
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
        onNext={goNext}
        canGoNext={canGoNext()}
        nextLabel={t('continue', 'Weiter →')}
      />
    </div>
  );
}
