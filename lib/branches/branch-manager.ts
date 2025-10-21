/**
 * Branch Manager (Simplified)
 *
 * Basic branch management for conversation branching.
 */

import { createClient } from '@/lib/supabase/server'

export interface Branch {
  id: string
  chatId: string
  parentMessageId?: string
  branchName: string
  createdAt: Date
}

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
    parentMessageId: data.parent_message_id,
    branchName: data.branch_name,
    createdAt: new Date(data.created_at),
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

  return (data || []).map((b) => ({
    id: b.id,
    chatId: b.chat_id,
    parentMessageId: b.parent_message_id,
    branchName: b.branch_name,
    createdAt: new Date(b.created_at),
  }))
}
