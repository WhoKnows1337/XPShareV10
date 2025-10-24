'use client'

/**
 * Agent Network Chat Component with Extended Thinking Visualization
 *
 * Features:
 * - Real-time streaming from Agent Network v3 API
 * - Thinking indicators (Extended Thinking Mode)
 * - Tool call visualization
 * - Complexity score display
 * - Event-based updates
 */

import { useState, useRef, useEffect } from 'react'
import { Send, Loader2, Brain, Wrench, Zap, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

// Types
interface NetworkEvent {
  type: string
  payload: any
  metadata: {
    thinkingMode: 'standard' | 'extended'
    complexityScore: number
    timestamp: number
  }
}

interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  thinkingMode?: 'standard' | 'extended'
  complexityScore?: number
  toolCalls?: Array<{
    tool: string
    status: 'running' | 'completed' | 'error'
    result?: any
  }>
  timestamp: number
}

interface AgentNetworkChatProps {
  className?: string
  threadId?: string
  onMessageSent?: (message: string) => void
  onThinkingStart?: (mode: 'standard' | 'extended') => void
}

export function AgentNetworkChat({
  className,
  threadId,
  onMessageSent,
  onThinkingStart,
}: AgentNetworkChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isThinking, setIsThinking] = useState(false)
  const [currentThinkingMode, setCurrentThinkingMode] = useState<'standard' | 'extended' | null>(
    null
  )
  const [currentComplexity, setCurrentComplexity] = useState<number | null>(null)
  const [activeToolCalls, setActiveToolCalls] = useState<string[]>([])

  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages, isThinking])

  // Send message to Agent Network
  const sendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: input,
      timestamp: Date.now(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)
    setIsThinking(false)
    setActiveToolCalls([])

    onMessageSent?.(userMessage.content)

    try {
      // Create abort controller for cancellation
      abortControllerRef.current = new AbortController()

      // Call Agent Network v3 API
      const response = await fetch('/api/discover-v3', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            ...messages.map((m) => ({ role: m.role, content: m.content })),
            { role: 'user', content: userMessage.content },
          ],
          locale: 'en',
          threadId: threadId || `thread-${Date.now()}`,
        }),
        signal: abortControllerRef.current.signal,
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      // Get thinking mode from headers
      const thinkingMode = (response.headers.get('X-Thinking-Mode') as
        | 'standard'
        | 'extended'
        | null) || 'standard'
      const complexityScore = parseFloat(response.headers.get('X-Complexity-Score') || '0')

      setCurrentThinkingMode(thinkingMode)
      setCurrentComplexity(complexityScore)

      onThinkingStart?.(thinkingMode)

      // Parse Server-Sent Events
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      let assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: '',
        thinkingMode,
        complexityScore,
        toolCalls: [],
        timestamp: Date.now(),
      }

      let buffer = ''

      while (reader) {
        const { done, value } = await reader.read()

        if (done) {
          break
        }

        // Decode chunk
        buffer += decoder.decode(value, { stream: true })

        // Split by newlines (SSE format)
        const lines = buffer.split('\n')
        buffer = lines.pop() || '' // Keep incomplete line in buffer

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6) // Remove "data: " prefix

            if (data === '[DONE]') {
              // Stream complete
              setIsThinking(false)
              setIsLoading(false)
              setActiveToolCalls([])
              continue
            }

            try {
              const event: NetworkEvent = JSON.parse(data)

              // Handle different event types
              switch (event.type) {
                case 'routing-agent-start':
                  setIsThinking(true)
                  break

                case 'routing-agent-end':
                  setIsThinking(false)
                  break

                case 'tool-execution-start':
                  // Tool started
                  const toolName = event.payload.toolName || event.payload.name
                  setActiveToolCalls((prev) => [...prev, toolName])

                  assistantMessage.toolCalls?.push({
                    tool: toolName,
                    status: 'running',
                  })

                  // Update message to show tool call
                  setMessages((prev) => [...prev.slice(0, -1), { ...assistantMessage }])
                  break

                case 'tool-execution-end':
                  // Tool completed
                  const completedTool = event.payload.toolName || event.payload.name
                  setActiveToolCalls((prev) => prev.filter((t) => t !== completedTool))

                  // Update tool call status
                  if (assistantMessage.toolCalls) {
                    const toolCall = assistantMessage.toolCalls.find(
                      (tc) => tc.tool === completedTool && tc.status === 'running'
                    )
                    if (toolCall) {
                      toolCall.status = 'completed'
                      toolCall.result = event.payload.result
                    }
                  }
                  break

                case 'agent-execution-event-text-delta':
                  // Streaming text
                  const textDelta = event.payload.textDelta || event.payload.text || ''
                  assistantMessage.content += textDelta

                  // Update message
                  setMessages((prev) => {
                    const lastMessage = prev[prev.length - 1]
                    if (lastMessage?.role === 'assistant' && lastMessage.id === assistantMessage.id) {
                      return [...prev.slice(0, -1), { ...assistantMessage }]
                    } else {
                      return [...prev, { ...assistantMessage }]
                    }
                  })
                  break

                case 'network-execution-event-step-finish':
                  // Step completed
                  console.log('[Agent Network] Step finished:', event.payload)
                  break

                default:
                  // Other events
                  console.log('[Agent Network] Event:', event.type, event.payload)
              }
            } catch (error) {
              console.error('[Agent Network] Failed to parse event:', error)
            }
          }
        }
      }

      // Finalize message
      setMessages((prev) => {
        const lastMessage = prev[prev.length - 1]
        if (lastMessage?.role === 'assistant') {
          return prev
        } else {
          return [...prev, assistantMessage]
        }
      })
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('[Agent Network] Request cancelled')
      } else {
        console.error('[Agent Network] Error:', error)

        setMessages((prev) => [
          ...prev,
          {
            id: `error-${Date.now()}`,
            role: 'system',
            content: `Error: ${error.message}`,
            timestamp: Date.now(),
          },
        ])
      }
    } finally {
      setIsLoading(false)
      setIsThinking(false)
      setActiveToolCalls([])
    }
  }

  // Cancel current request
  const cancelRequest = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      setIsLoading(false)
      setIsThinking(false)
      setActiveToolCalls([])
    }
  }

  return (
    <Card className={cn('flex flex-col h-[600px]', className)}>
      {/* Header with Thinking Mode Indicator */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-500" />
          <h3 className="font-semibold">Agent Network v3</h3>
        </div>

        {currentThinkingMode && (
          <div className="flex items-center gap-2">
            <Badge
              variant={currentThinkingMode === 'extended' ? 'default' : 'secondary'}
              className="gap-1"
            >
              {currentThinkingMode === 'extended' ? (
                <>
                  <Zap className="w-3 h-3" />
                  Extended Thinking
                </>
              ) : (
                <>
                  <Zap className="w-3 h-3" />
                  Standard
                </>
              )}
            </Badge>

            {currentComplexity !== null && (
              <Badge variant="outline" className="gap-1">
                <TrendingUp className="w-3 h-3" />
                {(currentComplexity * 100).toFixed(0)}% Complex
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                'flex gap-3',
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              <div
                className={cn(
                  'max-w-[80%] rounded-lg p-3',
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : message.role === 'system'
                      ? 'bg-destructive/10 text-destructive'
                      : 'bg-muted'
                )}
              >
                {/* Tool Calls */}
                {message.toolCalls && message.toolCalls.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {message.toolCalls.map((toolCall, idx) => (
                      <Badge
                        key={idx}
                        variant={
                          toolCall.status === 'running'
                            ? 'default'
                            : toolCall.status === 'completed'
                              ? 'secondary'
                              : 'destructive'
                        }
                        className="gap-1 text-xs"
                      >
                        <Wrench className="w-3 h-3" />
                        {toolCall.tool}
                        {toolCall.status === 'running' && (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        )}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Message Content */}
                <p className="whitespace-pre-wrap text-sm">{message.content}</p>

                {/* Metadata */}
                {message.thinkingMode && (
                  <div className="mt-2 text-xs opacity-70">
                    {message.thinkingMode === 'extended' ? '🧠 Extended Thinking' : '⚡ Standard'} •
                    Complexity: {((message.complexityScore || 0) * 100).toFixed(0)}%
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Thinking Indicator */}
          {isThinking && (
            <div className="flex gap-3 justify-start">
              <div className="bg-muted rounded-lg p-3 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-purple-500" />
                <span className="text-sm text-muted-foreground">
                  Claude is thinking{currentThinkingMode === 'extended' && ' deeply'}...
                </span>
              </div>
            </div>
          )}

          {/* Active Tool Calls */}
          {activeToolCalls.length > 0 && !isThinking && (
            <div className="flex gap-3 justify-start">
              <div className="bg-muted rounded-lg p-3">
                <div className="flex flex-wrap gap-1">
                  {activeToolCalls.map((tool, idx) => (
                    <Badge key={idx} variant="default" className="gap-1 text-xs">
                      <Wrench className="w-3 h-3" />
                      {tool}
                      <Loader2 className="w-3 h-3 animate-spin" />
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            sendMessage()
          }}
          className="flex gap-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about experiences... (e.g., 'Compare UFO trends in Berlin vs Paris')"
            disabled={isLoading}
            className="flex-1"
          />

          {isLoading ? (
            <Button type="button" onClick={cancelRequest} variant="destructive" size="icon">
              <Loader2 className="w-4 h-4 animate-spin" />
            </Button>
          ) : (
            <Button type="submit" disabled={!input.trim()} size="icon">
              <Send className="w-4 h-4" />
            </Button>
          )}
        </form>

        {currentThinkingMode && (
          <p className="mt-2 text-xs text-muted-foreground">
            {currentThinkingMode === 'extended'
              ? '🧠 Extended Thinking Mode: Deep reasoning (~10s per query)'
              : '⚡ Standard Mode: Fast responses (~3s per query)'}
          </p>
        )}
      </div>
    </Card>
  )
}
