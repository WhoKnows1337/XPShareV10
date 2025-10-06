'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, Calendar, MapPin, Tag, Users, Image as ImageIcon, Loader2 } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface DraftData {
  text: string
  category: string
  tags: string[]
  location: string
  date: string
  time: string
  questions?: Record<string, any>
  witnesses?: string[]
  mediaFiles?: Array<{ id: string; name: string; type: string }>
  analysis?: {
    category: string
    tags: string[]
    emotion: string
  }
}

const categoryLabels: Record<string, string> = {
  ufo: 'UFO Sighting',
  paranormal: 'Paranormal',
  dreams: 'Dream Experience',
  psychedelic: 'Psychedelic',
  spiritual: 'Spiritual',
  synchronicity: 'Synchronicity',
  nde: 'Near-Death Experience',
  other: 'Other Experience',
}

export default function FinalPage() {
  const router = useRouter()
  const [data, setData] = useState<DraftData | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Get all data from localStorage
    const draft = localStorage.getItem('experience_draft')
    if (!draft) {
      router.push('/submit')
      return
    }

    try {
      const parsed = JSON.parse(draft)
      setData(parsed)
    } catch (e) {
      console.error('Failed to parse draft:', e)
      router.push('/submit')
    }
  }, [router])

  const handleSubmit = async () => {
    if (!data) return

    setSubmitting(true)
    setError(null)

    try {
      // Prepare submission data - ensure required fields exist
      const submissionData = {
        text: data.text,
        category: data.category || 'other',
        tags: data.tags || [],
        location: data.location,
        date: data.date,
        time: data.time,
        questions: data.questions,
        witnesses: data.witnesses,
        mediaFiles: data.mediaFiles,
      }

      console.log('Submitting:', submissionData)

      const response = await fetch('/api/experiences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData),
      })

      if (!response.ok) {
        throw new Error('Failed to submit experience')
      }

      const result = await response.json()

      // Clear draft from localStorage
      localStorage.removeItem('experience_draft')

      // Redirect to success page
      router.push(`/submit/success?id=${result.id}`)
    } catch (err) {
      setError('Failed to submit your experience. Please try again.')
      console.error('Submit error:', err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (section: string) => {
    // Navigate back to specific section
    const routes: Record<string, string> = {
      text: '/submit',
      category: '/submit/review',
      questions: '/submit/questions',
      witnesses: '/submit/witnesses',
      media: '/submit/media',
    }
    router.push(routes[section] || '/submit')
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
        <h1 className="text-4xl font-bold mb-2">Review & Submit</h1>
        <p className="text-muted-foreground">
          Review everything one last time before sharing your experience
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-6">
        {/* Experience Text */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Your Experience</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => handleEdit('text')}>
                Edit
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{data.text}</p>
          </CardContent>
        </Card>

        {/* Category & Tags */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5 text-purple-500" />
                Category & Tags
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => handleEdit('category')}>
                Edit
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Category</p>
              <Badge variant="secondary" className="text-base px-4 py-2">
                {categoryLabels[data.category] || data.category}
              </Badge>
            </div>
            {data.tags && data.tags.length > 0 && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">Tags</p>
                <div className="flex flex-wrap gap-2">
                  {data.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Location & Date */}
        {(data.location || data.date) && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Location & Time</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => handleEdit('category')}>
                  Edit
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{data.location}</span>
                </div>
              )}
              {data.date && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {data.date}
                    {data.time && ` at ${data.time}`}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Witnesses */}
        {data.witnesses && data.witnesses.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-purple-500" />
                  Witnesses ({data.witnesses.length})
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => handleEdit('witnesses')}>
                  Edit
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {data.witnesses.map((witness) => (
                  <Badge key={witness} variant="secondary">
                    <Users className="h-3 w-3 mr-1" />
                    {witness}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Media */}
        {data.mediaFiles && data.mediaFiles.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5 text-purple-500" />
                  Media Files ({data.mediaFiles.length})
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => handleEdit('media')}>
                  Edit
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {data.mediaFiles.map((file) => (
                  <div key={file.id} className="flex items-center gap-2 text-sm">
                    <Badge variant="outline">{file.type}</Badge>
                    <span className="truncate">{file.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Submit Button */}
      <div className="mt-8 space-y-4">
        <Button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full"
          size="lg"
        >
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <CheckCircle2 className="mr-2 h-5 w-5" />
              Submit Experience
            </>
          )}
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          By submitting, you agree to share this experience publicly on XP-Share
        </p>
      </div>
    </div>
  )
}
