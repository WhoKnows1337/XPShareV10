import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createClient } from '@/lib/supabase/server';
import { attributeSchemaToJSONSchema } from '@/lib/openai/structured-outputs';
import { analyzeCompleteSchema, type AnalyzeCompleteInput } from '@/lib/validation/submit-schemas';
import { sanitizeText, sanitizeAttributeValue, containsSuspiciousPatterns } from '@/lib/validation/sanitization';

/**
 * Complete AI Analysis API - Extract everything in one call:
 * - Category (from 48 subcategories)
 * - Title & Summary
 * - Tags
 * - Structured Attributes (based on category) using OpenAI Structured Outputs
 * - Missing info detection
 *
 * Uses OpenAI GPT-4o with Structured Outputs for 100% schema compliance
 * Includes validation and sanitization for security
 */

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface AttributeSchema {
  key: string;
  display_name: string;
  data_type: string | null;
  allowed_values: string[] | null;
  description: string | null;
}

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();

    // Validate with Zod schema
    const validation = analyzeCompleteSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Invalid input',
          details: validation.error.flatten().fieldErrors
        },
        { status: 400 }
      );
    }

    const { text, language = 'de', category: providedCategory, existingAttributes }: AnalyzeCompleteInput = validation.data;

    // Check for suspicious patterns
    if (containsSuspiciousPatterns(text)) {
      console.warn('Suspicious patterns in analyze-complete request');
      return NextResponse.json(
        { error: 'Content contains prohibited patterns' },
        { status: 400 }
      );
    }

    // Sanitize the text
    const sanitizedText = sanitizeText(text);

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

    // Step 1: Category Detection with Structured Outputs
    const categoryPrompt = `Analyze this experience text and determine the most specific category.

Text Language: ${language}
Text: "${sanitizedText}"

Available Categories (choose the most specific subcategory BY SLUG):
${categories.map(c => `- slug: "${c.slug}" (name: ${c.name})`).join('\n')}

CRITICAL:
- Return ONLY the slug (e.g., "dreams", not "Träume und Luzides Träumen")
- Choose the MOST SPECIFIC subcategory that matches
- Be confident in your choice`;

    // Use Structured Outputs to enforce slug format
    const categorySchema = {
      type: 'object' as const,
      properties: {
        category: {
          type: 'string' as const,
          description: 'The category slug (NOT the name)',
          enum: categories.map(c => c.slug)
        },
        confidence: {
          type: 'number' as const,
          description: 'Confidence score between 0 and 1'
        },
        reasoning: {
          type: 'string' as const,
          description: 'Brief explanation for the category choice'
        }
      },
      required: ['category', 'confidence', 'reasoning'],
      additionalProperties: false
    };

    const categoryResponse = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{
        role: 'user',
        content: categoryPrompt
      }],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'category_detection',
          schema: categorySchema
        }
      },
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

    // ⭐ NEW: Two-Pass Extraction Approach
    // PASS 1: Identify which attributes are EXPLICITLY mentioned in the text
    let mentionedAttributeKeys: string[] = [];
    
    if (hasAttributes) {
      const identificationPrompt = `Analyze this text and identify which attributes are EXPLICITLY mentioned.

Language: ${language}
Text: "${sanitizedText}"

Available Attributes:
${attributeSchema.map(attr => {
  let valueInfo = ''
  if (attr.data_type === 'enum' && attr.allowed_values) {
    const values = typeof attr.allowed_values === 'string'
      ? JSON.parse(attr.allowed_values)
      : attr.allowed_values
    valueInfo = `[${values.join(', ')}]`
  } else {
    valueInfo = `(${attr.data_type})`
  }
  return `  - ${attr.key}: ${attr.description || attr.display_name} ${valueInfo}`
}).join('\n')}

STRICT RULES:
1. Only include an attribute if the text EXPLICITLY mentions it
2. DO NOT infer or assume based on general knowledge about the topic
3. "hell" or "bright" refers to VISIBILITY, NOT color attributes
4. "awake" or "asleep" must be EXPLICITLY stated, don't assume from context
5. Boolean fields (has_witnesses, has_documentation) require EXPLICIT mention of witnesses/photos/videos
6. State fields (prior_state, afterwards_feeling) require EXPLICIT before/after descriptions
7. If duration/time not mentioned → don't include duration fields
8. When in doubt → EXCLUDE IT

Return ONLY the keys of attributes that are explicitly mentioned.`;

      const identificationSchema = {
        type: 'object' as const,
        properties: {
          mentioned_attributes: {
            type: 'array' as const,
            items: { type: 'string' as const },
            description: 'List of attribute keys that are EXPLICITLY mentioned in the text'
          },
          reasoning: {
            type: 'string' as const,
            description: 'Brief explanation of which attributes were found and why others were excluded'
          }
        },
        required: ['mentioned_attributes', 'reasoning'],
        additionalProperties: false
      };

      const identificationResponse = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [{
          role: 'user',
          content: identificationPrompt
        }],
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: 'attribute_identification',
            schema: identificationSchema
          }
        },
        temperature: 0.1, // Very low temperature for strict identification
      });

      const identificationText = identificationResponse.choices[0].message.content || '{}';
      const identificationResult = JSON.parse(identificationText);
      mentionedAttributeKeys = identificationResult.mentioned_attributes || [];

      console.log('[Two-Pass] Pass 1 - Identified attributes:', {
        total: attributeSchema.length,
        mentioned: mentionedAttributeKeys.length,
        keys: mentionedAttributeKeys,
        reasoning: identificationResult.reasoning
      });
    }

    // PASS 2: Extract ONLY the mentioned attributes
    // Build schema with ONLY identified attributes
    const filteredAttributeSchema = hasAttributes && mentionedAttributeKeys.length > 0
      ? attributeSchema.filter(attr => mentionedAttributeKeys.includes(attr.key))
      : [];

    const attributeSchemaObj = filteredAttributeSchema.length > 0
      ? attributeSchemaToJSONSchema(filteredAttributeSchema as any)
      : { type: 'object' as const, properties: {}, required: [], additionalProperties: false };

    // Create comprehensive JSON schema including all fields
    const completeSchema = {
      type: 'object' as const,
      properties: {
        title: {
          type: 'string' as const,
          description: 'Compelling title for the experience (max 80 chars, in original language)'
        },
        tags: {
          type: 'array' as const,
          items: { type: 'string' as const },
          description: 'Up to 8 relevant tags (lowercase, English)',
          maxItems: 8
        },
        attributes: attributeSchemaObj,
        missing_info: {
          type: 'array' as const,
          items: { type: 'string' as const },
          description: 'List of missing information that would be helpful'
        }
      },
      required: ['title', 'tags', 'attributes', 'missing_info'],
      additionalProperties: false
    };

    // Create extraction prompt - only for identified attributes
    const attributeInstructions = filteredAttributeSchema.length > 0
      ? `\nExtract these attributes in CANONICAL ENGLISH LOWERCASE:
${filteredAttributeSchema.map(attr => {
  let valueInfo = ''
  if (attr.data_type === 'enum' && attr.allowed_values) {
    const values = typeof attr.allowed_values === 'string'
      ? JSON.parse(attr.allowed_values)
      : attr.allowed_values
    valueInfo = `[${values.join(', ')}]`
  } else {
    valueInfo = `(${attr.data_type})`
  }
  return `  - ${attr.key}: ${attr.description || attr.display_name} ${valueInfo}`
}).join('\n')}

EXTRACTION RULES:
1. Values MUST be in canonical English lowercase
2. For enum types, ONLY use exact values from the list
3. These attributes were pre-identified as mentioned - extract their exact values
4. "hell/bright" → use for visibility attribute, NOT color
5. Extract the precise value stated in the text`
      : '\nNo specific attributes identified in the text.';

    const analysisPrompt = `Analyze this ${detectedCategory} experience and extract structured information.

Language: ${language}
Text: "${sanitizedText}"
${attributeInstructions}

ALSO EXTRACT:
- A compelling title (max 80 chars, in original language)
- Up to 8 relevant tags (lowercase, English)
- Missing information that would be helpful

Return complete JSON with all fields: title, tags[], attributes{}, missing_info[]`;

    // Use Structured Outputs for 100% schema compliance
    const analysisResponse = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{
        role: 'user',
        content: analysisPrompt
      }],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'experience_analysis',
          schema: completeSchema
        }
      },
      temperature: 0.3,
    });

    const analysisText = analysisResponse.choices[0].message.content || '{}';
    const analysisResult = JSON.parse(analysisText);

    // Post-processing: Remove any "unknown" values and ensure clean data
    const cleanedAttributes: Record<string, any> = {};
    for (const [key, value] of Object.entries(analysisResult.attributes || {})) {
      // Skip "unknown", "not_specified", null, or empty values
      if (value && value !== 'unknown' && value !== 'not_specified' && value !== '') {
        cleanedAttributes[key] = value;
      }
    }

    // Sanitize AI output before returning
    const sanitizedTitle = sanitizeText(analysisResult.title || 'Untitled Experience');
    const sanitizedTags = (analysisResult.tags || []).map((tag: string) => sanitizeText(tag));
    const sanitizedMissingInfo = (analysisResult.missing_info || []).map((info: string) => sanitizeText(info));

    // Return complete analysis (summary removed - generated later in finalize-metadata)
    return NextResponse.json({
      category: detectedCategory,
      categoryConfidence: categoryResult.confidence,
      title: sanitizedTitle,
      tags: sanitizedTags,
      attributes: cleanedAttributes,
      missing_info: sanitizedMissingInfo,
      confidence: categoryResult.confidence || 0.8,
      _debug: {
        twoPassExtraction: true,
        pass1_totalAttributes: hasAttributes ? attributeSchema.length : 0,
        pass1_identifiedAttributes: mentionedAttributeKeys.length,
        pass1_identifiedKeys: mentionedAttributeKeys,
        pass2_extractedCount: Object.keys(cleanedAttributes).length,
        pass2_extractedKeys: Object.keys(cleanedAttributes),
        removedUnknownValues: Object.keys(analysisResult.attributes || {}).length - Object.keys(cleanedAttributes).length,
        categoryReasoning: categoryResult.reasoning,
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
