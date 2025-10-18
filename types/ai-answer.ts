/**
 * TypeScript type definitions for AI-powered Q&A system
 * Used for streaming answers with structured output
 */

/**
 * Source experience used in RAG answer
 */
export interface Source {
  id: string
  title: string
  excerpt?: string
  fullText?: string
  category: string
  similarity: number
  date_occurred?: string
  location_text?: string
  attributes?: string[]
}

/**
 * Complete Q&A response from AI
 */
export interface QAResponse {
  answer: string
  sources: Source[]
  confidence: number
  totalSources: number
  meta?: {
    question: string
    executionTime: number
    model: string
    avgSimilarity: number
  }
}

/**
 * Pattern detected by AI in experiences
 */
export interface Pattern {
  type: 'frequency' | 'geographic' | 'temporal' | 'categorical' | 'behavioral'
  pattern: string
  count: number
  examples: string[]
  data?: any // Chart data, varies by type
  locations?: { lat: number; lng: number; label: string }[]
}

/**
 * Section types for structured answers
 */
export type SectionType =
  | 'heading'
  | 'paragraph'
  | 'list'
  | 'experience_card'
  | 'pattern_insight'
  | 'quote'
  | 'statistics'

/**
 * Structured answer section
 */
export interface AnswerSection {
  type: SectionType
  content: string
  metadata?: {
    experienceId?: string
    pattern?: Pattern
    level?: number // Heading level (1-3)
    items?: string[] // List items
    stat?: { value: string; label: string }
  }
}

/**
 * Structured answer output from AI
 * (Future: will be parsed from AI response)
 */
export interface StructuredAnswer {
  sections: AnswerSection[]
  citations: string[]
  followUpQuestions: string[]
  patterns?: Pattern[]
  confidence?: number
}

/**
 * Streaming state for answer generation
 */
export type StreamingState =
  | 'idle'
  | 'generating_embedding'
  | 'searching'
  | 'generating_answer'
  | 'complete'
  | 'error'

/**
 * Progress update during streaming
 */
export interface StreamProgress {
  state: StreamingState
  message: string
  progress?: number // 0-100
}
