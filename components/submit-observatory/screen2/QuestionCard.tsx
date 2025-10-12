'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Lightbulb } from 'lucide-react';

interface Question {
  id: string;
  title: string;
  type: 'text' | 'checkbox' | 'scale';
  options?: string[];
  min?: number;
  max?: number;
  minLabel?: string;
  maxLabel?: string;
  placeholder?: string;
  tip?: string;
  xp: number;
}

interface QuestionCardProps {
  question: Question;
  questionNumber: number;
  onNext: (answer: any) => void;
  onSkip: () => void;
  currentAnswer?: any;
}

export function QuestionCard({
  question,
  questionNumber,
  onNext,
  onSkip,
  currentAnswer,
}: QuestionCardProps) {
  const t = useTranslations('submit.screen2.question');
  const [answer, setAnswer] = useState<any>(currentAnswer || null);

  const handleSubmit = () => {
    if (answer !== null && answer !== undefined) {
      onNext(answer);
    }
  };

  const canSubmit = () => {
    if (question.type === 'checkbox') {
      return Array.isArray(answer) && answer.length > 0;
    }
    return answer !== null && answer !== undefined && answer !== '';
  };

  return (
    <div className="p-6 bg-space-mid/40 border border-glass-border rounded-lg shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="font-mono text-xs text-text-monospace uppercase tracking-wider">
          → Q{questionNumber}
        </span>
        <span className="badge-observatory">+{question.xp} XP</span>
      </div>

      {/* Question Title */}
      <h4 className="text-lg font-semibold text-text-primary mb-6">{question.title}</h4>

      {/* Question Input */}
      <div className="mb-6">
        {question.type === 'text' && (
          <input
            type="text"
            value={answer || ''}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder={question.placeholder}
            className="input-observatory"
          />
        )}

        {question.type === 'checkbox' && (
          <div className="space-y-2">
            {question.options?.map((option) => (
              <label
                key={option}
                className="flex items-center gap-3 p-3 bg-text-primary/5 border border-text-primary/10 rounded-lg
                           hover:bg-text-primary/10 cursor-pointer transition-all"
              >
                <input
                  type="checkbox"
                  checked={Array.isArray(answer) && answer.includes(option)}
                  onChange={(e) => {
                    const currentAnswers = Array.isArray(answer) ? answer : [];
                    if (e.target.checked) {
                      setAnswer([...currentAnswers, option]);
                    } else {
                      setAnswer(currentAnswers.filter((a: string) => a !== option));
                    }
                  }}
                  className="w-4 h-4 accent-observatory-gold"
                />
                <span className="text-text-primary">{option}</span>
              </label>
            ))}
          </div>
        )}

        {question.type === 'scale' && (
          <div className="space-y-4">
            {/* Labels */}
            <div className="flex justify-between text-sm text-text-secondary">
              <span>{question.minLabel}</span>
              <span>{question.maxLabel}</span>
            </div>

            {/* Slider */}
            <div className="relative">
              <input
                type="range"
                min={question.min}
                max={question.max}
                value={answer || question.min}
                onChange={(e) => setAnswer(parseInt(e.target.value))}
                className="w-full h-2 bg-text-tertiary/20 rounded-full appearance-none cursor-pointer
                           [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5
                           [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-observatory-gold
                           [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(212,165,116,0.6)]
                           [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:transition-transform
                           [&::-webkit-slider-thumb]:hover:scale-110"
              />
              {/* Value Display */}
              <div className="flex justify-center mt-2">
                <span className="px-3 py-1 bg-observatory-gold/15 border border-observatory-gold/30 rounded-md text-observatory-gold font-mono font-semibold">
                  {answer || question.min}
                </span>
              </div>
            </div>

            {/* Scale Numbers */}
            <div className="flex justify-between text-xs text-text-monospace font-mono">
              {Array.from({ length: (question.max || 10) - (question.min || 1) + 1 }, (_, i) => i + (question.min || 1)).map(
                (num) => (
                  <span key={num} className={answer === num ? 'text-observatory-gold font-bold' : ''}>
                    {num}
                  </span>
                )
              )}
            </div>
          </div>
        )}
      </div>

      {/* Tip */}
      {question.tip && (
        <div className="flex items-start gap-3 p-3 bg-observatory-gold/5 border-l-3 border-observatory-gold/30 rounded-lg mb-6">
          <Lightbulb className="w-4 h-4 text-observatory-gold flex-shrink-0 mt-0.5" />
          <p className="text-sm text-text-secondary">{question.tip}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={onSkip}
          className="flex-1 px-4 py-2.5 bg-text-primary/5 border border-text-primary/20 rounded-lg
                     text-text-secondary font-medium hover:bg-text-primary/10 transition-colors"
        >
          {t('skip', 'Überspringen')}
        </button>
        <button
          onClick={handleSubmit}
          disabled={!canSubmit()}
          className="flex-1 btn-observatory"
        >
          {t('next', 'Weiter →')}
        </button>
      </div>
    </div>
  );
}
