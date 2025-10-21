'use client'

import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ChatSidebar } from '@/components/discover/ChatSidebar'
import { useDiscoveryChats } from '@/hooks/useDiscoveryChats'
import { generateChatTitle } from '@/lib/utils/generate-title'
import { useAutoResume } from '@/hooks/useAutoResume'
import { generateId } from '@/lib/utils'
import { ToolRenderer } from '@/components/discover/ToolRenderer'
import { getRelativeTimestamp, shouldShowDateSeparator, getDateSeparatorText, isMessageGrouped } from '@/lib/utils/message-formatting'
import { TypingIndicator } from '@/components/discover/TypingIndicator'
import { usePersistedChat } from '@/hooks/usePersistedChat'
import { Message, MessageContent } from '@/components/ai-elements/message'
import { Response } from '@/components/ai-elements/response'
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
  ConversationEmptyState,
} from '@/components/ai-elements/conversation'
import { Suggestion } from '@/components/ai-elements/suggestion'
import {
  PromptInput,
  PromptInputBody,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputTools,
  PromptInputActionMenu,
  PromptInputActionMenuTrigger,
  PromptInputActionMenuContent,
  PromptInputActionAddAttachments,
  PromptInputSpeechButton,
  PromptInputSubmit,
} from '@/components/ai-elements/prompt-input'
import { Send, Paperclip, Mic } from 'lucide-react'

/**
 * AI Discovery Interface
 * Using AI SDK UI (useChat) - Recommended approach for streaming with visualizations
 *
 * Features:
 * - Client-side streaming with useChat
 * - Tool calling with visualization rendering
 * - No RSC Client Manifest issues
 */

