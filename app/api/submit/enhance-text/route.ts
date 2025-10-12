import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

/**
 * Text Enhancement API - Enhance experience text with AI suggestions
 * Uses OpenAI GPT-4o-mini to improve clarity, grammar, and detail
 *
 * Note: For MVP, this returns the original text.
 * Full implementation would use AI to enhance the text and return highlight ranges.
 */

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text || text.trim().length < 50) {
      return NextResponse.json(
        { error: 'Text is too short for enhancement (minimum 50 words)' },
        { status: 400 }
      );
    }

    // MVP Implementation: Return original text without modifications
    // Full implementation would:
    // 1. Send text to OpenAI for enhancement
    // 2. Perform diff to find added/modified sections
    // 3. Return enhanced text + highlight ranges

    // For now, return original text
    return NextResponse.json({
      enhancedText: text,
      highlights: [],
      hasChanges: false,
    });

    /* Full Implementation Example:

    const prompt = `Verbessere den folgenden Text leicht:
    - Korrigiere Grammatik und Rechtschreibung
    - Verbessere Klarheit ohne den Sinn zu verändern
    - Füge kleine Details hinzu wenn sinnvoll
    - Behalte den persönlichen Stil bei

    Original:
    """
    ${text}
    """

    Verbesserter Text:`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Du verbesserst Texte subtil und behältst den Originalstil bei.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 1000,
    });

    const enhancedText = completion.choices[0].message.content || text;

    // Calculate highlights by comparing texts (simplified)
    const highlights = calculateHighlights(text, enhancedText);

    return NextResponse.json({
      enhancedText,
      highlights,
      hasChanges: highlights.length > 0,
    });
    */
  } catch (error: any) {
    console.error('Text enhancement error:', error);

    return NextResponse.json(
      {
        error: 'Text enhancement failed',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// Helper function to calculate highlight ranges (would need proper implementation)
function calculateHighlights(original: string, enhanced: string) {
  // This would use a proper diff algorithm
  // For MVP, return empty array
  return [];
}
