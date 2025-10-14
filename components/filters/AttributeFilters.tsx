'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Filter, X, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface AttributeValue {
  value: string;
  count: number;
  label_en: string;
}

interface AttributeData {
  display_name: string;
  display_name_de?: string;
  display_name_fr?: string;
  display_name_es?: string;
  data_type: string;
  values: AttributeValue[];
  total_count: number;
}

interface AttributeFiltersProps {
  category?: string;
  className?: string;
}

export function AttributeFilters({ category, className }: AttributeFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations('attributes');
  const [attributes, setAttributes] = useState<Record<string, AttributeData>>({});
  const [loading, setLoading] = useState(true);
  const [expandedAttributes, setExpandedAttributes] = useState<Set<string>>(new Set());
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({});

  // Load available attributes
  useEffect(() => {
    async function loadAttributes() {
      try {
        const url = category
          ? `/api/attributes/available?category=${category}`
          : '/api/attributes/available';

        const response = await fetch(url);
        const data = await response.json();

        if (data.success) {
          setAttributes(data.attributes);
          // Auto-expand first 3 attributes
          const keys = Object.keys(data.attributes).slice(0, 3);
          setExpandedAttributes(new Set(keys));
        }
      } catch (error) {
        console.error('Error loading attributes:', error);
      } finally {
        setLoading(false);
      }
    }

    loadAttributes();
  }, [category]);

  // Parse URL params
  useEffect(() => {
    const filters: Record<string, string[]> = {};
    searchParams.forEach((value, key) => {
      if (key !== 'category' && key !== 'q') {
        filters[key] = value.split(',');
      }
    });
    setSelectedFilters(filters);
  }, [searchParams]);

  const toggleAttribute = (attrKey: string) => {
    setExpandedAttributes(prev => {
      const next = new Set(prev);
      if (next.has(attrKey)) {
        next.delete(attrKey);
      } else {
        next.add(attrKey);
      }
      return next;
    });
  };

  const toggleFilter = (attrKey: string, value: string, checked: boolean) => {
    const newFilters = { ...selectedFilters };

    if (checked) {
      // Add filter
      if (!newFilters[attrKey]) {
        newFilters[attrKey] = [];
      }
      newFilters[attrKey].push(value);
    } else {
      // Remove filter
      if (newFilters[attrKey]) {
        newFilters[attrKey] = newFilters[attrKey].filter(v => v !== value);
        if (newFilters[attrKey].length === 0) {
          delete newFilters[attrKey];
        }
      }
    }

    setSelectedFilters(newFilters);
    updateURL(newFilters);
  };

  const updateURL = (filters: Record<string, string[]>) => {
    const params = new URLSearchParams(searchParams.toString());

    // Remove old attribute params
    Object.keys(attributes).forEach(key => {
      params.delete(key);
    });

    // Add new filters
    Object.entries(filters).forEach(([key, values]) => {
      if (values.length > 0) {
        params.set(key, values.join(','));
      }
    });

    router.push(`?${params.toString()}`);
  };

  const resetFilters = () => {
    setSelectedFilters({});
    const params = new URLSearchParams(searchParams.toString());

    // Keep category and search query
    Object.keys(attributes).forEach(key => {
      params.delete(key);
    });

    router.push(`?${params.toString()}`);
  };

  const getAttributeLabel = (attrKey: string, attrData: AttributeData): string => {
    // Try translation first
    try {
      return t(attrKey);
    } catch {
      return attrData.display_name_de || attrData.display_name;
    }
  };

  const getValueLabel = (attrKey: string, value: string): string => {
    // Try translation first
    try {
      return t(`values.${value}`);
    } catch {
      return value;
    }
  };

  const totalActiveFilters = Object.values(selectedFilters).reduce(
    (sum, values) => sum + values.length,
    0
  );

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center gap-2 text-text-secondary">
          <Filter className="w-4 h-4 animate-pulse" />
          <span className="text-sm">Lade Filter...</span>
        </div>
      </div>
    );
  }

  if (Object.keys(attributes).length === 0) {
    return null;
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-text-secondary" />
          <h3 className="font-semibold text-text-primary">Filter by Attributes</h3>
          {totalActiveFilters > 0 && (
            <Badge variant="secondary" className="ml-2">
              {totalActiveFilters}
            </Badge>
          )}
        </div>

        {totalActiveFilters > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            className="text-xs"
          >
            <X className="w-3 h-3 mr-1" />
            Reset
          </Button>
        )}
      </div>

      {/* Attribute Filters */}
      <div className="space-y-3">
        {Object.entries(attributes).map(([attrKey, attrData]) => {
          const isExpanded = expandedAttributes.has(attrKey);
          const activeCount = selectedFilters[attrKey]?.length || 0;

          return (
            <div
              key={attrKey}
              className="border border-glass-border rounded-lg bg-glass-bg/50 overflow-hidden"
            >
              {/* Attribute Header */}
              <button
                onClick={() => toggleAttribute(attrKey)}
                className="w-full flex items-center justify-between p-3 hover:bg-glass-bg transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm text-text-primary">
                    {getAttributeLabel(attrKey, attrData)}
                  </span>
                  {activeCount > 0 && (
                    <Badge variant="default" className="text-xs">
                      {activeCount}
                    </Badge>
                  )}
                </div>
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4 text-text-tertiary" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-text-tertiary" />
                )}
              </button>

              {/* Attribute Values */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-3 pb-3 space-y-2 max-h-64 overflow-y-auto">
                      {attrData.values.slice(0, 10).map(val => {
                        const isChecked = selectedFilters[attrKey]?.includes(val.value) || false;

                        return (
                          <label
                            key={val.value}
                            className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${
                              isChecked ? 'bg-primary/10' : 'hover:bg-glass-bg'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => toggleFilter(attrKey, val.value, e.target.checked)}
                              className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <span className="flex-1 text-sm text-text-primary capitalize">
                              {getValueLabel(attrKey, val.value)}
                            </span>
                            <span className="text-xs text-text-tertiary">
                              {val.count}
                            </span>
                          </label>
                        );
                      })}

                      {attrData.values.length > 10 && (
                        <p className="text-xs text-text-tertiary text-center pt-2">
                          +{attrData.values.length - 10} more values
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Active Filters Summary */}
      {totalActiveFilters > 0 && (
        <div className="pt-3 border-t border-glass-border">
          <p className="text-xs text-text-tertiary mb-2">Active Filters:</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(selectedFilters).map(([attrKey, values]) =>
              values.map(value => (
                <Badge
                  key={`${attrKey}-${value}`}
                  variant="secondary"
                  className="text-xs"
                >
                  {getValueLabel(attrKey, value)}
                  <button
                    onClick={() => toggleFilter(attrKey, value, false)}
                    className="ml-1 hover:text-error-soft"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
