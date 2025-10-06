'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, Sparkles, Tag, Heart } from 'lucide-react'

interface AnalysisResult {
  category: string
  tags: string[]
  emotion: string
}

export default function AnalyzePage() {
  const router = useRouter()
  const [text, setText] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(true)
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Get text from localStorage
    const draft = localStorage.getItem('experience_draft')
    if (!draft) {
      router.push('/submit')
      return
    }

    try {
      const { text: draftText } = JSON.parse(draft)
      setText(draftText)

      // Start AI analysis
      analyzeText(draftText)
    } catch (e) {
      console.error('Failed to parse draft:', e)
      router.push('/submit')
    }
  }, [router])

  const analyzeText = async (text: string) => {
    try {
      setIsAnalyzing(true)
      setError(null)

      const response = await fetch('/api/ai/analyze-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })

      if (!response.ok) {
        throw new Error('Analysis failed')
      }

      const result = await response.json()
      setAnalysis(result)

      // Store analysis in localStorage
      const draft = JSON.parse(localStorage.getItem('experience_draft') || '{}')
      localStorage.setItem(
        'experience_draft',
        JSON.stringify({ ...draft, analysis: result })
      )
    } catch (err) {
      setError('Failed to analyze your experience. Please try again.')
      console.error('Analysis error:', err)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleContinue = () => {
    router.push('/submit/review')
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

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-2">AI Analysis</h1>
        <p className="text-muted-foreground">
          Our AI is analyzing your experience to suggest categories and details
        </p>
      </div>

      {/* Your Experience */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Your Experience</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed">{text}</p>
        </CardContent>
      </Card>

      {/* Analysis Results */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            AI Analysis
          </CardTitle>
          <CardDescription>
            We've analyzed your experience. You can edit these suggestions in the next step.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {isAnalyzing && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
              <span className="ml-3 text-muted-foreground">Analyzing your experience...</span>
            </div>
          )}

          {error && (
            <div className="p-4 bg-destructive/10 text-destructive rounded-lg">
              {error}
              <Button variant="outline" size="sm" className="ml-4" onClick={() => analyzeText(text)}>
                Try Again
              </Button>
            </div>
          )}

          {analysis && !isAnalyzing && (
            <>
              {/* Category */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <h3 className="font-semibold">Suggested Category</h3>
                </div>
                <Badge variant="secondary" className="text-base px-4 py-2">
                  {categoryLabels[analysis.category] || analysis.category}
                </Badge>
              </div>

              {/* Tags */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-4 w-4 text-muted-foreground" />
                  <h3 className="font-semibold">Suggested Tags</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {analysis.tags.map((tag, i) => (
                    <Badge key={i} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Emotion */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Heart className="h-4 w-4 text-muted-foreground" />
                  <h3 className="font-semibold">Detected Emotion</h3>
                </div>
                <Badge variant="secondary" className="capitalize">
                  {analysis.emotion}
                </Badge>
              </div>

              {/* Continue Button */}
              <Button onClick={handleContinue} className="w-full" size="lg">
                Continue to Review & Edit →
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
