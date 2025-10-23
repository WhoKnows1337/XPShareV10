/**
 * Branch Manager (Simplified)
 *
 * Basic branch management for conversation branching.
 */

import { createClient } from '@/lib/supabase/server'
import type { Branch } from './types'

// Re-export types for backward compatibility
export type { Branch }

export async function createBranch(
  chatId: string,
  parentMessageId: string,
  branchName: string
): Promise<Branch> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('message_branches')
    .insert({
      chat_id: chatId,
      parent_message_id: parentMessageId,
      branch_name: branchName || `Branch ${Date.now()}`,
    })
    .select()
    .single()

  if (error) throw error

  return {
    id: data.id,
    chatId: data.chat_id,
    parentMessageId: data.parent_message_id || undefined,
    branchName: data.branch_name,
    createdAt: new Date(data.created_at as string),
  }
}

export async function getBranchesForChat(chatId: string): Promise<Branch[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('message_branches')
    .select('*')
    .eq('chat_id', chatId)
    .order('created_at', { ascending: false })

  if (error) throw error

  // Get message counts for each branch
  const branches = await Promise.all(
    (data || []).map(async (b) => {
      const { count } = await supabase
        .from('discovery_messages')
        .select('*', { count: 'exact', head: true })
        .eq('branch_id', b.id)

      return {
        id: b.id,
        chatId: b.chat_id,
        parentMessageId: b.parent_message_id || undefined,
        branchName: b.branch_name,
        createdAt: new Date(b.created_at as string),
        messageCount: count || 0,
      }
    })
  )

  return branches
}

export async function getMessagesForBranch(
  chatId: string,
  branchId?: string
): Promise<any[]> {
  const supabase = await createClient()

  let query = supabase
    .from('discovery_messages')
    .select('*')
    .eq('chat_id', chatId)
    .order('created_at', { ascending: true })

  if (branchId) {
    query = query.eq('branch_id', branchId)
  } else {
    query = query.is('branch_id', null)
  }

  const { data, error } = await query

  if (error) throw error

  return data || []
}
