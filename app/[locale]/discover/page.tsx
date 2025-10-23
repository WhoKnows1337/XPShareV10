'use client'

import { useChat } from '@ai-sdk/react'
import { CustomChatTransport } from '@/lib/transport/custom-chat-transport'
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
import { FloatingStopButton } from '@/components/discover/StopButton'
import { CitationList } from '@/components/discover/CitationList'
import { OfflineBanner } from '@/components/discover/OfflineBanner'
import { useOnlineStatus } from '@/lib/pwa/install'
import { useMessageQueue } from '@/lib/queue/message-queue'
import { useKeyboardShortcuts } from '@/lib/hooks/useKeyboardShortcuts'
import { ShortcutsModal } from '@/components/discover/ShortcutsModal'
import { useRef } from 'react'
import { ThreadList } from '@/components/discover/ThreadView'
import { buildThreadTree } from '@/lib/threads/thread-builder'
import { convertToThreadedMessages } from '@/lib/threads/message-adapter'

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
  const [pendingMessage, setPendingMessage] = useState<string | null>(null)
  const { createChat, loadMessages, saveMessages, updateChatTitle, loadChats } = useDiscoveryChats()

  // Threading and Branching state (must be declared before useChat)
  const [replyToId, setReplyToId] = useState<string | undefined>(undefined)
  const [currentBranchId, setCurrentBranchId] = useState<string | undefined>(undefined)

  const { messages, sendMessage, status, setMessages, resumeStream, stop, error, clearError } = useChat({
    id: currentChatId || undefined,
    messages: initialMessages,
    generateId,
    experimental_throttle: 500, // Increased from 100ms to reduce stream parsing race conditions
    transport: new CustomChatTransport({
      api: '/api/discover',
      body: {
        chatId: currentChatId,
        replyToId,
        branchId: currentBranchId,
      },
      timeout: 150000, // 150s timeout (vs 120s backend maxDuration)
    }),
    onError: (error) => {
      console.error('[Discovery Chat] Error:', error)
      // Error state is automatically set by useChat - no need to throw
    },
  })
  const [input, setInput] = useState('')
  const [attachments, setAttachments] = useState<File[]>([])
  const isLoading = status === 'submitted' || status === 'streaming'
  const isStreaming = status === 'streaming'

  // Offline support
  const isOnline = useOnlineStatus()
  const { queueCount, syncQueue: syncQueueFn } = useMessageQueue()

  // Keyboard shortcuts
  const [showShortcutsModal, setShowShortcutsModal] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useKeyboardShortcuts({
    shortcuts: [
      { key: 'k', ctrl: true, description: 'Focus input', action: () => inputRef.current?.focus() },
      { key: 'n', ctrl: true, description: 'New chat', action: () => handleNewChat() },
      { key: '/', ctrl: true, description: 'Show shortcuts', action: () => setShowShortcutsModal(true) },
      { key: '?', description: 'Show shortcuts', action: () => setShowShortcutsModal(true) },
    ],
  })

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

  // Send pending message when chat ID is set
  useEffect(() => {
    if (currentChatId && pendingMessage) {
      // Small delay to ensure useChat hook is re-initialized with new ID
      const timer = setTimeout(() => {
        sendMessage({ text: pendingMessage })
        setPendingMessage(null)
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [currentChatId, pendingMessage, sendMessage])

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
          const textPart = firstUserMessage.parts?.find((p: any) => p.type === 'text')
          const messageText =
            (textPart && 'text' in textPart ? textPart.text : undefined) ||
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

  const handleSuggestionClick = async (suggestion: string) => {
    if (isLoading) return

    // Create chat if none exists
    if (!currentChatId) {
      const newChatId = await createChat()
      if (newChatId) {
        setCurrentChatId(newChatId)
        setChatHasTitle(false)
        setPendingMessage(suggestion)
        router.push(`/discover?chat=${newChatId}`, { scroll: false })
        return
      }
    }

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
    clearError() // Clear previous error
    sendMessage({ text: query })
  }

  const handleStop = () => {
    stop()
  }

  return (
    <div className="h-[calc(100dvh-4rem)] w-full flex overflow-hidden">
      {/* Skip to content link for screen readers */}
      <a
        href="#chat-input"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md"
      >
        Skip to chat input
      </a>

      {/* Sidebar */}
      <ChatSidebar
        currentChatId={currentChatId}
        onChatSelect={handleChatSelect}
        onNewChat={handleNewChat}
      />

      {/* Main Chat Area */}
      <div
        className="flex-1 flex flex-col overflow-hidden"
        role="main"
        aria-label="Discovery Chat Interface"
      >
        {/* Offline Banner */}
        <OfflineBanner
          isOnline={isOnline}
          queueCount={queueCount}
          onSync={async () => {
            await syncQueueFn(async (msg) => {
              await sendMessage({ text: msg.content })
            })
          }}
        />
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
      <Conversation
        className="flex-1 min-h-0 overflow-y-auto"
        role="log"
        aria-live="polite"
        aria-atomic="false"
        aria-label="Chat messages"
      >
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

        {(() => {
          // Convert AI SDK messages to ThreadedMessage format
          const threadedMessages = convertToThreadedMessages(messages)

          // Filter by branch if branch is selected
          const filteredMessages = currentBranchId
            ? threadedMessages.filter((m) => m.branchId === currentBranchId || !m.branchId)
            : threadedMessages

          // Build thread tree
          const threads = buildThreadTree(filteredMessages)

          return (
            <ThreadList
              threads={threads}
              onReply={(messageId) => {
                setReplyToId(messageId)
                inputRef.current?.focus()
              }}
              onBranch={(messageId) => {
                // Create new branch from this message
                setReplyToId(messageId)
                // Branch creation will be handled by BranchButton in ThreadView
              }}
              renderCustomContent={(message) => {
                // Render tool calls and citations using existing components
                if (!message.originalMessage) return null

                const originalMsg = message.originalMessage

                return (
                  <div className="flex flex-col gap-1 w-full">
                    {originalMsg.parts?.map((part: any, i: number) => {
                      // Tool parts
                      if (part.type?.startsWith('tool-')) {
                        return (
                          <ToolRenderer
                            key={i}
                            part={part}
                            onRetry={() => {
                              // Find user query from context
                              const userQuery = part.input?.query || ''
                              handleRetry(userQuery)
                            }}
                            onSuggestionClick={handleSuggestionClick}
                          />
                        )
                      }
                      return null
                    })}

                    {/* Citations - only for assistant messages */}
                    {originalMsg.role === 'assistant' && originalMsg.id && (
                      <CitationList
                        messageId={originalMsg.id}
                        variant="footer"
                        showRelevanceScore={true}
                      />
                    )}
                  </div>
                )
              }}
            />
          )
        })()}

          {/* Error Display */}
          {error && (
            <div className="flex justify-start mb-4">
              <div className="max-w-2xl bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="text-destructive text-lg">⚠️</div>
                  <div className="flex-1 space-y-2">
                    <p className="text-sm font-medium text-destructive">Error occurred</p>
                    <p className="text-xs text-muted-foreground">{error.message}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        clearError()
                        // Retry last user message
                        const lastUserMessage = messages.filter(m => m.role === 'user').pop()
                        if (lastUserMessage) {
                          const textPart = lastUserMessage.parts?.find((p: any) => p.type === 'text')
                          const messageText = (textPart && 'text' in textPart ? textPart.text : undefined) || (lastUserMessage as any).content
                          if (messageText) {
                            handleRetry(messageText)
                          }
                        }
                      }}
                    >
                      Retry
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

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
          onSubmit={async (data) => {
            if (!data.text?.trim() || isLoading) return

            // Clear previous error
            clearError()

            // Create chat if none exists and save message for later
            if (!currentChatId) {
              const newChatId = await createChat()
              if (newChatId) {
                setCurrentChatId(newChatId)
                setChatHasTitle(false)
                setPendingMessage(data.text)
                router.push(`/discover?chat=${newChatId}`, { scroll: false })
                return
              }
            }

            // Send message
            sendMessage({ text: data.text })
          }}
          className="mb-2"
          id="chat-input"
          aria-label="Message input"
        >
          <PromptInputBody>
            <PromptInputTextarea
              ref={inputRef}
              placeholder="Ask about patterns, connections, or explore experiences..."
              rows={2}
              className="resize-none"
              aria-label="Type your message"
            />
          </PromptInputBody>

          <PromptInputFooter className="flex items-center justify-between pt-1.5">
            <PromptInputTools>
              <PromptInputActionMenu>
                <PromptInputActionMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="More options">
                    <Paperclip className="h-4 w-4" />
                  </Button>
                </PromptInputActionMenuTrigger>
                <PromptInputActionMenuContent>
                  <PromptInputActionAddAttachments
                    accept="image/*,application/pdf,.txt,.md"
                    multiple
                    aria-label="Add attachments"
                  />
                </PromptInputActionMenuContent>
              </PromptInputActionMenu>

              <PromptInputSpeechButton asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Voice input">
                  <Mic className="h-4 w-4" />
                </Button>
              </PromptInputSpeechButton>
            </PromptInputTools>

            <PromptInputSubmit asChild>
              <Button
                size="sm"
                className="h-8"
                disabled={isLoading}
                aria-label="Send message"
              >
                <Send className="h-4 w-4 mr-1.5" />
                Send
              </Button>
            </PromptInputSubmit>
          </PromptInputFooter>
        </PromptInput>

        {/* Floating Stop Button - shown during streaming */}
        <FloatingStopButton isStreaming={isStreaming} onStop={handleStop} />
        </div>
      </div>

      {/* Keyboard Shortcuts Modal */}
      <ShortcutsModal
        open={showShortcutsModal}
        onOpenChange={setShowShortcutsModal}
        shortcuts={[
          { key: 'Ctrl+K', description: 'Focus input' },
          { key: 'Ctrl+N', description: 'New chat' },
          { key: 'Ctrl+/', description: 'Show shortcuts' },
          { key: '?', description: 'Show shortcuts' },
        ]}
      />
      </div>
    </div>
  )
}
