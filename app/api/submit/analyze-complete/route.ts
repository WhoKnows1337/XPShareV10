import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createClient } from '@/lib/supabase/server';

/**
 * Complete AI Analysis API - Extract everything in one call:
 * - Category (from 48 subcategories)
 * - Title & Summary
 * - Tags
 * - Structured Attributes (based on category)
 * - Missing info detection
 *
 * Uses OpenAI GPT-4o-mini for semantic attribute extraction
 */

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface AttributeSchema {
  key: string;
  display_name: string;
  data_type: string;
  allowed_values: string[] | null;
  description: string;
}

interface ExtractedAttribute {
  value: string;
  confidence: number;
  evidence: string;
}

export async function POST(request: NextRequest) {
  try {
    const { text, language = 'de' } = await request.json();

    if (!text || text.trim().length < 50) {
      return NextResponse.json(
        { error: 'Text is too short for analysis (minimum 50 characters)' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get all active categories with their attributes
    const { data: categories } = await supabase
      .from('question_categories')
      .select('slug, name, parent_category_id')
      .eq('is_active', true)
      .order('sort_order');

    if (!categories) {
      throw new Error('Failed to load categories');
    }

    // Step 1: Category Detection
    const categoryPrompt = `Analyze this experience text and determine the most specific category.

Text Language: ${language}
Text: "${text}"

Available Categories (choose the most specific subcategory):
${categories.map(c => `- ${c.slug}: ${c.name}`).join('\n')}

IMPORTANT:
- Choose the MOST SPECIFIC subcategory that matches
- Return the slug exactly as listed above
- Be confident in your choice

Return JSON:
{
  "category": "slug-here",
  "confidence": 0.92,
  "reasoning": "why this category"
}`;

    const categoryResponse = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{
        role: 'user',
        content: categoryPrompt
      }],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    });

    const categoryText = categoryResponse.choices[0].message.content || '{}';
    const categoryResult = JSON.parse(categoryText);
    const detectedCategory = categoryResult.category;

    // Get attribute schema for detected category
    const { data: attributeSchema, error: schemaError } = await supabase
      .from('attribute_schema')
      .select('*')
      .or(`category_slug.is.null,category_slug.eq.${detectedCategory}`)
      .order('sort_order');

    if (schemaError) {
      console.error('Attribute schema query error:', schemaError);
      return NextResponse.json(
        { error: 'Failed to load attribute schema', details: schemaError.message },
        { status: 500 }
      );
    }

    // Continue even if no attributes found - not all categories have attributes yet
    const hasAttributes = attributeSchema && attributeSchema.length > 0;

    // Step 2: Complete Analysis with Attributes
    const attributeInstructions = hasAttributes
      ? `Extract these attributes (return in canonical English lowercase):
${attributeSchema.map(attr => {
  const values = attr.allowed_values ? (Array.isArray(attr.allowed_values) ? attr.allowed_values.join(', ') : JSON.parse(attr.allowed_values as any).join(', ')) : 'free text';
  return `- ${attr.key} (${attr.data_type}): ${values}`;
}).join('\n')}`
      : 'No specific attributes defined for this category yet.';

    const analysisPrompt = `Analyze this experience and extract structured information.

Text Language: ${language}
Text: "${text}"

Category: ${detectedCategory}

${attributeInstructions}

IMPORTANT FOR ATTRIBUTES:
- Return attribute values in CANONICAL FORM (lowercase English)
- Example: If user writes "Dreieck" or "triangulaire", return "triangle"
- Example: If user writes "metallisch" or "métallique", return "metallic"
- Use semantic matching, not exact string matching
- Only extract if you find clear evidence in the text
- Provide confidence (0.0-1.0) and evidence snippet

Also extract:
- A compelling title (max 80 chars, in original language)
- A concise summary (2-3 sentences, in original language)
- Up to 8 relevant tags (lowercase, English)
- Missing information that would be helpful

Return JSON:
{
  "title": "...",
  "summary": "...",
  "tags": ["tag1", "tag2"],
  "attributes": {
    "shape": {
      "value": "triangle",
      "confidence": 0.95,
      "evidence": "dreieckiges Objekt"
    }
  },
  "missing_info": ["date", "exact_location"]
}`;

    const analysisResponse = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{
        role: 'user',
        content: analysisPrompt
      }],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    });

    const analysisText = analysisResponse.choices[0].message.content || '{}';
    const analysisResult = JSON.parse(analysisText);

    // Validate attributes against schema (only if we have schema)
    const validatedAttributes: Record<string, ExtractedAttribute> = {};

    if (hasAttributes) {
      for (const [key, attr] of Object.entries(analysisResult.attributes || {})) {
        const schema = attributeSchema.find(s => s.key === key);
        if (!schema) continue;

      const extractedAttr = attr as ExtractedAttribute;

      // For enum types, validate against allowed_values
      if (schema.data_type === 'enum' && schema.allowed_values) {
        const allowedValues = Array.isArray(schema.allowed_values) ? schema.allowed_values : JSON.parse(schema.allowed_values as any);

        if (allowedValues.includes(extractedAttr.value)) {
          validatedAttributes[key] = extractedAttr;
        } else {
          // Try fuzzy matching
          const fuzzyMatch = findFuzzyMatch(extractedAttr.value, allowedValues);
          if (fuzzyMatch && fuzzyMatch.score > 0.7) {
            validatedAttributes[key] = {
              value: fuzzyMatch.value,
              confidence: extractedAttr.confidence * 0.9, // Penalty for fuzzy match
              evidence: extractedAttr.evidence
            };
          } else {
            // Log warning but don't include
            console.warn(`Attribute value "${extractedAttr.value}" not in allowed values for ${key}`);
          }
        }
      } else {
        // Text, number, boolean - accept as-is
        validatedAttributes[key] = extractedAttr;
      }
    }
    }

    // Return complete analysis
    return NextResponse.json({
      category: detectedCategory,
      categoryConfidence: categoryResult.confidence,
      title: analysisResult.title || 'Untitled Experience',
      summary: analysisResult.summary || '',
      tags: analysisResult.tags || [],
      attributes: validatedAttributes,
      missing_info: analysisResult.missing_info || [],
      confidence: categoryResult.confidence || 0.8,
      _debug: {
        attributeSchemaCount: hasAttributes ? attributeSchema.length : 0,
        extractedCount: Object.keys(validatedAttributes).length,
        hasAttributes
      }
    });

  } catch (error: any) {
    console.error('Complete analysis error:', error);

    if (error?.status === 401) {
      return NextResponse.json(
        { error: 'OpenAI API key invalid or missing' },
        { status: 500 }
      );
    }

    if (error?.status === 429) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    return NextResponse.json(
      {
        error: 'Complete analysis failed',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// Helper: Fuzzy string matching
function findFuzzyMatch(
  input: string,
  candidates: string[]
): { value: string; score: number } | null {
  let bestMatch: { value: string; score: number } | null = null;

  for (const candidate of candidates) {
    const score = similarity(input.toLowerCase(), candidate.toLowerCase());
    if (!bestMatch || score > bestMatch.score) {
      bestMatch = { value: candidate, score };
    }
  }

  return bestMatch;
}

// Simple Levenshtein-based similarity (0.0-1.0)
function similarity(s1: string, s2: string): number {
  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length > s2.length ? s2 : s1;

  if (longer.length === 0) return 1.0;

  const editDistance = levenshteinDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}

function levenshteinDistance(s1: string, s2: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= s2.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= s1.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= s2.length; i++) {
    for (let j = 1; j <= s1.length; j++) {
      if (s2.charAt(i - 1) === s1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[s2.length][s1.length];
}
