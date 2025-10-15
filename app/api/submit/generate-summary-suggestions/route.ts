import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

/**
 * Generate Summary Suggestions API
 *
 * Generates 3 alternative summary suggestions based on the original text,
 * category, and current summary. Used for the refresh functionality in Step 3.
 */

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface SummarySuggestionsRequest {
  text: string;
  category: string;
  currentSummary?: string;
}

export async function POST(request: NextRequest) {
  try {
    const data: SummarySuggestionsRequest = await request.json();
    const { text, category, currentSummary } = data;

    if (!text || text.trim().length < 50) {
      return NextResponse.json(
        { error: 'Text ist zu kurz für Zusammenfassungs-Generierung (mindestens 50 Zeichen erforderlich)' },
        { status: 400 }
      );
    }

    if (!category) {
      return NextResponse.json(
        { error: 'Kategorie erforderlich' },
        { status: 400 }
      );
    }

    // Create prompt for generating 3 alternative summaries
    const prompt = `Generate 3 alternative summaries for this ${category} experience report.

**Experience Text:**
"""
${text}
"""

${currentSummary ? `**Current Summary:** "${currentSummary}"\n` : ''}
**Requirements for each summary:**
- 150-250 characters (German)
- 3-4 concise sentences
- Lead with key facts (when, where if significant)
- Objective and factual tone
- Perfect for feed preview/snippet
- Each summary should emphasize different aspects

**Generate 3 diverse alternatives that:**
1. Vary in focus (chronological vs. thematic vs. emotional)
2. Emphasize different key details
3. Use different opening strategies
4. Are all objective and factual
5. Work well as standalone previews

**Example of good summary:**
"Am 15. März 2024 beobachtete ich ein dreieckiges Objekt über München. Es bewegte sich lautlos und änderte plötzlich die Richtung. Zwei weitere Zeugen bestätigten die Sichtung."

Return ONLY valid JSON:
{
  "suggestions": ["Summary 1", "Summary 2", "Summary 3"]
}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are an expert at writing concise, engaging summaries for extraordinary experience reports. You create diverse summaries that are factual, objective, and optimized for feed previews while maintaining reader interest.`,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.9, // Higher temperature for more diversity
      max_tokens: 400,
      response_format: { type: 'json_object' },
    });

    const result = JSON.parse(completion.choices[0].message.content || '{}');

    // Validate and sanitize results
    const suggestions = Array.isArray(result.suggestions)
      ? result.suggestions
          .slice(0, 3)
          .filter((summary: string) => typeof summary === 'string' && summary.length > 0)
          .map((summary: string) => summary.substring(0, 250).trim())
      : [];

    // Ensure we have exactly 3 suggestions
    while (suggestions.length < 3) {
      suggestions.push(`Alternative Zusammenfassung ${suggestions.length + 1}`);
    }

    return NextResponse.json({
      suggestions,
      category,
      _info: {
        basedOn: 'original_text',
        hadCurrentSummary: !!currentSummary,
      }
    });

  } catch (error: any) {
    console.error('Summary suggestions generation error:', error);

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
        error: 'Summary suggestions generation failed',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
