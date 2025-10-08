'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Search, Save, Trash, X } from 'lucide-react'
import { MultiSelect } from '@/components/ui/multi-select'
import { DateRangePicker } from '@/components/ui/date-range-picker'
import { LocationPicker } from '@/components/ui/location-picker'
import { TagInput } from '@/components/ui/tag-input'

interface SearchFilters {
  keywords: string
  categories: string[]
  location?: { lat: number; lng: number; name: string }
  radius: number
  dateFrom?: Date
  dateTo?: Date
  tags: string[]
  externalEvents: {
    solarStorms: boolean
    fullMoon: boolean
    earthquakes: boolean
  }
  verification: 'all' | 'verified' | 'unverified'
  minSimilar: number
}

interface SavedSearch {
  id: string
  name: string
  filters: SearchFilters
  createdAt: Date
}

const categories = [
  { value: 'ufo', label: '🛸 UFO' },
  { value: 'paranormal', label: '👻 Paranormal' },
  { value: 'dreams', label: '💭 Dreams' },
  { value: 'psychedelic', label: '🌈 Psychedelic' },
  { value: 'spiritual', label: '✨ Spiritual' },
  { value: 'synchronicity', label: '🔮 Synchronicity' },
  { value: 'nde', label: '💫 NDE' },
  { value: 'obe', label: '🌌 OBE' },
  { value: 'other', label: '❓ Other' },
]

const popularTags = [
  'nachts', 'leuchtend', 'schnell', 'lautlos', 'dreieck',
  'orange', 'mehrere-zeugen', 'bodensee', 'solar-storm'
]

interface AdvancedSearchBuilderProps {
  onSearch: (filters: SearchFilters) => void
  resultCount?: number
}

