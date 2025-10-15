'use client';

import { useState } from 'react';
import { useSubmitFlowStore } from '@/lib/stores/submitFlowStore';
import { useTranslations } from 'next-intl';
import {
  Pencil,
  Sparkles,
  ChevronDown,
  Check,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Separator } from '@/components/ui/separator';
import { getCategoryIcon, getCategoryBgClass } from '@/lib/category-icons';

export function AIResultsSection() {
  const t = useTranslations('submit.screen2.aiResults');
  const tCategories = useTranslations('categories');
  const { screen2, screen3, updateScreen2, currentStep } = useSubmitFlowStore();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(screen2.title || '');

  const handleTitleSave = () => {
    if (titleInput.trim()) {
      updateScreen2({ title: titleInput.trim() });
    }
    setIsEditingTitle(false);
  };

  // Get category info using central mapping
  const CategoryIcon = getCategoryIcon(screen2.category || 'other');
  const categoryColor = getCategoryBgClass(screen2.category || 'other');

  // Try to get translation, fallback to formatted slug
  let categoryName: string;
  try {
    categoryName = screen2.category ? tCategories(screen2.category) : 'Unknown';
  } catch {
    categoryName = (screen2.category || 'other')
      .split(/[-_]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  const attributeCount = screen2.attributes ? Object.keys(screen2.attributes).length : 0;
  const confidencePercent = screen2.aiConfidence ? Math.round(screen2.aiConfidence * 100) : 0;

  // Step 2: Minimal Card Design
  if (currentStep === 2) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-glass-bg border border-glass-border rounded-lg overflow-hidden"
      >
        {/* Compact Header with Status */}
        <div className="p-4 border-b border-glass-border">
          <div className="flex items-start gap-3">
            {/* Category Icon */}
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${categoryColor}`}>
              <CategoryIcon className="w-5 h-5 text-white" />
            </div>

            {/* Category + Confidence */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-medium text-observatory-accent uppercase tracking-wide">
                  {categoryName}
                </span>
                <span className="text-[10px] text-text-tertiary">
                  {confidencePercent}% Zuversicht
                </span>
              </div>

              {/* Editable Title */}
              {!isEditingTitle ? (
                <button
                  onClick={() => {
                    setTitleInput(screen2.title || '');
                    setIsEditingTitle(true);
                  }}
                  className="text-left text-sm font-medium text-text-primary hover:text-observatory-accent transition-colors group w-full"
                >
                  {screen2.title || t('untitled')}
                  <Pencil className="inline-block ml-2 w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ) : (
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={titleInput}
                    onChange={(e) => setTitleInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleTitleSave();
                      if (e.key === 'Escape') setIsEditingTitle(false);
                    }}
                    className="flex-1 text-sm font-medium bg-glass-bg border border-observatory-accent rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-observatory-accent/50"
                    autoFocus
                  />
                  <button
                    onClick={handleTitleSave}
                    className="p-1.5 bg-observatory-accent hover:bg-observatory-accent/80 rounded text-white transition-colors"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setIsEditingTitle(false)}
                    className="p-1.5 bg-glass-border hover:bg-glass-border/80 rounded text-text-secondary transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Collapsible Attributes Section */}
        <div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-glass-border/30 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-observatory-accent" />
              <span className="text-xs font-medium text-text-secondary">
                {attributeCount} {t('attributesFound')}
              </span>
            </div>
            <ChevronDown className={`w-4 h-4 text-text-tertiary transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden border-t border-glass-border"
              >
                <div className="p-4 space-y-2 max-h-64 overflow-y-auto">
                  {attributeCount > 0 ? (
                    Object.entries(screen2.attributes || {}).map(([key, attr]) => (
                      <div
                        key={key}
                        className="flex items-center justify-between py-1.5 px-2 bg-glass-border/20 rounded text-xs"
                      >
                        <span className="text-text-secondary font-medium">
                          {t(`attributes.${key}`)}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-text-primary">
                            {t(`attributes.values.${attr.value}`)}
                          </span>
                          <span className="text-[10px] text-text-tertiary">
                            {attr.confidence}%
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-text-tertiary text-center py-2">
                      {t('noAttributes')}
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    );
  }

  // Step 3: Full Sidebar (keep existing design)
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-glass-bg border border-glass-border rounded-lg p-6 space-y-6"
    >
      {/* Category Section */}
      <div>
        <div className="flex items-center gap-3 mb-3">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${categoryColor}`}>
            <CategoryIcon className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-text-tertiary uppercase tracking-wider mb-1">
              {t('category')}
            </p>
            <p className="text-sm font-semibold text-text-primary">
              {categoryName}
            </p>
            <p className="text-xs text-text-tertiary mt-0.5">
              {confidencePercent}% Zuversicht
            </p>
          </div>
        </div>
      </div>

      <Separator />

      {/* Title Section (Editable) */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-text-tertiary uppercase tracking-wider">
            {t('title')}
          </p>
          {!isEditingTitle && (
            <button
              onClick={() => {
                setTitleInput(screen2.title || '');
                setIsEditingTitle(true);
              }}
              className="p-1 hover:bg-glass-border rounded transition-colors"
            >
              <Pencil className="w-3 h-3 text-text-secondary" />
            </button>
          )}
        </div>

        {!isEditingTitle ? (
          <p className="text-sm text-text-primary font-medium">
            {screen2.title || t('untitled')}
          </p>
        ) : (
          <div className="space-y-2">
            <input
              type="text"
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleTitleSave();
                if (e.key === 'Escape') setIsEditingTitle(false);
              }}
              className="w-full text-sm bg-glass-bg border border-glass-border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-observatory-accent"
              placeholder={t('titlePlaceholder')}
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={handleTitleSave}
                className="flex-1 px-3 py-1.5 bg-observatory-accent hover:bg-observatory-accent/80 text-white text-xs rounded transition-colors"
              >
                <Check className="inline w-3 h-3 mr-1" />
                {t('save')}
              </button>
              <button
                onClick={() => setIsEditingTitle(false)}
                className="px-3 py-1.5 bg-glass-border hover:bg-glass-border/80 text-text-secondary text-xs rounded transition-colors"
              >
                <X className="inline w-3 h-3" />
              </button>
            </div>
          </div>
        )}
      </div>

      <Separator />

      {/* Summary Section (Step 3 only) */}
      {screen3.summary && (
        <>
          <div>
            <p className="text-xs text-text-tertiary uppercase tracking-wider mb-2">
              {t('summary')}
            </p>
            <p className="text-sm text-text-secondary leading-relaxed">
              {screen3.summary}
            </p>
          </div>
          <Separator />
        </>
      )}

      {/* Tags Section */}
      <div>
        <p className="text-xs text-text-tertiary uppercase tracking-wider mb-2">
          {t('tags')}
        </p>
        <div className="flex flex-wrap gap-2">
          {screen2.tags && screen2.tags.length > 0 ? (
            screen2.tags.map((tag, index) => (
              <motion.div
                key={index}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="px-2 py-1 bg-observatory-accent/10 text-observatory-accent text-xs rounded-full border border-observatory-accent/30"
              >
                {tag}
              </motion.div>
            ))
          ) : (
            <p className="text-xs text-text-tertiary">{t('noTags')}</p>
          )}
        </div>
      </div>

      <Separator />

      {/* Attributes Section */}
      <div>
        <p className="text-xs text-text-tertiary uppercase tracking-wider mb-3">
          {t('attributes')}
        </p>
        <div className="space-y-2">
          {attributeCount > 0 ? (
            Object.entries(screen2.attributes || {}).map(([key, attr]) => (
              <div
                key={key}
                className="p-3 bg-glass-border/20 rounded-lg border border-glass-border"
              >
                <div className="flex items-start justify-between mb-1">
                  <span className="text-xs font-medium text-text-secondary">
                    {t(`attributes.${key}`)}
                  </span>
                  <div className="flex items-center gap-1">
                    <div className={`w-1.5 h-1.5 rounded-full ${attr.confidence >= 80 ? 'bg-success-soft' : attr.confidence >= 60 ? 'bg-warning' : 'bg-destructive'}`} />
                    <span className="text-[10px] text-text-tertiary">
                      {attr.confidence}%
                    </span>
                  </div>
                </div>
                <p className="text-sm text-text-primary">
                  {t(`attributes.values.${attr.value}`)}
                </p>
              </div>
            ))
          ) : (
            <p className="text-xs text-text-tertiary text-center py-4">
              {t('noAttributes')}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
