'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

interface SubCategory {
  id: string
  label: string
  count: number
}

interface SubCategoryFilterProps {
  categorySlug: string
  selectedSubCategories: string[]
  onSubCategoryChange: (selected: string[]) => void
}

const SUB_CATEGORIES: Record<string, SubCategory[]> = {
  ufo: [
    { id: 'sighting', label: 'Sichtung', count: 1800 },
    { id: 'encounter', label: 'Begegnung', count: 400 },
    { id: 'abduction', label: 'Entführung', count: 120 },
    { id: 'landing', label: 'Landung', count: 80 },
  ],
  paranormal: [
    { id: 'ghost', label: 'Geister', count: 650 },
    { id: 'poltergeist', label: 'Poltergeist', count: 230 },
    { id: 'shadow', label: 'Schattenwesen', count: 180 },
    { id: 'haunted', label: 'Spukhaus', count: 340 },
  ],
  dreams: [
    { id: 'lucid', label: 'Luzid', count: 890 },
    { id: 'prophetic', label: 'Prophetisch', count: 340 },
    { id: 'recurring', label: 'Wiederkehrend', count: 520 },
    { id: 'nightmare', label: 'Albtraum', count: 280 },
  ],
  psychedelic: [
    { id: 'dmt', label: 'DMT', count: 450 },
    { id: 'lsd', label: 'LSD', count: 380 },
    { id: 'mushrooms', label: 'Pilze', count: 620 },
    { id: 'ayahuasca', label: 'Ayahuasca', count: 290 },
  ],
  spiritual: [
    { id: 'awakening', label: 'Erwachen', count: 560 },
    { id: 'kundalini', label: 'Kundalini', count: 230 },
    { id: 'meditation', label: 'Meditation', count: 780 },
    { id: 'entity', label: 'Wesen-Begegnung', count: 190 },
  ],
}

export function SubCategoryFilter({
  categorySlug,
  selectedSubCategories,
  onSubCategoryChange,
}: SubCategoryFilterProps) {
  const subCategories = SUB_CATEGORIES[categorySlug] || []

  if (subCategories.length === 0) return null

  const handleToggle = (subCatId: string) => {
    const newSelected = selectedSubCategories.includes(subCatId)
      ? selectedSubCategories.filter((id) => id !== subCatId)
      : [...selectedSubCategories, subCatId]

    onSubCategoryChange(newSelected)
  }

  const handleClear = () => {
    onSubCategoryChange([])
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">Sub-Categories</CardTitle>
          {selectedSubCategories.length > 0 && (
            <Button variant="ghost" size="sm" onClick={handleClear}>
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="all-subcats"
              checked={selectedSubCategories.length === 0}
              onCheckedChange={() => handleClear()}
            />
            <Label htmlFor="all-subcats" className="cursor-pointer flex-1 flex justify-between">
              <span>All</span>
              <Badge variant="secondary">
                {subCategories.reduce((sum, cat) => sum + cat.count, 0)}
              </Badge>
            </Label>
          </div>

          <Separator />

          {subCategories.map((subCat) => (
            <div key={subCat.id} className="flex items-center space-x-2">
              <Checkbox
                id={subCat.id}
                checked={selectedSubCategories.includes(subCat.id)}
                onCheckedChange={() => handleToggle(subCat.id)}
              />
              <Label htmlFor={subCat.id} className="cursor-pointer flex-1 flex justify-between">
                <span>{subCat.label}</span>
                <Badge variant="outline">{subCat.count}</Badge>
              </Label>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
