'use client';

import { useSubmitFlowStore } from '@/lib/stores/submitFlowStore';
import { useTranslations } from 'next-intl';

export function EnhancedTextEditor() {
  const t = useTranslations('submit.screen3.editor');
  const { screen1, screen3 } = useSubmitFlowStore();

  // Get the display text (enhanced if enabled and available, otherwise original)
  const displayText = screen3.enhancementEnabled && screen3.enhancedText ? screen3.enhancedText : screen1.text;

  // For MVP, we'll show the text with simple highlighting
  // In production, you'd use a proper rich text editor with highlight ranges
  const renderTextWithHighlights = () => {
    if (!screen3.enhancementEnabled || !screen3.highlights || screen3.highlights.length === 0) {
      return <div className="whitespace-pre-wrap">{displayText}</div>;
    }

    // Simple implementation: just show the text
    // TODO: Implement proper highlight rendering with ranges
    return <div className="whitespace-pre-wrap">{displayText}</div>;
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
            <span className="text-text-tertiary">{t('legend.added', 'AI Additions')}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-success-soft/20 border-l-2 border-success-soft rounded-sm" />
            <span className="text-text-tertiary">{t('legend.enhanced', 'AI Improvements')}</span>
          </div>
        </div>
      )}
    </div>
  );
}
