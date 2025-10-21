'use client'

/**
 * ThreadView Component
 *
 * Nested message threading with reply functionality.
 */

import * as React from 'react'
import { ChevronDown, ChevronRight, CornerDownRight, Reply } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { ThreadedMessage } from '@/lib/threads/thread-builder'
import { BranchButton } from './BranchButton'
import { Response } from '@/components/ai-elements/response'

interface ThreadViewProps {
  message: ThreadedMessage
  depth?: number
  onReply?: (messageId: string) => void
  onBranch?: (messageId: string) => void
  renderCustomContent?: (message: ThreadedMessage) => React.ReactNode
  className?: string
}

export function ThreadView({ message, depth = 0, onReply, onBranch, renderCustomContent, className }: ThreadViewProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(false)
  const hasReplies = message.replies && message.replies.length > 0
  const isNested = depth > 0

  return (
    <div className={cn('relative', className)}>
      {/* Connector Line for nested messages */}
      {isNested && (
        <div className="absolute left-0 top-0 bottom-0 w-px bg-border ml-4" />
      )}

      <div
        className={cn(
          'relative',
          isNested && 'ml-8 pl-4'
        )}
      >
        {/* Message Content */}
        <div className="group relative rounded-lg border bg-card p-4 hover:bg-muted/50 transition-colors">
          {/* Message Header */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm">
                {message.role === 'user' ? 'You' : 'Assistant'}
              </span>
              <span className="text-xs text-muted-foreground">
                {new Date(message.timestamp).toLocaleTimeString()}
              </span>
              {hasReplies && (
                <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                  {message.replies.length} {message.replies.length === 1 ? 'reply' : 'replies'}
                </span>
              )}
              {message.branchId && (
                <span className="text-xs text-muted-foreground bg-primary/10 px-2 py-0.5 rounded-full">
                  Branch
                </span>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {onBranch && (
                <BranchButton
                  messageId={message.id}
                  onBranch={onBranch}
                  className="h-7 w-7 p-0"
                />
              )}
              {onReply && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onReply(message.id)}
                  className="h-7 w-7 p-0"
                  aria-label="Reply to this message"
                >
                  <Reply className="h-3.5 w-3.5" />
                </Button>
              )}
              {hasReplies && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsCollapsed(!isCollapsed)}
                  className="h-7 w-7 p-0"
                  aria-label={isCollapsed ? 'Expand replies' : 'Collapse replies'}
                >
                  {isCollapsed ? (
                    <ChevronRight className="h-3.5 w-3.5" />
                  ) : (
                    <ChevronDown className="h-3.5 w-3.5" />
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* Message Content */}
          <div className="text-sm">
            <Response>{message.content}</Response>
          </div>

          {/* Custom Content (Tool Results, Citations, etc.) */}
          {renderCustomContent && renderCustomContent(message)}

          {/* Reply Indicator (for nested messages) */}
          {isNested && (
            <div className="absolute -left-6 top-6">
              <CornerDownRight className="h-4 w-4 text-muted-foreground" />
            </div>
          )}
        </div>

        {/* Nested Replies */}
        {hasReplies && !isCollapsed && (
          <div className="mt-2 space-y-2">
            {message.replies.map((reply) => (
              <ThreadView
                key={reply.id}
                message={reply}
                depth={depth + 1}
                onReply={onReply}
                onBranch={onBranch}
                renderCustomContent={renderCustomContent}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * ThreadList - Renders a flat list of threaded messages
 */
interface ThreadListProps {
  threads: ThreadedMessage[]
  onReply?: (messageId: string) => void
  onBranch?: (messageId: string) => void
  renderCustomContent?: (message: ThreadedMessage) => React.ReactNode
  className?: string
}

export function ThreadList({ threads, onReply, onBranch, renderCustomContent, className }: ThreadListProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {threads.map((thread) => (
        <ThreadView
          key={thread.id}
          message={thread}
          onReply={onReply}
          onBranch={onBranch}
          renderCustomContent={renderCustomContent}
        />
      ))}
    </div>
  )
}

/**
 * ReplyButton - Standalone button to trigger reply
 */
interface ReplyButtonProps {
  messageId: string
  onReply: (messageId: string) => void
  className?: string
}

export function ReplyButton({ messageId, onReply, className }: ReplyButtonProps) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => onReply(messageId)}
      className={cn('gap-2', className)}
      aria-label="Reply to this message"
    >
      <Reply className="h-4 w-4" />
      <span>Reply</span>
    </Button>
  )
}
