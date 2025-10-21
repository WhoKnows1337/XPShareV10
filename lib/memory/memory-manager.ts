/**
 * Memory Manager
 *
 * Manages user memories (preferences, facts, context) for personalized AI responses.
 * Integrates with Vercel AI SDK system prompts.
 */

import { createClient } from '@/lib/supabase/server'

export interface UserMemory {
  id: string
  userId: string
  scope: 'preference' | 'fact' | 'context' | 'dislike'
  key: string
  value: any
  confidence: number
  source?: string
  createdAt: Date
  updatedAt: Date
  expiresAt?: Date
}

/**
 * Get all active memories for a user
 */
export async function getUserMemories(userId: string): Promise<UserMemory[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('user_memory')
    .select('*')
    .eq('user_id', userId)
    .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
    .order('confidence', { ascending: false })

  if (error) {
    console.error('[Memory] Failed to load user memories:', error)
    return []
  }

  return (
    data?.map((m) => ({
      id: m.id,
      userId: m.user_id,
      scope: m.scope,
      key: m.key,
      value: m.value,
      confidence: m.confidence || 0.8,
      source: m.source,
      createdAt: new Date(m.created_at),
      updatedAt: new Date(m.updated_at),
      expiresAt: m.expires_at ? new Date(m.expires_at) : undefined,
    })) || []
  )
}

/**
 * Save a new memory or update existing
 */
export async function saveMemory(
  userId: string,
  memory: Omit<UserMemory, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
): Promise<void> {
  const supabase = await createClient()

  const memoryRecord = {
    user_id: userId,
    scope: memory.scope,
    key: memory.key,
    value: memory.value,
    confidence: memory.confidence,
    source: memory.source,
    expires_at: memory.expiresAt?.toISOString(),
  }

  // Upsert (insert or update)
  const { error } = await supabase
    .from('user_memory')
    .upsert(memoryRecord, {
      onConflict: 'user_id,scope,key',
      ignoreDuplicates: false,
    })

  if (error) {
    console.error('[Memory] Failed to save memory:', error)
    throw error
  }
}

/**
 * Delete a memory
 */
export async function deleteMemory(userId: string, memoryId: string): Promise<void> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('user_memory')
    .delete()
    .eq('id', memoryId)
    .eq('user_id', userId)

  if (error) {
    console.error('[Memory] Failed to delete memory:', error)
    throw error
  }
}

/**
 * Build system prompt with user memories injected
 */
export function buildSystemPromptWithMemory(
  basePrompt: string,
  memories: UserMemory[]
): string {
  if (memories.length === 0) {
    return basePrompt
  }

  const preferenceMemories = memories.filter((m) => m.scope === 'preference')
  const dislikeMemories = memories.filter((m) => m.scope === 'dislike')
  const factMemories = memories.filter((m) => m.scope === 'fact')
  const contextMemories = memories.filter((m) => m.scope === 'context')

  let memorySection = '\n\n## User Profile & Preferences\n\n'

  // Preferences
  if (preferenceMemories.length > 0) {
    memorySection += '**User Preferences:**\n'
    preferenceMemories.forEach((m) => {
      memorySection += `- ${m.key}: ${formatMemoryValue(m.value)} (${Math.round(m.confidence * 100)}% confidence)\n`
    })
    memorySection += '\n'
  }

  // Dislikes
  if (dislikeMemories.length > 0) {
    memorySection += '**User Dislikes:**\n'
    dislikeMemories.forEach((m) => {
      memorySection += `- ${m.key}: ${formatMemoryValue(m.value)}\n`
    })
    memorySection += '\n'
  }

  // Facts about user
  if (factMemories.length > 0) {
    memorySection += '**Known Facts:**\n'
    factMemories.forEach((m) => {
      memorySection += `- ${m.key}: ${formatMemoryValue(m.value)}\n`
    })
    memorySection += '\n'
  }

  // Context from previous conversations
  if (contextMemories.length > 0 && contextMemories.length <= 3) {
    // Only include recent context, max 3 items
    memorySection += '**Recent Context:**\n'
    contextMemories.forEach((m) => {
      memorySection += `- ${m.key}: ${formatMemoryValue(m.value)}\n`
    })
    memorySection += '\n'
  }

  memorySection += '**Important:** Use these preferences to personalize your responses. Filter results, adjust language, and tailor insights accordingly. Don\'t explicitly mention that you\'re using stored preferences unless the user asks.\n'

  return basePrompt + memorySection
}

/**
 * Format memory value for display in prompt
 */
function formatMemoryValue(value: any): string {
  if (typeof value === 'string') return value
  if (typeof value === 'boolean') return value ? 'yes' : 'no'
  if (typeof value === 'number') return value.toString()
  if (Array.isArray(value)) return value.join(', ')
  if (typeof value === 'object') {
    // Try to extract text property
    if (value.text) return value.text
    if (value.description) return value.description
    return JSON.stringify(value)
  }
  return String(value)
}

/**
 * Get memories by scope
 */
export async function getMemoriesByScope(
  userId: string,
  scope: UserMemory['scope']
): Promise<UserMemory[]> {
  const memories = await getUserMemories(userId)
  return memories.filter((m) => m.scope === scope)
}

/**
 * Update memory confidence score
 * Call this when user confirms/reinforces a preference
 */
export async function reinforceMemory(
  userId: string,
  memoryId: string,
  boost: number = 0.1
): Promise<void> {
  const supabase = await createClient()

  // Get current confidence
  const { data: memory } = await supabase
    .from('user_memory')
    .select('confidence')
    .eq('id', memoryId)
    .eq('user_id', userId)
    .single()

  if (!memory) return

  const newConfidence = Math.min(1.0, (memory.confidence || 0.8) + boost)

  const { error } = await supabase
    .from('user_memory')
    .update({ confidence: newConfidence })
    .eq('id', memoryId)
    .eq('user_id', userId)

  if (error) {
    console.error('[Memory] Failed to reinforce memory:', error)
  }
}

/**
 * Decay memory confidence over time
 * Run this periodically for memories that haven't been reinforced
 */
export async function decayMemoryConfidence(
  userId: string,
  memoryId: string,
  decay: number = 0.05
): Promise<void> {
  const supabase = await createClient()

  const { data: memory } = await supabase
    .from('user_memory')
    .select('confidence')
    .eq('id', memoryId)
    .eq('user_id', userId)
    .single()

  if (!memory) return

  const newConfidence = Math.max(0.0, (memory.confidence || 0.8) - decay)

  // If confidence drops below 0.3, delete the memory
  if (newConfidence < 0.3) {
    await deleteMemory(userId, memoryId)
    return
  }

  const { error } = await supabase
    .from('user_memory')
    .update({ confidence: newConfidence })
    .eq('id', memoryId)
    .eq('user_id', userId)

  if (error) {
    console.error('[Memory] Failed to decay memory:', error)
  }
}
