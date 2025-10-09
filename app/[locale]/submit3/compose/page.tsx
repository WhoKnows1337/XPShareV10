'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { getLocaleFromPathname } from '@/lib/utils/locale'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Save,
  Clock,
  ArrowRight,
  Sparkles
} from 'lucide-react'
import { useLiveAnalysis } from '@/lib/hooks/useLiveAnalysis'
import { useAutoSave } from '@/hooks/useAutoSave'
import { LiveInsightsSidebar } from '@/components/submit/LiveInsightsSidebar'
import { QuickActionsBar } from '@/components/submit3/QuickActionsBar'
import { SuggestionList, type Suggestion } from '@/components/submit3/InlineSuggestion'
import { ConfidenceIndicator } from '@/components/submit3/ConfidenceIndicator'
import { useAuth } from '@/lib/hooks/useAuth'
import { useSubmit3Store } from '@/lib/stores/submit3Store'
import { format } from 'date-fns'
import { motion } from 'framer-motion'

export default function Submit3ComposePage() {
  const router = useRouter()
  const pathname = usePathname()
  const { user } = useAuth()

  const {
    originalContent,
    mode,
    setOriginalContent,
    setAnalysis,
    setMode,
    setAudioTranscript,
  } = useSubmit3Store()

  const [text, setText] = useState(originalContent || '')

  // Sync with store
  useEffect(() => {
    setOriginalContent(text)
  }, [text, setOriginalContent])

  // Live AI Analysis
  const {
    analysis,
    isAnalyzing,
    error: analysisError,
    callCount,
    maxCalls,
  } = useLiveAnalysis(text, {
    enabled: text.length >= 50 && mode !== 'focus',
  })

  // Sync analysis with store
  useEffect(() => {
    if (analysis) {
      setAnalysis(analysis)
    }
  }, [analysis, setAnalysis])

  // Auto-Save
  const {
    lastSaved,
    isSaving,
  } = useAutoSave(
    text,
    { analysis },
    {
      userId: user?.id || 'anonymous',
      interval: 3000, // 3 seconds
    }
  )

  // Generate AI Suggestions from analysis
  const suggestions = useMemo<Suggestion[]>(() => {
    if (!analysis || mode === 'focus') return []

    const sugs: Suggestion[] = []

    if (analysis.category) {
      sugs.push({
        id: 'category',
        type: 'category',
        value: analysis.category,
        confidence: 0.85,
      })
    }

    if (analysis.location?.name) {
      sugs.push({
        id: 'location',
        type: 'location',
        value: analysis.location.name,
        confidence: analysis.location.confidence,
      })
    }

    if (analysis.time?.date) {
      sugs.push({
        id: 'time',
        type: 'time',
        value: new Date(analysis.time.date).toLocaleDateString(),
        confidence: analysis.time.isApproximate ? 0.6 : 0.9,
      })
    }

    // Add top 2 tags
    analysis.tags.slice(0, 2).forEach((tag, i) => {
      sugs.push({
        id: `tag-${i}`,
        type: 'tag',
        value: tag,
        confidence: 0.75,
      })
    })

    return sugs
  }, [analysis, mode])

  const handleAcceptSuggestion = (suggestion: Suggestion) => {
    console.log('Accepted:', suggestion)
    // TODO: Add to confirmed metadata in store
  }

  const handleRejectSuggestion = (suggestion: Suggestion) => {
    console.log('Rejected:', suggestion)
  }

  const handleVoiceTranscript = (transcript: string) => {
    setText((prev) => (prev ? `${prev}\n\n${transcript}` : transcript))
    setAudioTranscript(transcript)
  }

  const handlePhotoUpload = (file: File) => {
    console.log('Photo uploaded:', file)
    // TODO: Add to media files in store
  }

  const handleContinue = () => {
    if (text.length < 50) {
      alert('Please write at least 50 characters to continue.')
      return
    }

    setOriginalContent(text)
    const locale = getLocaleFromPathname(pathname)
    router.push(`/${locale}/submit3/refine`)
  }

  const wordCount = text.split(/\s+/).filter(word => word.length > 0).length
  const completionPercentage = Math.min(100, Math.round((text.length / 500) * 100))

  // Focus Mode (no distractions)
  if (mode === 'focus') {
    return (
      <div className="max-w-4xl mx-auto">
        <Card className="border-0 shadow-2xl">
          <CardContent className="pt-8 px-8 pb-6">
            <Textarea
              placeholder="Tell us your story... just start writing."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="min-h-[500px] resize-none text-lg leading-relaxed border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              autoFocus
            />

            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>{wordCount} words</span>
                <button
                  onClick={() => setMode('guided')}
                  className="text-purple-600 hover:text-purple-700 text-xs underline"
                >
                  Enable AI Assistant
                </button>
              </div>

              <Button
                size="lg"
                onClick={handleContinue}
                disabled={text.length < 50}
              >
                Continue <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Guided Mode (Default) - Desktop: Split View
  return (
    <div className="max-w-7xl mx-auto">
      {/* Mode Switcher */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-purple-500" />
          Capture Your Experience
        </h1>

        <div className="flex items-center gap-2">
          <Button
            variant={mode === 'focus' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setMode('focus')}
          >
            Focus
          </Button>
          <Button
            variant={mode === 'guided' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setMode('guided')}
          >
            Guided
          </Button>
          <Button
            variant={mode === 'expert' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setMode('expert')}
          >
            Expert
          </Button>
        </div>
      </div>

      {/* Desktop: Split View */}
      <div className="hidden md:block">
        <div className="grid grid-cols-3 gap-6">
          {/* Left: Input (2 columns) */}
          <div className="col-span-2 space-y-4">
            <Card className="border-0 shadow-lg">
              <CardContent className="pt-8 px-8 pb-6 space-y-6">
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-semibold">What happened?</h2>
                  <p className="text-muted-foreground">
                    Start writing - AI analyzes in real-time
                  </p>
                </div>

                {/* AI Suggestions */}
                {suggestions.length > 0 && mode !== 'focus' && (
                  <SuggestionList
                    suggestions={suggestions}
                    onAccept={handleAcceptSuggestion}
                    onReject={handleRejectSuggestion}
                    maxVisible={3}
                  />
                )}

                {/* Main Textarea */}
                <div>
                  <Textarea
                    placeholder="Tell us your story... just start writing. The AI will detect category, location, time, and more as you type."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="min-h-[400px] resize-y text-base leading-relaxed border-2 focus:border-purple-500 transition-colors"
                    autoFocus
                  />

                  {/* Stats & Auto-save Indicator */}
                  <div className="flex items-center justify-between mt-3 text-sm">
                    <div className="flex items-center gap-4 text-muted-foreground">
                      <span>{wordCount} words · {text.length} characters</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-gradient-to-r from-purple-600 to-pink-600 transition-all duration-300"
                            initial={{ width: 0 }}
                            animate={{ width: `${completionPercentage}%` }}
                          />
                        </div>
                        <span>{completionPercentage}%</span>
                      </div>
                    </div>

                    {lastSaved && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        {isSaving ? (
                          <>
                            <Save className="h-3 w-3 animate-pulse" />
                            <span>Saving...</span>
                          </>
                        ) : (
                          <>
                            <Clock className="h-3 w-3" />
                            <span>Saved {format(lastSaved, 'HH:mm:ss')}</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Continue Button */}
                <Button
                  size="lg"
                  className="w-full mt-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  onClick={handleContinue}
                  disabled={text.length < 50}
                >
                  Continue to Refinement <ArrowRight className="ml-2 h-4 w-4" />
                </Button>

                {text.length < 50 && text.length > 0 && (
                  <p className="text-center text-sm text-muted-foreground">
                    {50 - text.length} more characters needed
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions Bar */}
            {mode !== 'focus' && (
              <Card>
                <CardContent className="pt-6">
                  <QuickActionsBar
                    onVoiceTranscript={handleVoiceTranscript}
                    onPhotoUpload={handlePhotoUpload}
                    compact={mode === 'guided'}
                  />
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right: AI Sidebar (1 column) */}
          <div className="col-span-1">
            <div className="sticky top-6 space-y-4">
              <LiveInsightsSidebar
                analysis={analysis}
                isAnalyzing={isAnalyzing}
                callCount={callCount}
                maxCalls={maxCalls}
              />

              {/* Confidence Meter (Expert Mode) */}
              {mode === 'expert' && analysis?.location && (
                <Card>
                  <CardContent className="pt-6">
                    <h3 className="text-sm font-semibold mb-3">AI Confidence</h3>
                    <ConfidenceIndicator
                      confidence={analysis.location.confidence}
                      showPercentage={true}
                      variant="bar"
                      size="md"
                    />
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile: Tabs */}
      <div className="md:hidden">
        <Card>
          <CardContent className="pt-6">
            <Tabs defaultValue="input" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="input">Write</TabsTrigger>
                <TabsTrigger value="insights">
                  💡 AI Insights
                  {analysis && (
                    <span className="ml-1 text-xs">
                      ({Object.values(analysis).filter(v => v !== null && (Array.isArray(v) ? v.length > 0 : true)).length})
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="input" className="space-y-4 mt-4">
                <div className="text-center space-y-2 mb-4">
                  <h2 className="text-xl font-bold">What happened?</h2>
                  <p className="text-sm text-muted-foreground">
                    Tell your story
                  </p>
                </div>

                {/* Mobile Suggestions */}
                {suggestions.length > 0 && (
                  <SuggestionList
                    suggestions={suggestions}
                    onAccept={handleAcceptSuggestion}
                    onReject={handleRejectSuggestion}
                    maxVisible={2}
                  />
                )}

                <Textarea
                  placeholder="Start writing your experience..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="min-h-[300px] resize-none"
                  autoFocus
                />

                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{wordCount} words</span>
                  {lastSaved && (
                    <span>{isSaving ? 'Saving...' : `Saved ${format(lastSaved, 'HH:mm')}`}</span>
                  )}
                </div>

                {/* Mobile Quick Actions */}
                <QuickActionsBar
                  onVoiceTranscript={handleVoiceTranscript}
                  onPhotoUpload={handlePhotoUpload}
                  compact={true}
                />

                <Button
                  size="lg"
                  className="w-full"
                  onClick={handleContinue}
                  disabled={text.length < 50}
                >
                  Continue →
                </Button>
              </TabsContent>

              <TabsContent value="insights" className="mt-4">
                <LiveInsightsSidebar
                  analysis={analysis}
                  isAnalyzing={isAnalyzing}
                  callCount={callCount}
                  maxCalls={maxCalls}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Tip */}
      <div className="mt-6 text-center">
        <p className="text-sm text-muted-foreground">
          💡 Tip: Write naturally. AI automatically detects category, location, time and tags as you type!
        </p>
      </div>
    </div>
  )
}
