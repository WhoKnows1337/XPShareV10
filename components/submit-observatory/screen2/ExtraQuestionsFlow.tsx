'use client';

import { useState } from 'react';
import { useSubmitFlowStore } from '@/lib/stores/submitFlowStore';
import { useTranslations } from 'next-intl';
import { QuestionCard } from './QuestionCard';

// Example questions from spec
const EXTRA_QUESTIONS = [
  {
    id: 'physical_effects',
    title: 'Körperliche Effekte?',
    type: 'checkbox' as const,
    options: ['Kopfschmerzen', 'Übelkeit', 'Kribbeln', 'Zeitverzerrung', 'Keine'],
    tip: 'Körperliche Reaktionen können auf elektromagnetische Einflüsse hinweisen',
    xp: 10,
  },
  {
    id: 'electromagnetic',
    title: 'Elektromagnetische Effekte?',
    type: 'checkbox' as const,
    options: ['Lichter flackerten', 'Handy ging aus', 'Elektronik ausgefallen', 'Keine'],
    tip: 'EM-Effekte sind häufige Begleiter von anomalen Phänomenen',
    xp: 10,
  },
  {
    id: 'emotional_state',
    title: 'Emotionaler Zustand?',
    type: 'scale' as const,
    min: 1,
    max: 10,
    minLabel: 'Angst',
    maxLabel: 'Frieden',
    tip: 'Emotionale Zustände helfen bei der Mustererkennung',
    xp: 10,
  },
  {
    id: 'witnesses_count',
    title: 'Anzahl der Zeugen?',
    type: 'text' as const,
    placeholder: 'z.B. 2',
    tip: 'Mehrere Zeugen stärken die Glaubwürdigkeit',
    xp: 10,
  },
  {
    id: 'weather',
    title: 'Wetterbedingungen?',
    type: 'checkbox' as const,
    options: ['Klar', 'Bewölkt', 'Regen', 'Nebel', 'Gewitter'],
    tip: 'Wetter kann eine Rolle bei bestimmten Phänomenen spielen',
    xp: 10,
  },
];

interface ExtraQuestionsFlowProps {
  onComplete: () => void;
}

export function ExtraQuestionsFlow({ onComplete }: ExtraQuestionsFlowProps) {
  const t = useTranslations('submit.screen2.extraQuestions');
  const { screen2, setExtraQuestion, updateScreen2 } = useSubmitFlowStore();
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentQuestion = EXTRA_QUESTIONS[currentIndex];
  const progress = ((currentIndex + 1) / EXTRA_QUESTIONS.length) * 100;

  const handleNext = (answer: any) => {
    setExtraQuestion(currentQuestion.id, answer);

    if (currentIndex < EXTRA_QUESTIONS.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Completed all questions
      updateScreen2({ completedExtraQuestions: true });
      onComplete();
    }
  };

  const handleSkip = () => {
    if (currentIndex < EXTRA_QUESTIONS.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      updateScreen2({ completedExtraQuestions: true });
      onComplete();
    }
  };

  const handleSkipAll = () => {
    updateScreen2({ completedExtraQuestions: false });
    onComplete();
  };

  return (
    <div className="glass-card p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-text-primary">
          💎 {t('title', 'Extra Questions')}
        </h3>
        <span className="font-mono text-sm text-text-tertiary">
          {currentIndex + 1}/{EXTRA_QUESTIONS.length}
        </span>
      </div>

      {/* Completed Questions (Collapsed) */}
      {EXTRA_QUESTIONS.slice(0, currentIndex).map((q, i) => (
        <div
          key={q.id}
          className="flex items-center justify-between p-3 mb-2 bg-success-soft/5 border border-success-soft/20 rounded-lg cursor-pointer
                     hover:bg-success-soft/8 transition-colors"
        >
          <span className="text-sm text-text-secondary">
            ✓ Q{i + 1}: {q.title}
          </span>
          <span className="badge-observatory">+{q.xp} XP ✓</span>
        </div>
      ))}

      {/* Current Question */}
      <QuestionCard
        question={currentQuestion}
        questionNumber={currentIndex + 1}
        onNext={handleNext}
        onSkip={handleSkip}
        currentAnswer={screen2.extraQuestions[currentQuestion.id]}
      />

      {/* Progress Dots */}
      <div className="flex justify-center gap-2 mt-6 mb-4">
        {EXTRA_QUESTIONS.map((_, i) => (
          <div
            key={i}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
              i < currentIndex
                ? 'bg-success-soft shadow-[0_0_8px_rgba(127,176,105,0.5)]'
                : i === currentIndex
                ? 'bg-observatory-gold shadow-[0_0_8px_rgba(212,165,116,0.5)] scale-125'
                : 'bg-text-tertiary/30'
            }`}
          />
        ))}
      </div>

      {/* Skip All Button */}
      <div className="text-center">
        <button
          onClick={handleSkipAll}
          className="text-sm text-text-tertiary hover:text-text-secondary transition-colors"
        >
          {t('skipAll', 'Alle überspringen')}
        </button>
      </div>
    </div>
  );
}
