/**
 * AI SDK 5.0 Client with Strict Compatibility
 *
 * Uses modern AI SDK patterns:
 * - createOpenAI() with compatibility: 'strict'
 * - Structured outputs enforcement
 * - Type-safe provider configuration
 *
 * @see https://sdk.vercel.ai/docs/migration-guides/migration-guide-5-0
 */

import { createOpenAI } from '@ai-sdk/openai'

/**
 * OpenAI provider with strict compatibility mode
 * This enforces better structured output conformance
 */
export const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  compatibility: 'strict', // ✅ AI SDK 5.0 strict mode
})

/**
 * Export specific models for type safety
 */
export const gpt4o = openai('gpt-4o')
export const gpt4oMini = openai('gpt-4o-mini')
