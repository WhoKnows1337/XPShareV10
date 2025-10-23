/**
 * Citation Types
 *
 * Shared type definitions for the citation system.
 * Separated from server-code to allow client-side imports.
 */

export interface Citation {
  experienceId: string
  toolName: string
  citationIndex: number
  relevanceScore: number
  snippet?: string
  contextBefore?: string
  contextAfter?: string
  experience?: {
    id: string
    title: string
    category: string
    created_at: string
    user_id: string
    profiles?: {
      username: string
      avatar_url?: string
    }
  }
}

export interface ToolResultWithExperiences {
  toolName: string
  result: unknown
}
