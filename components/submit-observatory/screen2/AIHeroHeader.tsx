'use client';

import { useState } from 'react';
import { useSubmitFlowStore } from '@/lib/stores/submitFlowStore';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { CategoryPicker } from './CategoryPicker';
import { getCategoryIcon, getCategoryBgClass } from '@/lib/category-icons';

/**
 * Hero Header for Step 2 - Simplified to show only Category
 * Displays: Category (editable), Attributes (collapsible)
 * Title, Summary, and Tags are now shown in Step 3
 */
export function AIHeroHeader() {
  const t = useTranslations('submit.screen2');
  const tCategories = useTranslations('categories');
  const { screen2, updateScreen2 } = useSubmitFlowStore();
  const [isExpanded, setIsExpanded] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  const categorySlug = screen2.category || 'other';

  // Get icon and color from central mapping
  const CategoryIcon = getCategoryIcon(categorySlug);
  const categoryColor = getCategoryBgClass(categorySlug);

  // Try to get translation, fallback to formatted slug if not found
  let categoryName: string;
  try {
    categoryName = tCategories(categorySlug);
  } catch {
    // Fallback: format the slug (e.g., "dreams" -> "Dreams")
    categoryName = categorySlug
      .split(/[-_]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
  const confidencePercent = Math.round((screen2.confidence || 0.95) * 100);

  // Category change handler with smart attribute merging
  const handleCategoryChange = (newCategory: string) => {
    // Keep only universal attributes that apply to all categories
    const universalKeys = ['date', 'location', 'time_of_day', 'witnesses', 'duration'];

    const universalAttributes: Record<string, { value: string; confidence: number; isManuallyEdited: boolean }> = {};

    // Filter out category-specific attributes, keep only universal ones
    if (screen2.attributes) {
      Object.entries(screen2.attributes).forEach(([key, value]) => {
        if (universalKeys.includes(key)) {
          universalAttributes[key] = value;
        }
      });
    }

    console.log(`Category changed from ${screen2.category} to ${newCategory}`);
    console.log(`Keeping ${Object.keys(universalAttributes).length} universal attributes:`, Object.keys(universalAttributes));

    updateScreen2({
      category: newCategory,
      // Keep universal attributes, reset category-specific ones
      attributes: universalAttributes,
      // Reset questions when category changes
      extraQuestions: {},
      completedExtraQuestions: false
    });
    setPickerOpen(false);
  };

  // Helper function to get category translation
  const getCategoryTranslation = (slug: string): string => {
    try {
      return tCategories(slug);
    } catch {
      return slug
        .split(/[-_]/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }
  };

  const attributeCount = screen2.attributes ? Object.keys(screen2.attributes).length : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-glass-bg border border-glass-border rounded-lg overflow-hidden mb-6"
    >
      {/* Category Header */}
      <div className="p-4 bg-gradient-to-r from-observatory-accent/10 to-transparent">
        <div className="flex items-start gap-3">
          {/* Category Icon - Clickable (Left) - Just a button, no text */}
          <button
            onClick={() => setPickerOpen(true)}
            className={`w-12 h-12 rounded-full flex items-center justify-center ${categoryColor} flex-shrink-0 cursor-pointer hover:scale-105 transition-transform`}
            aria-label="Kategorie ändern"
          >
            <CategoryIcon className="w-6 h-6 text-white" />
          </button>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Category Name + Confidence (Right) */}
            <div className="flex items-center gap-2 mb-2">
              <CategoryPicker
                currentCategory={categorySlug}
                onSelect={handleCategoryChange}
                getCategoryTranslation={getCategoryTranslation}
                variant="inline"
                open={pickerOpen}
                onOpenChange={setPickerOpen}
              />
              <span className="text-xs text-text-tertiary">
                {confidencePercent}% Zuversicht
              </span>
            </div>

            <p className="text-sm text-text-secondary leading-snug">
              KI hat die Kategorie erkannt. Falls falsch, kannst du sie ändern.
            </p>
          </div>
        </div>

        {/* Collapsible Attributes */}
        {attributeCount > 0 && (
          <div className="mt-4 pt-4 border-t border-glass-border">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-2 text-xs text-text-secondary hover:text-text-primary transition-colors w-full"
            >
              <Sparkles className="w-4 h-4 text-observatory-accent" />
              <span>
                {attributeCount} {t('attributesFound', 'Details aus deinem Text erkannt')}
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
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
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
                            {attr.confidence}% Sicher
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
      </div>
    </motion.div>
  );
}
