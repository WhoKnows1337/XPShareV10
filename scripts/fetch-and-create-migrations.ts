#!/usr/bin/env tsx
/**
 * Fetch Table Schemas from Supabase and Create Migration File
 * Uses Supabase MCP-like queries to export actual production schemas
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

const MISSING_TABLES = [
  'citations',
  'discovery_chats',
  'discovery_messages',
  'message_attachments',
  'message_branches',
  'prompt_templates',
  'shared_chats',
  'usage_tracking',
  'user_memory',
]

interface ColumnDef {
  column_name: string
  data_type: string
  character_maximum_length: number | null
  is_nullable: string
  column_default: string | null
  udt_name: string
}

interface IndexDef {
  indexname: string
  indexdef: string
}

async function fetchTableSchema(supabase: any, tableName: string) {
  console.log(`\n📋 Fetching schema for ${tableName}...`)

  // Get columns
  const { data: columns, error: colError } = await supabase.rpc('exec_sql', {
    query: `
      SELECT
        column_name,
        data_type,
        character_maximum_length,
        is_nullable,
        column_default,
        udt_name
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = '${tableName}'
      ORDER BY ordinal_position;
    `
  })

  if (colError || !columns || columns.length === 0) {
    console.warn(`⚠️  Could not fetch ${tableName}`)
    return null
  }

  // Get indexes
  const { data: indexes } = await supabase.rpc('exec_sql', {
    query: `
      SELECT indexname, indexdef
      FROM pg_indexes
      WHERE schemaname = 'public'
        AND tablename = '${tableName}'
        AND indexname NOT LIKE '%_pkey';
    `
  })

  console.log(`  ✅ ${columns.length} columns, ${indexes?.length || 0} indexes`)

  return { columns, indexes: indexes || [] }
}

function generateCreateTable(tableName: string, columns: ColumnDef[]): string {
  let sql = `-- Table: ${tableName}\n`
  sql += `CREATE TABLE IF NOT EXISTS public.${tableName} (\n`

  const columnDefs = columns.map((col) => {
    let def = `  ${col.column_name} ${col.udt_name}`

    if (col.is_nullable === 'NO') {
      def += ' NOT NULL'
    }

    if (col.column_default) {
      def += ` DEFAULT ${col.column_default}`
    }

    return def
  })

  sql += columnDefs.join(',\n')
  sql += `\n);\n`

  return sql
}

function generateIndexes(indexes: IndexDef[]): string {
  if (indexes.length === 0) return ''

  let sql = '\n-- Indexes\n'
  indexes.forEach((idx) => {
    sql += `${idx.indexdef};\n`
  })

  return sql
}

async function main() {
  console.log('🚀 Fetching Phase 8 table schemas from Supabase...\n')

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

  const timestamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0].replace('T', '')
  const migrationFile = `${timestamp}_phase8_tables_complete.sql`
  const migrationPath = path.join(process.cwd(), 'supabase', 'migrations', migrationFile)

  let sqlContent = `-- Phase 8 Tables Migration (Complete)
-- Generated: ${new Date().toISOString()}
-- Source: Production database schema export
-- Tables: ${MISSING_TABLES.join(', ')}

-- NOTE: This migration contains CREATE TABLE statements only.
-- RLS policies, triggers, and foreign keys may need to be added manually.

`

  for (const tableName of MISSING_TABLES) {
    const schema = await fetchTableSchema(supabase, tableName)

    if (!schema) continue

    sqlContent += '\n' + '='.repeat(60) + '\n'
    sqlContent += generateCreateTable(tableName, schema.columns)
    sqlContent += generateIndexes(schema.indexes)
    sqlContent += '\n'
  }

  sqlContent += `\n-- Enable RLS on all tables (add specific policies manually)
${MISSING_TABLES.map(t => `ALTER TABLE public.${t} ENABLE ROW LEVEL SECURITY;`).join('\n')}

-- Grant permissions
${MISSING_TABLES.map(t => `GRANT SELECT, INSERT, UPDATE, DELETE ON public.${t} TO authenticated;`).join('\n')}

-- End of migration
`

  fs.writeFileSync(migrationPath, sqlContent, 'utf-8')

  console.log(`\n${'='.repeat(60)}`)
  console.log(`✅ Migration created: supabase/migrations/${migrationFile}`)
  console.log(`📊 Size: ${(sqlContent.length / 1024).toFixed(2)} KB`)
  console.log(`\n⚠️  IMPORTANT: Review and add manually:`)
  console.log(`   - Foreign key constraints`)
  console.log(`   - RLS policies (specific)`)
  console.log(`   - Triggers`)
  console.log(`   - Check constraints`)
  console.log(`\n💡 Next: Review the file, then apply with:`)
  console.log(`   supabase db reset`)
  console.log(`${'='.repeat(60)}\n`)
}

main().catch((err) => {
  console.error('❌ Error:', err.message)
  process.exit(1)
})
