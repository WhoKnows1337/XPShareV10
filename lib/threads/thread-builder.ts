/**
 * Thread Builder (Simplified)
 *
 * Basic threading support for nested conversations.
 */

export interface ThreadedMessage {
  id: string
  content: string
  role: string
  replyToId?: string
  threadId?: string
  replies?: ThreadedMessage[]
  createdAt: Date
}

export function buildThreadTree(messages: ThreadedMessage[]): ThreadedMessage[] {
  const messageMap = new Map<string, ThreadedMessage>()
  const rootMessages: ThreadedMessage[] = []

  // First pass: create map
  messages.forEach((msg) => {
    messageMap.set(msg.id, { ...msg, replies: [] })
  })

  // Second pass: build tree
  messages.forEach((msg) => {
    const message = messageMap.get(msg.id)!

    if (msg.replyToId) {
      const parent = messageMap.get(msg.replyToId)
      if (parent) {
        parent.replies = parent.replies || []
        parent.replies.push(message)
      } else {
        rootMessages.push(message)
      }
    } else {
      rootMessages.push(message)
    }
  })

  return rootMessages
}
