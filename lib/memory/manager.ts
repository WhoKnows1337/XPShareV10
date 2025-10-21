/**
 * Memory Manager
 *
 * Manages user preferences and session context for personalization.
 * Supports both persistent (user_memory) and temporary (session_memory) storage.
 */

import { SupabaseClient } from '@supabase/supabase-js'

export type MemoryScope = 'discovery' | 'profile' | 'global'

export interface UserPreferences {
  preferredCategories?: string[]
  defaultView?: 'list' | 'grid' | 'map'
  languagePreference?: 'en' | 'de' | 'fr' | 'es'
  notificationsEnabled?: boolean
  autoSuggestEnabled?: boolean
  theme?: 'light' | 'dark' | 'auto'
}

export interface SessionContext {
  recentQueries?: string[]
  activeFilters?: Record<string, any>
  conversationTopic?: string
  userIntent?: string
}

/**
 * Memory Manager Class
 */
export class MemoryManager {
  constructor(
    private supabase: SupabaseClient,
    private userId: string
  ) {}

  /**
   * Set user profile memory (persistent)
   */
  async setProfileMemory(key: string, value: any, scope: MemoryScope = 'global'): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('user_memory')
        .upsert({
          user_id: this.userId,
          scope,
          key,
          value: JSON.parse(JSON.stringify(value)), // Ensure valid JSON
        }, {
          onConflict: 'user_id,scope,key'
        })

      if (error) {
        console.error('Failed to set profile memory:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error setting profile memory:', error)
      return false
    }
  }

  /**
   * Get user profile memory (persistent)
   */
  async getProfileMemory<T = any>(key: string, scope: MemoryScope = 'global'): Promise<T | null> {
    try {
      const { data, error } = await this.supabase
        .from('user_memory')
        .select('value')
        .eq('user_id', this.userId)
        .eq('scope', scope)
        .eq('key', key)
        .maybeSingle()

      if (error) {
        console.error('Failed to get profile memory:', error)
        return null
      }

      return data?.value as T || null
    } catch (error) {
      console.error('Error getting profile memory:', error)
      return null
    }
  }

  /**
   * Delete user profile memory
   */
  async deleteProfileMemory(key: string, scope: MemoryScope = 'global'): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('user_memory')
        .delete()
        .eq('user_id', this.userId)
        .eq('scope', scope)
        .eq('key', key)

      if (error) {
        console.error('Failed to delete profile memory:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error deleting profile memory:', error)
      return false
    }
  }

  /**
   * Set session memory (temporary, expires after 24h)
   */
  async setSessionMemory(sessionId: string, key: string, value: any): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('session_memory')
        .upsert({
          user_id: this.userId,
          session_id: sessionId,
          key,
          value: JSON.parse(JSON.stringify(value)),
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24h
        }, {
          onConflict: 'user_id,session_id,key'
        })

      if (error) {
        console.error('Failed to set session memory:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error setting session memory:', error)
      return false
    }
  }

  /**
   * Get session memory (temporary)
   */
  async getSessionMemory<T = any>(sessionId: string, key: string): Promise<T | null> {
    try {
      const { data, error } = await this.supabase
        .from('session_memory')
        .select('value, expires_at')
        .eq('user_id', this.userId)
        .eq('session_id', sessionId)
        .eq('key', key)
        .maybeSingle()

      if (error) {
        console.error('Failed to get session memory:', error)
        return null
      }

      // Check expiration
      if (data && new Date(data.expires_at) < new Date()) {
        // Expired, delete it
        await this.deleteSessionMemory(sessionId, key)
        return null
      }

      return data?.value as T || null
    } catch (error) {
      console.error('Error getting session memory:', error)
      return null
    }
  }

  /**
   * Delete session memory
   */
  async deleteSessionMemory(sessionId: string, key: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('session_memory')
        .delete()
        .eq('user_id', this.userId)
        .eq('session_id', sessionId)
        .eq('key', key)

      if (error) {
        console.error('Failed to delete session memory:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error deleting session memory:', error)
      return false
    }
  }

  /**
   * Get all user preferences (helper)
   */
  async getUserPreferences(): Promise<UserPreferences> {
    try {
      const { data, error } = await this.supabase
        .from('user_memory')
        .select('key, value')
        .eq('user_id', this.userId)
        .eq('scope', 'discovery')

      if (error) {
        console.error('Failed to get user preferences:', error)
        return {}
      }

      // Convert array to object
      const preferences: UserPreferences = {}
      data?.forEach((row: any) => {
        preferences[row.key as keyof UserPreferences] = row.value
      })

      return preferences
    } catch (error) {
      console.error('Error getting user preferences:', error)
      return {}
    }
  }

  /**
   * Set user preference (helper)
   */
  async setUserPreference<K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ): Promise<boolean> {
    return this.setProfileMemory(key, value, 'discovery')
  }

  /**
   * Get session context (helper)
   */
  async getSessionContext(sessionId: string): Promise<SessionContext> {
    try {
      const { data, error } = await this.supabase
        .from('session_memory')
        .select('key, value, expires_at')
        .eq('user_id', this.userId)
        .eq('session_id', sessionId)

      if (error) {
        console.error('Failed to get session context:', error)
        return {}
      }

      // Filter expired and convert to object
      const context: SessionContext = {}
      const now = new Date()

      data?.forEach((row: any) => {
        if (new Date(row.expires_at) > now) {
          context[row.key as keyof SessionContext] = row.value
        }
      })

      return context
    } catch (error) {
      console.error('Error getting session context:', error)
      return {}
    }
  }

  /**
   * Update session context (helper)
   */
  async updateSessionContext(
    sessionId: string,
    updates: Partial<SessionContext>
  ): Promise<boolean> {
    try {
      const promises = Object.entries(updates).map(([key, value]) =>
        this.setSessionMemory(sessionId, key, value)
      )

      const results = await Promise.all(promises)
      return results.every((r) => r === true)
    } catch (error) {
      console.error('Error updating session context:', error)
      return false
    }
  }

  /**
   * Clear all session memory for a session
   */
  async clearSession(sessionId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('session_memory')
        .delete()
        .eq('user_id', this.userId)
        .eq('session_id', sessionId)

      if (error) {
        console.error('Failed to clear session:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error clearing session:', error)
      return false
    }
  }
}

/**
 * Create MemoryManager instance
 */
export function createMemoryManager(supabase: SupabaseClient, userId: string): MemoryManager {
  return new MemoryManager(supabase, userId)
}
