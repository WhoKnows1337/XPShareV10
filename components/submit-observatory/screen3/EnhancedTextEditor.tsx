'use client';

import { useSubmitFlowStore } from '@/lib/stores/submitFlowStore';
import { useTranslations } from 'next-intl';

export function EnhancedTextEditor() {
  const t = useTranslations('submit.screen3.editor');
  const { screen1, screen3 } = useSubmitFlowStore();

  // Get the display text (enhanced if enabled and available, otherwise original)
  const displayText = screen3.enhancementEnabled && screen3.enhancedText ? screen3.enhancedText : screen1.text;

  // Render text with highlights
  const renderTextWithHighlights = () => {
    if (!screen3.enhancementEnabled || !screen3.highlights || screen3.highlights.length === 0) {
      return <div className="whitespace-pre-wrap leading-relaxed">{displayText}</div>;
    }

    // Convert text to array of characters for easier manipulation
    const textChars = displayText.split('');
    const elements: JSX.Element[] = [];
    let lastIndex = 0;

    // Sort highlights by start position
    const sortedHighlights = [...screen3.highlights].sort((a, b) => a.start - b.start);

    sortedHighlights.forEach((highlight, idx) => {
      // Add text before highlight
      if (highlight.start > lastIndex) {
        const beforeText = textChars.slice(lastIndex, highlight.start).join('');
        elements.push(
          <span key={`text-${idx}`}>
            {beforeText}
          </span>
        );
      }

      // Add highlighted text
      const highlightedText = textChars.slice(highlight.start, highlight.end).join('');
      const highlightClass = highlight.type === 'added'
        ? 'bg-observatory-gold/20 border-l-2 border-observatory-gold px-1 rounded-sm'
        : 'bg-success-soft/20 border-l-2 border-success-soft px-1 rounded-sm';

      elements.push(
        <span key={`highlight-${idx}`} className={highlightClass} title={`KI ${highlight.type === 'added' ? 'hinzugefügt' : 'verbessert'}`}>
          {highlightedText}
        </span>
      );

      lastIndex = highlight.end;
    });

    // Add remaining text after last highlight
    if (lastIndex < textChars.length) {
      const afterText = textChars.slice(lastIndex).join('');
      elements.push(
        <span key="text-end">
          {afterText}
        </span>
      );
    }

    return <div className="whitespace-pre-wrap leading-relaxed">{elements}</div>;
  };

  return (
    <div className="relative">
      <div
        className="p-5 bg-space-deep/60 border border-glass-border rounded-lg
                   text-text-primary text-base leading-relaxed
                   min-h-[300px] cursor-text"
      >
        {renderTextWithHighlights()}
      </div>

      {/* Enhancement Legend */}
      {screen3.enhancementEnabled && screen3.highlights && screen3.highlights.length > 0 && (
        <div className="flex items-center gap-6 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-observatory-gold/20 border-l-2 border-observatory-gold rounded-sm" />
            <span className="text-text-tertiary">{t('legend.added', 'KI hinzugefügt')}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-success-soft/20 border-l-2 border-success-soft rounded-sm" />
            <span className="text-text-tertiary">{t('legend.enhanced', 'KI verbessert')}</span>
          </div>
          <div className="ml-auto text-text-tertiary text-xs">
            {screen3.highlights.length} {screen3.highlights.length === 1 ? 'Änderung' : 'Änderungen'}
          </div>
        </div>
      )}

      {/* No Enhancement Info */}
      {!screen3.enhancementEnabled && (
        <div className="mt-3 text-xs text-text-tertiary flex items-center gap-2">
          <span>💡</span>
          <span>Aktiviere den AI-Button um deinen Text mit zusätzlichen Details zu ergänzen</span>
        </div>
      )}
    </div>
  );
}
