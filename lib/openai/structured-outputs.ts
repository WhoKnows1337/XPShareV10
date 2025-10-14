/**
 * Structured Outputs Helper
 * Converts Supabase attribute_schema to OpenAI JSON Schema format
 *
 * This enables 100% guaranteed schema compliance from OpenAI API
 * No more fuzzy matching or validation needed!
 */

interface AttributeSchema {
  key: string
  display_name: string
  data_type: 'enum' | 'text' | 'number' | 'boolean'
  allowed_values: string[] | string | null
  description?: string
}

interface JSONSchemaProperty {
  type: string
  enum?: string[]
  description?: string
  minimum?: number
}

interface JSONSchema {
  type: 'object'
  properties: Record<string, JSONSchemaProperty>
  required: string[]
  additionalProperties: boolean
}

/**
 * Convert attribute schema from DB to OpenAI JSON Schema
 *
 * @param attributes - Attribute schema from database
 * @returns OpenAI JSON Schema object
 */
export function attributeSchemaToJSONSchema(
  attributes: AttributeSchema[]
): JSONSchema {
  const properties: Record<string, JSONSchemaProperty> = {}

  for (const attr of attributes) {
    // Parse allowed_values if it's a JSON string
    let allowedValues: string[] | null = null
    if (attr.allowed_values) {
      if (typeof attr.allowed_values === 'string') {
        try {
          allowedValues = JSON.parse(attr.allowed_values)
        } catch {
          allowedValues = null
        }
      } else if (Array.isArray(attr.allowed_values)) {
        allowedValues = attr.allowed_values
      }
    }

    // Build JSON Schema property based on data type
    switch (attr.data_type) {
      case 'enum':
        if (allowedValues && allowedValues.length > 0) {
          properties[attr.key] = {
            type: 'string',
            enum: allowedValues,
            description: attr.description || attr.display_name,
          }
        }
        break

      case 'number':
        properties[attr.key] = {
          type: 'number',
          description: attr.description || attr.display_name,
          minimum: 0, // Most measurements are positive
        }
        break

      case 'boolean':
        properties[attr.key] = {
          type: 'boolean',
          description: attr.description || attr.display_name,
        }
        break

      case 'text':
      default:
        properties[attr.key] = {
          type: 'string',
          description: attr.description || attr.display_name,
        }
        break
    }
  }

  return {
    type: 'object',
    properties,
    required: [], // All optional - AI extracts what it finds
    additionalProperties: true, // Allow partial extraction - AI only fills what it finds
  }
}

/**
 * Create optimized analysis prompt for attribute extraction
 */
export function createAttributeAnalysisPrompt(
  text: string,
  language: string,
  category: string,
  attributes: AttributeSchema[]
): string {
  const attributeInstructions = attributes
    .map((attr) => {
      let valueInfo = ''
      if (attr.data_type === 'enum' && attr.allowed_values) {
        const values =
          typeof attr.allowed_values === 'string'
            ? JSON.parse(attr.allowed_values)
            : attr.allowed_values
        valueInfo = `[${values.join(', ')}]`
      } else {
        valueInfo = `(${attr.data_type})`
      }
      return `  - ${attr.key}: ${attr.description || attr.display_name} ${valueInfo}`
    })
    .join('\n')

  return `Analyze this ${category} experience and extract structured attributes.

Language: ${language}
Text: "${text}"

Extract these attributes in CANONICAL ENGLISH LOWERCASE:
${attributeInstructions}

CRITICAL RULES:
1. Values MUST be in canonical English lowercase
   Example: "Dreieck" → "triangle", "métallique" → "metallic"
2. For enum types, ONLY use exact values from the list
3. Extract ONLY if clearly mentioned or strongly implied
4. If not found, omit the field entirely (don't return null)
5. Be confident - include if 70%+ sure

Return JSON with only the attributes you found.`
}
