#!/usr/bin/env tsx
/**
 * Export Table Schemas Directly from Supabase
 *
 * Alternative to `supabase db diff` that doesn't require Docker.
 * Uses direct SQL queries to export CREATE TABLE statements.
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

async function exportTableSchemas() {
  console.log('🚀 Exporting table schemas from Supabase...\n')

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

  const timestamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0].replace('T', '')
  const migrationFile = `${timestamp}_phase8_tables.sql`
  const migrationPath = path.join(process.cwd(), 'supabase', 'migrations', migrationFile)

  let sqlContent = `-- Phase 8 Tables Migration
-- Generated: ${new Date().toISOString()}
-- Tables: ${MISSING_TABLES.join(', ')}

`

  for (const tableName of MISSING_TABLES) {
    console.log(`📋 Exporting ${tableName}...`)

    // Get table definition using information_schema
    const { data: columns, error } = await supabase.rpc('exec_sql', {
      query: `
        SELECT
          column_name,
          data_type,
          character_maximum_length,
          column_default,
          is_nullable,
          udt_name
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = '${tableName}'
        ORDER BY ordinal_position;
      `
    })

    if (error) {
      console.error(`❌ Error fetching ${tableName}:`, error.message)
      continue
    }

    if (!columns || columns.length === 0) {
      console.warn(`⚠️  Table ${tableName} not found in database`)
      continue
    }

    sqlContent += `\n-- Table: ${tableName}\n`
    sqlContent += `CREATE TABLE IF NOT EXISTS public.${tableName} (\n`

    // Build column definitions (simplified)
    const columnDefs = columns.map((col: any) => {
      let def = `  ${col.column_name} ${col.data_type.toUpperCase()}`
      if (col.character_maximum_length) {
        def += `(${col.character_maximum_length})`
      }
      if (col.is_nullable === 'NO') {
        def += ' NOT NULL'
      }
      if (col.column_default) {
        def += ` DEFAULT ${col.column_default}`
      }
      return def
    })

    sqlContent += columnDefs.join(',\n')
    sqlContent += `\n);\n\n`

    console.log(`  ✅ Exported ${columns.length} columns`)
  }

  sqlContent += `\n-- End of migration\n`

  // Write to file
  fs.writeFileSync(migrationPath, sqlContent, 'utf-8')

  console.log(`\n✅ Migration file created: supabase/migrations/${migrationFile}`)
  console.log(`📊 Size: ${(sqlContent.length / 1024).toFixed(2)} KB`)
  console.log(`\n⚠️  NOTE: This is a simplified export. You may need to manually add:`)
  console.log(`   - Primary keys`)
  console.log(`   - Foreign keys`)
  console.log(`   - Indexes`)
  console.log(`   - RLS policies`)
  console.log(`   - Triggers`)
  console.log(`\n💡 TIP: Use Supabase Dashboard to get complete table definitions`)
}

exportTableSchemas().catch(console.error)
