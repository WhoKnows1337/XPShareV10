'use client';

import { useState } from 'react';
import { useSubmitFlowStore } from '@/lib/stores/submitFlowStore';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Ghost,
  Telescope,
  Sparkles,
  Heart,
  Zap,
  Brain,
  Footprints,
  HelpCircle,
  ChevronDown,
  Pencil,
  Check,
  X,
  LucideIcon
} from 'lucide-react';

/**
 * Hero Header for Step 2 - Shows AI Analysis Results
 * Displays: Category, Title (editable), Tags, Attributes (collapsible)
 */
export function AIHeroHeader() {
  const t = useTranslations('submit.screen2');
  const tCategories = useTranslations('categories');
  const { screen2, updateScreen2 } = useSubmitFlowStore();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  // Icon mapping for each category
  const categoryIcons: Record<string, LucideIcon> = {
    paranormal: Ghost,
    ufo_sighting: Telescope,
    synchronicity: Sparkles,
    spiritual_experience: Heart,
    near_death_experience: Zap,
    psychic_experience: Brain,
    cryptid_encounter: Footprints,
    other: HelpCircle,
  };

  // Color mapping for categories
  const categoryColors: Record<string, string> = {
    paranormal: 'bg-purple-500',
    ufo_sighting: 'bg-blue-500',
    synchronicity: 'bg-pink-500',
    spiritual_experience: 'bg-green-500',
    near_death_experience: 'bg-yellow-500',
    psychic_experience: 'bg-indigo-500',
    cryptid_encounter: 'bg-orange-500',
    other: 'bg-gray-500',
  };

  const categorySlug = screen2.categorySlug || 'other';
  const CategoryIcon = categoryIcons[categorySlug] || HelpCircle;
  const categoryColor = categoryColors[categorySlug] || 'bg-gray-500';
  const categoryName = tCategories(categorySlug, categorySlug);
  const confidencePercent = Math.round((screen2.confidence || 0.95) * 100);

  const attributeCount = screen2.attributes ? Object.keys(screen2.attributes).length : 0;
  const tagCount = screen2.tags ? screen2.tags.length : 0;

  const handleStartTitleEdit = () => {
    setEditedTitle(screen2.title || '');
    setIsEditingTitle(true);
  };

  const handleSaveTitle = () => {
    if (editedTitle.trim()) {
      updateScreen2({ title: editedTitle.trim() });
    }
    setIsEditingTitle(false);
  };

  const handleCancelTitleEdit = () => {
    setIsEditingTitle(false);
    setEditedTitle('');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-glass-bg border border-glass-border rounded-lg overflow-hidden mb-6"
    >
      {/* Category Header */}
      <div className="p-4 bg-gradient-to-r from-observatory-accent/10 to-transparent border-b border-glass-border">
        <div className="flex items-start gap-3">
          {/* Category Icon */}
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${categoryColor} flex-shrink-0`}>
            <CategoryIcon className="w-6 h-6 text-white" />
          </div>

          {/* Category + Confidence */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-bold text-observatory-accent uppercase tracking-wide">
                {categoryName}
              </span>
              <span className="text-xs text-text-tertiary">
                {confidencePercent}% Zuversicht
              </span>
            </div>

            {/* Editable Title */}
            {!isEditingTitle ? (
              <button
                onClick={handleStartTitleEdit}
                className="group text-left w-full"
              >
                <h1 className="text-2xl font-bold text-text-primary leading-tight">
                  {screen2.title || t('untitled', 'Ohne Titel')}
                  <Pencil className="inline-block ml-2 w-4 h-4 text-text-tertiary opacity-0 group-hover:opacity-100 transition-opacity" />
                </h1>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveTitle();
                    if (e.key === 'Escape') handleCancelTitleEdit();
                  }}
                  className="flex-1 px-2 py-1 bg-glass-bg border border-observatory-accent/40 rounded text-text-primary text-xl font-bold focus:outline-none focus:ring-2 focus:ring-observatory-accent/50"
                  autoFocus
                />
                <button
                  onClick={handleSaveTitle}
                  className="p-1.5 bg-observatory-accent/20 hover:bg-observatory-accent/30 rounded transition-colors"
                >
                  <Check className="w-4 h-4 text-observatory-accent" />
                </button>
                <button
                  onClick={handleCancelTitleEdit}
                  className="p-1.5 bg-glass-bg hover:bg-glass-border rounded transition-colors"
                >
                  <X className="w-4 h-4 text-text-tertiary" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tags & Attributes Summary */}
      <div className="p-4 space-y-3">
        {/* Tags */}
        {tagCount > 0 && (
          <div>
            <div className="text-xs text-text-tertiary uppercase tracking-wide mb-1.5">
              Tags
            </div>
            <div className="flex flex-wrap gap-1.5">
              {screen2.tags?.map((tag, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 bg-observatory-accent/10 border border-observatory-accent/30 rounded text-xs text-observatory-accent"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Collapsible Attributes */}
        {attributeCount > 0 && (
          <div>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-2 text-xs text-text-secondary hover:text-text-primary transition-colors w-full"
            >
              <Sparkles className="w-4 h-4 text-observatory-accent" />
              <span>
                {attributeCount} {t('attributesFound', 'KI-Attribute erkannt')}
              </span>
              <ChevronDown
                className={`w-4 h-4 ml-auto transition-transform ${
                  isExpanded ? 'rotate-180' : ''
                }`}
              />
            </button>

            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="mt-2 space-y-1.5 pl-6">
                    {Object.entries(screen2.attributes || {}).map(([key, attr]) => (
                      <div
                        key={key}
                        className="text-xs p-2 bg-glass-bg/50 rounded border border-glass-border"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-text-tertiary capitalize">
                            {key.replace(/_/g, ' ')}:
                          </span>
                          <span className="text-text-primary font-medium">
                            {typeof attr === 'string' ? attr : attr.value}
                          </span>
                        </div>
                        {typeof attr === 'object' && attr.confidence && (
                          <div className="mt-1 text-[10px] text-text-tertiary">
                            {attr.confidence}% Zuversicht
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Info when no attributes found */}
        {attributeCount === 0 && (
          <div className="text-xs text-text-tertiary italic">
            {t('noAttributes', 'Keine spezifischen Attribute im Text erkannt')}
          </div>
        )}
      </div>
    </motion.div>
  );
}
