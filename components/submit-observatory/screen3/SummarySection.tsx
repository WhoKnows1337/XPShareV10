'use client';

import { useState } from 'react';
import { useSubmitFlowStore } from '@/lib/stores/submitFlowStore';
import { useTranslations } from 'next-intl';
import { FileText, Edit2, RotateCw, Check, Info } from 'lucide-react';

interface SummarySectionProps {
  onRegenerate: () => void;
  isLoading?: boolean;
}

export function SummarySection({ onRegenerate, isLoading = false }: SummarySectionProps) {
  const t = useTranslations('submit.screen3.summary');
  const { screen3, setSummary } = useSubmitFlowStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editedSummary, setEditedSummary] = useState(screen3.summary);

  const handleSave = () => {
    setSummary(editedSummary);
    setIsEditing(false);
  };

  const charCount = editedSummary.length;
  const isOptimal = charCount >= 150 && charCount <= 200;
  const isWarning = charCount > 200 && charCount <= 250;
  const isError = charCount > 250;

  return (
    <div className="glass-card p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <label className="flex items-center gap-2 text-sm font-semibold text-text-primary">
          <FileText className="w-4 h-4 text-observatory-gold" />
          {t('title', '📋 Kurzzusammenfassung')}
        </label>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-text-tertiary hover:text-text-secondary
                       bg-text-primary/5 hover:bg-text-primary/10 border border-text-primary/10 rounded-md transition-colors"
          >
            <Edit2 className="w-3 h-3" />
            {t('edit', 'Edit')}
          </button>
        )}
      </div>

      {/* Content */}
      {isEditing ? (
        <div className="space-y-3">
          <textarea
            value={editedSummary}
            onChange={(e) => setEditedSummary(e.target.value)}
            className="w-full min-h-[100px] input-observatory"
            placeholder={t('placeholder', 'Schreibe eine kurze Zusammenfassung...')}
          />

          {/* Character Counter */}
          <div className={`text-right text-sm font-mono ${isError ? 'text-error-soft' : isWarning ? 'text-warning-soft' : isOptimal ? 'text-success-soft' : 'text-text-tertiary'}`}>
            {charCount}/250 {isOptimal && '✓'}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={onRegenerate}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-observatory-gold/10 border border-observatory-gold/30 rounded-lg
                         text-observatory-gold font-medium hover:bg-observatory-gold/15 transition-colors
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RotateCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              {t('regenerate', 'KI neu generieren')}
            </button>
            <button onClick={handleSave} className="flex-1 btn-observatory">
              <Check className="w-4 h-4" />
              {t('save', 'Speichern')}
            </button>
          </div>
        </div>
      ) : (
        <>
          <div
            className="p-4 bg-text-primary/5 border-l-3 border-observatory-gold rounded-lg cursor-pointer
                       hover:bg-text-primary/8 transition-colors mb-3"
            onClick={() => setIsEditing(true)}
          >
            <p className="text-text-primary leading-relaxed">{screen3.summary || t('noSummary', 'Keine Zusammenfassung')}</p>
          </div>

          {/* Info */}
          <div className="flex items-start gap-2 text-sm text-text-tertiary">
            <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{t('info', 'Diese Zusammenfassung erscheint als Preview in der Liste und Suche.')}</span>
          </div>
        </>
      )}
    </div>
  );
}
