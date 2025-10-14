import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

/**
 * Text Enrichment API - Merge question answers and attributes into original text
 *
 * Takes the original experience text and enriches it with:
 * - Structured attributes (shape, duration, etc.)
 * - Question answers (date, location, witnesses, etc.)
 *
 * Creates a more complete narrative without changing the user's voice.
 */

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface EnrichmentData {
  text: string;
  attributes: Record<string, { value: string; confidence: number }>;
  answers: Record<string, any>;
  language?: string;
}

export async function POST(request: NextRequest) {
  try {
    const data: EnrichmentData = await request.json();
    const { text, attributes, answers, language = 'de' } = data;

    if (!text || text.trim().length < 50) {
      return NextResponse.json(
        { error: 'Text is too short for enrichment (minimum 50 characters)' },
        { status: 400 }
      );
    }

    // Prepare enrichment context
    const attributesList = Object.entries(attributes || {})
      .map(([key, attr]) => `- ${key}: ${attr.value}`)
      .join('\n');

    const answersList = Object.entries(answers || {})
      .filter(([_, value]) => value !== undefined && value !== '')
      .map(([key, value]) => `- ${key}: ${value}`)
      .join('\n');

    const prompt = `Integriere die zusätzlichen Informationen natürlich in den Text, sodass er vollständiger wird.

**Original-Text:**
"""
${text}
"""

**Zusätzliche Informationen:**

Attribute:
${attributesList || '(keine)'}

Antworten:
${answersList || '(keine)'}

**Regeln:**
1. Behalte den persönlichen Stil und die Ich-Perspektive bei
2. Füge nur Informationen hinzu, die noch nicht im Text stehen
3. Verändere keine bestehenden Aussagen
4. Schreibe in der gleichen Sprache wie das Original (${language})
5. Bleibe authentisch und natürlich

Beispiel:
- Original: "Ich sah ein Licht am Himmel."
- Mit Datum/Ort: "Am 15. März 2024 in München sah ich ein Licht am Himmel."
- Mit Form: "Ich sah ein dreieckiges Licht am Himmel."

Gib NUR den angereicherten Text zurück, keine Erklärungen.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Du bist ein Assistent, der Erfahrungsberichte anreichert, ohne den Originalstil zu verändern.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 2000,
    });

    const enrichedText = completion.choices[0].message.content || text;

    // Calculate highlights (simplified: assume everything after original text is added)
    const highlights = calculateHighlights(text, enrichedText);

    return NextResponse.json({
      enrichedText: enrichedText.trim(),
      originalText: text,
      highlights,
      hasChanges: enrichedText !== text,
    });

  } catch (error: any) {
    console.error('Text enrichment error:', error);

    if (error?.status === 401 || error?.code === 'invalid_api_key') {
      return NextResponse.json(
        { error: 'OpenAI API key invalid or missing' },
        { status: 500 }
      );
    }

    if (error?.status === 429 || error?.code === 'rate_limit_exceeded') {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    return NextResponse.json(
      {
        error: 'Text enrichment failed',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * Calculate highlight ranges by finding added sections
 * Uses simple character-based comparison
 */
function calculateHighlights(original: string, enriched: string): Array<{
  start: number;
  end: number;
  type: 'added' | 'enhanced';
}> {
  const highlights: Array<{ start: number; end: number; type: 'added' | 'enhanced' }> = [];

  // Simple implementation: if enriched is longer, highlight the end
  if (enriched.length > original.length) {
    const addedStart = original.length;
    highlights.push({
      start: addedStart,
      end: enriched.length,
      type: 'added'
    });
  }

  // More sophisticated diff would be needed for proper highlighting
  // Could use libraries like diff-match-patch for better results

  return highlights;
}
