'use client'

import { useState, useEffect } from 'react'
import { DateRange } from 'react-day-picker'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'
import { DateRangePicker } from '@/components/ui/date-range-picker'
import { LocationPicker } from '@/components/ui/location-picker'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import {
  SlidersHorizontal,
  X,
  Calendar,
  Users,
  Image,
  MapPin,
  Clock,
  Star,
  Save,
  Trash2
} from 'lucide-react'

export interface AdvancedFilters {
  dateRange?: {
    from?: Date
    to?: Date
  }
  witnessCount?: {
    min: number
    max: number
  }
  mediaTypes: {
    hasPhotos: boolean
    hasAudio: boolean
    hasSketches: boolean
  }
  location?: {
    lat: number
    lng: number
    name: string
  }
  duration?: {
    min: number // in minutes
    max: number
  }
  credibilityScore?: {
    min: number
    max: number
  }
}

interface FilterPreset {
  name: string
  filters: AdvancedFilters
}

interface AdvancedFiltersPanelProps {
  filters: AdvancedFilters
  onFiltersChange: (filters: AdvancedFilters) => void
  onClose?: () => void
}

const DEFAULT_FILTERS: AdvancedFilters = {
  witnessCount: { min: 0, max: 50 },
  mediaTypes: {
    hasPhotos: false,
    hasAudio: false,
    hasSketches: false,
  },
  duration: { min: 0, max: 480 }, // 0-8 hours
  credibilityScore: { min: 0, max: 10 },
}

