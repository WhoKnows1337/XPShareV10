'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { UIMessage } from '@ai-sdk/react'

export interface DiscoveryChat {
  id: string
  user_id: string
  title: string | null
  created_at: string
  updated_at: string
  pinned?: boolean
  archived?: boolean
  archived_at?: string | null
  tags?: string[]
}

export interface DiscoveryChatWithMessages extends DiscoveryChat {
  messages: UIMessage[]
}

export function useDiscoveryChats() {
  const [chats, setChats] = useState<DiscoveryChat[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const supabase = createClient()

  // Load all user's chats
  const loadChats = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('discovery_chats')
        .select('*')
        .order('updated_at', { ascending: false })

      if (fetchError) throw fetchError

      setChats(data || [])
    } catch (err) {
      console.error('Error loading chats:', err)
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }

  // Create new chat
  const createChat = async (title?: string): Promise<string | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error: insertError } = await supabase
        .from('discovery_chats')
        .insert({
          user_id: user.id,
          title: title || null,
        })
        .select()
        .single()

      if (insertError) throw insertError

      await loadChats()
      return data.id
    } catch (err) {
      console.error('Error creating chat:', err)
      setError(err as Error)
      return null
    }
  }

  // Load messages for a specific chat
  const loadMessages = async (chatId: string): Promise<UIMessage[] | null> => {
    try {
      const { data, error: fetchError } = await supabase
        .from('discovery_messages')
        .select('messages')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (fetchError) {
        // If no messages found yet, return empty array
        if (fetchError.code === 'PGRST116') return []
        throw fetchError
      }

      return data?.messages as UIMessage[] || []
    } catch (err) {
      console.error('Error loading messages:', err)
      setError(err as Error)
      return null
    }
  }

  // Save messages for a chat (upsert pattern)
  const saveMessages = async (chatId: string, messages: UIMessage[]): Promise<boolean> => {
    try {
      // Verify chat belongs to current user before attempting save
      const { data: chat, error: chatError } = await supabase
        .from('discovery_chats')
        .select('id, user_id')
        .eq('id', chatId)
        .single()

      if (chatError || !chat) {
        console.warn('Chat not found or access denied:', chatId)
        return false
      }

      // First, delete old messages for this chat
      const { error: deleteError } = await supabase
        .from('discovery_messages')
        .delete()
        .eq('chat_id', chatId)

      if (deleteError && deleteError.code !== 'PGRST116') {
        // Ignore "no rows found" error (PGRST116)
        throw deleteError
      }

      // Insert new messages
      const { error: insertError } = await supabase
        .from('discovery_messages')
        .insert({
          chat_id: chatId,
          messages: messages as any,
        })

      if (insertError) throw insertError

      // Update chat's updated_at timestamp
      await supabase
        .from('discovery_chats')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', chatId)

      return true
    } catch (err: any) {
      // Only log error once, not hundreds of times
      if (err?.code !== 'PGRST116') {
        console.error('Error saving messages:', err?.message || err)
      }
      setError(err as Error)
      return false
    }
  }

  // Update chat title
  const updateChatTitle = async (chatId: string, title: string): Promise<boolean> => {
    try {
      const { error: updateError } = await supabase
        .from('discovery_chats')
        .update({ title })
        .eq('id', chatId)

      if (updateError) throw updateError

      await loadChats()
      return true
    } catch (err) {
      console.error('Error updating chat title:', err)
      setError(err as Error)
      return false
    }
  }

  // Delete chat (cascade will delete messages)
  const deleteChat = async (chatId: string): Promise<boolean> => {
    try {
      const { error: deleteError } = await supabase
        .from('discovery_chats')
        .delete()
        .eq('id', chatId)

      if (deleteError) throw deleteError

      await loadChats()
      return true
    } catch (err) {
      console.error('Error deleting chat:', err)
      setError(err as Error)
      return false
    }
  }

  // Pin/Unpin chat
  const pinChat = async (chatId: string): Promise<boolean> => {
    try {
      const chat = chats.find((c) => c.id === chatId)
      const { error: updateError } = await supabase
        .from('discovery_chats')
        .update({ pinned: !chat?.pinned })
        .eq('id', chatId)

      if (updateError) throw updateError

      await loadChats()
      return true
    } catch (err) {
      console.error('Error pinning/unpinning chat:', err)
      setError(err as Error)
      return false
    }
  }

  // Archive/Unarchive chat
  const archiveChat = async (chatId: string): Promise<boolean> => {
    try {
      const chat = chats.find((c) => c.id === chatId)
      const isArchiving = !chat?.archived

      const { error: updateError } = await supabase
        .from('discovery_chats')
        .update({
          archived: isArchiving,
          archived_at: isArchiving ? new Date().toISOString() : null,
        })
        .eq('id', chatId)

      if (updateError) throw updateError

      await loadChats()
      return true
    } catch (err) {
      console.error('Error archiving/unarchiving chat:', err)
      setError(err as Error)
      return false
    }
  }

  // Load chats on mount
  useEffect(() => {
    loadChats()
  }, [])

  return {
    chats,
    loading,
    error,
    loadChats,
    createChat,
    loadMessages,
    saveMessages,
    updateChatTitle,
    deleteChat,
    pinChat,
    archiveChat,
  }
}
