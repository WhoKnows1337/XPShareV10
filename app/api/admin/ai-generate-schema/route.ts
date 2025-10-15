import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { isAdmin } from '@/lib/admin-auth'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// POST /api/admin/ai-generate-schema - Generate attributes and questions from natural language
export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userIsAdmin = await isAdmin(user.id)
    if (!userIsAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { prompt, category_slug } = body

    if (!prompt) {
      return NextResponse.json(
        { error: 'Missing required field: prompt' },
        { status: 400 }
      )
    }

    // Build JSON Schema for structured output
    const schema = {
      type: 'object',
      properties: {
        attributes: {
          type: 'array',
          description: 'List of attributes to track',
          items: {
            type: 'object',
            properties: {
              key: {
                type: 'string',
                description: 'Unique key in snake_case (e.g., "ufo_shape", "light_color")',
              },
              display_name: {
                type: 'string',
                description: 'Human-readable name in English',
              },
              display_name_de: {
                type: 'string',
                description: 'Human-readable name in German',
              },
              data_type: {
                type: 'string',
                enum: ['text', 'enum', 'boolean', 'number'],
                description: 'Data type of the attribute',
              },
              allowed_values: {
                anyOf: [
                  { type: 'array', items: { type: 'string' } },
                  { type: 'null' }
                ],
                description: 'For enum type: list of allowed values',
              },
              description: {
                anyOf: [
                  { type: 'string' },
                  { type: 'null' }
                ],
                description: 'Description of what this attribute captures',
              },
              reasoning: {
                type: 'string',
                description: 'Why this attribute is important for pattern matching',
              },
            },
            required: ['key', 'display_name', 'display_name_de', 'data_type', 'allowed_values', 'description', 'reasoning'],
            additionalProperties: false,
          },
        },
        questions: {
          type: 'array',
          description: 'List of questions to ask users',
          items: {
            type: 'object',
            properties: {
              question_text: {
                type: 'string',
                description: 'The question to ask in German',
              },
              question_type: {
                type: 'string',
                enum: ['chips', 'chips-multi', 'text', 'textarea', 'boolean', 'dropdown', 'rating', 'slider'],
                description: 'Type of question UI',
              },
              maps_to_attribute: {
                anyOf: [
                  { type: 'string' },
                  { type: 'null' }
                ],
                description: 'Which attribute this question maps to (use the attribute key)',
              },
              options: {
                anyOf: [
                  {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        label: { type: 'string', description: 'German label' },
                        value: { type: 'string', description: 'Internal value (lowercase, underscores)' },
                      },
                      required: ['label', 'value'],
                      additionalProperties: false,
                    }
                  },
                  { type: 'null' }
                ],
                description: 'Options for chips/dropdown questions',
              },
              priority: {
                type: 'number',
                description: 'Display order (1 = first)',
              },
              is_optional: {
                type: 'boolean',
                description: 'Can user skip this question?',
              },
              reasoning: {
                type: 'string',
                description: 'Why this question is useful',
              },
            },
            required: ['question_text', 'question_type', 'maps_to_attribute', 'options', 'priority', 'is_optional', 'reasoning'],
            additionalProperties: false,
          },
        },
      },
      required: ['attributes', 'questions'],
      additionalProperties: false,
    }

    // Call OpenAI with structured output
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are a data schema expert. Generate structured attributes and questions for experience tracking based on the user's description.

Rules:
1. Create 5-15 attributes that capture key details for pattern matching
2. Use enum types when there are clear options (e.g., colors, shapes, sizes)
3. Attribute keys must be snake_case and unique
4. Create 5-10 questions that map to these attributes
5. Use German for question_text and display names
6. Use chips/dropdown for enum attributes, text for open-ended
7. Priority: most important questions first (1, 2, 3...)
8. Smart-Filtering: Questions are ONLY shown if AI didn't extract the attribute from text
9. Make questions clear and specific`,
        },
        {
          role: 'user',
          content: `Category: ${category_slug || 'general'}

User wants to track: ${prompt}

Generate a complete schema with attributes and questions.`,
        },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'schema_generation',
          schema,
          strict: true,
        },
      },
    })

    const result = JSON.parse(completion.choices[0].message.content || '{}')

    return NextResponse.json({
      success: true,
      schema: result,
      tokens_used: completion.usage?.total_tokens || 0,
    })
  } catch (error: any) {
    console.error('AI Schema Generation error:', error)

    if (error?.status === 401) {
      return NextResponse.json(
        { error: 'OpenAI API key invalid' },
        { status: 500 }
      )
    }

    if (error?.status === 429) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to generate schema', details: error.message },
      { status: 500 }
    )
  }
}