export function AdvancedFiltersPanel({ filters, onFiltersChange, onClose }: AdvancedFiltersPanelProps) {
  const [localFilters, setLocalFilters] = useState<AdvancedFilters>(filters)
  const [presets, setPresets] = useState<FilterPreset[]>([])
  const [isOpen, setIsOpen] = useState(false)

  // Load saved presets from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('filterPresets')
    if (saved) {
      try {
        setPresets(JSON.parse(saved))
      } catch (e) {
        console.error('Failed to load filter presets:', e)
      }
    }
  }, [])

  // Sync local filters with props
  useEffect(() => {
    setLocalFilters(filters)
  }, [filters])

  const handleApply = () => {
    onFiltersChange(localFilters)
    setIsOpen(false)
    onClose?.()
  }

  const handleClear = () => {
    const cleared = { ...DEFAULT_FILTERS }
    setLocalFilters(cleared)
    onFiltersChange(cleared)
  }

  const handleSavePreset = () => {
    const name = prompt('Enter a name for this filter preset:')
    if (!name) return

    const newPreset: FilterPreset = {
      name,
      filters: localFilters,
    }

    const updated = [...presets, newPreset]
    setPresets(updated)
    localStorage.setItem('filterPresets', JSON.stringify(updated))
  }

  const handleLoadPreset = (preset: FilterPreset) => {
    setLocalFilters(preset.filters)
    onFiltersChange(preset.filters)
  }

  const handleDeletePreset = (index: number) => {
    const updated = presets.filter((_, i) => i !== index)
    setPresets(updated)
    localStorage.setItem('filterPresets', JSON.stringify(updated))
  }

  const getActiveFilterCount = () => {
    let count = 0
    if (localFilters.dateRange?.from || localFilters.dateRange?.to) count++
    if (localFilters.witnessCount && (localFilters.witnessCount.min > 0 || localFilters.witnessCount.max < 50)) count++
    if (localFilters.mediaTypes.hasPhotos || localFilters.mediaTypes.hasAudio || localFilters.mediaTypes.hasSketches) count++
    if (localFilters.location) count++
    if (localFilters.duration && (localFilters.duration.min > 0 || localFilters.duration.max < 480)) count++
    if (localFilters.credibilityScore && (localFilters.credibilityScore.min > 0 || localFilters.credibilityScore.max < 10)) count++
    return count
  }

  const activeCount = getActiveFilterCount()

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="relative">
          <SlidersHorizontal className="w-4 h-4 mr-2" />
          Advanced Filters
          {activeCount > 0 && (
            <Badge variant="default" className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
              {activeCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Advanced Filters</SheetTitle>
          <SheetDescription>
            Refine your search with detailed filters
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          <Accordion type="multiple" defaultValue={['date', 'witnesses', 'media']} className="w-full">
            {/* Date Range */}
            <AccordionItem value="date">
              <AccordionTrigger className="text-sm font-medium">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Date Range
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 pt-2">
                  <Label className="text-xs text-muted-foreground">
                    Filter experiences by occurrence date
                  </Label>
                  <DateRangePicker
                    from={localFilters.dateRange?.from}
                    to={localFilters.dateRange?.to}
                    onSelect={(range) => {
                      setLocalFilters({
                        ...localFilters,
                        dateRange: range ? { from: range.from, to: range.to } : undefined,
                      })
                    }}
                  />
                  {localFilters.dateRange && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setLocalFilters({ ...localFilters, dateRange: undefined })}
                      className="text-xs"
                    >
                      <X className="w-3 h-3 mr-1" />
                      Clear dates
                    </Button>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Witness Count */}
            <AccordionItem value="witnesses">
              <AccordionTrigger className="text-sm font-medium">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Witness Count
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 pt-2">
                  <Label className="text-xs text-muted-foreground">
                    Min: {localFilters.witnessCount?.min || 0} - Max: {localFilters.witnessCount?.max || 50}
                  </Label>
                  <Slider
                    min={0}
                    max={50}
                    step={1}
                    value={[localFilters.witnessCount?.min || 0, localFilters.witnessCount?.max || 50]}
                    onValueChange={([min, max]) => {
                      setLocalFilters({
                        ...localFilters,
                        witnessCount: { min, max },
                      })
                    }}
                    className="mt-2"
                  />
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Media Types */}
            <AccordionItem value="media">
              <AccordionTrigger className="text-sm font-medium">
                <div className="flex items-center gap-2">
                  <Image className="w-4 h-4" />
                  Media Types
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3 pt-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="hasPhotos"
                      checked={localFilters.mediaTypes.hasPhotos}
                      onCheckedChange={(checked) => {
                        setLocalFilters({
                          ...localFilters,
                          mediaTypes: { ...localFilters.mediaTypes, hasPhotos: checked as boolean },
                        })
                      }}
                    />
                    <Label htmlFor="hasPhotos" className="text-sm cursor-pointer">
                      Has Photos
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="hasAudio"
                      checked={localFilters.mediaTypes.hasAudio}
                      onCheckedChange={(checked) => {
                        setLocalFilters({
                          ...localFilters,
                          mediaTypes: { ...localFilters.mediaTypes, hasAudio: checked as boolean },
                        })
                      }}
                    />
                    <Label htmlFor="hasAudio" className="text-sm cursor-pointer">
                      Has Audio
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="hasSketches"
                      checked={localFilters.mediaTypes.hasSketches}
                      onCheckedChange={(checked) => {
                        setLocalFilters({
                          ...localFilters,
                          mediaTypes: { ...localFilters.mediaTypes, hasSketches: checked as boolean },
                        })
                      }}
                    />
                    <Label htmlFor="hasSketches" className="text-sm cursor-pointer">
                      Has Sketches
                    </Label>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Location */}
            <AccordionItem value="location">
              <AccordionTrigger className="text-sm font-medium">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Location
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 pt-2">
                  <Label className="text-xs text-muted-foreground">
                    Filter by geographical location
                  </Label>
                  <LocationPicker
                    value={localFilters.location}
                    onChange={(location) => {
                      setLocalFilters({ ...localFilters, location })
                    }}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Duration */}
            <AccordionItem value="duration">
              <AccordionTrigger className="text-sm font-medium">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Duration
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 pt-2">
                  <Label className="text-xs text-muted-foreground">
                    {localFilters.duration?.min || 0} min - {localFilters.duration?.max || 480} min
                    ({Math.floor((localFilters.duration?.max || 480) / 60)}h)
                  </Label>
                  <Slider
                    min={0}
                    max={480}
                    step={5}
                    value={[localFilters.duration?.min || 0, localFilters.duration?.max || 480]}
                    onValueChange={([min, max]) => {
                      setLocalFilters({
                        ...localFilters,
                        duration: { min, max },
                      })
                    }}
                    className="mt-2"
                  />
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Credibility Score */}
            <AccordionItem value="credibility">
              <AccordionTrigger className="text-sm font-medium">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  Credibility Score
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 pt-2">
                  <Label className="text-xs text-muted-foreground">
                    Min: {localFilters.credibilityScore?.min || 0} - Max: {localFilters.credibilityScore?.max || 10}
                  </Label>
                  <Slider
                    min={0}
                    max={10}
                    step={1}
                    value={[localFilters.credibilityScore?.min || 0, localFilters.credibilityScore?.max || 10]}
                    onValueChange={([min, max]) => {
                      setLocalFilters({
                        ...localFilters,
                        credibilityScore: { min, max },
                      })
                    }}
                    className="mt-2"
                  />
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <Separator />

          {/* Filter Presets */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Filter Presets</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSavePreset}
                disabled={activeCount === 0}
              >
                <Save className="w-3 h-3 mr-1" />
                Save Current
              </Button>
            </div>

            {presets.length > 0 ? (
              <div className="space-y-2">
                {presets.map((preset, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 border rounded hover:bg-accent"
                  >
                    <button
                      onClick={() => handleLoadPreset(preset)}
                      className="flex-1 text-left text-sm"
                    >
                      {preset.name}
                    </button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeletePreset(index)}
                      className="h-6 w-6"
                    >
                      <Trash2 className="w-3 h-3 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                No saved presets. Save your current filters to create one.
              </p>
            )}
          </div>
        </div>

        <SheetFooter className="mt-6">
          <div className="flex gap-2 w-full">
            <Button variant="outline" onClick={handleClear} className="flex-1">
              Clear All
            </Button>
            <Button onClick={handleApply} className="flex-1">
              Apply Filters
              {activeCount > 0 && ` (${activeCount})`}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
