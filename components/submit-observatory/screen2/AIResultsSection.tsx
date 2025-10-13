'use client';

import { useState } from 'react';
import { useSubmitFlowStore } from '@/lib/stores/submitFlowStore';
import { useTranslations } from 'next-intl';
import { Edit2, FileText, RotateCw, X, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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
  const [isEditingCategory, setIsEditingCategory] = useState(false);
  const [newTagInput, setNewTagInput] = useState('');

  const handleSaveTitle = () => {
    setTitle(editedTitle);
    setIsEditingTitle(false);
  };

  const handleAddTag = () => {
    const trimmedTag = newTagInput.trim().toLowerCase();
    if (trimmedTag && trimmedTag.length > 0) {
      addTag(trimmedTag);
      setNewTagInput('');
    }
  };

  // Available categories from backend
  const availableCategories = [
    'paranormal',
    'ufo_sighting',
    'synchronicity',
    'spiritual_experience',
    'near_death_experience',
    'psychic_experience',
    'cryptid_encounter',
    'other',
  ];

  // Helper to safely get category translation
  const getCategoryTranslation = (category: string) => {
    // Check if category exists in valid list
    if (availableCategories.includes(category)) {
      return tCategories(category);
    }
    // Fallback for invalid/old categories
    return category;
  };

  const handleSaveSummary = () => {
    setSummary(editedSummary);
    setIsEditingSummary(false);
  };

  const charCount = editedSummary.length;
  const isOptimal = charCount >= 150 && charCount <= 200;
  const isWarning = charCount > 200 && charCount <= 250;
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

      {/* Category with Edit */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-[10px] font-medium text-text-tertiary uppercase">
            Kategorie
          </label>
          {!isEditingCategory && (
            <button
              onClick={() => setIsEditingCategory(true)}
              className="text-text-tertiary hover:text-text-secondary"
            >
              <Edit2 className="w-3 h-3" />
            </button>
          )}
        </div>

        {isEditingCategory ? (
          <div className="space-y-2">
            <Select
              value={screen2.category}
              onValueChange={(value) => {
                setCategory(value);
                setIsEditingCategory(false);
              }}
            >
              <SelectTrigger className="h-8 text-xs bg-space-mid/90 border-glass-border focus:border-observatory-accent/40">
                <SelectValue placeholder="Kategorie wählen..." />
              </SelectTrigger>
              <SelectContent className="bg-space-mid border-glass-border">
                {availableCategories.map((cat) => (
                  <SelectItem
                    key={cat}
                    value={cat}
                    className="text-xs hover:bg-observatory-accent/10 focus:bg-observatory-accent/10 cursor-pointer"
                  >
                    {getCategoryTranslation(cat)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={() => setIsEditingCategory(false)}
              variant="ghost"
              size="sm"
              className="w-full text-xs"
            >
              Abbrechen
            </Button>
          </div>
        ) : (
          <div
            className="px-2 py-1 bg-observatory-accent/10 border border-observatory-accent/20 rounded text-xs text-observatory-accent text-center cursor-pointer hover:border-observatory-accent/40"
            onClick={() => setIsEditingCategory(true)}
          >
            {screen2.category ? getCategoryTranslation(screen2.category) : 'Unknown'}
          </div>
        )}
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
              <Button
                onClick={handleSaveTitle}
                variant="default"
                size="sm"
                className="flex-1 text-xs"
              >
                Save
              </Button>
              <Button
                onClick={() => {
                  setEditedTitle(screen2.title);
                  setIsEditingTitle(false);
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
            <label className="flex items-center gap-1.5 text-[10px] font-medium text-text-tertiary uppercase">
              <FileText className="w-3 h-3" />
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
        </div>

        {/* Add Tag Input */}
        {screen2.tags.length < 10 && (
          <div className="flex gap-1">
            <input
              type="text"
              value={newTagInput}
              onChange={(e) => setNewTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
              className="flex-1 h-7 px-2 bg-space-mid/90 border border-glass-border rounded text-xs text-text-primary outline-none focus:border-observatory-accent/40"
              placeholder="Tag hinzufügen..."
              maxLength={20}
            />
            <Button
              onClick={handleAddTag}
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              disabled={!newTagInput.trim()}
            >
              <Plus className="w-3 h-3" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
