/**
 * Message Actions Component
 *
 * Action buttons for messages: Copy, Edit, Regenerate, Share, Rating
 * Provides rich interaction capabilities for chat messages.
 */

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Copy,
  Edit,
  RefreshCw,
  Share2,
  ThumbsUp,
  ThumbsDown,
  MoreVertical,
  Check,
} from 'lucide-react'
import { toast } from 'sonner'

export interface MessageActionsProps {
  messageId: string
  messageContent: string
  role: 'user' | 'assistant'
  onEdit?: (messageId: string) => void
  onRegenerate?: (messageId: string) => void
  onRate?: (messageId: string, rating: 'positive' | 'negative') => void
  currentRating?: 'positive' | 'negative' | null
}

export function MessageActions({
  messageId,
  messageContent,
  role,
  onEdit,
  onRegenerate,
  onRate,
  currentRating,
}: MessageActionsProps) {
  const [copied, setCopied] = useState(false)
  const [rating, setRating] = useState<'positive' | 'negative' | null>(currentRating || null)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(messageContent)
      setCopied(true)
      toast.success('Copied to clipboard')
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast.error('Failed to copy')
    }
  }

  function handleShare() {
    if (navigator.share) {
      navigator.share({
        title: 'XPShare Discovery',
        text: messageContent,
      }).catch(() => {
        // User cancelled share, ignore
      })
    } else {
      // Fallback: copy to clipboard
      handleCopy()
    }
  }

  function handleRate(newRating: 'positive' | 'negative') {
    const finalRating = rating === newRating ? null : newRating
    setRating(finalRating)
    if (finalRating) {
      onRate?.(messageId, finalRating)
      toast.success(finalRating === 'positive' ? 'Thanks for your feedback!' : 'Feedback received')
    }
  }

  return (
    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
      <TooltipProvider delayDuration={300}>
        {/* Copy Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={handleCopy}
              aria-label="Copy message"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-green-500" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>Copy</TooltipContent>
        </Tooltip>

        {/* Edit Button (User messages only) */}
        {role === 'user' && onEdit && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={() => onEdit(messageId)}
                aria-label="Edit message"
              >
                <Edit className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Edit</TooltipContent>
          </Tooltip>
        )}

        {/* Regenerate Button (Assistant messages only) */}
        {role === 'assistant' && onRegenerate && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={() => onRegenerate(messageId)}
                aria-label="Regenerate response"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Regenerate</TooltipContent>
          </Tooltip>
        )}

        {/* Rating Buttons (Assistant messages only) */}
        {role === 'assistant' && onRate && (
          <>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-7 w-7 p-0 ${
                    rating === 'positive' ? 'text-green-500' : ''
                  }`}
                  onClick={() => handleRate('positive')}
                  aria-label="Thumbs up"
                >
                  <ThumbsUp className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Good response</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-7 w-7 p-0 ${
                    rating === 'negative' ? 'text-red-500' : ''
                  }`}
                  onClick={() => handleRate('negative')}
                  aria-label="Thumbs down"
                >
                  <ThumbsDown className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Poor response</TooltipContent>
            </Tooltip>
          </>
        )}

        {/* More Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
              <MoreVertical className="h-3.5 w-3.5" />
              <span className="sr-only">More actions</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleCopy}>
              <Copy className="h-4 w-4 mr-2" />
              Copy
            </DropdownMenuItem>
            {role === 'user' && onEdit && (
              <DropdownMenuItem onClick={() => onEdit(messageId)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
            )}
            {role === 'assistant' && onRegenerate && (
              <DropdownMenuItem onClick={() => onRegenerate(messageId)}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Regenerate
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={handleShare}>
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TooltipProvider>
    </div>
  )
}

/**
 * Compact version for mobile
 */
export function CompactMessageActions(props: MessageActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <MoreVertical className="h-4 w-4" />
          <span className="sr-only">Message actions</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => navigator.clipboard.writeText(props.messageContent)}>
          <Copy className="h-4 w-4 mr-2" />
          Copy
        </DropdownMenuItem>
        {props.role === 'user' && props.onEdit && (
          <DropdownMenuItem onClick={() => props.onEdit?.(props.messageId)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </DropdownMenuItem>
        )}
        {props.role === 'assistant' && props.onRegenerate && (
          <DropdownMenuItem onClick={() => props.onRegenerate?.(props.messageId)}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Regenerate
          </DropdownMenuItem>
        )}
        {props.role === 'assistant' && props.onRate && (
          <>
            <DropdownMenuItem onClick={() => props.onRate?.(props.messageId, 'positive')}>
              <ThumbsUp className="h-4 w-4 mr-2" />
              Good response
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => props.onRate?.(props.messageId, 'negative')}>
              <ThumbsDown className="h-4 w-4 mr-2" />
              Poor response
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuItem
          onClick={() => {
            if (navigator.share) {
              navigator.share({ title: 'XPShare Discovery', text: props.messageContent })
            }
          }}
        >
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
