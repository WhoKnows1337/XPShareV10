/**
 * Message Queue for Offline Support
 *
 * Queues messages in localStorage when offline and syncs when back online.
 */

const QUEUE_KEY = 'xpshare_message_queue'
const MAX_RETRIES = 3
const RETRY_DELAY_MS = 1000

export interface QueuedMessage {
  id: string
  chatId: string
  content: string
  role: 'user' | 'assistant'
  timestamp: number
  retries: number
  attachments?: File[]
}

/**
 * Add message to queue
 */
export function queueMessage(message: Omit<QueuedMessage, 'timestamp' | 'retries'>): void {
  const queue = getQueue()

  const queuedMessage: QueuedMessage = {
    ...message,
    timestamp: Date.now(),
    retries: 0,
  }

  queue.push(queuedMessage)
  saveQueue(queue)

  console.log('[MessageQueue] Queued:', queuedMessage.id)
}

/**
 * Get all queued messages
 */
export function getQueue(): QueuedMessage[] {
  if (typeof window === 'undefined') return []

  try {
    const stored = localStorage.getItem(QUEUE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error('[MessageQueue] Failed to read queue:', error)
    return []
  }
}

/**
 * Save queue to localStorage
 */
function saveQueue(queue: QueuedMessage[]): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue))
  } catch (error) {
    console.error('[MessageQueue] Failed to save queue:', error)
  }
}

/**
 * Remove message from queue
 */
export function dequeueMessage(messageId: string): void {
  const queue = getQueue()
  const filtered = queue.filter((m) => m.id !== messageId)
  saveQueue(filtered)

  console.log('[MessageQueue] Dequeued:', messageId)
}

/**
 * Clear entire queue
 */
export function clearQueue(): void {
  if (typeof window === 'undefined') return

  localStorage.removeItem(QUEUE_KEY)
  console.log('[MessageQueue] Cleared queue')
}

/**
 * Get queue count
 */
export function getQueueCount(): number {
  return getQueue().length
}

/**
 * Sync all queued messages
 */
export async function syncQueue(sendMessageFn: (message: QueuedMessage) => Promise<void>): Promise<{
  success: number
  failed: number
}> {
  const queue = getQueue()
  let success = 0
  let failed = 0

  console.log(`[MessageQueue] Syncing ${queue.length} messages...`)

  for (const message of queue) {
    try {
      // Exponential backoff for retries
      if (message.retries > 0) {
        const delay = RETRY_DELAY_MS * Math.pow(2, message.retries - 1)
        await new Promise((resolve) => setTimeout(resolve, delay))
      }

      await sendMessageFn(message)
      dequeueMessage(message.id)
      success++

      console.log('[MessageQueue] Synced:', message.id)
    } catch (error) {
      console.error('[MessageQueue] Sync failed:', message.id, error)

      // Increment retry count
      message.retries++

      // Remove if max retries exceeded
      if (message.retries >= MAX_RETRIES) {
        console.error('[MessageQueue] Max retries exceeded:', message.id)
        dequeueMessage(message.id)
        failed++
      } else {
        // Update retry count in queue
        const updatedQueue = getQueue().map((m) =>
          m.id === message.id ? message : m
        )
        saveQueue(updatedQueue)
      }
    }
  }

  console.log(`[MessageQueue] Sync complete: ${success} success, ${failed} failed`)

  return { success, failed }
}

/**
 * Auto-sync on reconnect
 */
export function setupAutoSync(sendMessageFn: (message: QueuedMessage) => Promise<void>): () => void {
  if (typeof window === 'undefined') return () => {}

  const handleOnline = () => {
    const queueCount = getQueueCount()
    if (queueCount > 0) {
      console.log('[MessageQueue] Connection restored, syncing...')
      syncQueue(sendMessageFn).catch((error) => {
        console.error('[MessageQueue] Auto-sync failed:', error)
      })
    }
  }

  window.addEventListener('online', handleOnline)

  return () => {
    window.removeEventListener('online', handleOnline)
  }
}

/**
 * Hook for using message queue in React components
 */
export function useMessageQueue() {
  const isClient = typeof window !== 'undefined'

  const [queue, setQueue] = React.useState<QueuedMessage[]>(() =>
    isClient ? getQueue() : []
  )
  const [queueCount, setQueueCount] = React.useState(() =>
    isClient ? getQueue().length : 0
  )

  React.useEffect(() => {
    if (!isClient) return

    // Update state when localStorage changes
    const handleStorageChange = () => {
      const updated = getQueue()
      setQueue(updated)
      setQueueCount(updated.length)
    }

    window.addEventListener('storage', handleStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [isClient])

  const addToQueue = React.useCallback((message: Omit<QueuedMessage, 'timestamp' | 'retries'>) => {
    if (!isClient) return
    queueMessage(message)
    setQueue(getQueue())
    setQueueCount(getQueue().length)
  }, [isClient])

  const removeFromQueue = React.useCallback((messageId: string) => {
    if (!isClient) return
    dequeueMessage(messageId)
    setQueue(getQueue())
    setQueueCount(getQueue().length)
  }, [isClient])

  const clearQueueCallback = React.useCallback(() => {
    if (!isClient) return
    clearQueue()
    setQueue([])
    setQueueCount(0)
  }, [isClient])

  const syncQueueCallback = React.useCallback(
    async (sendMessageFn: (message: QueuedMessage) => Promise<void>) => {
      if (!isClient) return { success: 0, failed: 0 }
      const result = await syncQueue(sendMessageFn)
      setQueue(getQueue())
      setQueueCount(getQueue().length)
      return result
    },
    [isClient]
  )

  return {
    queue,
    queueCount,
    addToQueue,
    removeFromQueue,
    clearQueue: clearQueueCallback,
    syncQueue: syncQueueCallback,
  }
}

// Add React import
import * as React from 'react'
