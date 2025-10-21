/**
 * Generate TypeScript types from Supabase database schema
 * Alternative approach using direct SQL queries via MCP
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function generateTypes() {
  // Query to get all table columns and their types
  const { data, error } = await supabase.rpc('get_table_schema', {
    schema_name: 'public'
  })

  if (error) {
    console.error('Error fetching schema:', error)
    process.exit(1)
  }

  console.log('Schema data:', JSON.stringify(data, null, 2))
}

generateTypes()
