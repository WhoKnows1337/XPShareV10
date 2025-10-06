'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Mic, Image as ImageIcon, Sparkles } from 'lucide-react'

export default function SubmitPage() {
  const router = useRouter()
  const [text, setText] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)

  const handleContinue = () => {
    if (text.trim()) {
      // Store in localStorage for now
      localStorage.setItem('experience_draft', JSON.stringify({ text }))
      router.push('/submit/analyze')
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-2">Share Your Experience</h1>
        <p className="text-muted-foreground">
          Tell us what happened. You can type, speak, or upload photos.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>What happened?</CardTitle>
          <CardDescription>
            Describe your experience in your own words. Don't worry about details yet – we'll help you with that.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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
            className={`min-h-[150px] transition-all duration-300 ${
              isExpanded ? 'min-h-[300px]' : ''
            }`}
          />

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" className="flex items-center gap-2">
              <Mic className="h-4 w-4" />
              Record Audio
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              Upload Photo
            </Button>
          </div>

          {/* Character Counter */}
          <div className="text-sm text-muted-foreground">
            {text.length} characters
            {text.length >= 50 && (
              <span className="ml-2 text-green-600 flex items-center gap-1 inline-flex">
                <Sparkles className="h-3 w-3" />
                Ready for AI analysis
              </span>
            )}
          </div>

          {/* Continue Button */}
          <Button
            onClick={handleContinue}
            disabled={text.length < 50}
            className="w-full"
            size="lg"
          >
            Continue to AI Analysis →
          </Button>

          {text.length > 0 && text.length < 50 && (
            <p className="text-sm text-amber-600">
              Please write at least 50 characters to continue ({50 - text.length} more needed)
            </p>
          )}
        </CardContent>
      </Card>

      {/* Tips */}
      <div className="mt-6 p-4 bg-muted rounded-lg">
        <h3 className="font-semibold mb-2">Tips for sharing:</h3>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Don't worry about being perfect – just tell your story</li>
          <li>• Our AI will help you categorize and add details later</li>
          <li>• You can add photos, audio, and sketches in the next steps</li>
        </ul>
      </div>
    </div>
  )
}
