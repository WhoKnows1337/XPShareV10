'use client';

import { useState, useEffect } from 'react';
import { useSubmitFlowStore } from '@/lib/stores/submitFlowStore';
import { TextInputArea } from './TextInputArea';
import { WordCounter } from './WordCounter';
import { VoiceButton } from './VoiceButton';
import { OCRButton } from './OCRButton';
import { NavigationButtons } from '../shared/NavigationButtons';
import { useTranslations } from 'next-intl';
import { Lock } from 'lucide-react';

export function TextInputScreen() {
  const t = useTranslations('submit.screen1');
  const { screen1, setText, canGoNext, goNext, reset, isDraft, saveDraft } = useSubmitFlowStore();
  const [showResetConfirm, setShowResetConfirm] = useState(false);
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
    }, 30000); // 30 seconds

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

  const handleVoiceTranscript = (transcript: string) => {
    const newText = screen1.text ? `${screen1.text}\n\n${transcript}` : transcript;
    setText(newText);
  };

  const handleOCRText = (ocrText: string) => {
    const newText = screen1.text ? `${screen1.text}\n\n${ocrText}` : ocrText;
    setText(newText);
  };

  return (
    <div className="space-y-4">
      {/* Compact Header */}
      <div className="mb-3">
        <h1 className="section-title-observatory">
          {t('title')}
        </h1>
        <p className="text-text-secondary text-xs leading-snug mt-2">
          {t('subtitle')}
        </p>
      </div>

      {/* Text Input Area - Compact */}
      <div className="mb-3">
        <TextInputArea
          value={screen1.text}
          onChange={setText}
          placeholder={t('placeholder')}
        />
      </div>

      {/* Word Counter + Input Methods Row */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <WordCounter wordCount={screen1.wordCount} charCount={screen1.charCount} />
        <div className="flex gap-2">
          <VoiceButton onTranscript={handleVoiceTranscript} />
          <OCRButton onTextExtracted={handleOCRText} />
        </div>
      </div>

      {/* Privacy Notice - Hidden */}
      {/* <div className="p-2 bg-glass-bg border border-glass-border rounded flex items-center gap-2 text-xs text-text-tertiary leading-tight">
        <Lock className="w-3 h-3 flex-shrink-0" />
        <span>
          {t(
            'privacy',
            'Dein Entwurf wird automatisch alle 30 Sekunden gespeichert.'
          )}
        </span>
      </div> */}

      {/* Navigation */}
      <NavigationButtons
        onNext={goNext}
        onReset={handleReset}
        canGoNext={isClient ? canGoNext() : false}
        nextLabel={t('continue')}
        showReset={true}
        resetConfirm={showResetConfirm}
      />
    </div>
  );
}
