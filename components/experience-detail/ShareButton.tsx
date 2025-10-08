'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Share2, Copy, Check, Facebook, Twitter } from 'lucide-react'

interface ShareButtonProps {
  experienceId: string
  title: string
}

export function ShareButton({ experienceId, title }: ShareButtonProps) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/experiences/${experienceId}`
    : ''

  const handleShare = async () => {
    // Try native share first (mobile)
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: `Check out this experience: ${title}`,
          url: shareUrl,
        })
        return
      } catch (err) {
        // User cancelled or error - fallback to sheet
      }
    }

    // Fallback to custom sheet
    setOpen(true)
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy link', err)
    }
  }

  const shareToTwitter = () => {
    const text = encodeURIComponent(`Check out this experience: ${title}`)
    const url = encodeURIComponent(shareUrl)
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank')
  }

  const shareToFacebook = () => {
    const url = encodeURIComponent(shareUrl)
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank')
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleShare}
        aria-label="Share this experience"
      >
        <Share2 className="w-4 h-4" aria-hidden="true" />
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Share Experience</SheetTitle>
            <SheetDescription>
              Share this experience with others
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-4 mt-6">
            {/* Social Share Buttons */}
            <div className="space-y-2">
              <p className="text-sm font-medium">Share on social media</p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={shareToTwitter}
                >
                  <Twitter className="w-4 h-4 mr-2" />
                  Twitter
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={shareToFacebook}
                >
                  <Facebook className="w-4 h-4 mr-2" />
                  Facebook
                </Button>
              </div>
            </div>

            {/* Copy Link */}
            <div className="space-y-2">
              <p className="text-sm font-medium">Or copy link</p>
              <div className="flex gap-2">
                <Input value={shareUrl} readOnly className="flex-1" />
                <Button onClick={copyToClipboard} variant="outline">
                  {copied ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
