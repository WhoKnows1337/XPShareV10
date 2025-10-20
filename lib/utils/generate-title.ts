/**
 * Generate a short title for a chat based on the first user message
 * Calls API route to use OpenAI for concise, descriptive titles (max 60 chars)
 */
export async function generateChatTitle(firstMessage: string): Promise<string> {
  try {
    const response = await fetch('/api/discover/generate-title', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: firstMessage }),
    })

    if (!response.ok) {
      throw new Error('Failed to generate title')
    }

    const { title } = await response.json()
    return title
  } catch (error) {
    console.error('Error generating title:', error)
    // Fallback: Use first 60 chars of message
    return firstMessage.length > 60
      ? firstMessage.substring(0, 57) + '...'
      : firstMessage
  }
}
