'use client'

/**
 * Search 5.0 - Query Refinement Panel
 *
 * Allows users to refine search results with:
 * - Confidence threshold slider
 * - Date range picker
 * - Category multi-select
 * - Max sources slider
 * - Apply/Reset controls
 *
 * @see docs/masterdocs/search5.md (Part 4.1 - Query Refinement)
 */

import React, { useState, useEffect } from 'react'
import { SlidersHorizontal, Calendar, Filter, RotateCcw, Check } from 'lucide-react'
import { QueryRefinements } from '@/types/search5'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

// ============================================================================
// TYPES
// ============================================================================

interface QueryRefinementPanelProps {
  /**
   * Current refinement state
   */
  refinements: QueryRefinements

  /**
   * Callback when refinements change
   */
  onRefinementsChange: (refinements: QueryRefinements) => void

  /**
   * Callback when user applies refinements
   */
  onApply: () => void

  /**
   * Available categories
   */
  categories?: string[]

  /**
   * Compact mode (icon-only trigger)
   */
  compact?: boolean

  /**
   * Additional className
   */
  className?: string
}

// ============================================================================
// CONSTANTS
// ============================================================================

const DEFAULT_CATEGORIES = [
  'ufo',
  'nde',
  'oobe',
  'psychedelics',
  'lucid-dream',
  'meditation',
  'paranormal',
  'synchronicity',
  'healing',
  'other'
]

const CATEGORY_LABELS: Record<string, string> = {
  'ufo': 'UFO/UAP',
  'nde': 'Nahtoderfahrung',
  'oobe': 'Außerkörperlich',
  'psychedelics': 'Psychedelika',
  'lucid-dream': 'Luzider Traum',
  'meditation': 'Meditation',
  'paranormal': 'Paranormal',
  'synchronicity': 'Synchronizität',
  'healing': 'Heilung',
  'other': 'Sonstige'
}

// ============================================================================
// COMPONENT
// ============================================================================

