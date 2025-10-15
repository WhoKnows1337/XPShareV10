'use client';

import { useState } from 'react';
import { useSubmitFlowStore } from '@/lib/stores/submitFlowStore';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  Sparkles,
  Check,
  X,
} from 'lucide-react';
import { CategoryPicker } from './CategoryPicker';
import { getCategoryIcon, getCategoryBgClass } from '@/lib/category-icons';
import { Button } from '@/components/ui/button';

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
  const [isExpanded, setIsExpanded] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [editedAttributes, setEditedAttributes] = useState(screen2.attributes || {});
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

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

  // Attribute display names mapping (hardcoded to avoid missing translation errors)
  const attributeNames: Record<string, string> = {
    shape: 'Form',
    surface: 'Oberfläche',
    lights: 'Lichter',
    light_color: 'Lichtfarbe',
    movement: 'Bewegung',
    sound: 'Geräusch',
    size: 'Größe',
    entity_type: 'Art des Wesens',
    entity_appearance: 'Erscheinung',
    entity_behavior: 'Verhalten',
    intensity: 'Intensität',
    duration: 'Dauer',
    emotional_state: 'Emotionaler Zustand',
    time_distortion: 'Zeitverzerrung',
    event_date: 'Datum',
    event_location: 'Ort',
    event_time: 'Uhrzeit',
    time_of_day: 'Tageszeit',
    event_duration: 'Dauer',
    witnesses: 'Zeugen',
    visibility: 'Sichtbarkeit',
    afterwards_feeling: 'Gefühl danach',
    repeatability: 'Wiederholung',
    altitude: 'Höhe',
    disappearance: 'Verschwinden',
    phenomenon_color: 'Farbe',
    sky_location: 'Himmelsposition',
    movement_type: 'Bewegungsart',
    light_pattern: 'Lichtmuster',
    clarity_level: 'Klarheit',
    dream_emotion: 'Traumemotion',
    visual_quality: 'Visuelle Qualität',
    dream_symbol: 'Traumsymbol',
    lucidity: 'Luzidität',
    dream_type: 'Traumtyp',
    vividness: 'Lebendigkeit',
    dream_frequency_bw: 'SW-Traumhäufigkeit',
    dream_recent_color: 'Kürzlich Farbtraum',
    dream_color_experience: 'Farbtraum-Erlebnis',
    dream_recent_bw: 'Kürzlich SW-Traum',
    dream_frequency_color: 'Farbtraum-Häufigkeit',
  };

  // Predefined options for enum-type attributes
  const attributeOptions: Record<string, string[]> = {
    shape: ['triangle', 'disc', 'orb', 'cigar', 'cylinder', 'rectangle', 'sphere', 'other'],
    surface: ['metallic', 'glowing', 'translucent', 'matte', 'reflective'],
    light_color: ['white', 'red', 'blue', 'green', 'orange', 'yellow', 'multicolor'],
    movement: ['hovering', 'fast', 'erratic', 'smooth', 'zigzag', 'ascending', 'descending'],
    sound: ['silent', 'humming', 'buzzing', 'roaring', 'whistling', 'other'],
    size: ['tiny', 'small', 'medium', 'large', 'huge'],
    entity_type: ['human', 'shadow', 'animal', 'child', 'elderly', 'unknown'],
    entity_appearance: ['solid', 'transparent', 'shadow', 'mist', 'glowing'],
    entity_behavior: ['benign', 'aggressive', 'playful', 'sad', 'angry', 'confused'],
    intensity: ['mild', 'moderate', 'strong', 'overwhelming'],
    emotional_state: ['peaceful', 'fearful', 'joyful', 'confused', 'awe', 'terror'],
    time_distortion: ['faster', 'slower', 'stopped', 'backwards', 'loop'],
  };

  const handleAttributeClick = (key: string) => {
    setEditingKey(key);
    setEditedAttributes(screen2.attributes || {});
  };

  const handleAttributeChange = (key: string, value: string) => {
    const newAttributes = {
      ...editedAttributes,
      [key]: {
        ...editedAttributes[key],
        value,
        isManuallyEdited: true,
      },
    };
    setEditedAttributes(newAttributes);
  };

  const handleSaveAttribute = async (key: string) => {
    setIsSaving(true);
    try {
      // Update attributes in store
      updateScreen2({ attributes: editedAttributes });

      // Trigger questions reload if callback provided
      if (onReloadQuestions) {
        await onReloadQuestions();
      }

      setEditingKey(null);
    } catch (error) {
      console.error('Failed to save attribute changes:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditedAttributes(screen2.attributes || {});
    setEditingKey(null);
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
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {Object.entries(screen2.attributes || {}).map(([key, attr]) => {
                      const displayName = attributeNames[key] || key.replace(/_/g, ' ');
                      const attrValue = typeof attr === 'string' ? attr : attr.value;
                      const attrConfidence = typeof attr === 'object' && attr.confidence ? attr.confidence : 0;
                      const options = attributeOptions[key];
                      const isEditing = editingKey === key;

                      return (
                        <div
                          key={key}
                          className="text-xs p-2 bg-glass-bg/50 rounded border border-glass-border"
                        >
                          {/* Not Editing: Show Value (Clickable Box) */}
                          {!isEditing && (
                            <div
                              onClick={() => handleAttributeClick(key)}
                              className="cursor-pointer hover:bg-glass-bg transition-colors"
                            >
                              <div className="w-full flex items-center justify-between">
                                <span className="text-text-tertiary capitalize">
                                  {displayName}:
                                </span>
                                <span className="text-text-primary font-medium">
                                  {(() => {
                                    if (!attrValue || attrValue === '') {
                                      return <span className="text-green-400">✓</span>;
                                    }
                                    if (attrValue === 'true') return 'Ja';
                                    if (attrValue === 'false') return 'Nein';
                                    return attrValue;
                                  })()}
                                </span>
                              </div>
                              {attrConfidence > 0 && (
                                <div className="mt-1 flex items-center gap-1">
                                  <div className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                                    attrConfidence >= 80
                                      ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                      : attrConfidence >= 60
                                      ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                                      : 'bg-red-500/20 text-red-400 border border-red-500/30'
                                  }`}>
                                    {attrConfidence}% Sicher
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Editing: Show Input/Dropdown */}
                          {isEditing && (
                            <div className="space-y-2">
                              <label className="block text-text-tertiary font-medium">
                                {displayName}:
                              </label>
                              {options ? (
                                <select
                                  value={editedAttributes[key]?.value || ''}
                                  onChange={(e) => handleAttributeChange(key, e.target.value)}
                                  disabled={isSaving}
                                  className="w-full px-2 py-1.5 text-xs border border-glass-border rounded bg-glass-bg text-text-primary focus:outline-none focus:ring-2 focus:ring-observatory-accent/50 disabled:opacity-50"
                                  autoFocus
                                >
                                  <option value="">Auswählen...</option>
                                  {options.map((option) => (
                                    <option key={option} value={option}>
                                      {option}
                                    </option>
                                  ))}
                                </select>
                              ) : (
                                <input
                                  type="text"
                                  value={editedAttributes[key]?.value || ''}
                                  onChange={(e) => handleAttributeChange(key, e.target.value)}
                                  disabled={isSaving}
                                  className="w-full px-2 py-1.5 text-xs border border-glass-border rounded bg-glass-bg text-text-primary focus:outline-none focus:ring-2 focus:ring-observatory-accent/50 disabled:opacity-50"
                                  placeholder="Wert eingeben..."
                                  autoFocus
                                />
                              )}
                              {/* Save/Cancel Icons */}
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleSaveAttribute(key)}
                                  disabled={isSaving}
                                  className="p-1 text-green-400 hover:bg-green-400/10 rounded border border-green-400/30 disabled:opacity-50"
                                  title="Speichern"
                                >
                                  <Check className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={handleCancelEdit}
                                  disabled={isSaving}
                                  className="p-1 text-red-400 hover:bg-red-400/10 rounded border border-red-400/30 disabled:opacity-50"
                                  title="Abbrechen"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
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
