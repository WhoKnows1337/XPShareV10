'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, Save, Trash, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface SavedSearch {
  id: string
  name: string
  filters: SearchFilters
  createdAt: string
}

interface SearchFilters {
  keywords: string
  booleanOperator: 'AND' | 'OR' | 'NOT'
  categories: string[]
  location?: { lat: number; lng: number; name: string }
  radius: number
  dateFrom?: Date
  dateTo?: Date
  tags: string[]
  externalEvents: {
    solar: boolean
    moon: boolean
    earthquake: boolean
    geomagnetic: boolean
  }
  verification: 'all' | 'verified' | 'unverified'
  minSimilar: number
}

interface AdvancedSearchProps {
  onSearch: (filters: SearchFilters) => void
  resultCount?: number
}

const CATEGORIES = [
  { value: 'ufo', label: '🛸 UFO-Sichtung' },
  { value: 'paranormal', label: '👻 Paranormal' },
  { value: 'dreams', label: '💭 Träume' },
  { value: 'synchronicity', label: '🔮 Synchronizität' },
  { value: 'nde', label: '✨ Nahtoderfahrung' },
  { value: 'obe', label: '🌌 OBE' },
  { value: 'psychedelic', label: '🍄 Psychedelisch' },
  { value: 'other', label: '❓ Andere' },
]

const POPULAR_TAGS = [
  'nachts', 'leuchtend', 'schnell', 'dreieck', 'geräusch',
  'angst', 'euphorie', 'zeitverzerrung', 'telepathie'
]