export function QueryRefinementPanel({
  refinements,
  onRefinementsChange,
  onApply,
  categories = DEFAULT_CATEGORIES,
  compact = false,
  className
}: QueryRefinementPanelProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [localRefinements, setLocalRefinements] = useState<QueryRefinements>(refinements)
  const [hasChanges, setHasChanges] = useState(false)

  // Sync local state with props
  useEffect(() => {
    setLocalRefinements(refinements)
  }, [refinements])

  // Track changes
  useEffect(() => {
    const changed = JSON.stringify(localRefinements) !== JSON.stringify(refinements)
    setHasChanges(changed)
  }, [localRefinements, refinements])

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleConfidenceChange = (value: number[]) => {
    setLocalRefinements(prev => ({
      ...prev,
      confidenceThreshold: value[0]
    }))
  }

  const handleMaxSourcesChange = (value: number[]) => {
    setLocalRefinements(prev => ({
      ...prev,
      maxSources: value[0]
    }))
  }

  const handleDateFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const from = e.target.value
    setLocalRefinements(prev => ({
      ...prev,
      dateRange: {
        from,
        to: prev.dateRange?.to || ''
      }
    }))
  }

  const handleDateToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const to = e.target.value
    setLocalRefinements(prev => ({
      ...prev,
      dateRange: {
        from: prev.dateRange?.from || '',
        to
      }
    }))
  }

  const toggleCategory = (category: string) => {
    setLocalRefinements(prev => {
      const currentCategories = prev.categories || []
      const newCategories = currentCategories.includes(category)
        ? currentCategories.filter(c => c !== category)
        : [...currentCategories, category]

      return {
        ...prev,
        categories: newCategories.length > 0 ? newCategories : undefined
      }
    })
  }

  const handleApply = () => {
    onRefinementsChange(localRefinements)
    onApply()
    setIsOpen(false)
  }

  const handleReset = () => {
    const defaultRefinements: QueryRefinements = {
      confidenceThreshold: 0,
      maxSources: 15,
      dateRange: undefined,
      categories: undefined
    }
    setLocalRefinements(defaultRefinements)
    onRefinementsChange(defaultRefinements)
    onApply()
  }

  // ============================================================================
  // ACTIVE FILTERS COUNT
  // ============================================================================

  const activeFiltersCount = [
    localRefinements.confidenceThreshold && localRefinements.confidenceThreshold > 0,
    localRefinements.maxSources && localRefinements.maxSources !== 15,
    localRefinements.dateRange?.from || localRefinements.dateRange?.to,
    localRefinements.categories && localRefinements.categories.length > 0
  ].filter(Boolean).length

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={activeFiltersCount > 0 ? 'default' : 'outline'}
          size={compact ? 'icon' : 'default'}
          className={cn('relative', className)}
        >
          <SlidersHorizontal className={cn('h-4 w-4', !compact && 'mr-2')} />
          {!compact && <span>Filter</span>}

          {/* Active Filters Badge */}
          {activeFiltersCount > 0 && (
            <Badge
              variant="secondary"
              className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[400px] p-6" align="end">
        {/* Header */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold">Suchergebnisse verfeinern</h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="h-8 text-xs"
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              Zurücksetzen
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Passe die Filter an, um präzisere Muster zu finden
          </p>
        </div>

        <Separator className="my-4" />

        <div className="space-y-6">
          {/* Confidence Threshold */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">
                Konfidenz-Schwelle
              </Label>
              <span className="text-sm font-mono text-muted-foreground">
                {localRefinements.confidenceThreshold || 0}%
              </span>
            </div>
            <Slider
              value={[localRefinements.confidenceThreshold || 0]}
              onValueChange={handleConfidenceChange}
              min={0}
              max={100}
              step={5}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Nur Patterns mit Konfidenz ≥ {localRefinements.confidenceThreshold || 0}% anzeigen
            </p>
          </div>

          <Separator />

          {/* Max Sources */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">
                Max. Quellen
              </Label>
              <span className="text-sm font-mono text-muted-foreground">
                {localRefinements.maxSources || 15}
              </span>
            </div>
            <Slider
              value={[localRefinements.maxSources || 15]}
              onValueChange={handleMaxSourcesChange}
              min={5}
              max={50}
              step={5}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Mehr Quellen = präzisere Patterns, aber langsamere Analyse
            </p>
          </div>

          <Separator />

          {/* Date Range */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <Label className="text-sm font-medium">Zeitraum</Label>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="dateFrom" className="text-xs text-muted-foreground">
                  Von
                </Label>
                <Input
                  id="dateFrom"
                  type="date"
                  value={localRefinements.dateRange?.from || ''}
                  onChange={handleDateFromChange}
                  className="h-9"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateTo" className="text-xs text-muted-foreground">
                  Bis
                </Label>
                <Input
                  id="dateTo"
                  type="date"
                  value={localRefinements.dateRange?.to || ''}
                  onChange={handleDateToChange}
                  className="h-9"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Categories */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <Label className="text-sm font-medium">Kategorien</Label>
            </div>

            <div className="flex flex-wrap gap-2">
              {categories.map(category => {
                const isSelected = localRefinements.categories?.includes(category)
                return (
                  <Badge
                    key={category}
                    variant={isSelected ? 'default' : 'outline'}
                    className={cn(
                      'cursor-pointer transition-all hover:scale-105',
                      isSelected && 'ring-2 ring-primary/50'
                    )}
                    onClick={() => toggleCategory(category)}
                  >
                    {CATEGORY_LABELS[category] || category}
                    {isSelected && <Check className="ml-1 h-3 w-3" />}
                  </Badge>
                )
              })}
            </div>

            {localRefinements.categories && localRefinements.categories.length > 0 && (
              <p className="text-xs text-muted-foreground">
                {localRefinements.categories.length} Kategorie(n) ausgewählt
              </p>
            )}
          </div>
        </div>

        <Separator className="my-4" />

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsOpen(false)}
            className="flex-1"
          >
            Abbrechen
          </Button>
          <Button
            size="sm"
            onClick={handleApply}
            disabled={!hasChanges}
            className="flex-1"
          >
            {hasChanges ? 'Anwenden' : 'Keine Änderungen'}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