export function AdvancedSearchBuilder({ onSearch, resultCount = 0 }: AdvancedSearchBuilderProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    keywords: '',
    categories: [],
    radius: 50,
    tags: [],
    externalEvents: {
      solarStorms: false,
      fullMoon: false,
      earthquakes: false,
    },
    verification: 'all',
    minSimilar: 0,
  })

  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([])
  const [saveDialogOpen, setSaveDialogOpen] = useState(false)
  const [searchName, setSearchName] = useState('')

  const handleSearch = () => {
    onSearch(filters)
  }

  const handleSaveSearch = () => {
    if (!searchName.trim()) return

    const newSearch: SavedSearch = {
      id: crypto.randomUUID(),
      name: searchName,
      filters: { ...filters },
      createdAt: new Date(),
    }

    setSavedSearches([...savedSearches, newSearch])
    setSearchName('')
    setSaveDialogOpen(false)
  }

  const loadSearch = (saved: SavedSearch) => {
    setFilters(saved.filters)
    onSearch(saved.filters)
  }

  const deleteSearch = (id: string) => {
    setSavedSearches(savedSearches.filter(s => s.id !== id))
  }

  const resetFilters = () => {
    setFilters({
      keywords: '',
      categories: [],
      radius: 50,
      tags: [],
      externalEvents: {
        solarStorms: false,
        fullMoon: false,
        earthquakes: false,
      },
      verification: 'all',
      minSimilar: 0,
    })
  }

  const addBooleanOperator = (operator: string) => {
    setFilters({
      ...filters,
      keywords: filters.keywords + ` ${operator} `,
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Advanced Search</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Text Search */}
        <div>
          <Label htmlFor="keywords">Keywords</Label>
          <Input
            id="keywords"
            placeholder="Search in title, content, tags..."
            value={filters.keywords}
            onChange={(e) => setFilters({ ...filters, keywords: e.target.value })}
          />
        </div>

        {/* Boolean Operators */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => addBooleanOperator('AND')}
          >
            AND
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => addBooleanOperator('OR')}
          >
            OR
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => addBooleanOperator('NOT')}
          >
            NOT
          </Button>
        </div>

        {/* Category Multi-Select */}
        <div>
          <Label>Categories</Label>
          <MultiSelect
            options={categories}
            value={filters.categories}
            onChange={(value) => setFilters({ ...filters, categories: value })}
            placeholder="Select categories..."
          />
        </div>

        {/* Location Radius */}
        <div>
          <Label>Location (Radius: {filters.radius}km)</Label>
          <LocationPicker
            value={filters.location}
            onChange={(location) => setFilters({ ...filters, location })}
          />
          <Slider
            value={[filters.radius]}
            onValueChange={([val]) => setFilters({ ...filters, radius: val })}
            min={10}
            max={500}
            step={10}
            className="mt-2"
          />
        </div>

        {/* Date Range */}
        <div>
          <Label>Date Range</Label>
          <DateRangePicker
            from={filters.dateFrom}
            to={filters.dateTo}
            onSelect={(range) => {
              setFilters({
                ...filters,
                dateFrom: range?.from,
                dateTo: range?.to,
              })
            }}
          />
        </div>

        {/* Tags */}
        <div>
          <Label>Tags</Label>
          <TagInput
            value={filters.tags}
            onChange={(tags) => setFilters({ ...filters, tags })}
            suggestions={popularTags}
          />
        </div>

        {/* External Events */}
        <div>
          <Label>External Events</Label>
          <div className="space-y-2 mt-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="solar"
                checked={filters.externalEvents.solarStorms}
                onCheckedChange={(checked) =>
                  setFilters({
                    ...filters,
                    externalEvents: {
                      ...filters.externalEvents,
                      solarStorms: checked as boolean,
                    },
                  })
                }
              />
              <Label htmlFor="solar" className="font-normal cursor-pointer">
                Solar Storms
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="moon"
                checked={filters.externalEvents.fullMoon}
                onCheckedChange={(checked) =>
                  setFilters({
                    ...filters,
                    externalEvents: {
                      ...filters.externalEvents,
                      fullMoon: checked as boolean,
                    },
                  })
                }
              />
              <Label htmlFor="moon" className="font-normal cursor-pointer">
                Full/New Moon
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="earthquake"
                checked={filters.externalEvents.earthquakes}
                onCheckedChange={(checked) =>
                  setFilters({
                    ...filters,
                    externalEvents: {
                      ...filters.externalEvents,
                      earthquakes: checked as boolean,
                    },
                  })
                }
              />
              <Label htmlFor="earthquake" className="font-normal cursor-pointer">
                Earthquakes
              </Label>
            </div>
          </div>
        </div>

        {/* Verification Status */}
        <div>
          <Label>Verification</Label>
          <RadioGroup
            value={filters.verification}
            onValueChange={(value: any) => setFilters({ ...filters, verification: value })}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="all" id="all" />
              <Label htmlFor="all" className="font-normal cursor-pointer">
                All
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="verified" id="verified" />
              <Label htmlFor="verified" className="font-normal cursor-pointer">
                Verified Only
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="unverified" id="unverified" />
              <Label htmlFor="unverified" className="font-normal cursor-pointer">
                Unverified Only
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Similarity Threshold */}
        <div>
          <Label>Min. Similar Experiences</Label>
          <div className="flex items-center gap-3">
            <Slider
              value={[filters.minSimilar]}
              onValueChange={([val]) => setFilters({ ...filters, minSimilar: val })}
              min={0}
              max={50}
              className="flex-1"
            />
            <span className="text-sm text-muted-foreground w-8">{filters.minSimilar}</span>
          </div>
        </div>

        <Separator />

        {/* Actions */}
        <div className="flex gap-2">
          <Button onClick={handleSearch} className="flex-1">
            <Search className="w-4 h-4 mr-2" />
            Search ({resultCount})
          </Button>
          <Button
            variant="outline"
            onClick={() => setSaveDialogOpen(!saveDialogOpen)}
          >
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
          <Button variant="ghost" onClick={resetFilters}>
            <X className="w-4 h-4 mr-2" />
            Reset
          </Button>
        </div>

        {/* Save Dialog */}
        {saveDialogOpen && (
          <div className="space-y-2 p-3 border rounded-lg bg-muted/50">
            <Label htmlFor="search-name">Save Search As</Label>
            <div className="flex gap-2">
              <Input
                id="search-name"
                placeholder="e.g., UFO Bodensee März"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
              />
              <Button onClick={handleSaveSearch}>Save</Button>
              <Button variant="ghost" onClick={() => setSaveDialogOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Saved Searches */}
        {savedSearches.length > 0 && (
          <>
            <Separator />
            <div>
              <Label>Saved Searches</Label>
              <div className="space-y-2 mt-2">
                {savedSearches.map((saved) => (
                  <div
                    key={saved.id}
                    className="flex items-center justify-between p-2 border rounded hover:bg-accent"
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => loadSearch(saved)}
                      className="flex-1 justify-start"
                    >
                      <div className="flex flex-col items-start">
                        <span className="font-medium">{saved.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {saved.filters.categories.length} categories, {saved.filters.tags.length} tags
                        </span>
                      </div>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteSearch(saved.id)}
                    >
                      <Trash className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Active Filters */}
        {(filters.categories.length > 0 || filters.tags.length > 0) && (
          <>
            <Separator />
            <div>
              <Label>Active Filters</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {filters.categories.map((cat) => (
                  <Badge key={cat} variant="secondary">
                    {categories.find((c) => c.value === cat)?.label}
                    <button
                      onClick={() =>
                        setFilters({
                          ...filters,
                          categories: filters.categories.filter((c) => c !== cat),
                        })
                      }
                      className="ml-1"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
                {filters.tags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    #{tag}
                    <button
                      onClick={() =>
                        setFilters({
                          ...filters,
                          tags: filters.tags.filter((t) => t !== tag),
                        })
                      }
                      className="ml-1"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
