import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { analyzeSchema, type AnalyzeInput } from '@/lib/validation/submit-schemas';
import { sanitizeText } from '@/lib/validation/sanitization';
import { z } from 'zod';

/**
 * AI Analysis API - Extract title, category, and tags from experience text
 * Uses OpenAI GPT-4o for accurate analysis with validation and sanitization
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
    // Parse and validate request body
    const body = await request.json();

    // Validate input with Zod schema
    const validation = analyzeSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Invalid input',
          details: validation.error.flatten().fieldErrors
        },
        { status: 400 }
      );
    }

    const { text, language = 'en' }: AnalyzeInput = validation.data;

    // Sanitize the text to prevent injection attacks
    const sanitizedText = sanitizeText(text);

    // Additional validation: Check if text is actually meaningful
    if (sanitizedText.length < 50) {
      return NextResponse.json(
        { error: 'Text content too short after sanitization' },
        { status: 400 }
      );
    }

    const prompt = `Analyze this paranormal/extraordinary experience and extract:
1. A compelling title (max 80 characters, in language: ${language})
2. The most appropriate category from this list: ${CATEGORIES.join(', ')}
3. Up to 8 relevant tags (keywords that describe key aspects)

Experience text:
"""
${sanitizedText}
"""

Respond ONLY with valid JSON in this exact format:
{
  "title": "...",
  "category": "...",
  "tags": ["tag1", "tag2", "..."]
}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
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

    // Validate and sanitize AI output to prevent injection
    const title = sanitizeText(result.title || 'Untitled Experience');
    const category = CATEGORIES.includes(result.category) ? result.category : 'Other';
    const tags = Array.isArray(result.tags)
      ? await Promise.all(result.tags
          .slice(0, 8)
          .filter((tag: string) => typeof tag === 'string' && tag.length > 0)
          .map((tag: string) => sanitizeText(tag))) // Sanitize each tag
      : [];

    return NextResponse.json({
      title: title.substring(0, 80), // Ensure max length
      category,
      tags,
      confidence: 0.8, // Add confidence score for transparency
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
