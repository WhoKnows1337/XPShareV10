'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Sparkles, RefreshCw, Check, X, Eye, FileText, Zap } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface TextEnhancerProps {
  originalText: string
  onAccept: (enhancedText: string) => void
  onReject: () => void
}

export function TextEnhancer({ originalText, onAccept, onReject }: TextEnhancerProps) {
  const [isEnhancing, setIsEnhancing] = useState(false)
  const [enhancedText, setEnhancedText] = useState<string | null>(null)
  const [showComparison, setShowComparison] = useState(false)
  const [activeTab, setActiveTab] = useState<'original' | 'enhanced'>('original')

  const handleEnhance = async () => {
    setIsEnhancing(true)

    // Simulate AI enhancement (replace with actual API call)
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Mock enhanced text with improvements
    const enhanced = improvText(originalText)
    setEnhancedText(enhanced)
    setIsEnhancing(false)
    setActiveTab('enhanced')
    setShowComparison(true)
  }

  const handleAccept = () => {
    if (enhancedText) {
      onAccept(enhancedText)
    }
  }

  const handleRegenerate = async () => {
    setIsEnhancing(true)
    await new Promise((resolve) => setTimeout(resolve, 2000))
    const enhanced = improvText(originalText)
    setEnhancedText(enhanced)
    setIsEnhancing(false)
  }

  // Mock text improvement function (replace with actual AI)
  const improvText = (text: string): string => {
    // Simple mock: capitalize sentences, fix spacing, add descriptive words
    let improved = text
      .replace(/\s+/g, ' ')
      .replace(/\.\s*([a-z])/g, (match, char) => `. ${char.toUpperCase()}`)
      .trim()

    // Add some descriptive enhancements
    improved = improved
      .replace(/\bsaw\b/g, 'witnessed')
      .replace(/\bbig\b/g, 'massive')
      .replace(/\bvery\b/g, 'extremely')

    return improved
  }

  const getChangeSummary = () => {
    if (!enhancedText) return null

    const originalWords = originalText.split(/\s+/).length
    const enhancedWords = enhancedText.split(/\s+/).length
    const wordDiff = enhancedWords - originalWords

    return {
      originalWords,
      enhancedWords,
      wordDiff,
      percentChange: ((wordDiff / originalWords) * 100).toFixed(1),
    }
  }

  const summary = getChangeSummary()

  return (
    <div className="space-y-4">
      {/* Enhancement Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-xl flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-500" />
                AI Text Enhancement
              </CardTitle>
              <CardDescription>
                Improve clarity, grammar, and style while preserving your story
              </CardDescription>
            </div>

            {!enhancedText && !isEnhancing && (
              <Button onClick={handleEnhance} className="ml-4">
                <Zap className="mr-2 h-4 w-4" />
                Enhance
              </Button>
            )}
          </div>

          {/* Summary Stats */}
          {summary && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-2 mt-3"
            >
              <Badge variant="secondary" className="text-xs">
                {summary.originalWords} → {summary.enhancedWords} words
              </Badge>
              <Badge
                variant={Number(summary.percentChange) > 0 ? 'default' : 'outline'}
                className="text-xs"
              >
                {summary.wordDiff > 0 ? '+' : ''}
                {summary.percentChange}%
              </Badge>
            </motion.div>
          )}
        </CardHeader>

        <CardContent>
          <AnimatePresence mode="wait">
            {/* Loading State */}
            {isEnhancing && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-12 text-center space-y-4"
              >
                <div className="relative mx-auto w-16 h-16">
                  <motion.div
                    className="absolute inset-0 rounded-full border-4 border-purple-200"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  />
                  <motion.div
                    className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-600"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                  />
                  <Sparkles className="absolute inset-0 m-auto h-6 w-6 text-purple-600" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Analyzing and enhancing your text...
                </p>
              </motion.div>
            )}

            {/* Comparison View */}
            {!isEnhancing && enhancedText && (
              <motion.div
                key="enhanced"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="original" className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Original
                    </TabsTrigger>
                    <TabsTrigger value="enhanced" className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      Enhanced
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="original" className="mt-4">
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 min-h-[200px] whitespace-pre-wrap">
                      {originalText}
                    </div>
                  </TabsContent>

                  <TabsContent value="enhanced" className="mt-4">
                    <div className="p-4 bg-purple-50 rounded-lg border border-purple-200 min-h-[200px] whitespace-pre-wrap">
                      {enhancedText}
                    </div>
                  </TabsContent>
                </Tabs>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" onClick={handleRegenerate} className="flex-1">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Regenerate
                  </Button>
                  <Button variant="outline" onClick={onReject} className="flex-1">
                    <X className="mr-2 h-4 w-4" />
                    Keep Original
                  </Button>
                  <Button
                    onClick={handleAccept}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600"
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Use Enhanced
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Initial State */}
            {!isEnhancing && !enhancedText && (
              <motion.div
                key="initial"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-8 text-center space-y-4"
              >
                <div className="w-16 h-16 mx-auto rounded-full bg-purple-100 flex items-center justify-center">
                  <Sparkles className="h-8 w-8 text-purple-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 mb-1">
                    Improve your text with AI
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Click "Enhance" to improve grammar, clarity, and style
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Enhancement Tips */}
      {!enhancedText && (
        <Card className="border-purple-200 bg-purple-50/50">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                <Eye className="h-4 w-4 text-purple-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-sm mb-1">What will be improved?</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>✓ Grammar and spelling corrections</li>
                  <li>✓ Clarity and readability enhancements</li>
                  <li>✓ More descriptive and engaging language</li>
                  <li>✓ Consistent tone and style</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