export function AdvancedSearch({ onSearch, resultCount = 0 }: AdvancedSearchProps) {
  const [keywords, setKeywords] = useState('')
  const [booleanOperator, setBooleanOperator] = useState<'AND' | 'OR' | 'NOT'>('AND')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [location, setLocation] = useState<{ lat: number; lng: number; name: string } | null>(null)
  const [radius, setRadius] = useState(50)
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined)
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined)
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [externalEvents, setExternalEvents] = useState({
    solar: false,
    moon: false,
    earthquake: false,
    geomagnetic: false
  })
  const [verification, setVerification] = useState<'all' | 'verified' | 'unverified'>('all')
  const [minSimilar, setMinSimilar] = useState(0)
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([])
  const [saveSearchName, setSaveSearchName] = useState('')
  const [showSaveDialog, setShowSaveDialog] = useState(false)

  // Load saved searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('advanced_searches')
    if (saved) {
      try {
        setSavedSearches(JSON.parse(saved))
      } catch (error) {
        console.error('Error loading saved searches:', error)
      }
    }
  }, [])

  const getCurrentFilters = (): SearchFilters => ({
    keywords,
    booleanOperator,
    categories: selectedCategories,
    location: location || undefined,
    radius,
    dateFrom,
    dateTo,
    tags,
    externalEvents,
    verification,
    minSimilar
  })

  const executeSearch = () => {
    onSearch(getCurrentFilters())
  }

  const saveSearch = () => {
    if (!saveSearchName.trim()) {
      setShowSaveDialog(true)
      return
    }

    const newSearch: SavedSearch = {
      id: Date.now().toString(),
      name: saveSearchName,
      filters: getCurrentFilters(),
      createdAt: new Date().toISOString()
    }

    const updated = [...savedSearches, newSearch]
    setSavedSearches(updated)
    localStorage.setItem('advanced_searches', JSON.stringify(updated))
    setSaveSearchName('')
    setShowSaveDialog(false)
  }

  const loadSearch = (saved: SavedSearch) => {
    setKeywords(saved.filters.keywords)
    setBooleanOperator(saved.filters.booleanOperator)
    setSelectedCategories(saved.filters.categories)
    setLocation(saved.filters.location || null)
    setRadius(saved.filters.radius)
    setDateFrom(saved.filters.dateFrom)
    setDateTo(saved.filters.dateTo)
    setTags(saved.filters.tags)
    setExternalEvents(saved.filters.externalEvents)
    setVerification(saved.filters.verification)
    setMinSimilar(saved.filters.minSimilar)
  }

  const deleteSearch = (id: string) => {
    const updated = savedSearches.filter(s => s.id !== id)
    setSavedSearches(updated)
    localStorage.setItem('advanced_searches', JSON.stringify(updated))
  }

  const resetFilters = () => {
    setKeywords('')
    setBooleanOperator('AND')
    setSelectedCategories([])
    setLocation(null)
    setRadius(50)
    setDateFrom(undefined)
    setDateTo(undefined)
    setTags([])
    setExternalEvents({
      solar: false,
      moon: false,
      earthquake: false,
      geomagnetic: false
    })
    setVerification('all')
    setMinSimilar(0)
  }

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    )
  }

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput('')
    }
  }

  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="w-5 h-5" />
          Advanced Search
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Text Search */}
        <div className="space-y-2">
          <Label>Keywords</Label>
          <Input
            placeholder="Search in title, content, tags..."
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
          />
        </div>

        {/* Boolean Operators */}
        <div className="space-y-2">
          <Label>Boolean Operator</Label>
          <div className="flex gap-2">
            <Button
              variant={booleanOperator === 'AND' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setBooleanOperator('AND')}
            >
              AND
            </Button>
            <Button
              variant={booleanOperator === 'OR' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setBooleanOperator('OR')}
            >
              OR
            </Button>
            <Button
              variant={booleanOperator === 'NOT' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setBooleanOperator('NOT')}
            >
              NOT
            </Button>
          </div>
        </div>

        {/* Category Multi-Select */}
        <div className="space-y-2">
          <Label>Categories ({selectedCategories.length} selected)</Label>
          <div className="grid grid-cols-2 gap-2">
            {CATEGORIES.map((cat) => (
              <div key={cat.value} className="flex items-center space-x-2">
                <Checkbox
                  id={cat.value}
                  checked={selectedCategories.includes(cat.value)}
                  onCheckedChange={() => toggleCategory(cat.value)}
                />
                <Label htmlFor={cat.value} className="cursor-pointer text-sm">
                  {cat.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Location Radius */}
        <div className="space-y-2">
          <Label>Location (Radius: {radius}km)</Label>
          <Input
            placeholder="Enter location name..."
            value={location?.name || ''}
            onChange={(e) => {
              // Simple text input for now - could be enhanced with geocoding
              if (e.target.value) {
                setLocation({ lat: 0, lng: 0, name: e.target.value })
              } else {
                setLocation(null)
              }
            }}
          />
          <Slider
            value={[radius]}
            onValueChange={([val]) => setRadius(val)}
            min={10}
            max={500}
            step={10}
            className="mt-2"
          />
          <p className="text-xs text-muted-foreground">
            Search within {radius}km radius
          </p>
        </div>

        {/* Date Range */}
        <div className="space-y-2">
          <Label>Date Range</Label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">From</Label>
              <Input
                type="date"
                value={dateFrom?.toISOString().split('T')[0] || ''}
                onChange={(e) => setDateFrom(e.target.value ? new Date(e.target.value) : undefined)}
              />
            </div>
            <div>
              <Label className="text-xs">To</Label>
              <Input
                type="date"
                value={dateTo?.toISOString().split('T')[0] || ''}
                onChange={(e) => setDateTo(e.target.value ? new Date(e.target.value) : undefined)}
              />
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="space-y-2">
          <Label>Tags</Label>
          <div className="flex gap-2">
            <Input
              placeholder="Add tag..."
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addTag()
                }
              }}
            />
            <Button onClick={addTag} size="sm">Add</Button>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  #{tag}
                  <button
                    onClick={() => removeTag(tag)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
          <div className="flex flex-wrap gap-1">
            <p className="text-xs text-muted-foreground w-full">Suggestions:</p>
            {POPULAR_TAGS.map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="cursor-pointer"
                onClick={() => {
                  if (!tags.includes(tag)) {
                    setTags([...tags, tag])
                  }
                }}
              >
                #{tag}
              </Badge>
            ))}
          </div>
        </div>

        {/* External Events */}
        <div className="space-y-2">
          <Label>External Events</Label>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="solar"
                checked={externalEvents.solar}
                onCheckedChange={(checked) =>
                  setExternalEvents({ ...externalEvents, solar: checked as boolean })
                }
              />
              <Label htmlFor="solar" className="cursor-pointer">
                ☀️ Solar Storms
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="moon"
                checked={externalEvents.moon}
                onCheckedChange={(checked) =>
                  setExternalEvents({ ...externalEvents, moon: checked as boolean })
                }
              />
              <Label htmlFor="moon" className="cursor-pointer">
                🌕 Full/New Moon
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="earthquake"
                checked={externalEvents.earthquake}
                onCheckedChange={(checked) =>
                  setExternalEvents({ ...externalEvents, earthquake: checked as boolean })
                }
              />
              <Label htmlFor="earthquake" className="cursor-pointer">
                🌍 Earthquakes
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="geomagnetic"
                checked={externalEvents.geomagnetic}
                onCheckedChange={(checked) =>
                  setExternalEvents({ ...externalEvents, geomagnetic: checked as boolean })
                }
              />
              <Label htmlFor="geomagnetic" className="cursor-pointer">
                🧲 Geomagnetic Activity
              </Label>
            </div>
          </div>
        </div>

        {/* Verification Status */}
        <div className="space-y-2">
          <Label>Verification Status</Label>
          <RadioGroup value={verification} onValueChange={(val) => setVerification(val as any)}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="all" id="all" />
              <Label htmlFor="all" className="cursor-pointer">All</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="verified" id="verified" />
              <Label htmlFor="verified" className="cursor-pointer">Verified Only</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="unverified" id="unverified" />
              <Label htmlFor="unverified" className="cursor-pointer">Unverified Only</Label>
            </div>
          </RadioGroup>
        </div>

        {/* Similarity Threshold */}
        <div className="space-y-2">
          <Label>Min. Similar Experiences</Label>
          <div className="flex items-center gap-3">
            <Slider
              value={[minSimilar]}
              onValueChange={([val]) => setMinSimilar(val)}
              min={0}
              max={50}
              className="flex-1"
            />
            <span className="text-sm text-muted-foreground w-8">{minSimilar}</span>
          </div>
        </div>

        <Separator />

        {/* Actions */}
        <div className="flex gap-2">
          <Button onClick={executeSearch} className="flex-1">
            <Search className="w-4 h-4 mr-2" />
            Search ({resultCount})
          </Button>
          <Button variant="outline" onClick={() => setShowSaveDialog(!showSaveDialog)}>
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
          <Button variant="ghost" onClick={resetFilters}>
            Reset
          </Button>
        </div>

        {/* Save Search Dialog */}
        {showSaveDialog && (
          <div className="space-y-2">
            <Label>Save Search Name</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Enter search name..."
                value={saveSearchName}
                onChange={(e) => setSaveSearchName(e.target.value)}
              />
              <Button onClick={saveSearch}>Save</Button>
              <Button variant="ghost" onClick={() => setShowSaveDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Saved Searches */}
        {savedSearches.length > 0 && (
          <>
            <Separator />
            <div className="space-y-2">
              <Label>Saved Searches ({savedSearches.length})</Label>
              <div className="space-y-2">
                {savedSearches.map((saved) => (
                  <div key={saved.id} className="flex items-center justify-between p-2 border rounded-lg">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => loadSearch(saved)}
                      className="flex-1 justify-start"
                    >
                      {saved.name}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteSearch(saved.id)}
                    >
                      <Trash className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
