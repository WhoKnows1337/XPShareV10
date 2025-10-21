/**
 * Shared Chat View Page
 *
 * Read-only view of a shared chat.
 * Accessible via /share/[token]
 */

'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Copy, Check, Eye, Clock } from 'lucide-react'
import { toast } from 'sonner'
import { Message, MessageContent } from '@/components/ai-elements/message'
import { Response } from '@/components/ai-elements/response'
import { ToolRenderer } from '@/components/discover/ToolRenderer'
import { formatDistanceToNow } from 'date-fns'

interface SharedChatData {
  chat: {
    id: string
    title: string
    created_at: string
    updated_at: string
  }
  messages: any[]
  expiresAt: string | null
  viewCount: number
}

export default function SharedChatPage() {
  const params = useParams()
  const token = params.token as string
  const [data, setData] = useState<SharedChatData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    async function loadSharedChat() {
      try {
        setLoading(true)
        const res = await fetch(`/api/share?token=${token}`)
        const result = await res.json()

        if (!res.ok || !result.success) {
          setError(result.error || 'Failed to load shared chat')
          return
        }

        setData(result)
      } catch (err) {
        setError('Failed to load shared chat')
      } finally {
        setLoading(false)
      }
    }

    if (token) {
      loadSharedChat()
    }
  }, [token])

  const handleCopyConversation = async () => {
    if (!data) return

    const text = data.messages
      .map((m) => {
        const role = m.role === 'user' ? 'You' : 'Assistant'
        const content = m.parts?.find((p: any) => p.type === 'text')?.text || m.content || ''
        return `${role}: ${content}`
      })
      .join('\n\n')

    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      toast.success('Conversation copied to clipboard')
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast.error('Failed to copy')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <p className="text-muted-foreground">Loading shared conversation...</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-3 max-w-md">
          <h2 className="text-2xl font-bold">Unable to load conversation</h2>
          <p className="text-muted-foreground">
            {error || 'This share link may have expired or been removed.'}
          </p>
          <Button onClick={() => (window.location.href = '/discover')}>
            Go to Discovery
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold truncate">{data.chat.title}</h1>
              <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground flex-wrap">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Shared {formatDistanceToNow(new Date(data.chat.created_at), { addSuffix: true })}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  {data.viewCount} {data.viewCount === 1 ? 'view' : 'views'}
                </span>
                {data.expiresAt && (
                  <Badge variant="outline" className="text-xs">
                    Expires {formatDistanceToNow(new Date(data.expiresAt), { addSuffix: true })}
                  </Badge>
                )}
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyConversation}
              className="flex-shrink-0"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Conversation
                </>
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Messages */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="space-y-4">
          {data.messages.map((message, index) => {
            const previousMessage = index > 0 ? data.messages[index - 1] : undefined
            const isGrouped = previousMessage?.role === message.role

            return (
              <div key={message.id || index} className={isGrouped ? 'mt-1' : 'mt-4'}>
                <Message from={message.role}>
                  <div className="flex flex-col gap-1 w-full">
                    {message.parts?.map((part: any, i: number) => {
                      if (part.type === 'text') {
                        return (
                          <MessageContent key={i} variant="flat">
                            <Response>{part.text}</Response>
                          </MessageContent>
                        )
                      }

                      if (part.type?.startsWith('tool-')) {
                        return (
                          <ToolRenderer
                            key={i}
                            part={part}
                            onRetry={undefined} // Disabled in shared view
                            onSuggestionClick={undefined} // Disabled in shared view
                          />
                        )
                      }

                      return null
                    })}
                  </div>
                </Message>
              </div>
            )
          })}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-12 py-6 text-center text-xs text-muted-foreground">
        <p>
          This is a read-only shared view from{' '}
          <a href="/" className="text-primary hover:underline">
            XPShare Discovery
          </a>
        </p>
      </footer>
    </div>
  )
}
