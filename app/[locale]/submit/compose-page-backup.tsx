'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Mic, Image as ImageIcon, Sparkles, Save, Clock } from 'lucide-react'
import { useLiveAnalysis } from '@/lib/hooks/useLiveAnalysis'
import { useAutoSave } from '@/lib/hooks/useAutoSave'
import { LiveInsightsSidebar } from '@/components/submit/LiveInsightsSidebar'
import { FloatingInsightsBadge } from '@/components/submit/FloatingInsightsBadge'
import { useAuth } from '@/lib/hooks/useAuth'
import { format } from 'date-fns'

export default function SubmitPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [text, setText] = useState('')
  const [title, setTitle] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)

  // Live AI Analysis
  const {
    analysis,
    isAnalyzing,
    error: analysisError,
    callCount,
    maxCalls,
    hasReachedLimit,
  } = useLiveAnalysis(text, {
    enabled: text.length >= 50,
  })

  // Auto-Save
  const {
    lastSaved,
    isSaving,
    error: saveError,
  } = useAutoSave(
    text,
    {
      title,
      analysis,
    },
    {
      userId: user?.id || 'anonymous',
      interval: 10000, // 10 seconds
    }
  )

  const handleContinue = () => {
    if (text.trim()) {
      // Store in localStorage for compatibility with other pages
      localStorage.setItem(
        'experience_draft',
        JSON.stringify({
          text,
          title,
          analysis,
        })
      )
      router.push('/submit/review')
    }
  }

  return (
    <>
      {/* Desktop: Split View */}
      <div className="hidden md:block">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2">✨ Share Your Experience</h1>
          <p className="text-muted-foreground">
            Our AI will help you categorize and discover patterns as you type
          </p>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Left: Input (2/3) */}
          <div className="col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>What happened?</CardTitle>
                    <CardDescription>
                      Describe your experience in your own words
                    </CardDescription>
                  </div>
                  {lastSaved && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      Saved {format(lastSaved, 'HH:mm:ss')}
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Title (Optional) */}
                <div>
                  <Input
                    placeholder="Title (optional)"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="text-lg font-semibold"
                  />
                </div>

                {/* Text Input */}
                <Textarea
                  placeholder="Start typing your experience here... e.g., 'Last night I saw strange lights in the sky...'"
                  value={text}
                  onChange={(e) => {
                    setText(e.target.value)
                    if (e.target.value.length > 50 && !isExpanded) {
                      setIsExpanded(true)
                    }
                  }}
                  className={`min-h-[300px] transition-all duration-300 ${
                    isExpanded ? 'min-h-[400px]' : ''
                  }`}
                />

                {/* Quick Actions */}
                <div className="flex flex-wrap gap-3">
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <Mic className="h-4 w-4" />
                    Record Audio
                  </Button>
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" />
                    Upload Photo
                  </Button>
                </div>

                {/* Character Counter */}
                <div className="flex items-center justify-between text-sm">
                  <div className="text-muted-foreground">
                    {text.length} characters
                    {text.length >= 50 && (
                      <span className="ml-2 text-green-600 inline-flex items-center gap-1">
                        <Sparkles className="h-3 w-3" />
                        AI analysis active
                      </span>
                    )}
                    {hasReachedLimit && (
                      <span className="ml-2 text-amber-600">
                        (Max AI calls reached)
                      </span>
                    )}
                  </div>

                  {isSaving && (
                    <div className="text-muted-foreground flex items-center gap-1">
                      <Save className="h-3 w-3 animate-pulse" />
                      Saving...
                    </div>
                  )}
                </div>

                {text.length > 0 && text.length < 50 && (
                  <p className="text-sm text-amber-600">
                    Write at least 50 characters for AI analysis ({50 - text.length} more)
                  </p>
                )}

                {(analysisError || saveError) && (
                  <p className="text-sm text-destructive">
                    {analysisError || saveError}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Continue Button */}
            <Button
              onClick={handleContinue}
              disabled={text.length < 50}
              className="w-full"
              size="lg"
            >
              Continue to Review & Edit →
            </Button>

            {/* Tips */}
            <div className="p-4 bg-muted rounded-lg">
              <h3 className="font-semibold mb-2 text-sm">💡 Tips for sharing:</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Don't worry about being perfect – just tell your story</li>
                <li>• Our AI will help you categorize and add details</li>
                <li>• Your draft is auto-saved every 10 seconds</li>
              </ul>
            </div>
          </div>

          {/* Right: Live Insights (1/3) */}
          <div className="col-span-1">
            <div className="sticky top-6">
              <LiveInsightsSidebar
                analysis={analysis}
                isAnalyzing={isAnalyzing}
                callCount={callCount}
                maxCalls={maxCalls}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile: Tabs */}
      <div className="md:hidden">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">✨ New Experience</h1>
          <p className="text-sm text-muted-foreground">
            AI-powered submission flow
          </p>
        </div>

        <Tabs defaultValue="input" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="input">Input</TabsTrigger>
            <TabsTrigger value="insights" className="relative">
              Insights
              {analysis && (
                <span className="ml-1 h-2 w-2 rounded-full bg-purple-600" />
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="input" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base">Your Experience</CardTitle>
                  {lastSaved && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {format(lastSaved, 'HH:mm')}
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Title (optional)"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />

                <Textarea
                  placeholder="Describe what happened..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="min-h-[250px]"
                />

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Mic className="h-4 w-4 mr-2" />
                    Audio
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <ImageIcon className="h-4 w-4 mr-2" />
                    Photo
                  </Button>
                </div>

                <div className="text-xs text-muted-foreground">
                  {text.length} chars
                  {text.length >= 50 && (
                    <span className="ml-2 text-green-600">✓ AI active</span>
                  )}
                </div>
              </CardContent>
            </Card>

            <Button
              onClick={handleContinue}
              disabled={text.length < 50}
              className="w-full"
              size="lg"
            >
              Continue →
            </Button>
          </TabsContent>

          <TabsContent value="insights">
            <LiveInsightsSidebar
              analysis={analysis}
              isAnalyzing={isAnalyzing}
              callCount={callCount}
              maxCalls={maxCalls}
            />
          </TabsContent>
        </Tabs>

        {/* Floating Badge (only visible on input tab) */}
        <FloatingInsightsBadge
          analysis={analysis}
          isAnalyzing={isAnalyzing}
          callCount={callCount}
          maxCalls={maxCalls}
        />
      </div>
    </>
  )
}
