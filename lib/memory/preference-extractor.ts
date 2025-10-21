/**
 * Preference Extractor
 *
 * Extracts user preferences from conversations using AI.
 * Uses OpenAI structured outputs for reliable extraction.
 */

import { openai } from '@ai-sdk/openai'
import { generateObject } from 'ai'
import { z } from 'zod'
import { UserMemory, saveMemory } from './memory-manager'

// Schema for extracted preferences
const PreferenceSchema = z.object({
  preferences: z.array(
    z.object({
      key: z.string().describe('Short key describing the preference (e.g., "filter_drug_experiences")'),
      value: z.union([z.string(), z.boolean(), z.number(), z.array(z.string())]).describe('The preference value'),
      confidence: z.number().min(0).max(1).describe('Confidence score 0-1'),
      scope: z.enum(['preference', 'dislike', 'fact', 'context']).describe('Type of memory'),
    })
  ),
})

/**
 * Extract preferences from a conversation
 */
export async function extractPreferencesFromConversation(
  conversationMessages: Array<{ role: string; content: string }>,
  userId: string
): Promise<void> {
  try {
    // Build extraction prompt
    const extractionPrompt = buildExtractionPrompt(conversationMessages)

    // Use OpenAI with structured output
    const result = await generateObject({
      model: openai('gpt-4o-mini'),
      schema: PreferenceSchema,
      prompt: extractionPrompt,
      temperature: 0.3, // Low temperature for consistent extraction
    })

    // Save extracted preferences
    for (const pref of result.object.preferences) {
      await saveMemory(userId, {
        scope: pref.scope,
        key: pref.key,
        value: pref.value,
        confidence: pref.confidence,
        source: 'conversation_extraction',
      })
    }

    if (result.object.preferences.length > 0) {
      console.log(`[Preference Extractor] Extracted ${result.object.preferences.length} preferences for user ${userId}`)
    }
  } catch (error) {
    console.error('[Preference Extractor] Failed to extract preferences:', error)
    // Don't throw - preference extraction is non-critical
  }
}

/**
 * Build prompt for preference extraction
 */
function buildExtractionPrompt(messages: Array<{ role: string; content: string }>): string {
  const conversation = messages
    .map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
    .join('\n\n')

  return `Analyze the following conversation and extract user preferences, dislikes, facts, and context.

**Conversation:**
${conversation}

**Instructions:**
1. Look for explicit preferences (e.g., "I don't want to see experiences with drugs")
2. Look for implicit preferences (e.g., user repeatedly asks about UFOs → prefers UFO category)
3. Look for dislikes (e.g., "I'm not interested in...", "Filter out...")
4. Look for facts about the user (e.g., "I live in Berlin", "I'm a researcher")
5. Look for context that might be useful later (e.g., "I'm working on a project about...", "I'm skeptical about...")

**Scope definitions:**
- preference: Things the user likes or wants to see
- dislike: Things the user dislikes or wants to filter out
- fact: Factual information about the user
- context: Contextual information that might be useful

**Confidence scoring:**
- 0.9-1.0: Explicit statement ("I want...", "I don't like...")
- 0.7-0.9: Strong implicit preference (repeated behavior)
- 0.5-0.7: Weak implicit preference (single mention)
- 0.3-0.5: Uncertain/ambiguous

**Key naming:**
Use descriptive snake_case keys:
- filter_drug_experiences
- preferred_category_ufo
- location_berlin
- skeptical_about_paranormal
- interested_in_patterns

Extract ALL relevant preferences. If none found, return empty array.`
}

/**
 * Extract preferences from a single message
 * Faster, simpler version for real-time extraction during chat
 */
export async function extractPreferencesFromMessage(
  userMessage: string,
  assistantMessage: string,
  userId: string
): Promise<void> {
  // Only run extraction if user message contains certain keywords
  const triggers = [
    'don\'t want',
    'not interested',
    'filter',
    'prefer',
    'like',
    'dislike',
    'always',
    'never',
    'show me',
    'hide',
  ]

  const hasRelevantKeywords = triggers.some((trigger) =>
    userMessage.toLowerCase().includes(trigger)
  )

  if (!hasRelevantKeywords) {
    return // Skip extraction for irrelevant messages
  }

  await extractPreferencesFromConversation(
    [
      { role: 'user', content: userMessage },
      { role: 'assistant', content: assistantMessage },
    ],
    userId
  )
}

/**
 * Quick extraction for explicit preferences
 * Uses regex patterns for common preference statements
 */
export async function quickExtractExplicitPreferences(
  userMessage: string,
  userId: string
): Promise<void> {
  const patterns = [
    // "I don't want X"
    {
      pattern: /(?:don'?t|do not)\s+want\s+(?:to see\s+)?(.+)/i,
      scope: 'dislike' as const,
      confidence: 0.95,
    },
    // "I prefer X"
    {
      pattern: /(?:I\s+)?prefer\s+(.+)/i,
      scope: 'preference' as const,
      confidence: 0.9,
    },
    // "Filter out X" or "Hide X"
    {
      pattern: /(?:filter out|hide|exclude)\s+(.+)/i,
      scope: 'dislike' as const,
      confidence: 0.95,
    },
    // "Show me more X"
    {
      pattern: /show\s+(?:me\s+)?(?:more\s+)?(.+)/i,
      scope: 'preference' as const,
      confidence: 0.7,
    },
  ]

  for (const { pattern, scope, confidence } of patterns) {
    const match = userMessage.match(pattern)
    if (match) {
      const value = match[1].trim()
      const key = value.toLowerCase().replace(/\s+/g, '_').substring(0, 50)

      await saveMemory(userId, {
        scope,
        key,
        value,
        confidence,
        source: 'quick_extraction',
      })

      console.log(`[Quick Extract] Found ${scope}: "${value}"`)
    }
  }
}
