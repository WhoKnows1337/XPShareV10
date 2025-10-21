/**
 * Share Dialog Component
 *
 * Create and manage share links for conversations.
 */

'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Share2, Copy, Check, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export interface ShareDialogProps {
  chatId: string
  trigger?: React.ReactNode
}

export function ShareDialog({ chatId, trigger }: ShareDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [shareUrl, setShareUrl] = useState<string | null>(null)
  const [expiresIn, setExpiresIn] = useState<string>('never')
  const [copied, setCopied] = useState(false)

  const handleCreateShare = async () => {
    try {
      setLoading(true)

      const expiresInHours = expiresIn === 'never' ? null : parseInt(expiresIn)

      const res = await fetch('/api/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId,
          expiresIn: expiresInHours,
        }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to create share link')
      }

      setShareUrl(data.shareUrl)
      toast.success('Share link created!')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create share link')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async () => {
    if (!shareUrl) return

    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      toast.success('Link copied to clipboard')
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast.error('Failed to copy link')
    }
  }

  const handleReset = () => {
    setShareUrl(null)
    setExpiresIn('never')
    setCopied(false)
  }

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      setOpen(newOpen)
      if (!newOpen) {
        setTimeout(handleReset, 200) // Reset after dialog closes
      }
    }}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Conversation</DialogTitle>
          <DialogDescription>
            Create a link to share this conversation with others
          </DialogDescription>
        </DialogHeader>

        {!shareUrl ? (
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="expiry">Link expires after</Label>
              <Select value={expiresIn} onValueChange={setExpiresIn}>
                <SelectTrigger id="expiry">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="never">Never</SelectItem>
                  <SelectItem value="1">1 hour</SelectItem>
                  <SelectItem value="24">24 hours</SelectItem>
                  <SelectItem value="168">7 days</SelectItem>
                  <SelectItem value="720">30 days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleCreateShare}
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating link...
                </>
              ) : (
                <>
                  <Share2 className="h-4 w-4 mr-2" />
                  Create Share Link
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="share-url">Share Link</Label>
              <div className="flex gap-2">
                <Input
                  id="share-url"
                  value={shareUrl}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopy}
                  aria-label="Copy link"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleReset}
                className="flex-1"
              >
                Create New Link
              </Button>
              <Button
                onClick={() => setOpen(false)}
                className="flex-1"
              >
                Done
              </Button>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              {expiresIn === 'never'
                ? 'This link never expires'
                : `This link expires in ${expiresIn === '1' ? '1 hour' : expiresIn === '24' ? '24 hours' : expiresIn === '168' ? '7 days' : '30 days'}`}
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
