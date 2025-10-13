'use client';

import { useState } from 'react';
import { useSubmitFlowStore } from '@/lib/stores/submitFlowStore';
import { useTranslations } from 'next-intl';
import { Edit2, FileText, RotateCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface AIResultsSectionProps {
  onRegenerateSummary?: () => void;
  isSummarizing?: boolean;
}

export function AIResultsSection({
  onRegenerateSummary,
  isSummarizing = false
}: AIResultsSectionProps = {}) {
  const t = useTranslations('submit.screen2.aiResults');
  const tSummary = useTranslations('submit.screen3.summary');
  const { screen2, screen3, updateScreen2, setSummary } = useSubmitFlowStore();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(screen2.title);
  const [isEditingSummary, setIsEditingSummary] = useState(false);
  const [editedSummary, setEditedSummary] = useState(screen3?.summary || '');

  const handleSaveTitle = () => {
    updateScreen2({ title: editedTitle });
    setIsEditingTitle(false);
  };

  const handleSaveSummary = () => {
    setSummary(editedSummary);
    setIsEditingSummary(false);
  };

  const charCount = editedSummary.length;
  const isOptimal = charCount >= 150 && charCount <= 200;
  const isWarning = charCount > 200 && charCount <= 250;
  const isError = charCount > 250;

  return (
    <div className="p-3 bg-glass-bg border border-glass-border rounded space-y-3 max-h-[calc(100vh-180px)] overflow-y-auto custom-scrollbar">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-glass-border">
        <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wide">
          ✓ KI-Analyse
        </h3>
      </div>

      {/* Category */}
      <div>
        <label className="text-[10px] font-medium text-text-tertiary uppercase mb-1 block">
          Kategorie
        </label>
        <div className="px-2 py-1 bg-observatory-accent/10 border border-observatory-accent/20 rounded text-xs text-observatory-accent text-center">
          {screen2.category || 'Unknown'}
        </div>
      </div>

      {/* Title */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-[10px] font-medium text-text-tertiary uppercase">
            Titel
          </label>
          {!isEditingTitle && (
            <button
              onClick={() => setIsEditingTitle(true)}
              className="text-text-tertiary hover:text-text-secondary"
            >
              <Edit2 className="w-3 h-3" />
            </button>
          )}
        </div>

        {isEditingTitle ? (
          <div className="space-y-2">
            <input
              type="text"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              className="input-observatory text-xs"
              placeholder={t('titlePlaceholder', 'Titel eingeben...')}
            />
            <div className="flex gap-2">
              <button onClick={handleSaveTitle} className="btn-observatory text-xs py-1 px-2">
                Save
              </button>
              <button
                onClick={() => {
                  setEditedTitle(screen2.title);
                  setIsEditingTitle(false);
                }}
                className="text-xs text-text-tertiary hover:text-text-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div
            className="p-2 bg-space-mid/40 border border-glass-border rounded text-xs text-text-primary cursor-pointer hover:border-observatory-accent/30 leading-snug"
            onClick={() => setIsEditingTitle(true)}
          >
            {screen2.title || t('noTitle', 'Untitled')}
          </div>
        )}
      </div>

      {/* Summary Section (only show in Screen 3) */}
      {screen3?.summary !== undefined && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="flex items-center gap-1.5 text-[10px] font-medium text-text-tertiary uppercase">
              <FileText className="w-3 h-3" />
              Summary
            </label>
            {!isEditingSummary && (
              <button
                onClick={() => setIsEditingSummary(true)}
                className="text-text-tertiary hover:text-text-secondary"
              >
                <Edit2 className="w-3 h-3" />
              </button>
            )}
          </div>

          {isEditingSummary ? (
            <div className="space-y-2">
              <textarea
                value={editedSummary}
                onChange={(e) => setEditedSummary(e.target.value)}
                className="w-full min-h-[80px] p-2 bg-space-mid/90 border border-glass-border rounded text-xs text-text-primary resize-none outline-none focus:border-observatory-accent/40"
                placeholder={tSummary('placeholder', 'Schreibe eine kurze Zusammenfassung...')}
              />

              {/* Character Counter */}
              <div className={`text-right text-xs font-mono ${isError ? 'text-error-soft' : isWarning ? 'text-warning-soft' : isOptimal ? 'text-success-soft' : 'text-text-tertiary'}`}>
                {charCount}/250 {isOptimal && '✓'}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                {onRegenerateSummary && (
                  <Button
                    onClick={onRegenerateSummary}
                    disabled={isSummarizing}
                    variant="ghost"
                    size="sm"
                    className="text-xs"
                  >
                    <RotateCw className={`w-3 h-3 ${isSummarizing ? 'animate-spin' : ''}`} />
                  </Button>
                )}
                <Button
                  onClick={handleSaveSummary}
                  variant="default"
                  size="sm"
                  className="flex-1 text-xs"
                >
                  Save
                </Button>
                <Button
                  onClick={() => {
                    setEditedSummary(screen3.summary);
                    setIsEditingSummary(false);
                  }}
                  variant="ghost"
                  size="sm"
                  className="text-xs"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div
              className="p-2 bg-space-mid/40 border border-glass-border rounded text-xs text-text-primary cursor-pointer hover:border-observatory-accent/30 leading-snug"
              onClick={() => setIsEditingSummary(true)}
            >
              {screen3.summary || tSummary('noSummary', 'Keine Zusammenfassung')}
            </div>
          )}
        </div>
      )}

      {/* Tags */}
      <div>
        <label className="text-[10px] font-medium text-text-tertiary uppercase mb-1 block">
          Tags
        </label>
        <div className="flex flex-wrap gap-1">
          {screen2.tags.map((tag, index) => (
            <motion.span
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: 0.2,
                delay: index * 0.05,
                ease: 'easeOut'
              }}
              className="px-2 py-0.5 bg-glass-bg border border-glass-border rounded text-[10px] text-text-tertiary"
            >
              #{tag}
            </motion.span>
          ))}
          {screen2.tags.length === 0 && (
            <span className="text-xs text-text-tertiary italic">No tags</span>
          )}
        </div>
      </div>
    </div>
  );
}
