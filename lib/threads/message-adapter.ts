/**
 * Adapter to convert AI SDK UIMessage format to ThreadedMessage format
 *
 * AI SDK UIMessage doesn't include threading metadata, so we:
 * 1. Store threading metadata in message.experimental_metadata
 * 2. Convert UIMessage to ThreadedMessage for rendering
 */

import type { UIMessage } from 'ai'
import { ThreadedMessage } from './thread-builder'

export interface ThreadMetadata {
  replyToId?: string
  threadId?: string
  branchId?: string
}

/**
 * Convert AI SDK UIMessage to ThreadedMessage format
 */
export function convertToThreadedMessages(messages: UIMessage[]): ThreadedMessage[] {
  return messages.map((msg) => {
    // AI SDK 5.0: UIMessage has different structure
    const content = (msg as any).content ||
      (msg.parts ? msg.parts.map((p: any) => p.type === 'text' ? p.text : '').join('') : '')
    const metadata = (msg as any).experimental_metadata || {} as ThreadMetadata
    const createdAt = (msg as any).createdAt

    return {
      id: msg.id,
      role: msg.role,
      content,
      timestamp: createdAt?.toISOString() || new Date().toISOString(),
      replyToId: metadata.replyToId,
      threadId: metadata.threadId,
      branchId: metadata.branchId,
      replies: [],
      // Preserve original message for tool rendering
      originalMessage: msg,
    }
  })
}

/**
 * Add threading metadata to a message before sending
 */
export function addThreadMetadata(
  content: string,
  metadata: ThreadMetadata
): { content: string; experimental_metadata: ThreadMetadata } {
  return {
    content,
    experimental_metadata: metadata,
  }
}

/**
 * Extract threading metadata from a message
 */
export function getThreadMetadata(message: UIMessage): ThreadMetadata {
  return ((message as any).experimental_metadata || {}) as ThreadMetadata
}

/**
 * Generate a thread ID from the root message ID
 */
export function generateThreadId(rootMessageId: string): string {
  return rootMessageId
}
