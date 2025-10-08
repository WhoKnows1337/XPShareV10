'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Calendar, MapPin, Tag, Layers } from 'lucide-react'
import { CategoryChips, SubcategoryChips } from '@/components/submit/CategoryChips'
import { LocationPicker } from '@/components/submit/LocationPicker'
import { TagInput } from '@/components/submit/TagInput'
import { useSubmissionStore } from '@/lib/stores/submissionStore'

export default function ReviewPage() {
  const router = useRouter()
  const { content, analysis, setCategory, setSubcategory, setTags, setLocation, setDate } = useSubmissionStore()

  const [category, setCategoryLocal] = useState('')
  const [subcategory, setSubcategoryLocal] = useState('')
  const [tags, setTagsLocal] = useState<string[]>([])
  const [location, setLocationLocal] = useState('')
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number }>({ lat: 0, lng: 0 })
  const [date, setDateLocal] = useState('')
  const [time, setTime] = useState('')

  useEffect(() => {
    // Load from store
    if (analysis?.category) {
      setCategoryLocal(analysis.category)
    }
    if (analysis?.tags) {
      setTagsLocal(analysis.tags)
    }
  }, [analysis])

  const handleCategorySelect = (value: string) => {
    setCategoryLocal(value)
    setSubcategoryLocal('') // Reset subcategory when category changes
    setCategory(value)
  }

  const handleSubcategorySelect = (value: string) => {
    setSubcategoryLocal(value)
    setSubcategory(value)
  }

  const handleTagsChange = (newTags: string[]) => {
    setTagsLocal(newTags)
    setTags(newTags)
  }

  const handleLocationSelect = (loc: string, coords: { lat: number; lng: number }) => {
    setLocationLocal(loc)
    setCoordinates(coords)
    setLocation(loc, coords)
  }

  const handleContinue = () => {
    // Combine date and time
    if (date) {
      const fullDate = time ? `${date}T${time}:00` : `${date}T12:00:00`
      setDate(fullDate)
    }

    router.push('/submit/questions')
  }

  if (!content) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-600 border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-2">✨ Review & Kategorisierung</h1>
        <p className="text-muted-foreground">
          Überprüfe die AI-Vorschläge und ergänze Details zu deiner Erfahrung
        </p>
      </div>

      <div className="space-y-6">
        {/* Your Experience */}
        <Card>
          <CardHeader>
            <CardTitle>Deine Erfahrung</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed">{content}</p>
          </CardContent>
        </Card>

        {/* Category Selection with Chips */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-purple-500" />
              Kategorie
            </CardTitle>
            <CardDescription>Wähle die Art der Erfahrung</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <CategoryChips selected={category} onSelect={handleCategorySelect} />

            {/* Subcategory Chips */}
            {category && (
              <div className="pt-4 border-t">
                <Label className="text-sm text-muted-foreground mb-3 block">
                  Unterkategorie (optional)
                </Label>
                <SubcategoryChips
                  category={category}
                  selected={subcategory}
                  onSelect={handleSubcategorySelect}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tags with Suggestions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5 text-purple-500" />
              Tags
            </CardTitle>
            <CardDescription>Füge Tags hinzu um deine Erfahrung zu beschreiben</CardDescription>
          </CardHeader>
          <CardContent>
            <TagInput value={tags} onChange={handleTagsChange} category={category} />
          </CardContent>
        </Card>

        {/* Location with Mapbox Picker */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-purple-500" />
              Ort
            </CardTitle>
            <CardDescription>Wo ist diese Erfahrung passiert?</CardDescription>
          </CardHeader>
          <CardContent>
            <LocationPicker
              value={location}
              coordinates={coordinates}
              onSelect={handleLocationSelect}
            />
          </CardContent>
        </Card>

        {/* Date & Time */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-purple-500" />
              Datum & Uhrzeit
            </CardTitle>
            <CardDescription>Wann ist das passiert?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="date">Datum</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDateLocal(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="time">Uhrzeit (optional)</Label>
              <Input
                id="time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Continue Button */}
        <Button
          onClick={handleContinue}
          className="w-full"
          size="lg"
          disabled={!category || tags.length === 0}
        >
          Weiter zu den Fragen →
        </Button>
      </div>
    </div>
  )
}
