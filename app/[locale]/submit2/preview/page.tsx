'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft, Sparkles, Edit, Loader2, Eye } from 'lucide-react'
import { ProgressBar } from '@/components/submit2/ProgressBar'
import { useSubmit2Store } from '@/lib/stores/submit2Store'
import { motion } from 'framer-motion'

export default function Submit2PreviewPage() {
  const router = useRouter()
  const pathname = usePathname()

  const {
    originalContent,
    analysis,
    questionAnswers,
    enhancedContent,
    generatedTitle,
    summary,
    setEnhancedContent,
    setGeneratedTitle,
    setSummary,
    useEnhanced,
    setUseEnhanced,
    confirmedLocation,
    confirmedTime,
    witnesses,
  } = useSubmit2Store()

  const [isEnhancing, setIsEnhancing] = useState(false)
  const [isGeneratingTitle, setIsGeneratingTitle] = useState(false)
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false)
  const [editedTitle, setEditedTitle] = useState(generatedTitle || '')
  const [editedSummary, setEditedSummary] = useState(summary || '')
  const [editedContent, setEditedContent] = useState(enhancedContent || originalContent)

  // Redirect if no content
  useEffect(() => {
    if (!originalContent || originalContent.length < 50) {
      const locale = pathname.split('/')[1]
      router.push(`/${locale}/submit2/compose`)
    }
  }, [originalContent, router, pathname])

  // Auto-generate on mount if not already done
  useEffect(() => {
    if (originalContent && !enhancedContent) {
      handleEnhanceText()
    }
    if (originalContent && !generatedTitle) {
      handleGenerateTitle()
    }
    if (originalContent && !summary) {
      handleGenerateSummary()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleEnhanceText = async () => {
    setIsEnhancing(true)
    try {
      const response = await fetch('/api/ai/enhance-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalText: originalContent,
          questionAnswers,
          metadata: {
            category: analysis?.category,
            location: confirmedLocation?.name || analysis?.location?.name,
            time: confirmedTime || analysis?.time?.date,
          },
        }),
      })

      const data = await response.json()
      if (data.enhancedText) {
        setEnhancedContent(data.enhancedText)
        setEditedContent(data.enhancedText)
      }
    } catch (error) {
      console.error('Failed to enhance text:', error)
      setEnhancedContent(originalContent)
      setEditedContent(originalContent)
    } finally {
      setIsEnhancing(false)
    }
  }

  const handleGenerateTitle = async () => {
    setIsGeneratingTitle(true)
    try {
      const response = await fetch('/api/ai/generate-title', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: originalContent,
          category: analysis?.category,
          location: confirmedLocation?.name || analysis?.location?.name,
        }),
      })

      const data = await response.json()
      if (data.title) {
        setGeneratedTitle(data.title)
        setEditedTitle(data.title)
      }
    } catch (error) {
      console.error('Failed to generate title:', error)
    } finally {
      setIsGeneratingTitle(false)
    }
  }

  const handleGenerateSummary = async () => {
    setIsGeneratingSummary(true)
    try {
      const response = await fetch('/api/ai/generate-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: originalContent,
          metadata: {
            category: analysis?.category,
            location: confirmedLocation?.name || analysis?.location?.name,
            time: confirmedTime || analysis?.time?.date,
            witnesses: witnesses.length,
          },
        }),
      })

      const data = await response.json()
      if (data.summary) {
        setSummary(data.summary)
        setEditedSummary(data.summary)
      }
    } catch (error) {
      console.error('Failed to generate summary:', error)
    } finally {
      setIsGeneratingSummary(false)
    }
  }

  const handlePublish = () => {
    // TODO: Implement actual publish logic
    const locale = pathname.split('/')[1]
    router.push(`/${locale}/submit/success`)
  }

  if (!originalContent) {
    return null
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => {
          const locale = pathname.split('/')[1]
          router.push(`/${locale}/submit2/details`)
        }}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Details
      </Button>

      {/* Progress Bar */}
      <div className="mb-8">
        <ProgressBar currentStep={3} />
      </div>

      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">👁️ Preview & Publish</h1>
        <p className="text-muted-foreground">
          Review your enhanced story and publish when ready
        </p>
      </div>

      <div className="space-y-6">
        {/* AI Enhancement Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-purple-200 bg-purple-50">
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <Sparkles className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-purple-900">
                    AI Enhanced Your Story
                  </p>
                  <p className="text-sm text-purple-700">
                    We've naturally integrated your details. You can edit everything or switch back to the original.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Edit className="h-5 w-5 text-purple-500" />
                  Title
                </CardTitle>
                {isGeneratingTitle && (
                  <Loader2 className="h-4 w-4 animate-spin text-purple-600" />
                )}
              </div>
              <CardDescription>AI-generated from your story</CardDescription>
            </CardHeader>
            <CardContent>
              <Input
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                placeholder="Enter a title..."
                className="text-lg font-semibold"
              />
              <p className="text-xs text-muted-foreground mt-2">
                {editedTitle.length}/60 characters
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Content Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Your Story</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={useEnhanced ? 'enhanced' : 'original'} onValueChange={(v) => setUseEnhanced(v === 'enhanced')}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="original">
                    <Eye className="h-4 w-4 mr-2" />
                    Original
                  </TabsTrigger>
                  <TabsTrigger value="enhanced">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Enhanced (Recommended)
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="original" className="mt-4">
                  <Textarea
                    value={originalContent}
                    readOnly
                    className="min-h-[300px] bg-gray-50"
                  />
                </TabsContent>

                <TabsContent value="enhanced" className="mt-4">
                  {isEnhancing ? (
                    <div className="flex items-center justify-center min-h-[300px]">
                      <div className="text-center">
                        <Loader2 className="h-8 w-8 animate-spin text-purple-600 mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">Enhancing your story...</p>
                      </div>
                    </div>
                  ) : (
                    <Textarea
                      value={editedContent}
                      onChange={(e) => setEditedContent(e.target.value)}
                      className="min-h-[300px]"
                    />
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>

        {/* Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Feed Card Summary</CardTitle>
                {isGeneratingSummary && (
                  <Loader2 className="h-4 w-4 animate-spin text-purple-600" />
                )}
              </div>
              <CardDescription>
                This appears on feed cards and search results (5-7 sentences)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={editedSummary}
                onChange={(e) => setEditedSummary(e.target.value)}
                rows={4}
                placeholder="Summary will be generated..."
              />
            </CardContent>
          </Card>
        </motion.div>

        {/* Metadata Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {analysis?.category && (
                <div className="flex items-center gap-2">
                  <Badge>{analysis.category}</Badge>
                  <span className="text-sm text-muted-foreground">Category</span>
                </div>
              )}
              {confirmedLocation?.name && (
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{confirmedLocation.name}</Badge>
                  <span className="text-sm text-muted-foreground">Location ({confirmedLocation.accuracy})</span>
                </div>
              )}
              {confirmedTime && (
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{confirmedTime}</Badge>
                  <span className="text-sm text-muted-foreground">Time</span>
                </div>
              )}
              {witnesses.length > 0 && (
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{witnesses.length} witness(es)</Badge>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-4">
          <Button
            variant="outline"
            className="flex-1"
            size="lg"
            disabled
          >
            💾 Save as Draft
          </Button>
          <Button
            onClick={handlePublish}
            className="flex-1"
            size="lg"
          >
            🚀 Publish Now
          </Button>
        </div>
      </div>
    </div>
  )
}
