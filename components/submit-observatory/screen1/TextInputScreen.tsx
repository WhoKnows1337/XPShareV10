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
        <div className="mb-8 animate-fly-in-up">
          <h1 className="section-title-observatory">
            {t('title', 'Deine außergewöhnliche Erfahrung')}
          </h1>
          <p className="text-text-secondary text-base leading-relaxed max-w-2xl mt-4">
            {t(
              'subtitle',
              'Was hast du erlebt, das die Realität in Frage stellt? Erzähle deine Geschichte - jedes Detail könnte wichtig sein.'
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
              '3:33 Uhr nachts... Ich sah ein Licht am Himmel...\n\nOder beginne mit: "Es war ein ganz normaler Dienstag, bis..."'
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
        <div className="mt-8 p-5 bg-text-primary/5 border border-text-primary/10 rounded-lg flex items-start gap-3 hover:bg-text-primary/8 transition-all">
          <Lock className="w-4 h-4 text-observatory-gold flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-text-secondary leading-relaxed">
              {t(
                'privacy',
                'Deine Geschichte gehört dir. Du entscheidest am Ende: Öffentlich, Anonym oder Privat.'
              )}
            </p>
            <p className="text-xs text-text-tertiary mt-1">
              {t('privacyDetail', 'Entwürfe werden automatisch gespeichert und bleiben privat.')}
            </p>
          </div>
        </div>

        {/* Continue Button */}
        <div className="flex flex-col items-end gap-2 mt-8">
          {screen1.wordCount > 0 && screen1.wordCount < 50 && (
            <p className="text-xs text-warning-soft animate-shake-subtle">
              💡 {t('minWordsHint', 'Empfehlung: Mindestens 50 Wörter für bessere Pattern-Erkennung')}
            </p>
          )}
          <ContinueButton
            onClick={goNext}
            disabled={!canGoNext()}
            label={t('continue', 'Zur AI-Analyse →')}
          />
        </div>
      </div>
    </div>
  );
}
