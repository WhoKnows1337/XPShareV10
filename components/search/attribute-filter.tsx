'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Sparkles, Plus, X, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface AttributeFilter {
  key: string;
  value: string;
}

interface AttributeKey {
  attribute_key: string;
  value_count: number;
  experience_count: number;
  sample_values: string[];
}

interface AttributeValue {
  attribute_value: string;
  experience_count: number;
  categories: string[];
}

interface AttributeFilterProps {
  filters: AttributeFilter[];
  onChange: (filters: AttributeFilter[]) => void;
  category?: string;
  matchMode?: 'all' | 'any';
  onMatchModeChange?: (mode: 'all' | 'any') => void;
}

export function AttributeFilter({
  filters,
  onChange,
  category,
  matchMode = 'all',
  onMatchModeChange,
}: AttributeFilterProps) {
  const [availableKeys, setAvailableKeys] = useState<AttributeKey[]>([]);
  const [availableValues, setAvailableValues] = useState<Record<string, AttributeValue[]>>({});
  const [loadingKeys, setLoadingKeys] = useState(true);
  const [loadingValues, setLoadingValues] = useState<Record<string, boolean>>({});
  const [selectedKey, setSelectedKey] = useState<string>('');
  const [selectedValue, setSelectedValue] = useState<string>('');

  // Fetch available attribute keys on mount or category change
  useEffect(() => {
    fetchAvailableKeys();
  }, [category]);

  // Fetch values when a key is selected
  useEffect(() => {
    if (selectedKey && !availableValues[selectedKey]) {
      fetchValuesForKey(selectedKey);
    }
  }, [selectedKey]);

  const fetchAvailableKeys = async () => {
    try {
      setLoadingKeys(true);
      const params = new URLSearchParams();
      if (category) params.set('category', category);

      const response = await fetch(`/api/attributes/keys?${params}`);
      const data = await response.json();

      setAvailableKeys(data.keys || []);
    } catch (error) {
      console.error('Error fetching attribute keys:', error);
    } finally {
      setLoadingKeys(false);
    }
  };

  const fetchValuesForKey = async (key: string) => {
    try {
      setLoadingValues((prev) => ({ ...prev, [key]: true }));
      const params = new URLSearchParams({ key });
      if (category) params.set('category', category);

      const response = await fetch(`/api/attributes/values?${params}`);
      const data = await response.json();

      setAvailableValues((prev) => ({
        ...prev,
        [key]: data.values || [],
      }));
    } catch (error) {
      console.error(`Error fetching values for key ${key}:`, error);
    } finally {
      setLoadingValues((prev) => ({ ...prev, [key]: false }));
    }
  };

  const handleAddFilter = () => {
    if (!selectedKey || !selectedValue) return;

    // Check if filter already exists
    const exists = filters.some(
      (f) => f.key === selectedKey && f.value === selectedValue
    );

    if (!exists) {
      onChange([...filters, { key: selectedKey, value: selectedValue }]);
    }

    // Reset selection
    setSelectedKey('');
    setSelectedValue('');
  };

  const handleRemoveFilter = (index: number) => {
    onChange(filters.filter((_, i) => i !== index));
  };

  const getKeyLabel = (key: string): string => {
    // Convert snake_case to readable label
    return key
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (loadingKeys) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            Attributfilter
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (availableKeys.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            Attributfilter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-muted-foreground">
            <Filter className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Keine Attribute verfügbar</p>
            <p className="text-xs mt-1">
              Attribute werden automatisch aus neuen Erfahrungen extrahiert
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          Attributfilter
        </CardTitle>
        <CardDescription className="text-xs">
          Finde Erfahrungen anhand extrahierter Merkmale
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Match Mode Toggle */}
        {onMatchModeChange && filters.length > 1 && (
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <Label className="text-xs">Matching-Modus:</Label>
            <div className="flex gap-2">
              <Button
                variant={matchMode === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onMatchModeChange('all')}
              >
                Alle (AND)
              </Button>
              <Button
                variant={matchMode === 'any' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onMatchModeChange('any')}
              >
                Beliebig (OR)
              </Button>
            </div>
          </div>
        )}

        {/* Add New Filter */}
        <div className="space-y-3">
          <Label className="text-xs font-semibold">Neuer Filter</Label>

          {/* Key Selection */}
          <div>
            <Label htmlFor="attribute-key" className="text-xs mb-1">
              Attribut
            </Label>
            <Select value={selectedKey} onValueChange={setSelectedKey}>
              <SelectTrigger id="attribute-key">
                <SelectValue placeholder="Wähle ein Attribut..." />
              </SelectTrigger>
              <SelectContent>
                {availableKeys.map((key) => (
                  <SelectItem key={key.attribute_key} value={key.attribute_key}>
                    <div className="flex items-center justify-between gap-2">
                      <span>{getKeyLabel(key.attribute_key)}</span>
                      <Badge variant="outline" className="text-xs">
                        {key.experience_count}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Value Selection */}
          {selectedKey && (
            <div>
              <Label htmlFor="attribute-value" className="text-xs mb-1">
                Wert
              </Label>
              {loadingValues[selectedKey] ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <Select value={selectedValue} onValueChange={setSelectedValue}>
                  <SelectTrigger id="attribute-value">
                    <SelectValue placeholder="Wähle einen Wert..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableValues[selectedKey]?.map((val) => (
                      <SelectItem key={val.attribute_value} value={val.attribute_value}>
                        <div className="flex items-center justify-between gap-2">
                          <span className="capitalize">{val.attribute_value}</span>
                          <Badge variant="secondary" className="text-xs">
                            {val.experience_count}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          )}

          {/* Add Button */}
          <Button
            onClick={handleAddFilter}
            disabled={!selectedKey || !selectedValue}
            className="w-full"
            size="sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Filter hinzufügen
          </Button>
        </div>

        {/* Active Filters */}
        {filters.length > 0 && (
          <>
            <Separator />
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Aktive Filter</Label>
              <AnimatePresence mode="popLayout">
                {filters.map((filter, index) => (
                  <motion.div
                    key={`${filter.key}-${filter.value}-${index}`}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex items-center justify-between p-2 bg-primary/5 border border-primary/20 rounded-lg"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-primary truncate">
                        {getKeyLabel(filter.key)}
                      </p>
                      <p className="text-xs text-muted-foreground capitalize truncate">
                        {filter.value}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveFilter(index)}
                      className="h-6 w-6 p-0"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onChange([])}
              className="w-full"
            >
              Alle Filter löschen
            </Button>
          </>
        )}

        {/* Info */}
        {availableKeys.length > 0 && filters.length === 0 && (
          <div className="text-xs text-muted-foreground p-3 bg-muted/30 rounded-lg">
            💡 <strong>Tipp:</strong> Kombiniere mehrere Attribute, um präzise Ergebnisse zu erhalten (z.B. "Objekt Form: Dreieck" + "Objekt Farbe: Orange")
          </div>
        )}
      </CardContent>
    </Card>
  );
}
