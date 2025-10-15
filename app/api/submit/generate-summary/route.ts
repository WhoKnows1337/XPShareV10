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
    const { text, metadata } = await request.json();

    if (!text || text.trim().length < 50) {
      return NextResponse.json(
        { error: 'Text is too short for summarization (minimum 50 characters)' },
        { status: 400 }
      );
    }

    // Build context from metadata if available
    let contextInfo = '';
    if (metadata) {
      const parts = [];

      if (metadata.category) {
        parts.push(`Kategorie: ${metadata.category}`);
      }

      if (metadata.date && metadata.time) {
        parts.push(`Datum/Zeit: ${metadata.date} um ${metadata.time}`);
      } else if (metadata.date) {
        parts.push(`Datum: ${metadata.date}`);
      }

      if (metadata.location) {
        parts.push(`Ort: ${metadata.location}`);
      }

      if (metadata.duration) {
        const durationMap: Record<string, string> = {
          'less_than_1min': 'unter 1 Minute',
          '1_to_5min': '1-5 Minuten',
          'more_than_5min': 'über 5 Minuten'
        };
        parts.push(`Dauer: ${durationMap[metadata.duration] || metadata.duration}`);
      }

      if (parts.length > 0) {
        contextInfo = `\n\nStrukturierte Informationen:\n${parts.join('\n')}`;
      }
    }

    const prompt = `Erstelle eine prägnante Zusammenfassung des folgenden Erfahrungsberichts.${contextInfo}

Anforderungen:
- Maximal 3-4 Sätze (150-200 Zeichen ideal, max 250)
- Objektiv und sachlich
- Beginne mit den wichtigsten Fakten (Wann, Wo falls vorhanden)
- Fokus auf Kern-Ereignisse
- Für Preview/Snippet in Feed geeignet
- In derselben Sprache wie der Originaltext

Detaillierter Bericht:
"""
${text}
"""

Zusammenfassung:`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
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
