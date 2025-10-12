import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

/**
 * Generate Summary API - Create a concise summary of the experience
 * Uses OpenAI GPT-4o-mini for fast and cost-effective summarization
 */

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text || text.trim().length < 50) {
      return NextResponse.json(
        { error: 'Text is too short for summarization (minimum 50 words)' },
        { status: 400 }
      );
    }

    const prompt = `Erstelle eine prägnante Zusammenfassung des folgenden Erfahrungsberichts.

Anforderungen:
- Maximal 3-4 Sätze
- 150-200 Zeichen ideal (max 250)
- Objektiv und sachlich
- Wichtigste Details: Was, Wann, Wo
- Für Preview/Snippet geeignet
- In derselben Sprache wie der Originaltext

Text:
"""
${text}
"""

Zusammenfassung:`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'Du bist ein AI-Assistent, der prägnante Zusammenfassungen von außergewöhnlichen Erfahrungen erstellt. Du schreibst objektiv, sachlich und fokussierst dich auf die wichtigsten Details.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 100,
    });

    const summary = completion.choices[0].message.content?.trim() || '';

    // Validate summary length
    if (summary.length > 250) {
      return NextResponse.json(
        { summary: summary.substring(0, 247) + '...' },
        { status: 200 }
      );
    }

    return NextResponse.json({
      summary,
      charCount: summary.length,
    });
  } catch (error: any) {
    console.error('Summary generation error:', error);

    // Handle specific OpenAI errors
    if (error?.status === 401) {
      return NextResponse.json({ error: 'OpenAI API key invalid or missing' }, { status: 500 });
    }

    if (error?.status === 429) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    return NextResponse.json(
      {
        error: 'Summary generation failed',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
