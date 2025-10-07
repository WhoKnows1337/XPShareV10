const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function applyMigrations() {
  const migrations = [
    '20250000000015_similar_users.sql',
    '20250000000016_pattern_prediction.sql'
  ]

  for (const migration of migrations) {
    const filePath = path.join(__dirname, 'supabase', 'migrations', migration)
    const sql = fs.readFileSync(filePath, 'utf8')

    console.log(`\nApplying migration: ${migration}`)

    const { data, error } = await supabase.rpc('exec', { sql })

    if (error) {
      console.error(`Error applying ${migration}:`, error)
    } else {
      console.log(`✓ Successfully applied ${migration}`)
    }
  }
}

applyMigrations().then(() => {
  console.log('\nAll migrations applied!')
  process.exit(0)
}).catch(err => {
  console.error('Error:', err)
  process.exit(1)
})
