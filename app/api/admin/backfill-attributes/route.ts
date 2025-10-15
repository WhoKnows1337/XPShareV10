import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import OpenAI from 'openai';

/**
 * Admin Backfill Attributes API
 * Re-analyzes existing experiences and extracts attributes
 */

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// Levenshtein distance for fuzzy matching
function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
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

  return matrix[b.length][a.length];
}

function findFuzzyMatch(
  value: string,
  allowedValues: string[]
): { value: string; score: number } | null {
  let bestMatch = null;
  let bestScore = 0;

  for (const allowed of allowedValues) {
    const distance = levenshteinDistance(value.toLowerCase(), allowed.toLowerCase());
    const maxLength = Math.max(value.length, allowed.length);
    const similarity = 1 - distance / maxLength;

    if (similarity > bestScore) {
      bestScore = similarity;
      bestMatch = allowed;
    }
  }

  return bestMatch ? { value: bestMatch, score: bestScore } : null;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check if user is admin
    const { data: { user }, error: authError } = await (supabase as any).auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (!profile?.is_admin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Get experiences without attributes
    const { data: experiences, error: fetchError } = await supabase
      .from('experiences')
      .select('id, story_text, category, title')
      .not('story_text', 'is', null)
      .limit(10);

    if (fetchError) {
      console.error('Error fetching experiences:', fetchError);
      throw fetchError;
    }

    if (!experiences || experiences.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No experiences to backfill',
        processed: 0,
      });
    }

    const results = [];

    for (const experience of experiences) {
      try {
        // Check if experience already has attributes
        const { data: existingAttributes } = await supabase
          .from('experience_attributes')
          .select('id')
          .eq('experience_id', experience.id)
          .limit(1);

        if (existingAttributes && existingAttributes.length > 0) {
          results.push({
            experience_id: experience.id,
            title: experience.title,
            status: 'skipped',
            reason: 'Already has attributes',
          });
          continue;
        }

        // Get attribute schema for the category
        const { data: attributeSchema } = await supabase
          .from('attribute_schema')
          .select('*')
          .or(`category_slug.is.null,category_slug.eq.${experience.category}`)
          .eq('is_searchable', true)
          .order('sort_order');

        if (!attributeSchema || attributeSchema.length === 0) {
          results.push({
            experience_id: experience.id,
            title: experience.title,
            status: 'skipped',
            reason: 'No attribute schema available',
          });
          continue;
        }

        // Build AI prompt for attribute extraction
        const analysisPrompt = `Analyze this experience and extract the following attributes. Return ONLY a JSON object with the attributes found (return in canonical lowercase English). For each attribute, include: value (string), confidence (0.0-1.0), evidence (brief quote from text).

Available attributes to extract:
${attributeSchema.map(attr => {
  const values = attr.allowed_values ? JSON.parse(attr.allowed_values as any).join(', ') : 'free text';
  return `- ${attr.key} (${attr.data_type}): ${values}`;
}).join('\n')}

Experience text:
${experience.story_text}

Return format:
{
  "attributes": {
    "attribute_key": {
      "value": "extracted_value",
      "confidence": 0.95,
      "evidence": "quote from text"
    }
  }
}`;

        // Call OpenAI API
        const response = await openai.chat.completions.create({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: 'You are an AI assistant that extracts structured attributes from experience descriptions. Always respond with valid JSON only.',
            },
            {
              role: 'user',
              content: analysisPrompt,
            },
          ],
          temperature: 0.3,
          max_tokens: 2000,
          response_format: { type: 'json_object' },
        });

        const content = response.choices[0].message.content;
        if (!content) {
          throw new Error('No response from OpenAI');
        }

        const analysisResult = JSON.parse(content);

        // Validate and store attributes
        const validatedAttributes: any[] = [];

        for (const [key, attr] of Object.entries(analysisResult.attributes || {})) {
          const extractedAttr = attr as { value: string; confidence: number; evidence?: string };
          const schema = attributeSchema.find((s) => s.key === key);

          if (!schema) {
            continue;
          }

          let finalValue = extractedAttr.value;
          let finalConfidence = extractedAttr.confidence;

          // Validate enum values with fuzzy matching
          if (schema.data_type === 'enum' && schema.allowed_values) {
            const allowedValues = JSON.parse(schema.allowed_values as any);

            if (!allowedValues.includes(extractedAttr.value)) {
              const fuzzyMatch = findFuzzyMatch(extractedAttr.value, allowedValues);

              if (fuzzyMatch && fuzzyMatch.score > 0.7) {
                finalValue = fuzzyMatch.value;
                finalConfidence = extractedAttr.confidence * 0.9;
              } else {
                continue;
              }
            }
          }

          validatedAttributes.push({
            experience_id: experience.id,
            attribute_key: key,
            attribute_value: finalValue,
            confidence: finalConfidence,
            source: 'ai_extracted',
            verified_by_user: false,
            created_by: user.id,
          });
        }

        // Insert attributes
        if (validatedAttributes.length > 0) {
          const { error: insertError } = await supabase
            .from('experience_attributes')
            .insert(validatedAttributes);

          if (insertError) {
            console.error('Error inserting attributes:', insertError);
            throw insertError;
          }

          results.push({
            experience_id: experience.id,
            title: experience.title,
            status: 'success',
            attributes_extracted: validatedAttributes.length,
            attributes: validatedAttributes.map(a => ({
              key: a.attribute_key,
              value: a.attribute_value,
              confidence: a.confidence,
            })),
          });
        } else {
          results.push({
            experience_id: experience.id,
            title: experience.title,
            status: 'no_attributes',
            reason: 'No valid attributes extracted',
          });
        }
      } catch (experienceError: any) {
        console.error(`Error processing experience ${experience.id}:`, experienceError);
        results.push({
          experience_id: experience.id,
          title: experience.title,
          status: 'error',
          error: experienceError.message,
        });
      }
    }

    return NextResponse.json({
      success: true,
      processed: results.length,
      results,
    });
  } catch (error: any) {
    console.error('Backfill attributes API error:', error);

    return NextResponse.json(
      {
        error: 'Failed to backfill attributes',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
