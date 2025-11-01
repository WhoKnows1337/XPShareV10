import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/admin-auth'
import { GlobalConfigClient } from './global-config-client'

interface AttributeSchemaRow {
  allowed_values: unknown | null
  category_slug: string | null
  created_at: string | null
  data_type: string | null
  description: string | null
  display_name: string
  display_name_de: string | null
  display_name_es: string | null
  display_name_fr: string | null
  is_filterable: boolean | null
  is_searchable: boolean | null
  key: string
  sort_order: number | null
  updated_at: string | null
}

export const metadata = {
  title: 'Global Configuration | Admin',
  description: 'Manage universal questions and attributes that apply to all categories',
}

export default async function GlobalConfigPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?redirect=/admin/global-config')
  }

  const userIsAdmin = await isAdmin(user.id)
  if (!userIsAdmin) {
    redirect('/')
  }

  // Load universal questions (category_id IS NULL)
  const { data: questionsData } = await supabase
    .from('dynamic_questions')
    .select('*')
    .is('category_id', null)
    .order('priority', { ascending: true })

  const questions = questionsData || []

  // Load universal attributes (category_slug IS NULL)
  const { data: attributesRawData } = await supabase
    .from('attribute_schema')
    .select('*')
    .is('category_slug', null)
    .order('sort_order', { ascending: true })

  const attributesRaw: AttributeSchemaRow[] | null = attributesRawData

  // Parse allowed_values from JSON string to array
  const attributes = attributesRaw?.map(attr => ({
    ...attr,
    allowed_values: attr.allowed_values
      ? (Array.isArray(attr.allowed_values)
        ? attr.allowed_values
        : typeof attr.allowed_values === 'string'
        ? (() => {
            try {
              const parsed = JSON.parse(attr.allowed_values)
              return Array.isArray(parsed) ? parsed : null
            } catch {
              return attr.allowed_values.split(',').map((v: string) => v.trim())
            }
          })()
        : null)
      : null
  })) || []

  return (
    <GlobalConfigClient
      initialQuestions={(questions || []) as any}
      attributes={attributes as any}
    />
  )
}
