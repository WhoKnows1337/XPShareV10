'use client';

import { useState } from 'react';
import { useSubmitFlowStore } from '@/lib/stores/submitFlowStore';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { CategoryPicker } from './CategoryPicker';
import { getCategoryIcon, getCategoryBgClass } from '@/lib/category-icons';
import { AttributeGrid } from '../shared/AttributeGrid';

interface AIHeroHeaderProps {
  onReloadQuestions?: () => Promise<void>;
}

/**
 * Hero Header for Step 2 - Simplified to show only Category
 * Displays: Category (editable), Attributes (editable & collapsible)
 * Title, Summary, and Tags are now shown in Step 3
 */
export function AIHeroHeader({ onReloadQuestions }: AIHeroHeaderProps) {
  const t = useTranslations('submit.screen2');
  const tCategories = useTranslations('categories');
  const { screen2, updateScreen2 } = useSubmitFlowStore();
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
  const confidencePercent = Math.round((screen2.aiConfidence || 0.95) * 100);

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

  // Callback for saving attributes with optional question reload
  const handleSaveAttribute = async (key: string, editedAttributes: Record<string, any>) => {
    // Update attributes in store
    updateScreen2({ attributes: editedAttributes });

    // Trigger questions reload if callback provided
    if (onReloadQuestions) {
      await onReloadQuestions();
    }
  };

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

        {/* Attributes Grid - Shared Component */}
        <AttributeGrid
          attributes={screen2.attributes}
          attributeCount={attributeCount}
          isCollapsible={true}
          onSaveAttribute={handleSaveAttribute}
          buttonText={t('attributesFound')}
        />
      </div>
    </motion.div>
  );
}
