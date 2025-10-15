'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Sparkles, Check, X } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface AttributeOption {
  value: string;
  label: string;
}

interface AttributeGridProps {
  attributes: Record<string, any>;
  attributeCount: number;
  isCollapsible?: boolean;
  onSaveAttribute?: (key: string, value: any) => Promise<void>;
  buttonText?: string;
}

/**
 * Shared component for displaying and editing attributes
 * Used in both Step 2 (AIHeroHeader) and Step 3 (EditableMetadataHero)
 */
export function AttributeGrid({
  attributes,
  attributeCount,
  isCollapsible = true,
  onSaveAttribute,
  buttonText = 'Details aus deinem Text erkannt'
}: AttributeGridProps) {
  const t = useTranslations('attributes');
  const [isExpanded, setIsExpanded] = useState(false);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editedAttributes, setEditedAttributes] = useState(attributes || {});
  const [customAttributeValue, setCustomAttributeValue] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [loadedOptions, setLoadedOptions] = useState<Record<string, AttributeOption[]>>({});
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [attributeMetadata, setAttributeMetadata] = useState<Record<string, { dataType: string; displayName: string }>>({});

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
    const displayName = getDisplayName(key);
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
              {getTranslatedValue(option.value) || option.label}
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
    setEditedAttributes(attributes || {});

    const currentAttr = attributes?.[key];
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

  const handleSaveAttributeInternal = async (key: string) => {
    setIsSaving(true);
    try {
      const attributeValue = editedAttributes[key]?.value;
      if (attributeValue === 'other' && customAttributeValue.trim()) {
        editedAttributes[key] = {
          ...editedAttributes[key],
          customValue: customAttributeValue.trim(),
          isCustom: true,
          isManuallyEdited: true,
        };
      }

      // Call parent's save callback if provided
      if (onSaveAttribute) {
        await onSaveAttribute(key, editedAttributes);
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
    setEditingKey(null);
    setCustomAttributeValue('');
    setEditedAttributes(attributes || {});
  };

  // Get confidence color (traffic light system)
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

  // Sort attributes by logical groups
  const sortAttributes = (attrs: Record<string, any>) => {
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

    return Object.entries(attrs).sort((a, b) => {
      const indexA = priorityOrder.indexOf(a[0]);
      const indexB = priorityOrder.indexOf(b[0]);

      if (indexA === -1 && indexB === -1) return a[0].localeCompare(b[0]);
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
    });
  };

  // Get display name with priority: Translation > API metadata > formatted key
  const getDisplayName = (key: string): string => {
    // Try translation first - silently fail if not found
    try {
      const translated = t(key, { default: key });
      // Check if translation was found (not just the fallback)
      if (translated && translated !== key && !translated.startsWith('attributes.')) {
        return translated;
      }
    } catch (e) {
      // Ignore translation errors - continue to fallbacks
    }

    // Fallback to API metadata
    const metadata = attributeMetadata[key];
    if (metadata?.displayName && metadata.displayName !== key) {
      return metadata.displayName;
    }

    // Final fallback: format the key
    return key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ');
  };

  // Get translated value (for display only)
  const getTranslatedValue = (value: string): string => {
    if (!value || value === '') return '';
    if (value === 'true') return 'Ja';
    if (value === 'false') return 'Nein';

    // Return values as-is (no translation)
    // Attribute values are either:
    // 1. User-generated text (dates, locations, times, names) → should stay as-is
    // 2. AI-extracted enums (disc, hovering) → keep original for consistency
    // Only attribute NAMES are translated, not their values
    return value;
  };

  if (attributeCount === 0) return null;

  return (
    <div className="mt-4 pt-4 border-t border-glass-border">
      {isCollapsible ? (
        <>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 text-xs text-text-secondary hover:text-text-primary transition-colors w-full"
          >
            <Sparkles className="w-4 h-4 text-observatory-accent" />
            <span>
              {attributeCount} {buttonText}
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
                <AttributeGridContent
                  attributes={attributes}
                  sortAttributes={sortAttributes}
                  getDisplayName={getDisplayName}
                  getTranslatedValue={getTranslatedValue}
                  getConfidenceColor={getConfidenceColor}
                  editingKey={editingKey}
                  handleAttributeClick={handleAttributeClick}
                  editedAttributes={editedAttributes}
                  renderSmartInput={renderSmartInput}
                  customAttributeValue={customAttributeValue}
                  setCustomAttributeValue={setCustomAttributeValue}
                  isSaving={isSaving}
                  handleSaveAttributeInternal={handleSaveAttributeInternal}
                  handleCancelEdit={handleCancelEdit}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </>
      ) : (
        <AttributeGridContent
          attributes={attributes}
          sortAttributes={sortAttributes}
          getDisplayName={getDisplayName}
          getTranslatedValue={getTranslatedValue}
          getConfidenceColor={getConfidenceColor}
          editingKey={editingKey}
          handleAttributeClick={handleAttributeClick}
          editedAttributes={editedAttributes}
          renderSmartInput={renderSmartInput}
          customAttributeValue={customAttributeValue}
          setCustomAttributeValue={setCustomAttributeValue}
          isSaving={isSaving}
          handleSaveAttributeInternal={handleSaveAttributeInternal}
          handleCancelEdit={handleCancelEdit}
        />
      )}
    </div>
  );
}

// Separate component for the grid content
function AttributeGridContent({
  attributes,
  sortAttributes,
  getDisplayName,
  getTranslatedValue,
  getConfidenceColor,
  editingKey,
  handleAttributeClick,
  editedAttributes,
  renderSmartInput,
  customAttributeValue,
  setCustomAttributeValue,
  isSaving,
  handleSaveAttributeInternal,
  handleCancelEdit,
}: any) {
  return (
    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
      {sortAttributes(attributes || {}).map(([key, attr]: [string, any]) => {
        const displayName = getDisplayName(key);
        const attrValue = typeof attr === 'string' ? attr : attr.value;
        const attrConfidence = typeof attr === 'object' && attr.confidence ? attr.confidence : 0;
        const isEditing = editingKey === key;

        // Display custom value if present
        const displayValue = typeof attr === 'object' && attr.customValue
          ? attr.customValue
          : attrValue;

        return (
          <div
            key={key}
            className="text-xs p-2 bg-glass-bg/50 rounded border border-glass-border"
          >
            {!isEditing && (
              <div
                onClick={() => handleAttributeClick(key)}
                className="cursor-pointer hover:bg-glass-bg transition-colors"
              >
                <div className="space-y-1">
                  {/* Label with confidence badge on same line */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-text-tertiary text-xs font-medium">
                      {displayName}
                    </span>
                    {attrConfidence > 0 && (
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${getConfidenceColor(attrConfidence).bg} ${getConfidenceColor(attrConfidence).text}`}>
                        {attrConfidence}%
                      </span>
                    )}
                  </div>
                  {/* Value on separate line, left-aligned */}
                  <div className="text-text-primary font-medium text-sm">
                    {(() => {
                      if (!displayValue || displayValue === '') {
                        return <span className="text-green-400">✓</span>;
                      }
                      return getTranslatedValue(displayValue);
                    })()}
                  </div>
                </div>
              </div>
            )}

            {isEditing && (
              <div className="space-y-2">
                <label className="block text-text-tertiary font-medium">
                  {displayName}:
                </label>
                {renderSmartInput(key)}

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

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleSaveAttributeInternal(key)}
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
  );
}
