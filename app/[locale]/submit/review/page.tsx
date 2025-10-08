'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ArrowLeft, Calendar, MapPin, Tag, Layers, Clock, Sparkles, Check } from 'lucide-react'
import { CategoryChips, SubcategoryChips } from '@/components/submit/CategoryChips'
import { LocationPicker } from '@/components/submit/LocationPicker'
import { TagInput } from '@/components/submit/TagInput'
import { ProgressIndicator } from '@/components/submit/ProgressIndicator'
import { useSubmissionStore } from '@/lib/stores/submissionStore'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'
import { cn } from '@/lib/utils'

export default function ReviewPage() {
  const router = useRouter()
  const pathname = usePathname()
  const { content, analysis, setCategory, setSubcategory, setTags, setLocation, setDate } = useSubmissionStore()

  const [category, setCategoryLocal] = useState('')
  const [subcategory, setSubcategoryLocal] = useState('')
  const [tags, setTagsLocal] = useState<string[]>([])
  const [location, setLocationLocal] = useState('')
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number }>({ lat: 0, lng: 0 })
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [time, setTime] = useState('')
  const [timeAccuracy, setTimeAccuracy] = useState<'exact' | 'approximate'>('exact')
  const [showDatePicker, setShowDatePicker] = useState(false)

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

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date)
  }

  const handleQuickDate = (daysAgo: number) => {
    const date = new Date()
    date.setDate(date.getDate() - daysAgo)
    setSelectedDate(date)
    setShowDatePicker(true)
  }

  const handleContinue = () => {
    // Combine date and time
    if (selectedDate) {
      const dateStr = format(selectedDate, 'yyyy-MM-dd')
      const fullDate = time ? `${dateStr}T${time}:00` : `${dateStr}T12:00:00`
      setDate(fullDate)
    }

    // Extract locale from pathname and build the URL
    const locale = pathname.split('/')[1]
    router.push(`/${locale}/submit/questions`)
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
    <div className="w-full max-w-4xl mx-auto pb-16">
      <div className="mb-4 text-center">
        <h1 className="text-3xl font-bold mb-1">✨ Review & Kategorisierung</h1>
        <p className="text-muted-foreground text-sm">
          Überprüfe die AI-Vorschläge und ergänze Details zu deiner Erfahrung
        </p>
      </div>

      <div className="space-y-3">
        {/* Your Experience */}
        <div>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Deine Erfahrung</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="text-sm leading-relaxed">{content}</p>
            </CardContent>
          </Card>
        </div>

        {/* AI Analysis Badge */}
        {analysis && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-purple-200 bg-purple-50/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-900">
                  <Sparkles className="h-5 w-5" />
                  AI-Analyse
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 pt-4">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-purple-100 text-purple-900">
                    <Layers className="h-3 w-3 mr-1" />
                    {analysis.category}
                  </Badge>
                  {analysis.tags && analysis.tags.length > 0 && (
                    <div className="flex gap-1 flex-wrap">
                      {analysis.tags.slice(0, 3).map((tag, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  💡 Du kannst diese Vorschläge anpassen
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Category Selection with Chips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Layers className="h-5 w-5 text-purple-500" />
                Kategorie
              </CardTitle>
              <CardDescription>Wähle die Art der Erfahrung</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 pt-4">
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
        </motion.div>

        {/* Tags with Suggestions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Tag className="h-5 w-5 text-purple-500" />
                Tags
                {analysis?.tags && analysis.tags.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    <Sparkles className="h-3 w-3 mr-1" />
                    AI-Vorschläge
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>Füge Tags hinzu um deine Erfahrung zu beschreiben</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <TagInput value={tags} onChange={handleTagsChange} category={category} />
            </CardContent>
          </Card>
        </motion.div>

        {/* Location with Mapbox Picker */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <MapPin className="h-5 w-5 text-purple-500" />
                Ort
              </CardTitle>
              <CardDescription>Wo ist diese Erfahrung passiert?</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <LocationPicker
                value={location}
                coordinates={coordinates}
                onSelect={handleLocationSelect}
              />
            </CardContent>
          </Card>
        </motion.div>

        {/* Date & Time with Calendar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="h-5 w-5 text-purple-500" />
                Datum & Uhrzeit
              </CardTitle>
              <CardDescription>Wann ist das passiert?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 pt-4">
              {/* Quick Date Selection */}
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickDate(0)}
                  type="button"
                >
                  Heute
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickDate(1)}
                  type="button"
                >
                  Gestern
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickDate(7)}
                  type="button"
                >
                  Vor 1 Woche
                </Button>
              </div>

              {/* Calendar Popover */}
              <div>
                <Label>Datum wählen</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !selectedDate && 'text-muted-foreground'
                      )}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, 'PPP', { locale: de }) : 'Datum auswählen'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={selectedDate}
                      onSelect={handleDateSelect}
                      initialFocus
                      locale={de}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Time Accuracy */}
              <div className="space-y-3">
                <Label>Zeitgenauigkeit</Label>
                <RadioGroup value={timeAccuracy} onValueChange={(val) => setTimeAccuracy(val as 'exact' | 'approximate')}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="exact" id="exact" />
                    <Label htmlFor="exact" className="font-normal cursor-pointer">
                      Exakte Zeit
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="approximate" id="approximate" />
                    <Label htmlFor="approximate" className="font-normal cursor-pointer">
                      Ungefähre Zeit
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Time Input */}
              {timeAccuracy === 'exact' && (
                <div>
                  <Label htmlFor="time">Uhrzeit</Label>
                  <Input
                    id="time"
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Continue Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Button
            onClick={handleContinue}
            className="w-full"
            size="lg"
            disabled={!category}
          >
            Weiter zu den Fragen →
          </Button>
        </motion.div>
      </div>
    </div>
  )
}
