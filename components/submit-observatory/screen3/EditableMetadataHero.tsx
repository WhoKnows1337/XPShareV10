'use client';

import { useState, useEffect } from 'react';
import { useSubmitFlowStore } from '@/lib/stores/submitFlowStore';
import { CategoryPicker } from '../screen2/CategoryPicker';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Pencil, Check, RefreshCw } from 'lucide-react';
import { AttributeGrid } from '../shared/AttributeGrid';
import { useTranslations } from 'next-intl';
import { getCategoryIcon, getCategoryBgClass } from '@/lib/category-icons';

export function EditableMetadataHero() {
  const tCategories = useTranslations('categories');
  const { screen2, screen3, setTitle, setCategory, removeTag, setSummary, screen1, updateScreen2 } = useSubmitFlowStore();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingSummary, setIsEditingSummary] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [showTitleSuggestions, setShowTitleSuggestions] = useState(false);
  const [showSummarySuggestions, setShowSummarySuggestions] = useState(false);
  const [titleSuggestions, setTitleSuggestions] = useState<string[]>([]);
  const [summarySuggestions, setSummarySuggestions] = useState<string[]>([]);
  const [isGeneratingTitles, setIsGeneratingTitles] = useState(false);
  const [isGeneratingSummaries, setIsGeneratingSummaries] = useState(false);

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


  const categorySlug = screen2.category || 'other';
  const CategoryIcon = getCategoryIcon(categorySlug);
  const categoryColor = getCategoryBgClass(categorySlug);
  const confidencePercent = Math.round((screen2.aiConfidence || 0.95) * 100);
  const attributeCount = screen2.attributes ? Object.keys(screen2.attributes).length : 0;

  const titleLength = screen2.title.length;
  const summaryLength = screen3.summary?.length || 0;

  // Callback for saving attributes
  const handleSaveAttribute = async (key: string, editedAttributes: Record<string, any>) => {
    updateScreen2({ attributes: editedAttributes });
  };

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

        {/* Attributes Grid - Shared Component */}
        <AttributeGrid
          attributes={screen2.attributes}
          attributeCount={attributeCount}
          isCollapsible={true}
          onSaveAttribute={handleSaveAttribute}
          buttonText="Details aus deinem Text erkannt"
        />
      </div>
    </motion.div>
  );
}