export default function DiscoverPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [currentChatId, setCurrentChatId] = useState<string | null>(null)
  const [chatHasTitle, setChatHasTitle] = useState(false)
  const [initialMessages, setInitialMessages] = useState<any[]>([])
  const { createChat, loadMessages, saveMessages, updateChatTitle, loadChats } = useDiscoveryChats()

  const { messages, sendMessage, status, setMessages, resumeStream } = useChat({
    id: currentChatId || undefined,
    messages: initialMessages,
    generateId,
    experimental_throttle: 100,
    transport: new DefaultChatTransport({
      api: '/api/discover',
    }),
  })
  const [input, setInput] = useState('')
  const isLoading = status === 'submitted' || status === 'streaming'

  // Auto-resume interrupted streams
  useAutoResume({
    autoResume: true,
    initialMessages,
    resumeStream,
    setMessages,
  })

  const suggestions = [
    'Show UFO sightings in California', // geoSearch
    'Analyze dream patterns over time', // temporalAnalysis
    'Find top contributors', // rankUsers
    'Detect patterns in psychic experiences', // detectPatterns + generateInsights
    'Predict NDE trends', // predictTrends
    'Compare UFO and dream categories', // compareCategory
  ]

  // Conversation Persistence (legacy - kept for export)
  const { clearHistory, exportHistory } = usePersistedChat({
    messages,
    onRestore: (restored) => {
      setMessages(restored)
    },
  })

  // Handle chat selection
  const handleChatSelect = useCallback(async (chatId: string) => {
    // Always allow selection to ensure UI updates properly
    setCurrentChatId(chatId)
    setChatHasTitle(true) // Assume existing chats have titles

    // Only reload messages if switching to a different chat
    if (chatId !== currentChatId) {
      const loadedMessages = await loadMessages(chatId)
      if (loadedMessages) {
        setInitialMessages(loadedMessages)
        setMessages(loadedMessages)
      }
    }

    // Update URL without triggering reload
    router.push(`/discover?chat=${chatId}`, { scroll: false })
  }, [currentChatId, router, loadMessages, setMessages])

  // Handle new chat creation
  const handleNewChat = useCallback(async () => {
    const newChatId = await createChat()
    if (newChatId) {
      setCurrentChatId(newChatId)
      setChatHasTitle(false)
      setInitialMessages([])
      setMessages([])
      await loadChats() // Refresh sidebar to show new chat immediately
      router.push(`/discover?chat=${newChatId}`, { scroll: false })
    }
  }, [router, createChat, setMessages, loadChats])

  // Load chat from URL parameter on initial mount or URL change
  useEffect(() => {
    const chatId = searchParams.get('chat')
    if (chatId && chatId !== currentChatId) {
      // Update state to match URL (source of truth)
      setCurrentChatId(chatId)
      setChatHasTitle(true)

      loadMessages(chatId).then((loadedMessages) => {
        if (loadedMessages) {
          setInitialMessages(loadedMessages)
          setMessages(loadedMessages)
        }
      })
    }
  }, [searchParams]) // Only depend on searchParams to avoid race conditions

  // Auto-save messages when they change and generate title for first message
  // Only save when streaming is complete to avoid race conditions
  useEffect(() => {
    if (currentChatId && messages.length > 0 && !isLoading) {
      // Debounce: only save after streaming is complete
      const timeoutId = setTimeout(() => {
        saveMessages(currentChatId, messages).catch((err) => {
          console.error('Failed to save messages:', err)
          // Don't retry automatically to avoid error loops
        })
      }, 500) // Wait 500ms after last update

      // Generate title from first user message if chat doesn't have one
      if (!chatHasTitle && messages.length >= 1) {
        const firstUserMessage = messages.find((m) => m.role === 'user')
        if (firstUserMessage) {
          const messageText =
            firstUserMessage.parts?.find((p: any) => p.type === 'text')?.text ||
            (firstUserMessage as any).content

          if (messageText) {
            generateChatTitle(messageText).then(async (title) => {
              await updateChatTitle(currentChatId, title)
              await loadChats() // Refresh sidebar to show new title
              setChatHasTitle(true)
            })
          }
        }
      }

      return () => clearTimeout(timeoutId)
    }
  }, [messages, currentChatId, isLoading, chatHasTitle, updateChatTitle, saveMessages, loadChats])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input?.trim() || isLoading) return
    sendMessage({ text: input })
    setInput('')
  }

  const handleSuggestionClick = (suggestion: string) => {
    if (isLoading) return
    sendMessage({ text: suggestion })
  }

  const handleClearHistory = () => {
    if (confirm('Are you sure you want to clear the conversation history?')) {
      clearHistory()
      setMessages([])
    }
  }

  const handleRetry = (query: string) => {
    if (isLoading) return
    sendMessage({ text: query })
  }

  return (
    <div className="h-[calc(100dvh-4rem)] w-full flex overflow-hidden">
      {/* Sidebar */}
      <ChatSidebar
        currentChatId={currentChatId}
        onChatSelect={handleChatSelect}
        onNewChat={handleNewChat}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header - Only show Export/Clear when messages exist */}
        {messages.length > 0 && (
        <div className="py-2 flex-shrink-0">
          <div className="max-w-4xl mx-auto px-4 flex items-center justify-end">
            <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={exportHistory}
              aria-label="Export conversation"
            >
              Export
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearHistory}
              aria-label="Clear conversation history"
            >
              Clear
            </Button>
            </div>
          </div>
        </div>
      )}

      {/* Scrollable Conversation Area */}
      <Conversation className="flex-1 min-h-0 overflow-y-auto">
        <ConversationContent className="max-w-4xl mx-auto px-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="max-w-2xl space-y-6">
                <div className="space-y-3">
                  <h2 className="text-2xl font-bold text-foreground">
                    Can I help you discover patterns?
                  </h2>
                  <p className="text-muted-foreground text-sm">
                    Ready to analyze patterns, connections, and insights across 40+ categories of extraordinary experiences.
                    Ask me anything about UFO sightings, dreams, NDEs, synchronicities, and more.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 justify-center text-xs">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary">
                    <span>⚡</span> 16 AI Tools
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/10 text-green-500">
                    <span>🔍</span> Smart Search
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-500/10 text-blue-500">
                    <span>📊</span> Analytics
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-500/10 text-purple-500">
                    <span>🧠</span> Insights & Predictions
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-500/10 text-orange-500">
                    <span>🗺️</span> Visualizations
                  </span>
                </div>

                <p className="text-xs text-muted-foreground">
                  Try me with a prompt — I might surprise you
                </p>

                <div className="flex flex-wrap gap-2 justify-center" role="group" aria-label="Suggested queries">
                  {suggestions.map((s) => (
                    <Suggestion
                      key={s}
                      suggestion={s}
                      onClick={(suggestion) => handleSuggestionClick(suggestion)}
                      disabled={isLoading}
                      aria-label={`Ask: ${s}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

        {messages.map((message, index) => {
          const previousMessage = index > 0 ? messages[index - 1] : undefined
          const nextMessage = index < messages.length - 1 ? messages[index + 1] : undefined

          // Use index as fallback for timestamp since AI SDK 5.0 UIMessage doesn't have createdAt
          const messageDate = new Date()
          const showDateSeparator = false // Simplified for now

          // Simplified grouping - group consecutive messages from same role
          const isGrouped = previousMessage?.role === message.role
          const isLastInGroup = nextMessage?.role !== message.role
          const showTimestamp = isLastInGroup

          return (
            <div key={message.id} className={isGrouped ? 'mt-1' : 'mt-4'}>
              {/* Date Separator */}
              {showDateSeparator && (
                <div className="flex items-center gap-4 my-6">
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-xs font-medium text-muted-foreground px-3 py-1 bg-muted rounded-full">
                    {getDateSeparatorText(messageDate)}
                  </span>
                  <div className="flex-1 h-px bg-border" />
                </div>
              )}

              <Message from={message.role}>
                <div className="flex flex-col gap-1 w-full">
                  {message.parts?.map((part, i) => {
                    // Text part - use Response component for streaming markdown
                    if (part.type === 'text') {
                      return (
                        <MessageContent key={i} variant="flat">
                          <Response>{part.text}</Response>
                        </MessageContent>
                      )
                    }

                    // Tool parts - use universal ToolRenderer for all 16 tools
                    if (part.type?.startsWith('tool-')) {
                      // Get original user query from previous message for retry
                      const userQuery = previousMessage?.role === 'user'
                        ? previousMessage.parts?.find((p: any) => p.type === 'text')?.text || (part as any).input?.query
                        : (part as any).input?.query

                      return (
                        <ToolRenderer
                          key={i}
                          part={part as any}
                          onRetry={() => handleRetry(userQuery)}
                          onSuggestionClick={handleSuggestionClick}
                        />
                      )
                    }

                    return null
                  })}

                  {/* Timestamp */}
                  {showTimestamp && (
                    <span className="text-xs text-muted-foreground mt-1">
                      {getRelativeTimestamp(messageDate)}
                    </span>
                  )}
                </div>
              </Message>
            </div>
          )
        })}
          {isLoading && (
            <div className="flex justify-start">
              <TypingIndicator />
            </div>
          )}
        </ConversationContent>

        <ConversationScrollButton />
      </Conversation>

      {/* Sticky Input Area */}
      <div className="flex-shrink-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 pt-2">
        <div className="max-w-4xl mx-auto px-4">
          {/* Persistierende Suggestions - ÜBER der Textbox */}
          {messages.length > 0 && (
            <div className="flex gap-1.5 mb-2 flex-wrap justify-center" role="group" aria-label="Quick actions">
            {suggestions.map((s) => (
              <Suggestion
                key={s}
                suggestion={s}
                onClick={(suggestion) => handleSuggestionClick(suggestion)}
                disabled={isLoading}
                aria-label={`Ask: ${s}`}
                className="text-[11px] py-0.5 px-2 leading-tight whitespace-nowrap"
              />
            ))}
            </div>
          )}

        {/* AI Elements PromptInput */}
        <PromptInput
          onSubmit={(data) => {
            if (!data.text?.trim() || isLoading) return
            sendMessage({ text: data.text })
          }}
        >
          <PromptInputBody>
            <PromptInputTextarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about patterns, connections, or insights..."
              disabled={isLoading}
              aria-label="Message input"
              aria-describedby="input-description"
            />
          </PromptInputBody>
          <PromptInputFooter>
            <PromptInputTools>
              <PromptInputActionMenu>
                <PromptInputActionMenuTrigger>
                  <Paperclip className="size-4" />
                </PromptInputActionMenuTrigger>
                <PromptInputActionMenuContent>
                  <PromptInputActionAddAttachments />
                </PromptInputActionMenuContent>
              </PromptInputActionMenu>
              <PromptInputSpeechButton>
                <Mic className="size-4" />
              </PromptInputSpeechButton>
            </PromptInputTools>
            <PromptInputSubmit disabled={isLoading || !input?.trim()}>
              <Send className="size-4" />
            </PromptInputSubmit>
          </PromptInputFooter>
        </PromptInput>
          <p id="input-description" className="sr-only">
            Type your question about patterns, connections, or insights in extraordinary experiences
          </p>

          <p className="text-xs text-muted-foreground text-center mt-1 pb-2">
            Powered by AI • Data from 40+ categories of extraordinary experiences
          </p>
        </div>
      </div>
      </div>
    </div>
  )
}
