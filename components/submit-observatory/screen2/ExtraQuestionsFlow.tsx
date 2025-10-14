'use client';

import { useState, useEffect } from 'react';
import { useSubmitFlowStore } from '@/lib/stores/submitFlowStore';
import { useTranslations } from 'next-intl';
import { QuestionCard } from './QuestionCard';
import { Loader2 } from 'lucide-react';

interface QuestionOption {
  value: string;
  label: string;
  image_url?: string;
  icon?: string;
  description?: string;
}

interface DynamicQuestion {
  id: string;
  type: 'checkbox' | 'radio' | 'scale' | 'text' | 'textarea' | 'dropdown' | 'dropdown-multi' | 'image-select' | 'image-multi' | 'rating' | 'ai-text' | 'date';
  question: string;
  options: QuestionOption[];
  required: boolean;
  helpText?: string;
  maps_to_attribute?: string | null;
  priority: number;
}

interface ExtraQuestionsFlowProps {
  onComplete: () => void;
}

export function ExtraQuestionsFlow({ onComplete }: ExtraQuestionsFlowProps) {
  const t = useTranslations('submit.screen2.extraQuestions');
  const { screen2, setExtraQuestion, updateScreen2 } = useSubmitFlowStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [questions, setQuestions] = useState<DynamicQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Load questions from API on mount
  useEffect(() => {
    const loadQuestions = async () => {
      if (!screen2.category) {
        setLoadError('No category detected');
        setIsLoading(false);
        return;
      }

      try {
        // Build query string with extracted attributes for smart filtering
        const params = new URLSearchParams({
          category: screen2.category,
          extractedAttributes: JSON.stringify(screen2.attributes || {})
        });

        const response = await fetch(`/api/questions?${params.toString()}`);
        if (!response.ok) {
          throw new Error('Failed to load questions');
        }

        const data = await response.json();
        setQuestions(data.questions || []);

        console.log(`Loaded ${data.questions?.length || 0} questions for category ${screen2.category}`);
        if (data.stats?.filtered) {
          console.log(`Filtered out ${data.stats.filtered} questions (already answered by AI)`);
        }
      } catch (error) {
        console.error('Failed to load questions:', error);
        setLoadError('Failed to load questions');
      } finally {
        setIsLoading(false);
      }
    };

    loadQuestions();
  }, [screen2.category, screen2.attributes]);

  // If no questions after filtering, complete immediately
  useEffect(() => {
    if (!isLoading && questions.length === 0 && !loadError) {
      console.log('No questions to show - all answered by AI or category has no questions');
      updateScreen2({ completedExtraQuestions: true });
      onComplete();
    }
  }, [isLoading, questions.length, loadError]);

  const currentQuestion = questions[currentIndex];

  const handleNext = (answer: any) => {
    if (!currentQuestion) return;

    setExtraQuestion(currentQuestion.id, answer);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Completed all questions
      updateScreen2({ completedExtraQuestions: true });
      onComplete();
    }
  };

  const handleSkip = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      updateScreen2({ completedExtraQuestions: true });
      onComplete();
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleSkipAll = () => {
    updateScreen2({ completedExtraQuestions: false });
    onComplete();
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="p-6 bg-glass-bg border border-glass-border rounded flex items-center justify-center gap-3">
        <Loader2 className="h-5 w-5 animate-spin text-observatory-accent" />
        <span className="text-sm text-text-secondary">
          {t('loading', 'Lade Fragen...')}
        </span>
      </div>
    );
  }

  // Error state
  if (loadError) {
    return (
      <div className="p-6 bg-destructive/10 border border-destructive/30 rounded">
        <p className="text-sm text-destructive">{loadError}</p>
        <button
          onClick={onComplete}
          className="mt-3 text-xs text-text-secondary hover:text-text-primary underline"
        >
          {t('skip', 'Überspringen')}
        </button>
      </div>
    );
  }

  // No questions state (shouldn't happen due to useEffect auto-complete)
  if (questions.length === 0) {
    return null;
  }

  // Convert DB question to QuestionCard format
  const questionForCard = {
    id: currentQuestion.id,
    title: currentQuestion.question,
    type: currentQuestion.type,
    options: currentQuestion.options || [],
    tip: currentQuestion.helpText || '',
    xp: 10, // Default XP for all questions
    min: currentQuestion.type === 'scale' ? 1 : undefined,
    max: currentQuestion.type === 'scale' ? 10 : undefined,
    minLabel: currentQuestion.type === 'scale' ? 'Min' : undefined,
    maxLabel: currentQuestion.type === 'scale' ? 'Max' : undefined,
  };

  return (
    <div className="p-3 bg-glass-bg border border-glass-border rounded">
      {/* Compact Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-observatory-accent">
            Q{currentIndex + 1}/{questions.length}
          </span>
          <span className="text-[10px] text-text-tertiary uppercase tracking-wide">
            +{questionForCard.xp} XP
          </span>
        </div>
      </div>

      {/* Current Question */}
      <QuestionCard
        question={questionForCard}
        questionNumber={currentIndex + 1}
        onNext={handleNext}
        onSkip={handleSkip}
        onBack={handleBack}
        isFirstQuestion={currentIndex === 0}
        isRequired={currentQuestion.required}
        currentAnswer={screen2.extraQuestions[currentQuestion.id]}
      />

      {/* Skip All - Below buttons */}
      <div className="flex justify-center mt-2">
        <button
          onClick={handleSkipAll}
          className="text-[10px] text-text-tertiary hover:text-text-secondary uppercase tracking-wide"
        >
          {t('skipAll', 'Alle überspringen')}
        </button>
      </div>

      {/* Compact Progress Dots */}
      <div className="flex justify-center gap-1.5 mt-3">
        {questions.map((_, i) => (
          <div
            key={i}
            className={`w-1.5 h-1.5 rounded-full transition-all ${
              i < currentIndex
                ? 'bg-success-soft'
                : i === currentIndex
                ? 'bg-observatory-accent scale-125'
                : 'bg-text-tertiary/30'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
