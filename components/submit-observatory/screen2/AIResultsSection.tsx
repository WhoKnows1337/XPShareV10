'use client';

import { useState } from 'react';
import { useSubmitFlowStore } from '@/lib/stores/submitFlowStore';
import { useTranslations } from 'next-intl';
import { Edit2, FileText, RotateCw, X, Plus, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { CategoryPicker } from './CategoryPicker';

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
  const tCategories = useTranslations('categories');
  const { screen2, screen3, setTitle, setCategory, addTag, removeTag, setSummary } = useSubmitFlowStore();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(screen2.title);
  const [isEditingSummary, setIsEditingSummary] = useState(false);
  const [editedSummary, setEditedSummary] = useState(screen3?.summary || '');
  const [newTagInput, setNewTagInput] = useState('');
  const [showTagInput, setShowTagInput] = useState(false);

  const handleSaveTitle = () => {
    setTitle(editedTitle);
    setIsEditingTitle(false);
  };

  const handleAddTag = () => {
    const trimmedTag = newTagInput.trim().toLowerCase();
    if (trimmedTag && trimmedTag.length > 0) {
      addTag(trimmedTag);
      setNewTagInput('');
      setShowTagInput(false);
    }
  };

  // Helper to safely get category translation
  const getCategoryTranslation = (category: string) => {
    // Normalize to lowercase and handle edge cases
    const normalizedCategory = category.toLowerCase();

    // Map legacy/shortened category names to full keys
    const categoryKeyMap: Record<string, string> = {
      'ufo': 'ufo_sighting',
      'spiritual': 'spiritual_experience',
      'nde': 'near_death_experience',
      'psychic': 'psychic_experience',
      'cryptid': 'cryptid_encounter',
    };

    // Use mapped key if available, otherwise use normalized category
    const translationKey = categoryKeyMap[normalizedCategory] || normalizedCategory;

    try {
      return tCategories(translationKey);
    } catch (error) {
      // Fallback if translation not found
      return category;
    }
  };

  const handleSaveSummary = () => {
    setSummary(editedSummary);
    setIsEditingSummary(false);
  };

  const charCount = editedSummary.length;
  const isOptimal = charCount >= 180 && charCount <= 220;
  const isWarning = charCount > 220 && charCount <= 250;
  const isError = charCount > 250;

  // AI Confidence color coding
  const confidence = screen2.aiConfidence;
  const confidenceColor =
    confidence >= 80 ? 'text-success-soft' :
    confidence >= 60 ? 'text-warning-soft' :
    'text-error-soft';

  return (
    <div className="p-3 bg-glass-bg border border-glass-border rounded space-y-3 max-h-[calc(100vh-180px)] overflow-y-auto custom-scrollbar">
      {/* Header with AI Confidence */}
      <div className="flex items-center justify-between pb-2 border-b border-glass-border">
        <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wide">
          ✓ KI-Analyse
        </h3>
        {confidence > 0 && (
          <span className={`text-[10px] font-mono font-semibold ${confidenceColor}`}>
            {confidence}% Zuversicht
          </span>
        )}
      </div>

      {/* Category Picker */}
      <CategoryPicker
        currentCategory={screen2.category}
        onSelect={setCategory}
        getCategoryTranslation={getCategoryTranslation}
      />

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
          <div className="space-y-1.5">
            <input
              type="text"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              className="w-full p-2 bg-space-mid/90 border border-glass-border rounded text-xs text-text-primary outline-none focus:border-observatory-accent/40 leading-snug"
              placeholder={t('titlePlaceholder', 'Titel eingeben...')}
            />
            <div className="flex gap-1.5 justify-end">
              <button
                onClick={handleSaveTitle}
                className="p-1 rounded bg-success-soft/20 hover:bg-success-soft/30 text-success-soft transition-colors"
              >
                <Check className="w-3 h-3" />
              </button>
              <button
                onClick={() => {
                  setEditedTitle(screen2.title);
                  setIsEditingTitle(false);
                }}
                className="p-1 rounded bg-error-soft/20 hover:bg-error-soft/30 text-error-soft transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>
        ) : (
          <div
            className="p-2 bg-space-mid/40 border border-glass-border rounded text-xs text-text-primary cursor-pointer hover:border-observatory-accent/30 leading-snug min-h-[2.25rem]"
            onClick={() => setIsEditingTitle(true)}
          >
            {screen2.title || t('noTitle', 'Untitled')}
          </div>
        )}
      </div>

      {/* Summary Section (only show in Screen 3) */}
      {screen3 !== undefined && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-[10px] font-medium text-text-tertiary uppercase">
              Summary
            </label>
            {!isEditingSummary && !isSummarizing && (
              <button
                onClick={() => setIsEditingSummary(true)}
                className="text-text-tertiary hover:text-text-secondary"
              >
                <Edit2 className="w-3 h-3" />
              </button>
            )}
          </div>

          {isSummarizing && !screen3.summary ? (
            <div className="flex items-center gap-2 p-3 bg-space-mid/40 border border-glass-border rounded text-xs text-text-secondary">
              <RotateCw className="w-3 h-3 animate-spin text-observatory-accent" />
              <span>Generiere Zusammenfassung...</span>
            </div>
          ) : isEditingSummary ? (
            <div className="space-y-1.5">
              <textarea
                value={editedSummary}
                onChange={(e) => setEditedSummary(e.target.value)}
                className="w-full h-[80px] p-2 bg-space-mid/90 border border-glass-border rounded text-xs text-text-primary resize-none outline-none focus:border-observatory-accent/40 leading-snug"
                placeholder={tSummary('placeholder', 'Schreibe eine kurze Zusammenfassung...')}
              />

              {/* Character Counter and Actions */}
              <div className="flex items-center justify-between">
                <div className={`text-xs font-mono ${isError ? 'text-error-soft' : isWarning ? 'text-warning-soft' : isOptimal ? 'text-success-soft' : 'text-text-tertiary'}`}>
                  {charCount}/250 {isOptimal && '✓'}
                </div>
                <div className="flex gap-1.5">
                  {onRegenerateSummary && (
                    <button
                      onClick={onRegenerateSummary}
                      disabled={isSummarizing}
                      className="p-1 rounded bg-observatory-accent/20 hover:bg-observatory-accent/30 text-observatory-accent transition-colors disabled:opacity-50"
                    >
                      <RotateCw className={`w-3 h-3 ${isSummarizing ? 'animate-spin' : ''}`} />
                    </button>
                  )}
                  <button
                    onClick={handleSaveSummary}
                    className="p-1 rounded bg-success-soft/20 hover:bg-success-soft/30 text-success-soft transition-colors"
                  >
                    <Check className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => {
                      setEditedSummary(screen3.summary);
                      setIsEditingSummary(false);
                    }}
                    className="p-1 rounded bg-error-soft/20 hover:bg-error-soft/30 text-error-soft transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div
              className="p-2 bg-space-mid/40 border border-glass-border rounded text-xs text-text-primary cursor-pointer hover:border-observatory-accent/30 leading-snug max-h-[120px] overflow-y-auto custom-scrollbar"
              onClick={() => setIsEditingSummary(true)}
            >
              {screen3.summary || tSummary('noSummary', 'Keine Zusammenfassung')}
            </div>
          )}
        </div>
      )}

      {/* Tags with Remove & Add */}
      <div>
        <label className="text-[10px] font-medium text-text-tertiary uppercase mb-1 block">
          Tags {screen2.tags.length > 0 && `(${screen2.tags.length}/10)`}
        </label>
        <div className="flex flex-wrap gap-1 mb-2">
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
              className="group px-2 py-0.5 bg-glass-bg border border-glass-border rounded text-[10px] text-text-tertiary flex items-center gap-1 hover:border-error-soft/30"
            >
              {tag}
              <button
                onClick={() => removeTag(tag)}
                className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-error-soft"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </motion.span>
          ))}
          {screen2.tags.length === 0 && (
            <span className="text-xs text-text-tertiary italic">Keine Tags</span>
          )}

          {/* Add Tag Bubble - inline with tags */}
          {screen2.tags.length < 10 && !showTagInput && (
            <button
              onClick={() => setShowTagInput(true)}
              className="px-2 py-0.5 bg-glass-bg border border-glass-border hover:border-observatory-accent/40 rounded text-[10px] text-text-tertiary hover:text-observatory-accent transition-all flex items-center"
            >
              <Plus className="w-2.5 h-2.5" />
            </button>
          )}
        </div>

        {/* Add Tag Input - shows below when active */}
        {showTagInput && screen2.tags.length < 10 && (
          <div className="space-y-1.5">
            <input
              type="text"
              value={newTagInput}
              onChange={(e) => setNewTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTag();
                } else if (e.key === 'Escape') {
                  setNewTagInput('');
                  setShowTagInput(false);
                }
              }}
              autoFocus
              className="w-full h-7 px-2 bg-space-mid/90 border border-observatory-accent/40 rounded text-xs text-text-primary outline-none"
              placeholder="Tag eingeben..."
              maxLength={20}
            />
            <div className="flex gap-1.5 justify-end">
              <button
                onClick={handleAddTag}
                disabled={!newTagInput.trim()}
                className="p-1 rounded bg-success-soft/20 hover:bg-success-soft/30 text-success-soft transition-colors disabled:opacity-50"
              >
                <Check className="w-3 h-3" />
              </button>
              <button
                onClick={() => {
                  setNewTagInput('');
                  setShowTagInput(false);
                }}
                className="p-1 rounded bg-error-soft/20 hover:bg-error-soft/30 text-error-soft transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
