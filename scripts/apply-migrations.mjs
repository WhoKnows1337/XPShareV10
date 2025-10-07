import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function applyMigration(migrationFile) {
  const filePath = join(__dirname, '..', 'supabase', 'migrations', migrationFile)
  const sql = readFileSync(filePath, 'utf8')

  console.log(`\nApplying migration: ${migrationFile}`)

  try {
    // Split by semicolons and execute each statement
    const statements = sql.split(';').filter(s => s.trim())

    for (const statement of statements) {
      if (!statement.trim()) continue

      const { data, error } = await supabase.rpc('exec_sql', { sql: statement.trim() + ';' })

      if (error) {
        // If exec_sql doesn't exist, try direct query
        const { error: queryError } = await supabase.from('_migrations').select('*').limit(0)

        if (queryError) {
          console.log('Trying alternative execution method...')
          // Just log - we'll execute via SQL editor
          console.log('SQL:', statement.substring(0, 100) + '...')
        }
      }
    }

    console.log(`✓ Migration ${migrationFile} logged (execute manually in Supabase SQL editor)`)
    console.log(`\nSQL to execute:\n${sql}\n`)

  } catch (err) {
    console.error(`Error with ${migrationFile}:`, err.message)
  }
}

async function main() {
  console.log('Starting migration process...')
  console.log(`Supabase URL: ${supabaseUrl}`)

  await applyMigration('20250000000015_similar_users.sql')
  await applyMigration('20250000000016_pattern_prediction.sql')

  console.log('\nMigrations ready to apply!')
  console.log('\n📋 Next steps:')
  console.log('1. Go to: https://supabase.com/dashboard/project/gtuxnucmbocjtnaiflds/sql/new')
  console.log('2. Copy the SQL from above')
  console.log('3. Execute in the SQL editor')
}

main().catch(console.error)
