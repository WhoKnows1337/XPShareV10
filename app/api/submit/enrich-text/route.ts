import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import DiffMatchPatch from 'diff-match-patch';
import type { TextSegment } from '@/lib/utils/text-diff';

/**
 * Text Enrichment API - Merge question answers and attributes into original text
 *
 * Takes the original experience text and enriches it with:
 * - Structured attributes (shape, duration, etc.)
 * - Question answers (date, location, witnesses, etc.)
 *
 * Creates a more complete narrative without changing the user's voice.
 * Returns segments for interactive editing.
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

    const prompt = `Integriere die zusätzlichen Informationen natürlich in den Text.

**Original-Text:**
"""
${text}
"""

**Zusätzliche Informationen aus Fragen:**

Attribute:
${attributesList || '(keine)'}

Antworten:
${answersList || '(keine)'}

**Wichtige Regeln:**
1. ÄNDERE NICHTS am Original-Text - Füge nur neue Informationen hinzu
2. Füge NUR Informationen hinzu, die noch nicht im Text stehen
3. Behalte den persönlichen Stil und die Ich-Perspektive exakt bei
4. Schreibe in der gleichen Sprache wie das Original (${language})
5. Füge die Infos natürlich ein, nicht als Liste
6. KEINE Verbesserungen, KEINE Umformulierungen, KEINE Stiländerungen

Beispiele:
- Original: "Ich sah ein Licht am Himmel."
  Mit Datum/Ort: "Am 15. März 2024 gegen 22:30 Uhr in München sah ich ein Licht am Himmel."

- Original: "Es schwebte dort für einige Minuten."
  Mit Dauer: "Es schwebte dort für etwa 10 Minuten."

Gib NUR den angereicherten Text zurück, keine Erklärungen.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'Du fügst fehlende Fakten in Erfahrungsberichte ein, OHNE irgendetwas zu verändern oder zu verbessern.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.1, // Lower temperature for more factual additions
      max_tokens: 2000,
    });

    const enrichedText = completion.choices[0].message.content || text;

    // Calculate segments with proper positions
    const segments = calculateSegments(text, enrichedText, attributes, answers);

    // Convert to highlights for backward compatibility
    const highlights = segmentsToHighlights(segments);

    return NextResponse.json({
      enrichedText: enrichedText.trim(),
      originalText: text,
      highlights, // Backward compatibility
      segments, // NEW: Detailed segments for interactive editing
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
 * Calculate text segments using diff-match-patch
 * Returns segments with proper positions and types
 */
function calculateSegments(original: string, enriched: string, attributes: Record<string, any>, answers: Record<string, any>): TextSegment[] {
  const dmp = new DiffMatchPatch();
  const diffs = dmp.diff_main(original, enriched);
  dmp.diff_cleanupSemantic(diffs); // Make diffs more human-readable

  const segments: TextSegment[] = [];
  let currentPosition = 0;
  let segmentId = 0;

  for (const [operation, text] of diffs) {
    if (operation === 0) {
      // EQUAL - Original text segment
      segments.push({
        id: `segment-${segmentId++}`,
        type: 'original',
        text,
        start: currentPosition,
        end: currentPosition + text.length,
      });
      currentPosition += text.length;
    } else if (operation === 1) {
      // INSERT - AI added text
      // Try to determine source from attributes or answers
      const source = inferSource(text, attributes, answers);

      segments.push({
        id: `segment-${segmentId++}`,
        type: 'ai-added',
        text,
        start: currentPosition,
        end: currentPosition + text.length,
        source,
      });
      currentPosition += text.length;
    }
    // operation === -1 (DELETE) should not happen in enrichment, so we ignore it
  }

  return segments;
}

/**
 * Infer the source of added text based on attributes and answers
 * Simple heuristic: check if added text contains attribute/answer keywords
 */
function inferSource(addedText: string, attributes: Record<string, any>, answers: Record<string, any>): TextSegment['source'] {
  const lowerText = addedText.toLowerCase();

  // Check attributes
  for (const [key, attr] of Object.entries(attributes)) {
    if (attr.value && typeof attr.value === 'string' && lowerText.includes(attr.value.toLowerCase())) {
      return {
        type: 'attribute',
        key,
        label: key.charAt(0).toUpperCase() + key.slice(1),
      };
    }
  }

  // Check answers
  for (const [key, value] of Object.entries(answers)) {
    if (value && typeof value === 'string' && lowerText.includes(value.toLowerCase())) {
      return {
        type: 'question',
        key,
        label: key === 'date' ? 'Date & Time' : key === 'location' ? 'Location' : key.charAt(0).toUpperCase() + key.slice(1),
      };
    }
  }

  // Default source
  return {
    type: 'question',
    key: 'general',
    label: 'AI Enhancement',
  };
}

/**
 * Calculate simple highlights for backward compatibility
 */
function segmentsToHighlights(segments: TextSegment[]): Array<{
  start: number;
  end: number;
  type: 'added' | 'enhanced';
}> {
  return segments
    .filter((s) => s.type === 'ai-added')
    .map((s) => ({
      start: s.start,
      end: s.end,
      type: 'added' as const,
    }));
}
