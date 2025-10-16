import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { analyzeTextChanges } from '@/lib/utils/text-diff';
import { createClient } from '@/lib/supabase/server';

/**
 * Incremental Analysis API - Re-analyze edited text
 *
 * When users edit their experience text after initial analysis, this endpoint
 * performs smart re-analysis of only the changed content to:
 * - Update category if significantly changed
 * - Add/update relevant attributes
 * - Identify new questions that should be asked
 * - Preserve existing valid data
 *
 * This is more efficient than full re-analysis and preserves user work.
 */

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface IncrementalAnalysisRequest {
  originalText: string;
  editedText: string;
  currentCategory: string;
  currentAttributes: Record<string, { value: string; confidence: number }>;
  currentAnswers: Record<string, any>;
  language?: string;
}

export async function POST(request: NextRequest) {
  try {
    const data: IncrementalAnalysisRequest = await request.json();
    const {
      originalText,
      editedText,
      currentCategory,
      currentAttributes,
      currentAnswers,
      language = 'de',
    } = data;

    if (!originalText || !editedText) {
      return NextResponse.json(
        { error: 'Original and edited text are required' },
        { status: 400 }
      );
    }

    // Analyze the changes
    const textChange = analyzeTextChanges(originalText, editedText);

    // If changes are trivial, return current data unchanged
    if (textChange.severity === 'trivial') {
      return NextResponse.json({
        category: currentCategory,
        attributes: currentAttributes,
        changesDetected: textChange,
        reAnalysisPerformed: false,
        message: 'Changes too minor to require re-analysis',
      });
    }

    const supabase = await createClient();

    // Get attribute schema for current category
    const { data: attributeSchema } = await supabase
      .from('attribute_schema')
      .select('*')
      .or(`category_slug.is.null,category_slug.eq.${currentCategory}`)
      .order('sort_order');

    const hasAttributes = attributeSchema && attributeSchema.length > 0;

    // ⭐ TWO-PASS EXTRACTION for new/changed attributes
    let mentionedAttributeKeys: string[] = [];

    if (hasAttributes) {
      // PASS 1: Identify which attributes are mentioned in the CHANGED/ADDED text
      const identificationPrompt = `Analyze the CHANGES in this text and identify which attributes are EXPLICITLY mentioned in the NEW or CHANGED parts.

**Original Text:**
"""
${originalText}
"""

**Edited Text:**
"""
${editedText}
"""

**Change Summary:**
- Type: ${textChange.type}
- Added words: ${textChange.wordsAdded}
- Deleted words: ${textChange.wordsDeleted}

Available Attributes:
${attributeSchema.map(attr => {
  let valueInfo = '';
  if (attr.data_type === 'enum' && attr.allowed_values) {
    const values = typeof attr.allowed_values === 'string'
      ? JSON.parse(attr.allowed_values)
      : attr.allowed_values;
    valueInfo = `[${values.join(', ')}]`;
  } else {
    valueInfo = `(${attr.data_type})`;
  }
  return `  - ${attr.key}: ${attr.description || attr.display_name} ${valueInfo}`;
}).join('\n')}

STRICT RULES:
1. Only include attributes that are EXPLICITLY mentioned in the CHANGES
2. DO NOT infer or assume based on general knowledge
3. DO NOT include attributes that were already in the original text
4. Boolean fields require EXPLICIT mention
5. State fields require EXPLICIT before/after descriptions
6. When in doubt → EXCLUDE IT

Return ONLY the keys of NEW/CHANGED attributes that are explicitly mentioned.`;

      const identificationSchema = {
        type: 'object' as const,
        properties: {
          mentioned_attributes: {
            type: 'array' as const,
            items: { type: 'string' as const },
            description: 'Attribute keys explicitly mentioned in the changes',
          },
          invalidated_attributes: {
            type: 'array' as const,
            items: { type: 'string' as const },
            description: 'Attribute keys that are no longer valid due to changes',
          },
          reasoning: {
            type: 'string' as const,
            description: 'Brief explanation of findings',
          },
        },
        required: ['mentioned_attributes', 'invalidated_attributes', 'reasoning'],
        additionalProperties: false,
      };

      const identificationResponse = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [{
          role: 'user',
          content: identificationPrompt,
        }],
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: 'incremental_attribute_identification',
            schema: identificationSchema,
          },
        },
        temperature: 0.1,
      });

      const identificationText = identificationResponse.choices[0].message.content || '{}';
      const identificationResult = JSON.parse(identificationText);
      mentionedAttributeKeys = identificationResult.mentioned_attributes || [];
      const invalidatedKeys = identificationResult.invalidated_attributes || [];

      console.log('[Incremental Two-Pass] Pass 1:', {
        mentioned: mentionedAttributeKeys,
        invalidated: invalidatedKeys,
        reasoning: identificationResult.reasoning,
      });

      // PASS 2: Extract values for ONLY identified attributes
      if (mentionedAttributeKeys.length > 0) {
        const filteredSchema = attributeSchema.filter(attr =>
          mentionedAttributeKeys.includes(attr.key)
        );

        const extractionPrompt = `Extract the exact values for these NEW/CHANGED attributes from the edited text.

Edited Text: "${editedText}"

Extract these attributes in CANONICAL ENGLISH LOWERCASE:
${filteredSchema.map(attr => {
  let valueInfo = '';
  if (attr.data_type === 'enum' && attr.allowed_values) {
    const values = typeof attr.allowed_values === 'string'
      ? JSON.parse(attr.allowed_values)
      : attr.allowed_values;
    valueInfo = `[${values.join(', ')}]`;
  } else {
    valueInfo = `(${attr.data_type})`;
  }
  return `  - ${attr.key}: ${attr.description || attr.display_name} ${valueInfo}`;
}).join('\n')}

EXTRACTION RULES:
1. Values MUST be in canonical English lowercase
2. For enum types, ONLY use exact values from the list
3. Extract precise values as stated in text`;

        // Build dynamic schema
        const extractionProperties: Record<string, any> = {};
        for (const attr of filteredSchema) {
          if (attr.data_type === 'enum' && attr.allowed_values) {
            const values = typeof attr.allowed_values === 'string'
              ? JSON.parse(attr.allowed_values)
              : attr.allowed_values;
            extractionProperties[attr.key] = {
              type: 'string',
              enum: values,
            };
          } else if (attr.data_type === 'boolean') {
            extractionProperties[attr.key] = { type: 'boolean' };
          } else if (attr.data_type === 'number') {
            extractionProperties[attr.key] = { type: 'number' };
          } else {
            extractionProperties[attr.key] = { type: 'string' };
          }
        }

        const extractionSchema = {
          type: 'object' as const,
          properties: extractionProperties,
          required: [],
          additionalProperties: false,
        };

        const extractionResponse = await openai.chat.completions.create({
          model: 'gpt-4o',
          messages: [{
            role: 'user',
            content: extractionPrompt,
          }],
          response_format: {
            type: 'json_schema',
            json_schema: {
              name: 'attribute_extraction',
              schema: extractionSchema,
            },
          },
          temperature: 0.3,
        });

        const extractionText = extractionResponse.choices[0].message.content || '{}';
        const extractedAttributes = JSON.parse(extractionText);

        // Clean extracted attributes
        const cleanedAttributes: Record<string, any> = {};
        for (const [key, value] of Object.entries(extractedAttributes)) {
          if (value && value !== '' && value !== 'unknown' && value !== 'not_specified') {
            cleanedAttributes[key] = {
              value,
              confidence: 0.85,
              isManuallyEdited: false,
            };
          }
        }

        // Build response
        const response: any = {
          changesDetected: textChange,
          reAnalysisPerformed: true,
          category: currentCategory,
          attributes: { ...currentAttributes },
        };

        // Update with new attributes
        Object.assign(response.attributes, cleanedAttributes);

        // Remove invalidated attributes
        for (const key of invalidatedKeys) {
          delete response.attributes[key];
        }

        response.meta = {
          twoPassExtraction: true,
          attributesIdentified: mentionedAttributeKeys.length,
          attributesExtracted: Object.keys(cleanedAttributes).length,
          attributesInvalidated: invalidatedKeys.length,
        };

        return NextResponse.json(response);
      }

      // No new attributes found
      const response: any = {
        changesDetected: textChange,
        reAnalysisPerformed: true,
        category: currentCategory,
        attributes: { ...currentAttributes },
      };

      // Remove invalidated attributes
      for (const key of invalidatedKeys) {
        delete response.attributes[key];
      }

      response.meta = {
        twoPassExtraction: true,
        attributesIdentified: 0,
        attributesExtracted: 0,
        attributesInvalidated: invalidatedKeys.length,
      };

      return NextResponse.json(response);
    }

    // No attributes for this category
    return NextResponse.json({
      changesDetected: textChange,
      reAnalysisPerformed: true,
      category: currentCategory,
      attributes: currentAttributes,
      meta: {
        noAttributesAvailable: true,
      },
    });

  } catch (error: any) {
    console.error('Incremental analysis error:', error);

    if (error?.status === 401 || error?.code === 'invalid_api_key') {
      return NextResponse.json(
        { error: 'OpenAI API key invalid or missing' },
        { status: 500 }
      );
    }

    if (error?.status === 429 || error?.code === 'rate_limit_exceeded') {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    return NextResponse.json(
      {
        error: 'Incremental analysis failed',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
