'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { ChevronDown, ChevronUp, Sliders, X, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { DateRangeSlider } from './date-range-slider'

interface CollapsibleFiltersProps {
  filters: {
    category?: string
    tags?: string
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
  const [isOpen, setIsOpen] = useState(false)
  const [filterCounts, setFilterCounts] = useState<any>(null)
  const [isLoadingCounts, setIsLoadingCounts] = useState(false)

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
      category: '',
      tags: '',
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
            <span>Filters</span>
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
                {/* Category Filter with Counts */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="category-filter">Category</Label>
                    {isLoadingCounts && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
                  </div>
                  <Select
                    value={filters.category || 'all'}
                    onValueChange={(value) =>
                      handleFilterChange('category', value === 'all' ? '' : value)
                    }
                  >
                    <SelectTrigger id="category-filter">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="ufo">
                        🛸 UFO Sighting {filterCounts?.categories?.ufo && `(${filterCounts.categories.ufo})`}
                      </SelectItem>
                      <SelectItem value="paranormal">
                        👻 Paranormal {filterCounts?.categories?.paranormal && `(${filterCounts.categories.paranormal})`}
                      </SelectItem>
                      <SelectItem value="dreams">
                        💭 Dream Experience {filterCounts?.categories?.dreams && `(${filterCounts.categories.dreams})`}
                      </SelectItem>
                      <SelectItem value="psychedelic">
                        🍄 Psychedelic {filterCounts?.categories?.psychedelic && `(${filterCounts.categories.psychedelic})`}
                      </SelectItem>
                      <SelectItem value="spiritual">
                        🙏 Spiritual {filterCounts?.categories?.spiritual && `(${filterCounts.categories.spiritual})`}
                      </SelectItem>
                      <SelectItem value="synchronicity">
                        ✨ Synchronicity {filterCounts?.categories?.synchronicity && `(${filterCounts.categories.synchronicity})`}
                      </SelectItem>
                      <SelectItem value="nde">
                        💫 Near-Death Experience {filterCounts?.categories?.nde && `(${filterCounts.categories.nde})`}
                      </SelectItem>
                      <SelectItem value="other">
                        🔮 Other Experience {filterCounts?.categories?.other && `(${filterCounts.categories.other})`}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Location Filter */}
                <div className="space-y-2">
                  <Label htmlFor="location-filter">Location</Label>
                  <Input
                    id="location-filter"
                    type="text"
                    placeholder="e.g., 'Berlin', 'California', 'desert'"
                    value={filters.location || ''}
                    onChange={(e) => handleFilterChange('location', e.target.value)}
                  />
                </div>

                {/* Tags Filter */}
                <div className="space-y-2">
                  <Label htmlFor="tags-filter">Tags (comma-separated)</Label>
                  <Input
                    id="tags-filter"
                    type="text"
                    placeholder="e.g., 'night, glowing, orb'"
                    value={filters.tags || ''}
                    onChange={(e) => handleFilterChange('tags', e.target.value)}
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
                      Only with witnesses
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Show experiences that had witnesses present
                    </p>
                  </div>
                  <Button
                    id="witnesses-only"
                    type="button"
                    variant={filters.witnessesOnly ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleFilterChange('witnessesOnly', !filters.witnessesOnly)}
                  >
                    {filters.witnessesOnly ? 'On' : 'Off'}
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
                      Clear All Filters
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
