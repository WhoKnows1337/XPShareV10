import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

/**
 * AI Analysis API - Extract title, category, and tags from experience text
 * Uses OpenAI GPT-4o-mini for fast and cost-effective analysis
 */

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const CATEGORIES = [
  'UFO',
  'Paranormal',
  'Dreams',
  'Synchronicity',
  'Psychedelic',
  'NDE',
  'Meditation',
  'Astral Projection',
  'Time Anomaly',
  'Entity',
  'Energy',
  'Other',
];

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text || text.trim().length < 50) {
      return NextResponse.json(
        { error: 'Text is too short for analysis (minimum 50 words)' },
        { status: 400 }
      );
    }

    const prompt = `Analyze this paranormal/extraordinary experience and extract:
1. A compelling title (max 80 characters, in the same language as the text)
2. The most appropriate category from this list: ${CATEGORIES.join(', ')}
3. Up to 8 relevant tags (keywords that describe key aspects)

Experience text:
"""
${text}
"""

Respond ONLY with valid JSON in this exact format:
{
  "title": "...",
  "category": "...",
  "tags": ["tag1", "tag2", "..."]
}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are an AI assistant that analyzes extraordinary experiences. You extract meaningful titles, categorize experiences, and identify key themes. Always respond with valid JSON only.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3, // Lower temperature for more consistent results
      max_tokens: 200,
      response_format: { type: 'json_object' },
    });

    const result = JSON.parse(completion.choices[0].message.content || '{}');

    // Validate and sanitize result
    const title = result.title || 'Untitled Experience';
    const category = CATEGORIES.includes(result.category) ? result.category : 'Other';
    const tags = Array.isArray(result.tags)
      ? result.tags.slice(0, 8).filter((tag: string) => typeof tag === 'string' && tag.length > 0)
      : [];

    return NextResponse.json({
      title: title.substring(0, 80), // Ensure max length
      category,
      tags,
    });
  } catch (error: any) {
    console.error('AI Analysis error:', error);

    // Handle specific OpenAI errors
    if (error?.status === 401) {
      return NextResponse.json({ error: 'OpenAI API key invalid or missing' }, { status: 500 });
    }

    if (error?.status === 429) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    return NextResponse.json(
      {
        error: 'AI analysis failed',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
