'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Calendar, MapPin, Tag, X, Plus } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface ReviewData {
  text: string
  analysis: {
    category: string
    tags: string[]
    emotion: string
  }
}

const categoryOptions = [
  { value: 'ufo', label: 'UFO Sighting' },
  { value: 'paranormal', label: 'Paranormal' },
  { value: 'dreams', label: 'Dream Experience' },
  { value: 'psychedelic', label: 'Psychedelic' },
  { value: 'spiritual', label: 'Spiritual' },
  { value: 'synchronicity', label: 'Synchronicity' },
  { value: 'nde', label: 'Near-Death Experience' },
  { value: 'other', label: 'Other Experience' },
]

export default function ReviewPage() {
  const router = useRouter()
  const [data, setData] = useState<ReviewData | null>(null)
  const [category, setCategory] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState('')
  const [location, setLocation] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')

  useEffect(() => {
    // Get data from localStorage
    const draft = localStorage.getItem('experience_draft')
    if (!draft) {
      router.push('/submit')
      return
    }

    try {
      const parsed = JSON.parse(draft)
      setData(parsed)
      setCategory(parsed.analysis?.category || '')
      setTags(parsed.analysis?.tags || [])
    } catch (e) {
      console.error('Failed to parse draft:', e)
      router.push('/submit')
    }
  }, [router])

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()])
      setNewTag('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const handleContinue = () => {
    // Save updated data to localStorage
    const draft = JSON.parse(localStorage.getItem('experience_draft') || '{}')
    localStorage.setItem(
      'experience_draft',
      JSON.stringify({
        ...draft,
        category,
        tags,
        location,
        date,
        time,
      })
    )
    router.push('/submit/questions')
  }

  if (!data) {
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
        <h1 className="text-4xl font-bold mb-2">Review & Edit</h1>
        <p className="text-muted-foreground">
          Review the AI suggestions and add more details about your experience
        </p>
      </div>

      <div className="space-y-6">
        {/* Your Experience */}
        <Card>
          <CardHeader>
            <CardTitle>Your Experience</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed text-muted-foreground">{data.text}</p>
          </CardContent>
        </Card>

        {/* Category Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5 text-purple-500" />
              Category
            </CardTitle>
            <CardDescription>Select the type of experience</CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categoryOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Tags */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5 text-purple-500" />
              Tags
            </CardTitle>
            <CardDescription>Add or remove tags to describe your experience</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="gap-1 px-3 py-1">
                  {tag}
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1 hover:text-destructive"
                    aria-label={`Remove ${tag}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add a tag..."
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
              />
              <Button onClick={handleAddTag} variant="outline" size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-purple-500" />
              Location
            </CardTitle>
            <CardDescription>Where did this experience occur?</CardDescription>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="Enter location (city, country)..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </CardContent>
        </Card>

        {/* Date & Time */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-purple-500" />
              Date & Time
            </CardTitle>
            <CardDescription>When did this experience happen?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="time">Time (optional)</Label>
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
          Continue to Questions →
        </Button>
      </div>
    </div>
  )
}
