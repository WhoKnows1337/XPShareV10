/**
 * Enhanced Session Management
 *
 * Manages chat sessions with export, history, and metadata tracking.
 */

import { createClient } from '@/lib/supabase/client'

export interface ChatSession {
  id: string
  title: string
  createdAt: string
  updatedAt: string
  messageCount: number
  lastMessage?: string
  metadata?: {
    model?: string
    totalTokens?: number
    totalCost?: number
    categories?: string[]
    tags?: string[]
  }
}

export interface ExportFormat {
  format: 'json' | 'markdown' | 'text' | 'csv'
  includeMetadata?: boolean
  includeTimestamps?: boolean
}

/**
 * Export chat session to various formats
 */
export async function exportSession(
  sessionId: string,
  format: ExportFormat['format'] = 'json'
): Promise<string> {
  const supabase = createClient()

  // Get chat metadata
  const { data: chat } = await supabase
    .from('discovery_chats')
    .select('*')
    .eq('id', sessionId)
    .single()

  if (!chat) {
    throw new Error('Chat not found')
  }

  // Get messages
  const { data: messages } = await supabase
    .from('discovery_messages')
    .select('*')
    .eq('chat_id', sessionId)
    .order('created_at', { ascending: true })

  if (!messages) {
    throw new Error('Failed to load messages')
  }

  switch (format) {
    case 'json':
      return exportAsJSON(chat, messages)
    case 'markdown':
      return exportAsMarkdown(chat, messages)
    case 'text':
      return exportAsText(chat, messages)
    case 'csv':
      return exportAsCSV(chat, messages)
    default:
      throw new Error(`Unsupported format: ${format}`)
  }
}

/**
 * Export as JSON
 */
function exportAsJSON(chat: any, messages: any[]): string {
  const exportData = {
    metadata: {
      chatId: chat.id,
      title: chat.title,
      createdAt: chat.created_at,
      updatedAt: chat.updated_at,
      exportedAt: new Date().toISOString(),
    },
    messages: messages.map((msg) => ({
      id: msg.id,
      role: msg.role,
      content: msg.content,
      createdAt: msg.created_at,
    })),
  }

  return JSON.stringify(exportData, null, 2)
}

/**
 * Export as Markdown
 */
function exportAsMarkdown(chat: any, messages: any[]): string {
  let md = `# ${chat.title}\n\n`
  md += `**Created:** ${new Date(chat.created_at).toLocaleString()}\n`
  md += `**Last Updated:** ${new Date(chat.updated_at).toLocaleString()}\n`
  md += `**Messages:** ${messages.length}\n\n`
  md += '---\n\n'

  messages.forEach((msg) => {
    const timestamp = new Date(msg.created_at).toLocaleTimeString()
    const role = msg.role === 'user' ? 'You' : 'Assistant'

    md += `### ${role} - ${timestamp}\n\n`
    md += `${msg.content}\n\n`
  })

  md += '---\n\n'
  md += `*Exported from XPShare Discovery on ${new Date().toLocaleString()}*\n`

  return md
}

/**
 * Export as plain text
 */
function exportAsText(chat: any, messages: any[]): string {
  let text = `${chat.title}\n`
  text += `${'='.repeat(chat.title.length)}\n\n`
  text += `Created: ${new Date(chat.created_at).toLocaleString()}\n`
  text += `Messages: ${messages.length}\n\n`

  messages.forEach((msg) => {
    const timestamp = new Date(msg.created_at).toLocaleTimeString()
    const role = msg.role === 'user' ? 'YOU' : 'ASSISTANT'

    text += `[${timestamp}] ${role}:\n${msg.content}\n\n`
  })

  text += `\nExported from XPShare Discovery on ${new Date().toLocaleString()}\n`

  return text
}

/**
 * Export as CSV
 */
function exportAsCSV(chat: any, messages: any[]): string {
  const rows = [
    ['Timestamp', 'Role', 'Message'],
    ...messages.map((msg) => [
      new Date(msg.created_at).toISOString(),
      msg.role,
      `"${msg.content.replace(/"/g, '""')}"`, // Escape quotes
    ]),
  ]

  return rows.map((row) => row.join(',')).join('\n')
}

/**
 * Download exported session
 */
export function downloadExport(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/**
 * Get session statistics
 */
export async function getSessionStats(sessionId: string): Promise<{
  messageCount: number
  userMessages: number
  assistantMessages: number
  averageResponseTime: number
  totalTokens?: number
  categories: string[]
}> {
  const supabase = createClient()

  const { data: messages } = await supabase
    .from('discovery_messages')
    .select('*')
    .eq('chat_id', sessionId)
    .order('created_at', { ascending: true })

  if (!messages || messages.length === 0) {
    return {
      messageCount: 0,
      userMessages: 0,
      assistantMessages: 0,
      averageResponseTime: 0,
      categories: [],
    }
  }

  const userMessages = messages.filter((m) => m.role === 'user').length
  const assistantMessages = messages.filter((m) => m.role === 'assistant').length

  // Calculate average response time (time between user message and assistant response)
  let totalResponseTime = 0
  let responseCount = 0

  for (let i = 0; i < messages.length - 1; i++) {
    if (messages[i].role === 'user' && messages[i + 1].role === 'assistant') {
      const userTime = new Date(messages[i].created_at).getTime()
      const assistantTime = new Date(messages[i + 1].created_at).getTime()
      totalResponseTime += assistantTime - userTime
      responseCount++
    }
  }

  const averageResponseTime = responseCount > 0 ? totalResponseTime / responseCount / 1000 : 0

  return {
    messageCount: messages.length,
    userMessages,
    assistantMessages,
    averageResponseTime,
    categories: [],
  }
}

/**
 * Duplicate session (create copy)
 */
export async function duplicateSession(sessionId: string): Promise<string | null> {
  const supabase = createClient()

  // Get original chat
  const { data: originalChat } = await supabase
    .from('discovery_chats')
    .select('*')
    .eq('id', sessionId)
    .single()

  if (!originalChat) {
    return null
  }

  // Get original messages
  const { data: originalMessages } = await supabase
    .from('discovery_messages')
    .select('*')
    .eq('chat_id', sessionId)
    .order('created_at', { ascending: true })

  // Create new chat
  const { data: newChat, error: chatError } = await supabase
    .from('discovery_chats')
    .insert({
      user_id: originalChat.user_id,
      title: `${originalChat.title} (Copy)`,
    })
    .select()
    .single()

  if (chatError || !newChat) {
    console.error('Failed to duplicate chat:', chatError)
    return null
  }

  // Copy messages
  if (originalMessages && originalMessages.length > 0) {
    const newMessages = originalMessages.map((msg) => ({
      chat_id: newChat.id,
      role: msg.role,
      content: msg.content,
    }))

    await supabase.from('discovery_messages').insert(newMessages)
  }

  return newChat.id
}
