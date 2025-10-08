'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet'
import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Filter, X } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'

const categories = [
  { value: 'ufo', label: '🛸 UFO' },
  { value: 'paranormal', label: '👻 Paranormal' },
  { value: 'dreams', label: '💭 Dreams' },
  { value: 'psychedelic', label: '🍄 Psychedelic' },
  { value: 'spiritual', label: '🙏 Spiritual' },
  { value: 'synchronicity', label: '🔮 Synchronicity' },
  { value: 'nde', label: '💫 NDE' },
  { value: 'other', label: '📦 Other' },
]

const dateRanges = [
  { value: '24h', label: 'Last 24 Hours' },
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
  { value: '90d', label: 'Last 90 Days' },
  { value: '1y', label: 'Last Year' },
  { value: 'all', label: 'All Time' },
]

export function MobileFilterSheet() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    searchParams.get('category')?.split(',').filter(Boolean) || []
  )
  const [radius, setRadius] = useState(
    Number(searchParams.get('radius')) || 50
  )
  const [dateRange, setDateRange] = useState(
    searchParams.get('dateRange') || '30d'
  )

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    )
  }

  const handleReset = () => {
    setSelectedCategories([])
    setRadius(50)
    setDateRange('30d')
  }

  const handleApply = () => {
    const params = new URLSearchParams(searchParams.toString())

    if (selectedCategories.length > 0) {
      params.set('category', selectedCategories.join(','))
    } else {
      params.delete('category')
    }

    params.set('radius', radius.toString())
    params.set('dateRange', dateRange)

    router.push(`?${params.toString()}`)
  }

  const activeFilterCount =
    selectedCategories.length +
    (radius !== 50 ? 1 : 0) +
    (dateRange !== '30d' ? 1 : 0)

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="relative">
          <Filter className="h-4 w-4 mr-2" />
          Filters
          {activeFilterCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[80vh]">
        <SheetHeader>
          <SheetTitle>Filters</SheetTitle>
          <SheetDescription>
            Customize your experience feed
          </SheetDescription>
        </SheetHeader>

        <div className="py-6 space-y-6 overflow-y-auto max-h-[calc(80vh-180px)]">
          {/* Categories */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Category</Label>
            <div className="grid grid-cols-2 gap-3">
              {categories.map((category) => (
                <div
                  key={category.value}
                  className="flex items-center space-x-2"
                >
                  <Checkbox
                    id={`mobile-cat-${category.value}`}
                    checked={selectedCategories.includes(category.value)}
                    onCheckedChange={() => handleCategoryToggle(category.value)}
                  />
                  <Label
                    htmlFor={`mobile-cat-${category.value}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {category.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Location Radius */}
          <div className="space-y-3">
            <div className="flex justify-between">
              <Label className="text-base font-semibold">Location ({radius}km)</Label>
              <span className="text-xs text-muted-foreground">Proximity radius</span>
            </div>
            <Slider
              value={[radius]}
              onValueChange={([val]) => setRadius(val)}
              min={10}
              max={500}
              step={10}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>10km</span>
              <span>500km</span>
            </div>
          </div>

          {/* Date Range */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Date Range</Label>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {dateRanges.map((range) => (
                  <SelectItem key={range.value} value={range.value}>
                    {range.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <SheetFooter className="flex gap-2">
          <Button variant="outline" onClick={handleReset} className="flex-1">
            <X className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <SheetClose asChild>
            <Button onClick={handleApply} className="flex-1">
              Apply ({activeFilterCount} filters)
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
