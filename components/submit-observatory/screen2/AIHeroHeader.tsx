'use client';

import { useState, useEffect } from 'react';
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

interface AttributeOption {
  value: string;
  label: string;
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
  const [customAttributeValue, setCustomAttributeValue] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [loadedOptions, setLoadedOptions] = useState<Record<string, AttributeOption[]>>({});
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [attributeMetadata, setAttributeMetadata] = useState<Record<string, { dataType: string; displayName: string }>>({});

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

  // Load attribute options dynamically from API
  const loadAttributeOptions = async (key: string) => {
    if (loadedOptions[key]) {
      return;
    }

    setLoadingOptions(true);
    try {
      const response = await fetch(`/api/attribute-options?key=${encodeURIComponent(key)}`);
      if (response.ok) {
        const data = await response.json();
        const options = data.options || [];
        const dataType = data.dataType || 'text';
        const displayName = data.displayName || key;

        // Save metadata
        setAttributeMetadata(prev => ({
          ...prev,
          [key]: { dataType, displayName },
        }));

        // Only add options and "other" for enum types
        if (dataType === 'enum') {
          const hasOther = options.some((opt: AttributeOption) => opt.value === 'other');
          if (!hasOther) {
            options.push({ value: 'other', label: 'Andere...' });
          }

          setLoadedOptions(prev => ({
            ...prev,
            [key]: options,
          }));
        }
      }
    } catch (error) {
      console.error(`Failed to load options for ${key}:`, error);
      setAttributeMetadata(prev => ({
        ...prev,
        [key]: { dataType: 'text', displayName: key },
      }));
    } finally {
      setLoadingOptions(false);
    }
  };

  // Render smart input based on attribute type
  const renderSmartInput = (key: string) => {
    const metadata = attributeMetadata[key];
    const dataType = metadata?.dataType || 'text';
    const displayName = metadata?.displayName || attributeNames[key] || key.replace(/_/g, ' ');
    const options = loadedOptions[key];

    // Enum type → Dropdown
    if (dataType === 'enum' && options && options.length > 0) {
      return (
        <select
          value={editedAttributes[key]?.value || ''}
          onChange={(e) => handleAttributeChange(key, e.target.value)}
          disabled={isSaving || loadingOptions}
          className="w-full px-2 py-1.5 text-xs border border-glass-border rounded bg-glass-bg text-text-primary focus:outline-none focus:ring-2 focus:ring-observatory-accent/50 disabled:opacity-50"
          autoFocus
        >
          <option value="">Auswählen...</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      );
    }

    // Date field
    if (key.includes('date')) {
      return (
        <input
          type="date"
          value={editedAttributes[key]?.value || ''}
          onChange={(e) => handleAttributeChange(key, e.target.value)}
          disabled={isSaving}
          className="w-full px-2 py-1.5 text-xs border border-glass-border rounded bg-glass-bg text-text-primary focus:outline-none focus:ring-2 focus:ring-observatory-accent/50 disabled:opacity-50"
          autoFocus
        />
      );
    }

    // Time field
    if (key.includes('time')) {
      return (
        <input
          type="time"
          value={editedAttributes[key]?.value || ''}
          onChange={(e) => handleAttributeChange(key, e.target.value)}
          disabled={isSaving}
          className="w-full px-2 py-1.5 text-xs border border-glass-border rounded bg-glass-bg text-text-primary focus:outline-none focus:ring-2 focus:ring-observatory-accent/50 disabled:opacity-50"
          autoFocus
        />
      );
    }

    // Default: Text input
    return (
      <input
        type="text"
        value={editedAttributes[key]?.value || ''}
        onChange={(e) => handleAttributeChange(key, e.target.value)}
        disabled={isSaving}
        className="w-full px-2 py-1.5 text-xs border border-glass-border rounded bg-glass-bg text-text-primary focus:outline-none focus:ring-2 focus:ring-observatory-accent/50 disabled:opacity-50"
        placeholder={`${displayName} eingeben...`}
        autoFocus
      />
    );
  };

