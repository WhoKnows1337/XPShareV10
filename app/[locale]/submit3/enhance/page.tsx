'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { getLocaleFromPathname } from '@/lib/utils/locale'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { ArrowLeft, ArrowRight, Sparkles, Code } from 'lucide-react'
import { useSubmit3Store } from '@/lib/stores/submit3Store'
import { TextEnhancer } from '@/components/submit3/TextEnhancer'
import { DiffView } from '@/components/submit3/DiffView'

export default function Submit3EnhancePage() {
  const router = useRouter()
  const pathname = usePathname()
  const locale = getLocaleFromPathname(pathname)

  const { originalContent, enhancedContent, setEnhancedContent } = useSubmit3Store()

  const [showDiff, setShowDiff] = useState(false)
  const [tempEnhanced, setTempEnhanced] = useState<string | null>(null)

  // Redirect if no content
  useEffect(() => {
    if (!originalContent || originalContent.length < 50) {
      router.push(`/${locale}/submit3/compose`)
    }
  }, [originalContent, router, locale])

  const handleAccept = (enhanced: string) => {
    setEnhancedContent(enhanced)
    setTempEnhanced(enhanced)
    setShowDiff(true)
  }

  const handleReject = () => {
    setEnhancedContent(null)
    setTempEnhanced(null)
    setShowDiff(false)
  }

  const handleContinue = () => {
    router.push(`/${locale}/submit3/privacy`)
  }

  const handleBack = () => {
    router.push(`/${locale}/submit3/attach`)
  }

  const handleSkip = () => {
    setEnhancedContent(null)
    router.push(`/${locale}/submit3/privacy`)
  }

  if (!originalContent) return null

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Back & Skip */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Button variant="ghost" onClick={handleSkip}>
          Skip Enhancement →
        </Button>
      </div>

      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2 flex items-center justify-center gap-2">
          <Sparkles className="h-8 w-8 text-purple-500" />
          AI Text Enhancement
        </h1>
        <p className="text-muted-foreground">
          Optional: Let AI improve grammar, clarity, and style while preserving your story
        </p>
      </div>

      {/* Text Enhancer */}
      <TextEnhancer
        originalText={originalContent}
        onAccept={handleAccept}
        onReject={handleReject}
      />

      {/* Detailed Diff View */}
      {tempEnhanced && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Switch id="show-diff" checked={showDiff} onCheckedChange={setShowDiff} />
              <Label htmlFor="show-diff" className="cursor-pointer flex items-center gap-2">
                <Code className="h-4 w-4" />
                Show Detailed Changes
              </Label>
            </div>
          </div>

          {showDiff && (
            <DiffView
              original={originalContent}
              enhanced={tempEnhanced}
              showLineByLine={false}
            />
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button variant="outline" onClick={handleBack} className="flex-1" size="lg">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button
          onClick={handleContinue}
          className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          size="lg"
        >
          Continue
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
