/**
 * Branch Types
 *
 * Shared type definitions for the conversation branching system.
 * Separated from server-code to allow client-side imports.
 */

export interface Branch {
  id: string
  chatId: string
  parentMessageId?: string
  branchName: string
  createdAt: Date
  messageCount?: number
}
