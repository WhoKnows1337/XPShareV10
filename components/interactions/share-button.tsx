'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Share2, Check, Copy, Twitter, Facebook, Mail } from 'lucide-react'
import { toast } from 'sonner'

interface ShareButtonProps {
  experienceId: string
  title: string
}

export function ShareButton({ experienceId, title }: ShareButtonProps) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const url = typeof window !== 'undefined' ? `${window.location.origin}/experiences/${experienceId}` : ''
  const shareText = `Check out this experience on XP-Share: ${title}`

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      toast.success('Link copied to clipboard!')
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast.error('Failed to copy link')
    }
  }

  const handleShare = (platform: 'twitter' | 'facebook' | 'email') => {
    let shareUrl = ''

    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(url)}`
        break
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
        break
      case 'email':
        shareUrl = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(shareText + '\n\n' + url)}`
        break
    }

    window.open(shareUrl, '_blank', 'width=600,height=400')
  }

  // Native Web Share API (mobile)
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: shareText,
          url: url,
        })
      } catch (error) {
        // User cancelled or error occurred
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Share2 className="h-4 w-4" />
          <span>Share</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share this experience</DialogTitle>
          <DialogDescription>
            Share this experience with your friends and community
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Copy Link */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={url}
              readOnly
              className="flex-1 px-3 py-2 text-sm border rounded-md bg-muted"
            />
            <Button onClick={handleCopyLink} size="sm" variant="secondary">
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </>
              )}
            </Button>
          </div>

          {/* Social Share Buttons */}
          <div className="grid grid-cols-3 gap-2">
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => handleShare('twitter')}
            >
              <Twitter className="h-4 w-4" />
              Twitter
            </Button>
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => handleShare('facebook')}
            >
              <Facebook className="h-4 w-4" />
              Facebook
            </Button>
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => handleShare('email')}
            >
              <Mail className="h-4 w-4" />
              Email
            </Button>
          </div>

          {/* Native Share (Mobile) */}
          {typeof navigator !== 'undefined' && typeof navigator.share === 'function' && (
            <Button
              variant="default"
              className="w-full gap-2"
              onClick={handleNativeShare}
            >
              <Share2 className="h-4 w-4" />
              Share via...
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
