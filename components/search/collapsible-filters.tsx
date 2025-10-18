'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ChevronDown, ChevronUp, Sliders, X, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { DateRangeSlider } from './date-range-slider'
import { MultiSelectFilter, MultiSelectOption } from './multi-select-filter'
import { useTranslations } from 'next-intl'

interface CollapsibleFiltersProps {
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
}

export function CollapsibleFilters({
  filters,
  onFiltersChange,
  appliedFiltersCount = 0,
}: CollapsibleFiltersProps) {
  const t = useTranslations('search.filters')
  const tCategories = useTranslations('categories')
  const [isOpen, setIsOpen] = useState(false)
  const [filterCounts, setFilterCounts] = useState<any>(null)
  const [isLoadingCounts, setIsLoadingCounts] = useState(false)

  // Define category options
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
    const fetchFilterCounts = async () => {
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

    fetchFilterCounts()
  }, [])

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

  return (
    <div className="w-full">
      {/* Toggle Button */}
      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "w-full justify-between transition-all",
            isOpen && "bg-accent",
            hasActiveFilters && "border-primary"
          )}
        >
          <div className="flex items-center gap-2">
            <Sliders className="h-4 w-4" />
            <span>{t('label')}</span>
            {hasActiveFilters && (
              <Badge variant="secondary" className="h-5 px-1.5">
                {appliedFiltersCount}
              </Badge>
            )}
          </div>
          {isOpen ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      </motion.div>

      {/* Collapsible Filter Panel */}
      <AnimatePresence mode="wait">
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <Card>
              <CardContent className="pt-6 space-y-4">
                {/* Category Filter with Multi-Select */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>{t('categories')}</Label>
                    {isLoadingCounts && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
                  </div>
                  <MultiSelectFilter
                    options={categoryOptions}
                    selectedValues={filters.categories || []}
                    onChange={(values) => handleFilterChange('categories', values)}
                    placeholder={t('categoriesPlaceholder')}
                    emptyText={t('categoriesEmpty')}
                  />
                </div>

                {/* Location Filter */}
                <div className="space-y-2">
                  <Label htmlFor="location-filter">{t('location')}</Label>
                  <Input
                    id="location-filter"
                    type="text"
                    placeholder={t('locationPlaceholder')}
                    value={filters.location || ''}
                    onChange={(e) => handleFilterChange('location', e.target.value)}
                  />
                </div>

                {/* Tags Filter with Multi-Select */}
                <div className="space-y-2">
                  <Label>{t('tags')}</Label>
                  <MultiSelectFilter
                    options={[]} // No predefined options for tags
                    selectedValues={filters.tags || []}
                    onChange={(values) => handleFilterChange('tags', values)}
                    placeholder={t('tagsPlaceholder')}
                    emptyText={t('tagsEmpty')}
                    allowCustom={true}
                  />
                </div>

                {/* Date Range Slider - Hybrid UI */}
                <DateRangeSlider
                  dateFrom={filters.dateFrom || ''}
                  dateTo={filters.dateTo || ''}
                  onDateChange={(from, to) => {
                    onFiltersChange({ ...filters, dateFrom: from, dateTo: to })
                  }}
                />

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
                  >
                    {filters.witnessesOnly ? t('on') : t('off')}
                  </Button>
                </div>

                {/* Clear All Button */}
                {hasActiveFilters && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleClearFilters}
                      className="w-full text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-4 w-4 mr-2" />
                      {t('clearAll')}
                    </Button>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
