'use client'

import { useEffect } from 'react'
import type { UIMessage } from '@ai-sdk/react'

export interface UseAutoResumeParams {
  autoResume: boolean
  initialMessages: UIMessage[]
  resumeStream: () => void
  setMessages: (messages: UIMessage[]) => void
}

/**
 * Auto-resume hook for continuing interrupted AI streams
 * Based on Vercel AI Chatbot implementation
 *
 * If the last message is from the user and autoResume is enabled,
 * automatically resume the stream when the component mounts.
 */
export function useAutoResume({
  autoResume,
  initialMessages,
  resumeStream,
  setMessages,
}: UseAutoResumeParams) {
  useEffect(() => {
    if (!autoResume) {
      return
    }

    const mostRecentMessage = initialMessages.at(-1)

    // If last message was from user, resume the stream
    if (mostRecentMessage?.role === 'user') {
      resumeStream()
    }

    // Intentionally run only once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Restore initial messages on mount
  useEffect(() => {
    if (initialMessages.length > 0) {
      setMessages(initialMessages)
    }
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}
