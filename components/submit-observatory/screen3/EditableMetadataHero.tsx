'use client';

import { useState, useEffect } from 'react';
import { useSubmitFlowStore } from '@/lib/stores/submitFlowStore';
import { CategoryPicker } from '../screen2/CategoryPicker';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, X, Pencil, Check, RefreshCw } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { getCategoryIcon, getCategoryBgClass } from '@/lib/category-icons';

interface AttributeOption {
  value: string;
  label: string;
}

export function EditableMetadataHero() {
  const tCategories = useTranslations('categories');
  const { screen2, screen3, setTitle, setCategory, removeTag, setSummary, screen1, updateScreen2 } = useSubmitFlowStore();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingSummary, setIsEditingSummary] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [showTitleSuggestions, setShowTitleSuggestions] = useState(false);
  const [showSummarySuggestions, setShowSummarySuggestions] = useState(false);
  const [titleSuggestions, setTitleSuggestions] = useState<string[]>([]);
  const [summarySuggestions, setSummarySuggestions] = useState<string[]>([]);
  const [isGeneratingTitles, setIsGeneratingTitles] = useState(false);
  const [isGeneratingSummaries, setIsGeneratingSummaries] = useState(false);

  // Attribute editing states
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editedAttributes, setEditedAttributes] = useState(screen2.attributes || {});
  const [customAttributeValue, setCustomAttributeValue] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [loadedOptions, setLoadedOptions] = useState<Record<string, AttributeOption[]>>({});
  const [loadingOptions, setLoadingOptions] = useState(false);

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

  const handleCategoryChange = (category: string) => {
    setCategory(category);
    setPickerOpen(false);
  };

  const generateTitleSuggestions = async () => {
    setIsGeneratingTitles(true);
    setShowTitleSuggestions(true);
    try {
      const response = await fetch('/api/submit/generate-title-suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: screen1.text,
          category: screen2.category,
          currentTitle: screen2.title,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setTitleSuggestions(data.suggestions || []);
      } else {
        // Fallback
        setTitleSuggestions([
          'Alternative Titel-Variante 1',
          'Alternative Titel-Variante 2',
          'Alternative Titel-Variante 3',
        ]);
      }
    } catch (error) {
      console.error('Fehler beim Generieren von Titel-Vorschlägen:', error);
      // Fallback
      setTitleSuggestions([
        'Alternative Titel-Variante 1',
        'Alternative Titel-Variante 2',
        'Alternative Titel-Variante 3',
      ]);
    } finally {
      setIsGeneratingTitles(false);
    }
  };

  const generateSummarySuggestions = async () => {
    setIsGeneratingSummaries(true);
    setShowSummarySuggestions(true);
    try {
      const response = await fetch('/api/submit/generate-summary-suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: screen1.text,
          category: screen2.category,
          currentSummary: screen3.summary,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSummarySuggestions(data.suggestions || []);
      } else {
        // Fallback
        setSummarySuggestions([
          'Alternative Zusammenfassung 1 - Kurz und prägnant',
          'Alternative Zusammenfassung 2 - Mit mehr Details',
          'Alternative Zusammenfassung 3 - Fokus auf Kernaussage',
        ]);
      }
    } catch (error) {
      console.error('Fehler beim Generieren von Zusammenfassungs-Vorschlägen:', error);
      // Fallback
      setSummarySuggestions([
        'Alternative Zusammenfassung 1 - Kurz und prägnant',
        'Alternative Zusammenfassung 2 - Mit mehr Details',
        'Alternative Zusammenfassung 3 - Fokus auf Kernaussage',
      ]);
    } finally {
      setIsGeneratingSummaries(false);
    }
  };

  // Load attribute options dynamically from API
  const [attributeMetadata, setAttributeMetadata] = useState<Record<string, { dataType: string; displayName: string }>>({});

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

  const handleAttributeClick = async (key: string) => {
    setEditingKey(key);
    setEditedAttributes(screen2.attributes || {});

    const currentAttr = screen2.attributes?.[key];
    if (currentAttr && typeof currentAttr === 'object' && currentAttr.customValue) {
      setCustomAttributeValue(currentAttr.customValue);
    } else {
      setCustomAttributeValue('');
    }

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
    const attributeValue = editedAttributes[key]?.value;
    if (attributeValue === 'other' && customAttributeValue.trim()) {
      editedAttributes[key] = {
        ...editedAttributes[key],
        customValue: customAttributeValue.trim(),
        isCustom: true,
        isManuallyEdited: true,
      };
    }
    updateScreen2({ attributes: editedAttributes });
    setEditingKey(null);
    setCustomAttributeValue('');
    setIsSaving(false);
  };

  const handleCancelEdit = () => {
    setEditingKey(null);
    setCustomAttributeValue('');
    setEditedAttributes(screen2.attributes || {});
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

  // Render smart input based on attribute type
  const renderSmartInput = (key: string) => {
    const metadata = attributeMetadata[key];
    const dataType = metadata?.dataType || 'text';
    const displayName = metadata?.displayName || key.replace(/_/g, ' ');
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

  const categorySlug = screen2.category || 'other';
  const CategoryIcon = getCategoryIcon(categorySlug);
  const categoryColor = getCategoryBgClass(categorySlug);
  const confidencePercent = Math.round((screen2.confidence || 0.95) * 100);
  const attributeCount = screen2.attributes ? Object.keys(screen2.attributes).length : 0;

  const titleLength = screen2.title.length;
  const summaryLength = screen3.summary?.length || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-glass-bg border border-glass-border rounded-lg mb-6"
    >
      {/* Category Header - Same style as Step 2 */}
      <div className="p-4 bg-gradient-to-r from-observatory-accent/10 to-transparent rounded-t-lg">
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

            {/* Editable Title - With Pencil Icon */}
            {!isEditingTitle ? (
              <div className="relative">
                <div className="group flex items-center gap-2">
                  <h1
                    onClick={() => setIsEditingTitle(true)}
                    className="text-2xl font-bold text-text-primary leading-tight cursor-pointer flex-1"
                  >
                    {screen2.title || 'Titel eingeben...'}
                  </h1>
                  <button
                    onClick={() => setIsEditingTitle(true)}
                    className="p-1.5 text-observatory-accent hover:bg-observatory-accent/10 rounded transition-colors"
                    title="Titel bearbeiten"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="relative">
                <div className="flex items-center gap-2">
                  <Input
                    value={screen2.title}
                    onChange={(e) => setTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') setIsEditingTitle(false);
                      if (e.key === 'Escape') setIsEditingTitle(false);
                    }}
                    placeholder="Titel eingeben..."
                    className="flex-1 px-2 py-1 bg-glass-bg border border-observatory-accent/40 rounded text-text-primary text-xl font-bold focus:outline-none focus:ring-2 focus:ring-observatory-accent/50"
                    autoFocus
                    maxLength={80}
                  />
                  <button
                    onClick={() => setIsEditingTitle(false)}
                    className="p-1.5 bg-green-500/20 hover:bg-green-500/30 rounded transition-colors"
                  >
                    <Check className="w-4 h-4 text-green-500" />
                  </button>
                  <button
                    onClick={() => generateTitleSuggestions()}
                    className="p-1.5 text-observatory-accent hover:bg-observatory-accent/10 rounded transition-colors group/refresh"
                    title="Neue Vorschläge generieren"
                  >
                    <RefreshCw className="w-4 h-4 group-hover/refresh:rotate-180 transition-transform duration-500" />
                  </button>
                  <button
                    onClick={() => setIsEditingTitle(false)}
                    className="p-1.5 bg-glass-bg hover:bg-glass-border rounded transition-colors"
                  >
                    <X className="w-4 h-4 text-text-tertiary" />
                  </button>
                </div>

                {/* Title Suggestions Popup */}
                <AnimatePresence>
                  {showTitleSuggestions && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full left-0 right-0 mt-2 bg-space-mid/95 backdrop-blur-md border border-glass-border rounded-lg p-3 z-50 shadow-xl"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-text-primary">Titel-Vorschläge</span>
                        <button
                          onClick={() => setShowTitleSuggestions(false)}
                          className="p-1 hover:bg-glass-border rounded transition-colors"
                        >
                          <X className="w-3 h-3 text-text-tertiary" />
                        </button>
                      </div>
                      <div className="space-y-2">
                        {isGeneratingTitles ? (
                          <div className="flex items-center justify-center py-4">
                            <RefreshCw className="w-4 h-4 animate-spin text-observatory-accent" />
                          </div>
                        ) : (
                          titleSuggestions.map((suggestion, index) => (
                            <button
                              key={index}
                              onClick={() => {
                                setTitle(suggestion);
                                setShowTitleSuggestions(false);
                              }}
                              className="w-full text-left p-2 bg-glass-bg/50 hover:bg-observatory-accent/10 border border-glass-border hover:border-observatory-accent/40 rounded text-sm text-text-primary transition-colors"
                            >
                              {suggestion}
                            </button>
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>

        {/* Editable Summary - With Pencil Icon */}
        <div className="mt-4 space-y-1">
          <label className="text-[10px] font-medium text-text-tertiary uppercase">
            Zusammenfassung
          </label>
          {isEditingSummary ? (
            <div className="relative">
              <Textarea
                value={screen3.summary || ''}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Zusammenfassung eingeben..."
                className="text-sm bg-glass-bg/50 border-glass-border focus:border-accent-cyan resize-none h-20 pr-20"
                maxLength={250}
              />
              <div className="absolute right-2 top-2 flex gap-1">
                <button
                  onClick={() => setIsEditingSummary(false)}
                  className="p-1.5 bg-green-500/20 hover:bg-green-500/30 rounded transition-colors"
                >
                  <Check className="w-3.5 h-3.5 text-green-500" />
                </button>
                <button
                  onClick={() => generateSummarySuggestions()}
                  className="p-1.5 text-observatory-accent hover:bg-observatory-accent/10 rounded transition-colors group/refresh"
                  title="Neue Vorschläge generieren"
                >
                  <RefreshCw className="w-3.5 h-3.5 group-hover/refresh:rotate-180 transition-transform duration-500" />
                </button>
                <button
                  onClick={() => setIsEditingSummary(false)}
                  className="p-1.5 bg-glass-bg hover:bg-glass-border rounded transition-colors"
                >
                  <X className="w-3.5 h-3.5 text-text-tertiary" />
                </button>
              </div>
              <div className={`absolute right-3 bottom-2 text-[10px] font-medium ${
                summaryLength >= 150 && summaryLength <= 250 ? 'text-green-400' : 'text-yellow-400'
              }`}>
                {summaryLength}/250
              </div>

              {/* Summary Suggestions Popup */}
              <AnimatePresence>
                {showSummarySuggestions && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-space-mid/95 backdrop-blur-md border border-glass-border rounded-lg p-3 z-[100] shadow-xl max-h-[500px] overflow-y-auto"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-text-primary">Zusammenfassungs-Vorschläge</span>
                      <button
                        onClick={() => setShowSummarySuggestions(false)}
                        className="p-1 hover:bg-glass-border rounded transition-colors"
                      >
                        <X className="w-3 h-3 text-text-tertiary" />
                      </button>
                    </div>
                    <div className="space-y-2 min-h-[200px]">
                      {isGeneratingSummaries ? (
                        <div className="flex items-center justify-center py-4">
                          <RefreshCw className="w-4 h-4 animate-spin text-observatory-accent" />
                        </div>
                      ) : (
                        summarySuggestions.map((suggestion, index) => (
                          <button
                            key={index}
                            onClick={() => {
                              setSummary(suggestion);
                              setShowSummarySuggestions(false);
                            }}
                            className="w-full text-left p-3 bg-glass-bg/50 hover:bg-observatory-accent/10 border border-glass-border hover:border-observatory-accent/40 rounded text-xs text-text-primary transition-colors leading-relaxed"
                          >
                            {suggestion}
                          </button>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="group flex items-start gap-2 cursor-pointer text-sm text-text-primary p-2 rounded border border-transparent hover:border-accent-cyan/30 min-h-[60px]">
              <div
                onClick={() => setIsEditingSummary(true)}
                className="flex-1"
              >
                {screen3.summary || 'Zusammenfassung eingeben...'}
              </div>
              <button
                onClick={() => setIsEditingSummary(true)}
                className="p-1.5 text-observatory-accent hover:bg-observatory-accent/10 rounded transition-colors"
                title="Zusammenfassung bearbeiten"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Tags - Without # */}
        <div className="mt-4 space-y-2">
          <label className="text-[10px] font-medium text-text-tertiary uppercase">
            Tags ({screen2.tags.length}/12)
          </label>
          <div className="flex flex-wrap gap-2">
            {screen2.tags.map((tag) => (
              <div
                key={tag}
                className="group flex items-center gap-1.5 px-3 py-1 rounded-full bg-observatory-accent/10 border border-observatory-accent/20 hover:border-observatory-accent/40 transition-colors"
              >
                <span className="text-xs font-medium text-observatory-accent">{tag}</span>
                <button
                  onClick={() => removeTag(tag)}
                  className="p-0.5 rounded-full hover:bg-destructive/20 transition-colors"
                  aria-label="Tag entfernen"
                >
                  <X className="w-3 h-3 text-text-tertiary group-hover:text-destructive transition-colors" />
                </button>
              </div>
            ))}
            {screen2.tags.length === 0 && (
              <span className="text-xs text-text-tertiary">Keine Tags vorhanden</span>
            )}
          </div>
        </div>

        {/* Collapsible Attributes */}
        {attributeCount > 0 && (
          <div className="mt-4 pt-4 border-t border-glass-border">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-2 text-xs text-text-secondary hover:text-text-primary transition-colors w-full"
            >
              <span>
                {attributeCount} Details aus deinem Text erkannt
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
                      const displayName = key.replace(/_/g, ' ');
                      const attrValue = typeof attr === 'string' ? attr : attr.value;
                      const attrConfidence = typeof attr === 'object' && attr.confidence ? attr.confidence : 0;
                      const options = loadedOptions[key];
                      const isEditing = editingKey === key;

                      // Display custom value if present
                      const displayValue = typeof attr === 'object' && attr.customValue
                        ? attr.customValue
                        : attrValue;

                      return (
                        <div
                          key={key}
                          className={`text-xs p-2 bg-glass-bg/50 rounded border transition-all ${
                            isEditing
                              ? 'border-observatory-accent ring-2 ring-observatory-accent/20'
                              : 'border-glass-border hover:border-observatory-accent/30 cursor-pointer'
                          }`}
                        >
                          {isEditing ? (
                            <div className="space-y-2">
                              <label className="block text-text-tertiary font-medium capitalize">
                                {displayName}:
                              </label>
                              {/* Smart input based on type */}
                              {renderSmartInput(key)}

                              {/* Custom value input - only for enum with "other" */}
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

                              {/* Action buttons */}
                              <div className="flex gap-1">
                                <button
                                  onClick={() => handleSaveAttribute(key)}
                                  disabled={isSaving}
                                  className="flex-1 px-2 py-1 text-[10px] font-medium bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded border border-green-400/30 transition-colors disabled:opacity-50"
                                >
                                  <Check className="w-3 h-3 inline mr-1" />
                                  Speichern
                                </button>
                                <button
                                  onClick={handleCancelEdit}
                                  disabled={isSaving}
                                  className="flex-1 px-2 py-1 text-[10px] font-medium bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded border border-red-400/30 transition-colors disabled:opacity-50"
                                >
                                  <X className="w-3 h-3 inline mr-1" />
                                  Abbrechen
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div onClick={() => handleAttributeClick(key)}>
                              <div className="flex items-center gap-1.5">
                                <span className="text-text-tertiary text-[11px] min-w-[90px] text-right">
                                  {displayName}:
                                </span>
                                {typeof attr === 'object' && attr.confidence && (
                                  <span className={`px-1 py-0.5 rounded text-[8px] font-semibold ${getConfidenceColor(attr.confidence).bg} ${getConfidenceColor(attr.confidence).text}`}>
                                    {attr.confidence}%
                                  </span>
                                )}
                                <span className="text-text-primary font-medium text-[11px] flex-1">
                                  {displayValue}
                                </span>
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
