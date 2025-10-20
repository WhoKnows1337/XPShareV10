import { openai } from '@ai-sdk/openai'
import { generateText } from 'ai'

/**
 * Generate a short title for a chat based on the first user message
 * Uses OpenAI to create concise, descriptive titles (max 60 chars)
 */
export async function generateChatTitle(firstMessage: string): Promise<string> {
  try {
    const { text } = await generateText({
      model: openai('gpt-4o-mini'),
      prompt: `Generate a very short, concise title (max 60 characters) for a conversation that starts with this user message: "${firstMessage}"\n\nOnly return the title, nothing else. Make it descriptive and relevant.`,
      maxTokens: 20,
      temperature: 0.7,
    })

    return text.trim().replace(/^["']|["']$/g, '') // Remove surrounding quotes
  } catch (error) {
    console.error('Error generating title:', error)
    // Fallback: Use first 60 chars of message
    return firstMessage.length > 60
      ? firstMessage.substring(0, 57) + '...'
      : firstMessage
  }
}
