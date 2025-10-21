/**
 * Citation Inline Component
 *
 * Renders inline citation numbers [1][2][3] in AI responses.
 * Shows tooltip on hover with experience snippet.
 */

'use client'

import { useState } from 'react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Badge } from '@/components/ui/badge'
import { ExternalLink } from 'lucide-react'

export interface CitationInlineProps {
  citationNumber: number
  experienceId: string
  snippet?: string
  onClick?: () => void
}

export function CitationInline({
  citationNumber,
  experienceId,
  snippet,
  onClick,
}: CitationInlineProps) {
  const [open, setOpen] = useState(false)

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip open={open} onOpenChange={setOpen}>
        <TooltipTrigger asChild>
          <button
            onClick={(e) => {
              e.preventDefault()
              onClick?.()
            }}
            className="inline-flex items-center mx-0.5 align-super text-[0.7em] hover:opacity-80 transition-opacity"
            aria-label={`Citation ${citationNumber}: View source experience`}
          >
            <Badge
              variant="outline"
              className="h-4 px-1 text-[0.9em] font-mono border-primary/30 hover:border-primary/60 cursor-pointer"
            >
              {citationNumber}
            </Badge>
          </button>
        </TooltipTrigger>

        <TooltipContent
          side="top"
          className="max-w-sm p-3 space-y-2"
          sideOffset={5}
        >
          {snippet ? (
            <>
              <p className="text-xs text-muted-foreground">Source #{citationNumber}:</p>
              <p className="text-sm leading-relaxed">{snippet}</p>
              <div className="flex items-center gap-1 text-xs text-primary">
                <ExternalLink className="h-3 w-3" />
                <span>Click to view full experience</span>
              </div>
            </>
          ) : (
            <p className="text-xs">
              Source #{citationNumber} - Click to view experience
            </p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

/**
 * Parse text and insert citation components
 * Usage: {parseCitationsInText(messageText, citations)}
 */
export function parseCitationsInText(
  text: string,
  citations: Array<{
    citationNumber: number
    experienceId: string
    snippet?: string
  }>,
  onCitationClick?: (experienceId: string) => void
): React.ReactNode[] {
  // Pattern: [1], [2], etc.
  const citationPattern = /\[(\d+)\]/g
  const parts: React.ReactNode[] = []
  let lastIndex = 0
  let match

  while ((match = citationPattern.exec(text)) !== null) {
    const citationNum = parseInt(match[1], 10)
    const citation = citations.find((c) => c.citationNumber === citationNum)

    // Add text before citation
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index))
    }

    // Add citation component or plain text if not found
    if (citation) {
      parts.push(
        <CitationInline
          key={`cite-${citationNum}-${match.index}`}
          citationNumber={citation.citationNumber}
          experienceId={citation.experienceId}
          snippet={citation.snippet}
          onClick={() => onCitationClick?.(citation.experienceId)}
        />
      )
    } else {
      // Keep original [1] if citation not found
      parts.push(match[0])
    }

    lastIndex = match.index + match[0].length
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex))
  }

  return parts.length > 0 ? parts : [text]
}
