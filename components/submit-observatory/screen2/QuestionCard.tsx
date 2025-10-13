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
    <div className="space-y-3">
      {/* Question Title - Compact */}
      <h4 className="text-sm font-medium text-text-primary">{question.title}</h4>

      {/* Question Input */}
      <div>
        {question.type === 'text' && (
          <input
            type="text"
            value={answer || ''}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder={question.placeholder}
            className="input-observatory text-xs"
          />
        )}

        {question.type === 'checkbox' && (
          <div className="space-y-1.5">
            {question.options?.map((option) => (
              <label
                key={option}
                className="flex items-center gap-2 p-2 bg-glass-bg border border-glass-border rounded
                           hover:border-observatory-accent/30 cursor-pointer transition-all"
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
                  className="w-3 h-3 accent-observatory-accent"
                />
                <span className="text-xs text-text-primary">{option}</span>
              </label>
            ))}
          </div>
        )}

        {question.type === 'scale' && (
          <div className="space-y-2">
            {/* Labels */}
            <div className="flex justify-between text-[10px] text-text-tertiary">
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
                className="w-full h-1.5 bg-text-tertiary/20 rounded-full appearance-none cursor-pointer
                           [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5
                           [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-observatory-accent
                           [&::-webkit-slider-thumb]:cursor-pointer"
              />
              {/* Value Display */}
              <div className="flex justify-center mt-1.5">
                <span className="px-2 py-0.5 bg-observatory-accent/20 border border-observatory-accent/40 rounded text-xs text-observatory-accent">
                  {answer || question.min}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tip - Compact */}
      {question.tip && (
        <p className="text-[10px] text-text-tertiary italic leading-relaxed">
          💡 {question.tip}
        </p>
      )}

      {/* Actions - Compact */}
      <div className="flex gap-2 pt-1">
        <button
          onClick={onSkip}
          className="px-3 py-1.5 text-xs text-text-tertiary hover:text-text-secondary border border-glass-border rounded hover:border-observatory-accent/30"
        >
          {t('skip', 'Skip')}
        </button>
        <button
          onClick={handleSubmit}
          disabled={!canSubmit()}
          className="flex-1 btn-observatory text-xs py-1.5"
        >
          {t('next', 'Weiter →')}
        </button>
      </div>
    </div>
  );
}
