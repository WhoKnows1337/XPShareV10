'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Star, Calendar as CalendarIcon } from 'lucide-react';
import Image from 'next/image';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface QuestionOption {
  value: string;
  label: string;
  image_url?: string;
  icon?: string;
  description?: string;
}

interface Question {
  id: string;
  title: string;
  type: 'text' | 'textarea' | 'checkbox' | 'radio' | 'scale' | 'dropdown' | 'dropdown-multi' | 'image-select' | 'image-multi' | 'rating' | 'ai-text' | 'date';
  options?: QuestionOption[];
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
  const [answer, setAnswer] = useState<any>(currentAnswer || (question.type === 'checkbox' || question.type === 'dropdown-multi' || question.type === 'image-multi' ? [] : ''));

  const handleSubmit = () => {
    if (answer !== null && answer !== undefined) {
      onNext(answer);
    }
  };

  const canSubmit = () => {
    if (question.type === 'checkbox' || question.type === 'dropdown-multi' || question.type === 'image-multi') {
      return Array.isArray(answer) && answer.length > 0;
    }
    return answer !== null && answer !== undefined && answer !== '';
  };

  const renderInput = () => {
    const opts = question.options || [];

    switch (question.type) {
      case 'text':
      case 'ai-text':
        return (
          <input
            type="text"
            value={answer || ''}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder={question.placeholder || 'Deine Antwort...'}
            className="input-observatory text-xs"
          />
        );

      case 'textarea':
        return (
          <textarea
            value={answer || ''}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder={question.placeholder || 'Deine Antwort...'}
            rows={4}
            className="input-observatory text-xs resize-y"
          />
        );

      case 'radio':
        return (
          <div className="space-y-1.5">
            {opts.map((option) => (
              <label
                key={option.value}
                className="flex items-center gap-2 p-2 bg-glass-bg border border-glass-border rounded hover:border-observatory-accent/30 cursor-pointer transition-all"
              >
                <input
                  type="radio"
                  name={question.id}
                  value={option.value}
                  checked={answer === option.value}
                  onChange={(e) => setAnswer(e.target.value)}
                  className="w-3 h-3 accent-observatory-accent"
                />
                {option.icon && <span className="text-sm">{option.icon}</span>}
                <span className="text-xs text-text-primary">{option.label}</span>
              </label>
            ))}
          </div>
        );

      case 'checkbox':
        return (
          <div className="space-y-1.5">
            {opts.map((option) => (
              <label
                key={option.value}
                className="flex items-center gap-2 p-2 bg-glass-bg border border-glass-border rounded hover:border-observatory-accent/30 cursor-pointer transition-all"
              >
                <input
                  type="checkbox"
                  checked={Array.isArray(answer) && answer.includes(option.value)}
                  onChange={(e) => {
                    const currentAnswers = Array.isArray(answer) ? answer : [];
                    if (e.target.checked) {
                      setAnswer([...currentAnswers, option.value]);
                    } else {
                      setAnswer(currentAnswers.filter((a: string) => a !== option.value));
                    }
                  }}
                  className="w-3 h-3 accent-observatory-accent"
                />
                {option.icon && <span className="text-sm">{option.icon}</span>}
                <span className="text-xs text-text-primary">{option.label}</span>
              </label>
            ))}
          </div>
        );

      case 'dropdown':
        return (
          <Select value={answer} onValueChange={setAnswer}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={question.placeholder || "Auswählen..."} />
            </SelectTrigger>
            <SelectContent>
              {opts.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.icon && <span className="mr-2">{option.icon}</span>}
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'rating':
        const maxRating = question.max || 5;
        const currentRating = parseInt(answer) || 0;
        return (
          <div className="space-y-2">
            <div className="flex gap-1 justify-center">
              {Array.from({ length: maxRating }, (_, i) => i + 1).map((rating) => (
                <button
                  key={rating}
                  type="button"
                  onClick={() => setAnswer(rating.toString())}
                  className="p-1 hover:scale-110 transition-transform"
                >
                  <Star
                    className={`w-7 h-7 ${
                      rating <= currentRating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            {currentRating > 0 && (
              <p className="text-xs text-text-tertiary text-center">
                {currentRating} von {maxRating} Sternen
              </p>
            )}
          </div>
        );

      case 'image-select':
      case 'image-multi':
        const selectedValues = Array.isArray(answer) ? answer : [answer];
        const isMultiple = question.type === 'image-multi';

        return (
          <div className="grid grid-cols-2 gap-2">
            {opts.map((option) => {
              const isSelected = isMultiple
                ? selectedValues.includes(option.value)
                : answer === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    if (isMultiple) {
                      const current = Array.isArray(answer) ? answer : [];
                      setAnswer(
                        current.includes(option.value)
                          ? current.filter((v: string) => v !== option.value)
                          : [...current, option.value]
                      );
                    } else {
                      setAnswer(option.value);
                    }
                  }}
                  className={`relative rounded border-2 overflow-hidden transition-all ${
                    isSelected
                      ? 'border-observatory-accent'
                      : 'border-glass-border hover:border-glass-border/60'
                  }`}
                >
                  {option.image_url && (
                    <div className="relative aspect-square">
                      <Image
                        src={option.image_url}
                        alt={option.label}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="p-2 bg-glass-bg">
                    <p className="text-xs font-medium text-center">{option.label}</p>
                  </div>
                  {isSelected && (
                    <div className="absolute top-1 right-1 w-5 h-5 bg-observatory-accent rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        );

      case 'scale':
        return (
          <div className="space-y-2">
            <div className="flex justify-between text-[10px] text-text-tertiary">
              <span>{question.minLabel || 'Min'}</span>
              <span>{question.maxLabel || 'Max'}</span>
            </div>
            <div className="relative">
              <input
                type="range"
                min={question.min || 1}
                max={question.max || 10}
                value={answer || question.min || 1}
                onChange={(e) => setAnswer(parseInt(e.target.value))}
                className="w-full h-1.5 bg-text-tertiary/20 rounded-full appearance-none cursor-pointer
                           [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5
                           [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-observatory-accent
                           [&::-webkit-slider-thumb]:cursor-pointer"
              />
              <div className="flex justify-center mt-1.5">
                <span className="px-2 py-0.5 bg-observatory-accent/20 border border-observatory-accent/40 rounded text-xs text-observatory-accent">
                  {answer || question.min || 1}
                </span>
              </div>
            </div>
          </div>
        );

      case 'date':
        const selectedDate = answer ? new Date(answer) : undefined;
        return (
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="w-full flex items-center gap-2 p-2 bg-glass-bg border border-glass-border rounded hover:border-observatory-accent/30 cursor-pointer transition-all text-left"
              >
                <CalendarIcon className="w-4 h-4 text-observatory-accent" />
                <span className="text-xs text-text-primary">
                  {selectedDate ? format(selectedDate, 'PPP') : (question.placeholder || 'Datum auswählen...')}
                </span>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => setAnswer(date ? date.toISOString() : null)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        );

      default:
        return <p className="text-xs text-destructive">Unsupported question type: {question.type}</p>;
    }
  };

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-text-primary">{question.title}</h4>
      <div>{renderInput()}</div>

      {question.tip && (
        <p className="text-[10px] text-text-tertiary italic leading-relaxed">
          💡 {question.tip}
        </p>
      )}

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
          className="flex-1 btn-observatory text-xs py-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {t('next', 'Weiter →')}
        </button>
      </div>
    </div>
  );
}
