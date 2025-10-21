'use client'

import { useEffect, useRef } from 'react'
import { UIMessage } from '@ai-sdk/react'

/**
 * Conversation Persistence Hook
 * Saves and restores chat messages to/from localStorage
 * Pattern: chat-{sessionId} key structure
 */

const STORAGE_KEY = 'discovery-chat-history'

interface PersistedChatOptions {
  messages: UIMessage[]
  onRestore?: (messages: UIMessage[]) => void
}

export function usePersistedChat({ messages, onRestore }: PersistedChatOptions) {
  const hasRestoredRef = useRef(false)

  // Restore messages from localStorage on mount (only once)
  useEffect(() => {
    if (hasRestoredRef.current) return

    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored && onRestore) {
      try {
        const parsed = JSON.parse(stored) as UIMessage[]
        onRestore(parsed)
        hasRestoredRef.current = true
      } catch (error) {
        console.error('Failed to restore chat history:', error)
        localStorage.removeItem(STORAGE_KEY)
      }
    }
  }, [onRestore])

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
    }
  }, [messages])

  // Clear chat history
  const clearHistory = () => {
    localStorage.removeItem(STORAGE_KEY)
  }

  // Export chat history as JSON
  const exportHistory = () => {
    const dataStr = JSON.stringify(messages, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `discovery-chat-${new Date().toISOString()}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  return {
    clearHistory,
    exportHistory,
  }
}
