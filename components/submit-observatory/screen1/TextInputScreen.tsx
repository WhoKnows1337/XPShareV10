'use client';

import { useSubmitFlowStore } from '@/lib/stores/submitFlowStore';
import { TextInputArea } from './TextInputArea';
import { WordCounter } from './WordCounter';
import { VoiceButton } from './VoiceButton';
import { OCRButton } from './OCRButton';
import { ContinueButton } from '../shared/ContinueButton';
import { useTranslations } from 'next-intl';
import { Lock } from 'lucide-react';

export function TextInputScreen() {
  const t = useTranslations('submit.screen1');
  const { screen1, setText, canGoNext, goNext } = useSubmitFlowStore();

  const handleVoiceTranscript = (transcript: string) => {
    // Append voice transcript to existing text
    const newText = screen1.text ? `${screen1.text}\n\n${transcript}` : transcript;
    setText(newText);
  };

  const handleOCRText = (ocrText: string) => {
    // Append OCR text to existing text
    const newText = screen1.text ? `${screen1.text}\n\n${ocrText}` : ocrText;
    setText(newText);
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Main Card */}
      <div className="glass-card p-8 md:p-12">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="section-title-observatory">
            {t('title', 'Dokumentiere deine Erfahrung')}
          </h1>
          <p className="text-text-secondary text-base leading-relaxed max-w-2xl mt-4">
            {t(
              'description',
              'Beschreibe was passiert ist. Je detaillierter, desto besser kann das System Muster erkennen.'
            )}
          </p>
        </div>

        {/* Text Input Area */}
        <div className="mb-6">
          <TextInputArea
            value={screen1.text}
            onChange={setText}
            placeholder={t(
              'placeholder',
              'Last night at 3:33 AM, I observed...'
            )}
          />
        </div>

        {/* Word Counter */}
        <div className="mb-8">
          <WordCounter wordCount={screen1.wordCount} />
        </div>

        {/* Input Methods */}
        <div className="flex flex-wrap gap-4 mb-8">
          <VoiceButton onTranscript={handleVoiceTranscript} />
          <OCRButton onTextExtracted={handleOCRText} />
        </div>

        {/* Privacy Notice */}
        <div className="mt-8 p-5 bg-text-primary/5 border border-text-primary/10 rounded-lg flex items-start gap-3">
          <Lock className="w-4 h-4 text-text-tertiary flex-shrink-0 mt-0.5" />
          <p className="text-sm text-text-tertiary leading-relaxed">
            {t(
              'privacy',
              'Deine Daten bleiben verschlüsselt und werden nur mit deiner Zustimmung geteilt.'
            )}
          </p>
        </div>

        {/* Continue Button */}
        <div className="flex justify-end mt-8">
          <ContinueButton
            onClick={goNext}
            disabled={!canGoNext()}
            label={t('continue', 'Weiter →')}
          />
        </div>
      </div>
    </div>
  );
}
