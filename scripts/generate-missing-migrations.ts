#!/usr/bin/env tsx
/**
 * Generate Missing SQL Migrations
 *
 * This script helps generate migration files for the 9 Phase 8 tables
 * that exist in the database but have no migrations.
 *
 * Usage:
 *   npx tsx scripts/generate-missing-migrations.ts
 *
 * Prerequisites:
 *   - Supabase CLI installed: npm install -g supabase
 *   - SUPABASE_ACCESS_TOKEN environment variable set
 */

import { exec } from 'child_process'
import { promisify } from 'util'
import * as fs from 'fs'
import * as path from 'path'

const execAsync = promisify(exec)

const SUPABASE_PROJECT_ID = 'gtuxnucmbocjtnaiflds'
const MIGRATIONS_DIR = path.join(process.cwd(), 'supabase', 'migrations')

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

async function checkPrerequisites(): Promise<boolean> {
  console.log('🔍 Checking prerequisites...\n')

  // Check if Supabase CLI is installed
  try {
    await execAsync('supabase --version')
    console.log('✅ Supabase CLI installed')
  } catch {
    console.error('❌ Supabase CLI not installed')
    console.error('   Install with: npm install -g supabase')
    return false
  }

  // Check if access token is set
  if (!process.env.SUPABASE_ACCESS_TOKEN) {
    console.error('❌ SUPABASE_ACCESS_TOKEN not set')
    console.error('   Get token from: https://supabase.com/dashboard/account/tokens')
    console.error('   Set with: export SUPABASE_ACCESS_TOKEN="sbp_..."')
    return false
  }
  console.log('✅ SUPABASE_ACCESS_TOKEN found')

  // Check if migrations directory exists
  if (!fs.existsSync(MIGRATIONS_DIR)) {
    console.error(`❌ Migrations directory not found: ${MIGRATIONS_DIR}`)
    return false
  }
  console.log('✅ Migrations directory exists')

  return true
}

async function generateMigrations(): Promise<void> {
  console.log('\n📝 Generating migrations...\n')

  const timestamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0].replace('T', '')
  const migrationFile = `${timestamp}_phase8_tables.sql`

  try {
    // Use supabase db diff to generate migration
    const { stdout, stderr } = await execAsync(
      `supabase db diff --linked --file ${migrationFile}`,
      {
        cwd: process.cwd(),
        env: {
          ...process.env,
          SUPABASE_ACCESS_TOKEN: process.env.SUPABASE_ACCESS_TOKEN,
        },
      }
    )

    if (stderr && !stderr.includes('Finished')) {
      console.warn('⚠️  Warnings:', stderr)
    }

    console.log('✅ Migration generated successfully!')
    console.log(`   File: supabase/migrations/${migrationFile}`)

    // Verify migration content
    const migrationPath = path.join(MIGRATIONS_DIR, migrationFile)
    if (fs.existsSync(migrationPath)) {
      const content = fs.readFileSync(migrationPath, 'utf-8')
      const tableCount = (content.match(/CREATE TABLE/g) || []).length

      console.log(`\n📊 Migration stats:`)
      console.log(`   Tables created: ${tableCount}`)
      console.log(`   File size: ${(content.length / 1024).toFixed(2)} KB`)

      // Check if all expected tables are present
      const foundTables = MISSING_TABLES.filter((table) =>
        content.includes(table)
      )
      console.log(`\n✅ Found ${foundTables.length}/${MISSING_TABLES.length} expected tables:`)
      foundTables.forEach((table) => console.log(`   - ${table}`))

      const missingTables = MISSING_TABLES.filter(
        (table) => !foundTables.includes(table)
      )
      if (missingTables.length > 0) {
        console.log(`\n⚠️  Missing ${missingTables.length} expected tables:`)
        missingTables.forEach((table) => console.log(`   - ${table}`))
        console.log('\n   These tables may need manual migration creation.')
      }
    }
  } catch (error: any) {
    console.error('❌ Failed to generate migration:')
    console.error(error.message)

    if (error.message.includes('Login required')) {
      console.error('\n💡 Tip: Make sure SUPABASE_ACCESS_TOKEN is valid')
      console.error('   Get new token from: https://supabase.com/dashboard/account/tokens')
    }

    throw error
  }
}

async function showNextSteps(): Promise<void> {
  console.log('\n📋 Next Steps:\n')
  console.log('1. Review the generated migration:')
  console.log('   cat supabase/migrations/*_phase8_tables.sql\n')
  console.log('2. Apply to local database:')
  console.log('   supabase db reset\n')
  console.log('3. Test the application:')
  console.log('   npm run dev\n')
  console.log('4. Deploy to production:')
  console.log('   supabase db push --project-id gtuxnucmbocjtnaiflds\n')
  console.log('5. Commit the migration:')
  console.log('   git add supabase/migrations/*_phase8_tables.sql')
  console.log('   git commit -m "Add Phase 8 table migrations"\n')
}

async function main(): Promise<void> {
  console.log('🚀 Generate Missing Migrations Script\n')
  console.log('=' .repeat(50))

  try {
    // Step 1: Check prerequisites
    const ready = await checkPrerequisites()
    if (!ready) {
      process.exit(1)
    }

    // Step 2: Generate migrations
    await generateMigrations()

    // Step 3: Show next steps
    await showNextSteps()

    console.log('=' .repeat(50))
    console.log('\n✅ Done! Migrations generated successfully.\n')
  } catch (error: any) {
    console.error('\n❌ Script failed:', error.message)
    console.error('\nFor manual migration creation, see:')
    console.error('  docs/MISSING_MIGRATIONS_GUIDE.md')
    process.exit(1)
  }
}

// Run the script
main()
