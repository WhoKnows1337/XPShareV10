import { openai } from '@ai-sdk/openai'
import { generateText } from 'ai'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { message } = await req.json()

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    const { text } = await generateText({
      model: openai('gpt-4o-mini'),
      prompt: `Generate a very short, concise title (max 60 characters) for a conversation that starts with this user message: "${message}"\n\nOnly return the title, nothing else. Make it descriptive and relevant.`,
      maxTokens: 20,
      temperature: 0.7,
    })

    const title = text.trim().replace(/^["']|["']$/g, '')
    return NextResponse.json({ title })
  } catch (error) {
    console.error('Error generating title:', error)
    // Fallback: Use first 60 chars of message
    const { message } = await req.json()
    const fallbackTitle = message.length > 60
      ? message.substring(0, 57) + '...'
      : message
    return NextResponse.json({ title: fallbackTitle })
  }
}
