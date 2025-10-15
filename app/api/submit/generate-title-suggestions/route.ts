import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

/**
 * Generate Title Suggestions API
 *
 * Generates 3 alternative title suggestions based on the original text,
 * category, and current title. Used for the refresh functionality in Step 3.
 */

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface TitleSuggestionsRequest {
  text: string;
  category: string;
  currentTitle?: string;
}

export async function POST(request: NextRequest) {
  try {
    const data: TitleSuggestionsRequest = await request.json();
    const { text, category, currentTitle } = data;

    if (!text || text.trim().length < 50) {
      return NextResponse.json(
        { error: 'Text ist zu kurz für Titel-Generierung (mindestens 50 Zeichen erforderlich)' },
        { status: 400 }
      );
    }

    if (!category) {
      return NextResponse.json(
        { error: 'Kategorie erforderlich' },
        { status: 400 }
      );
    }

    // Create prompt for generating 3 alternative titles
    const prompt = `Generate 3 alternative titles for this ${category} experience report.

**Experience Text:**
"""
${text}
"""

${currentTitle ? `**Current Title:** "${currentTitle}"\n` : ''}
**Requirements for each title:**
- Maximum 80 characters
- In German (DE)
- Compelling and descriptive
- Include key element + location OR key element + defining detail
- Natural language, no clickbait
- Searchable and specific
- Each title should be unique and offer different perspectives/emphasis

**Good Examples:**
- "Dreieckiges UFO über dem Olympiapark München" (48 chars)
- "Lautlose Lichtkugel folgt Auto auf A8" (38 chars)
- "Gemeinsame Nahtoderfahrung mit Zeuge" (37 chars)
- "Spontane Heilung nach jahrelanger Krankheit" (44 chars)

**Generate 3 diverse alternatives that:**
1. Emphasize different aspects (location, phenomenon, emotion, context)
2. Use varied vocabulary and phrasing
3. Appeal to different reader interests
4. Are all factual and search-optimized

Return ONLY valid JSON:
{
  "suggestions": ["Title 1", "Title 2", "Title 3"]
}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are an expert at crafting compelling titles for extraordinary experience reports. You create diverse, search-optimized titles that accurately represent experiences while being concise and engaging.`,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.9, // Higher temperature for more diversity
      max_tokens: 200,
      response_format: { type: 'json_object' },
    });

    const result = JSON.parse(completion.choices[0].message.content || '{}');

    // Validate and sanitize results
    const suggestions = Array.isArray(result.suggestions)
      ? result.suggestions
          .slice(0, 3)
          .filter((title: string) => typeof title === 'string' && title.length > 0)
          .map((title: string) => title.substring(0, 80).trim())
      : [];

    // Ensure we have exactly 3 suggestions
    while (suggestions.length < 3) {
      suggestions.push(`Alternative Titel ${suggestions.length + 1}`);
    }

    return NextResponse.json({
      suggestions,
      category,
      _info: {
        basedOn: 'original_text',
        hadCurrentTitle: !!currentTitle,
      }
    });

  } catch (error: any) {
    console.error('Title suggestions generation error:', error);

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
        error: 'Title suggestions generation failed',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
