/**
 * Prompt Template Manager
 *
 * Manages reusable prompt templates with variable substitution.
 * Supports user templates and system-provided templates.
 */

import { createClient } from '@/lib/supabase/client'

export interface PromptTemplate {
  id: string
  userId?: string
  title: string
  description?: string
  category: 'general' | 'search' | 'analytics' | 'patterns'
  promptText: string
  variables: string[]
  isSystem: boolean
  isFavorite: boolean
  useCount: number
  createdAt: string
  updatedAt: string
}

export interface TemplateVariable {
  name: string
  value: string
}

/**
 * Get all templates (user + system)
 */
export async function getTemplates(
  category?: PromptTemplate['category']
): Promise<PromptTemplate[]> {
  const supabase = createClient()

  let query = supabase
    .from('prompt_templates')
    .select('*')
    .order('is_favorite', { ascending: false })
    .order('use_count', { ascending: false })

  if (category) {
    query = query.eq('category', category)
  }

  const { data, error } = await query

  if (error) {
    console.error('[Templates] Failed to fetch:', error)
    return []
  }

  return (data || []).map(mapTemplateFromDB)
}

/**
 * Get template by ID
 */
export async function getTemplate(id: string): Promise<PromptTemplate | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('prompt_templates')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('[Templates] Failed to fetch template:', error)
    return null
  }

  return mapTemplateFromDB(data)
}

/**
 * Create new template
 */
export async function createTemplate(
  template: Omit<PromptTemplate, 'id' | 'userId' | 'isSystem' | 'useCount' | 'createdAt' | 'updatedAt'>
): Promise<PromptTemplate | null> {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    console.error('[Templates] User not authenticated')
    return null
  }

  const { data, error } = await supabase
    .from('prompt_templates')
    .insert({
      user_id: user.id,
      title: template.title,
      description: template.description,
      category: template.category,
      prompt_text: template.promptText,
      variables: template.variables,
      is_favorite: template.isFavorite,
    })
    .select()
    .single()

  if (error) {
    console.error('[Templates] Failed to create:', error)
    return null
  }

  return mapTemplateFromDB(data)
}

/**
 * Update template
 */
export async function updateTemplate(
  id: string,
  updates: Partial<Pick<PromptTemplate, 'title' | 'description' | 'promptText' | 'variables' | 'isFavorite'>>
): Promise<boolean> {
  const supabase = createClient()

  const updateData: any = {
    updated_at: new Date().toISOString(),
  }

  if (updates.title) updateData.title = updates.title
  if (updates.description !== undefined) updateData.description = updates.description
  if (updates.promptText) updateData.prompt_text = updates.promptText
  if (updates.variables) updateData.variables = updates.variables
  if (updates.isFavorite !== undefined) updateData.is_favorite = updates.isFavorite

  const { error } = await supabase
    .from('prompt_templates')
    .update(updateData)
    .eq('id', id)

  if (error) {
    console.error('[Templates] Failed to update:', error)
    return false
  }

  return true
}

/**
 * Delete template
 */
export async function deleteTemplate(id: string): Promise<boolean> {
  const supabase = createClient()

  const { error } = await supabase
    .from('prompt_templates')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('[Templates] Failed to delete:', error)
    return false
  }

  return true
}

/**
 * Increment template use count
 */
export async function incrementTemplateUse(id: string): Promise<void> {
  const supabase = createClient()

  await supabase.rpc('increment_template_use', { template_id: id })
}

/**
 * Fill template with variables
 */
export function fillTemplate(template: PromptTemplate, variables: TemplateVariable[]): string {
  let filled = template.promptText

  variables.forEach((variable) => {
    const placeholder = `{${variable.name}}`
    filled = filled.replace(new RegExp(placeholder, 'g'), variable.value)
  })

  return filled
}

/**
 * Extract variables from template text
 */
export function extractVariables(templateText: string): string[] {
  const regex = /\{([^}]+)\}/g
  const variables: string[] = []
  let match

  while ((match = regex.exec(templateText)) !== null) {
    if (!variables.includes(match[1])) {
      variables.push(match[1])
    }
  }

  return variables
}

/**
 * Validate template (check if all variables are filled)
 */
export function validateTemplate(
  template: PromptTemplate,
  variables: TemplateVariable[]
): { valid: boolean; missing: string[] } {
  const providedVariables = new Set(variables.map((v) => v.name))
  const missing = template.variables.filter((v) => !providedVariables.has(v))

  return {
    valid: missing.length === 0,
    missing,
  }
}

/**
 * Search templates
 */
export async function searchTemplates(query: string): Promise<PromptTemplate[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('prompt_templates')
    .select('*')
    .or(`title.ilike.%${query}%,description.ilike.%${query}%,prompt_text.ilike.%${query}%`)
    .order('use_count', { ascending: false })
    .limit(20)

  if (error) {
    console.error('[Templates] Search failed:', error)
    return []
  }

  return (data || []).map(mapTemplateFromDB)
}

/**
 * Toggle favorite status
 */
export async function toggleFavorite(id: string, isFavorite: boolean): Promise<boolean> {
  return updateTemplate(id, { isFavorite })
}

/**
 * Map database record to PromptTemplate
 */
function mapTemplateFromDB(data: any): PromptTemplate {
  return {
    id: data.id,
    userId: data.user_id,
    title: data.title,
    description: data.description,
    category: data.category,
    promptText: data.prompt_text,
    variables: data.variables || [],
    isSystem: data.is_system || false,
    isFavorite: data.is_favorite || false,
    useCount: data.use_count || 0,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  }
}