  const handleAttributeClick = async (key: string) => {
    setEditingKey(key);
    setEditedAttributes(screen2.attributes || {});

    // Initialize custom value if current value is "other:something"
    const currentAttr = screen2.attributes?.[key];
    if (currentAttr && typeof currentAttr === 'object' && currentAttr.customValue) {
      setCustomAttributeValue(currentAttr.customValue);
    } else {
      setCustomAttributeValue('');
    }

    // Load options for this attribute if it's a known type with options
    await loadAttributeOptions(key);
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
      // If "other" is selected and custom value provided, store it
      const attributeValue = editedAttributes[key]?.value;
      if (attributeValue === 'other' && customAttributeValue.trim()) {
        editedAttributes[key] = {
          ...editedAttributes[key],
          customValue: customAttributeValue.trim(),
          isCustom: true,
          isManuallyEdited: true,
        };
      }

      // Update attributes in store
      updateScreen2({ attributes: editedAttributes });

      // Trigger questions reload if callback provided
      if (onReloadQuestions) {
        await onReloadQuestions();
      }

      setEditingKey(null);
      setCustomAttributeValue('');
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

  // Get confidence color (traffic light system) - dezente Version
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return {
      text: 'text-green-600',
      bg: 'bg-green-100/20',
    };
    if (confidence >= 60) return {
      text: 'text-yellow-600',
      bg: 'bg-yellow-100/20',
    };
    return {
      text: 'text-red-600',
      bg: 'bg-red-100/20',
    };
  };

  // Sortiere Attribute nach logischen Gruppen
  const sortAttributes = (attributes: Record<string, any>) => {
    const priorityOrder = [
      // Zeit & Ort
      'experience_date', 'event_date', 'event_time', 'location', 'event_location', 'time_of_day',
      // Dauer & Kontext
      'duration', 'event_duration', 'witnesses', 'visibility', 'prior_state',
      // Intensität & Emotionen
      'intensity', 'emotions', 'emotional_state', 'afterwards_feeling', 'repeatability', 'frequency',
      // Physische Eigenschaften
      'shape', 'surface', 'size', 'phenomenon_color', 'light_color', 'light_pattern',
      // Verhalten & Bewegung
      'movement', 'movement_type', 'sound', 'altitude', 'sky_location', 'disappearance',
      // Rest alphabetisch
    ];

    return Object.entries(attributes).sort((a, b) => {
      const indexA = priorityOrder.indexOf(a[0]);
      const indexB = priorityOrder.indexOf(b[0]);

      if (indexA === -1 && indexB === -1) return a[0].localeCompare(b[0]);
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
    });
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
                    {sortAttributes(screen2.attributes || {}).map(([key, attr]) => {
                      const displayName = attributeNames[key] || key.replace(/_/g, ' ');
                      const attrValue = typeof attr === 'string' ? attr : attr.value;
                      const attrConfidence = typeof attr === 'object' && attr.confidence ? attr.confidence : 0;
                      const options = loadedOptions[key];
                      const isEditing = editingKey === key;

                      // Display custom value if present, otherwise show the regular value
                      const displayValue = typeof attr === 'object' && attr.customValue
                        ? attr.customValue
                        : attrValue;

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
                              <div className="w-full flex items-center gap-1.5">
                                <span className="text-text-tertiary text-[11px] min-w-[90px] text-right">
                                  {displayName}:
                                </span>
                                {attrConfidence > 0 && (
                                  <span className={`px-1 py-0.5 rounded text-[8px] font-semibold ${getConfidenceColor(attrConfidence).bg} ${getConfidenceColor(attrConfidence).text}`}>
                                    {attrConfidence}%
                                  </span>
                                )}
                                <span className="text-text-primary font-medium text-[11px] flex-1">
                                  {(() => {
                                    if (!displayValue || displayValue === '') {
                                      return <span className="text-green-400">✓</span>;
                                    }
                                    if (displayValue === 'true') return 'Ja';
                                    if (displayValue === 'false') return 'Nein';
                                    return displayValue;
                                  })()}
                                </span>
                              </div>
                            </div>
                          )}

                          {/* Editing: Show Input/Dropdown */}
                          {isEditing && (
                            <div className="space-y-2">
                              <label className="block text-text-tertiary font-medium">
                                {displayName}:
                              </label>
                              {/* Smart input based on type */}
                              {renderSmartInput(key)}

                              {/* Custom Value Input - Shows when "other" is selected */}
                              {editedAttributes[key]?.value === 'other' && (
                                <div className="p-2 bg-glass-bg border border-glass-border rounded space-y-1">
                                  <label className="text-[10px] font-medium text-text-primary">
                                    Bitte genauer beschreiben:
                                  </label>
                                  <input
                                    type="text"
                                    value={customAttributeValue}
                                    onChange={(e) => setCustomAttributeValue(e.target.value)}
                                    placeholder="z.B. Kreuzförmig, Bumerang..."
                                    className="w-full px-2 py-1 text-xs border border-glass-border rounded bg-glass-bg text-text-primary focus:outline-none focus:ring-2 focus:ring-observatory-accent/50"
                                    maxLength={50}
                                    disabled={isSaving}
                                  />
                                  <p className="text-[9px] text-text-tertiary italic">
                                    💡 Deine Eingabe hilft uns das System zu verbessern
                                  </p>
                                </div>
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
