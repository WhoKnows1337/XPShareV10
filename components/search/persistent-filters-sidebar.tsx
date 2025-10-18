'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Sliders, X, Loader2 } from 'lucide-react'
import { DateRangeSlider } from './date-range-slider'
import { MultiSelectFilter, MultiSelectOption } from './multi-select-filter'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'

interface PersistentFiltersSidebarProps {
  filters: {
    categories?: string[]
    tags?: string[]
    location?: string
    dateFrom?: string
    dateTo?: string
    witnessesOnly?: boolean
  }
  onFiltersChange: (filters: any) => void
  appliedFiltersCount?: number
  className?: string
}

/**
 * Persistent Filters Sidebar - 2025 Best Practice
 *
 * DESKTOP: Always visible sidebar (200px)
 * MOBILE: Bottom sheet trigger + overlay
 *
 * Shows filter counts for better decision making
 */
export function PersistentFiltersSidebar({
  filters,
  onFiltersChange,
  appliedFiltersCount = 0,
  className,
}: PersistentFiltersSidebarProps) {
  const t = useTranslations('search.filters')
  const tCategories = useTranslations('categories')
  const [filterCounts, setFilterCounts] = useState<any>(null)
  const [isLoadingCounts, setIsLoadingCounts] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  // Define category options with counts
  const categoryOptions: MultiSelectOption[] = [
    { value: 'ufo', label: tCategories('ufo-uap'), icon: '🛸', count: filterCounts?.categories?.ufo },
    { value: 'paranormal', label: tCategories('paranormal'), icon: '👻', count: filterCounts?.categories?.paranormal },
    { value: 'dreams', label: tCategories('dreams'), icon: '💭', count: filterCounts?.categories?.dreams },
    { value: 'psychedelic', label: tCategories('psychedelic'), icon: '🍄', count: filterCounts?.categories?.psychedelic },
    { value: 'spiritual', label: tCategories('spiritual'), icon: '🙏', count: filterCounts?.categories?.spiritual },
    { value: 'synchronicity', label: tCategories('synchronicity'), icon: '✨', count: filterCounts?.categories?.synchronicity },
    { value: 'nde', label: tCategories('nde'), icon: '💫', count: filterCounts?.categories?.nde },
    { value: 'other', label: tCategories('other'), icon: '🔮', count: filterCounts?.categories?.other },
  ]

  // Fetch filter counts on mount
  useEffect(() => {
    fetchFilterCounts()
  }, [])

  async function fetchFilterCounts() {
    setIsLoadingCounts(true)
    try {
      const response = await fetch('/api/search/filter-counts')
      if (response.ok) {
        const data = await response.json()
        setFilterCounts(data)
      }
    } catch (error) {
      console.error('Failed to fetch filter counts:', error)
    } finally {
      setIsLoadingCounts(false)
    }
  }

  const handleFilterChange = (key: string, value: any) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const handleClearFilters = () => {
    onFiltersChange({
      categories: [],
      tags: [],
      location: '',
      dateFrom: '',
      dateTo: '',
      witnessesOnly: false,
    })
  }

  const hasActiveFilters = appliedFiltersCount > 0

  // Filter Content Component (reused for desktop + mobile)
  const FilterContent = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Sliders className="h-4 w-4" />
          {t('label')}
        </h3>
        {isLoadingCounts && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
      </div>

      {/* Applied Filters Count */}
      {hasActiveFilters && (
        <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg">
          <span className="text-sm font-medium">
            {appliedFiltersCount} {appliedFiltersCount === 1 ? 'filter' : 'filters'} active
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="h-7 text-xs"
          >
            <X className="h-3 w-3 mr-1" />
            Clear All
          </Button>
        </div>
      )}

      {/* Category Filter with Counts */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">{t('categories')}</Label>
        <MultiSelectFilter
          options={categoryOptions}
          selectedValues={filters.categories || []}
          onChange={(values) => handleFilterChange('categories', values)}
          placeholder={t('categoriesPlaceholder')}
          emptyText={t('categoriesEmpty')}
          showCounts={true}
        />
      </div>

      {/* Location Filter */}
      <div className="space-y-2">
        <Label htmlFor="location-filter" className="text-sm font-medium">
          {t('location')}
        </Label>
        <Input
          id="location-filter"
          type="text"
          placeholder={t('locationPlaceholder')}
          value={filters.location || ''}
          onChange={(e) => handleFilterChange('location', e.target.value)}
          className="h-9"
        />
      </div>

      {/* Tags Filter */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">{t('tags')}</Label>
        <MultiSelectFilter
          options={[]}
          selectedValues={filters.tags || []}
          onChange={(values) => handleFilterChange('tags', values)}
          placeholder={t('tagsPlaceholder')}
          emptyText={t('tagsEmpty')}
          allowCustom={true}
        />
      </div>

      {/* Date Range Slider */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">{t('dateRange')}</Label>
        <DateRangeSlider
          dateFrom={filters.dateFrom || ''}
          dateTo={filters.dateTo || ''}
          onDateChange={(from, to) => {
            onFiltersChange({ ...filters, dateFrom: from, dateTo: to })
          }}
        />
      </div>

      {/* Witnesses Only Filter */}
      <div className="flex items-center justify-between p-3 bg-accent/50 rounded-lg">
        <div className="space-y-0.5">
          <Label htmlFor="witnesses-only" className="text-sm font-medium cursor-pointer">
            {t('witnessesOnly')}
          </Label>
          <p className="text-xs text-muted-foreground">
            {t('witnessesOnlyDescription')}
          </p>
        </div>
        <Button
          id="witnesses-only"
          type="button"
          variant={filters.witnessesOnly ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleFilterChange('witnessesOnly', !filters.witnessesOnly)}
          className="h-8"
        >
          {filters.witnessesOnly ? t('on') : t('off')}
        </Button>
      </div>
    </div>
  )

  return (
    <>
      {/* DESKTOP: Persistent Sidebar */}
      <div className={cn('hidden lg:block', className)}>
        <Card>
          <CardContent className="pt-6">
            <FilterContent />
          </CardContent>
        </Card>
      </div>

      {/* MOBILE: Bottom Sheet Trigger + Overlay */}
      <div className="lg:hidden">
        <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="default"
              className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 shadow-lg"
            >
              <Sliders className="h-4 w-4 mr-2" />
              Filters
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-2 h-5 px-1.5">
                  {appliedFiltersCount}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[85vh] overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <FilterContent />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  )
}
