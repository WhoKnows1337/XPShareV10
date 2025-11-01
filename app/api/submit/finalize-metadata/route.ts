import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

/**
 * Finalize Metadata API - Generate final Title, Summary, and Tags
 *
 * Called after text enrichment with complete information:
 * - Enhanced text (with all details from questions)
 * - Metadata (date, time, location, duration)
 * - Attributes (shape, color, size, etc.)
 * - Category
 *
 * Generates high-quality metadata optimized for search and pattern-matching
 */

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface FinalizeMetadataRequest {
  enhancedText: string;
  originalText: string;
  category: string;
  metadata: {
    date?: string;
    time?: string;
    location?: string;
    duration?: string;
  };
  attributes?: Record<string, { value: string; confidence: number }>;
  language?: string;
}

export async function POST(request: NextRequest) {
  try {
    const data: FinalizeMetadataRequest = await request.json();
    const { enhancedText, originalText, category, metadata, attributes, language = 'de' } = data;

    // Allow texts with 30+ characters (more flexible)
    if (!enhancedText || enhancedText.trim().length < 30) {
      // Generate simple metadata for very short texts
      const simpleTitle = originalText.trim().substring(0, 80);
      const simpleSummary = enhancedText.trim().substring(0, 200);

      return NextResponse.json({
        title: simpleTitle,
        summary: simpleSummary,
        tags: ['experience', category?.replace(/-/g, ' ')].filter(Boolean),
        qualityScore: { title: 70, summary: 70 }
      });
    }

    // Build context from all available information
    const contextParts = [];

    if (metadata.date) contextParts.push(`Date: ${metadata.date}`);
    if (metadata.time) contextParts.push(`Time: ${metadata.time}`);
    if (metadata.location) contextParts.push(`Location: ${metadata.location}`);
    if (metadata.duration) contextParts.push(`Duration: ${metadata.duration}`);

    if (attributes && Object.keys(attributes).length > 0) {
      const attrList = Object.entries(attributes)
        .map(([key, attr]) => `${key}: ${attr.value}`)
        .join(', ');
      contextParts.push(`Attributes: ${attrList}`);
    }

    const contextInfo = contextParts.length > 0
      ? `\n\nStructured Information:\n${contextParts.join('\n')}`
      : '';

    // Create comprehensive prompt for title, summary, and tags
    const prompt = `Generate final metadata for this complete ${category} experience report.

**Complete Enhanced Text:**
"""
${enhancedText}
"""
${contextInfo}

**Generate the following:**

1. **Title** (max 80 characters, in ${language})
   - Compelling and descriptive
   - Include key element + location OR key element + defining detail
   - Natural language, no clickbait
   - Searchable and specific

   Examples:
   - "Dreieckiges UFO über dem Olympiapark München" (48 chars)
   - "Lautlose Lichtkugel folgt Auto auf A8" (38 chars)
   - "Gemeinsame Nahtoderfahrung mit Zeuge" (37 chars)

2. **Summary** (150-250 characters, in ${language})
   - 3-4 concise sentences
   - Lead with key facts (when, where if significant)
   - Objective and factual tone
   - Perfect for feed preview/snippet

3. **Tags** (8-12 tags, lowercase English)
   - Phenomenological aspects (shape, behavior, effects)
   - Location markers (city name, region if significant)
   - Temporal markers (night-sighting, dawn, season if relevant)
   - Context markers (multiple-witnesses, duration-long, clear-sky)
   - Unique identifiers from attributes
   - Optimize for search & pattern-matching

   Good examples: ["munich", "triangle-shaped", "silent", "night-sighting", "witnesses", "hovering", "metallic", "clear-sky"]
   Bad examples: ["ufo", "amazing", "incredible", "wow"] (too generic or subjective)

**CRITICAL:**
- Use ALL available information (enhanced text + metadata + attributes)
- Title and summary must be in ${language}
- Tags must be lowercase English for consistency
- Focus on facts and searchable terms
- No sensationalism or clickbait

Return ONLY valid JSON:
{
  "title": "...",
  "summary": "...",
  "tags": ["tag1", "tag2", ...]
}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are an expert at generating metadata for extraordinary experience reports. You create compelling titles, concise summaries, and searchable tags that accurately represent the experience while being optimized for discovery and pattern-matching.`,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7, // Balanced between creativity and consistency
      max_tokens: 300,
      response_format: { type: 'json_object' },
    });

    const result = JSON.parse(completion.choices[0].message.content || '{}');

    // Validate and sanitize results
    const title = (result.title || 'Untitled Experience').substring(0, 80);
    const summary = (result.summary || '').substring(0, 250);
    const tags = Array.isArray(result.tags)
      ? result.tags
          .slice(0, 12)
          .filter((tag: string) => typeof tag === 'string' && tag.length > 0)
          .map((tag: string) => tag.toLowerCase().trim())
      : [];

    // Calculate quality scores
    const titleLength = title.length;
    const summaryLength = summary.length;
    const tagCount = tags.length;

    const qualityScore = {
      title: titleLength >= 20 && titleLength <= 80 ? 100 : Math.round((titleLength / 80) * 100),
      summary: summaryLength >= 150 && summaryLength <= 250 ? 100 : Math.round((summaryLength / 250) * 100),
      tags: tagCount >= 8 && tagCount <= 12 ? 100 : Math.round((tagCount / 12) * 100),
    };

    return NextResponse.json({
      title,
      summary,
      tags,
      qualityScore,
      charCount: {
        title: titleLength,
        summary: summaryLength,
      },
      _info: {
        basedOn: 'enhanced_text_with_metadata',
        category,
        hasAttributes: attributes && Object.keys(attributes).length > 0,
      }
    });

  } catch (error: any) {
    console.error('Finalize metadata error:', error);

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
        error: 'Metadata finalization failed',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
