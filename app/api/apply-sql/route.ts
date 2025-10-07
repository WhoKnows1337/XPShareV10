import { NextResponse } from 'next/server'
import { readFileSync } from 'fs'
import { join } from 'path'

export async function GET() {
  try {
    // Read migration files
    const migration1Path = join(process.cwd(), 'supabase', 'migrations', '20250000000015_similar_users.sql')
    const migration2Path = join(process.cwd(), 'supabase', 'migrations', '20250000000016_pattern_prediction.sql')

    const migration1 = readFileSync(migration1Path, 'utf8')
    const migration2 = readFileSync(migration2Path, 'utf8')

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

    // Execute via REST API directly
    const results = []

    // Migration 1
    try {
      const response1 = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': serviceKey,
          'Authorization': `Bearer ${serviceKey}`
        },
        body: JSON.stringify({ query: migration1 })
      })

      const result1 = await response1.text()
      results.push({
        migration: '20250000000015_similar_users.sql',
        status: response1.status,
        result: result1
      })
    } catch (err: any) {
      results.push({
        migration: '20250000000015_similar_users.sql',
        error: err.message
      })
    }

    // Migration 2
    try {
      const response2 = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': serviceKey,
          'Authorization': `Bearer ${serviceKey}`
        },
        body: JSON.stringify({ query: migration2 })
      })

      const result2 = await response2.text()
      results.push({
        migration: '20250000000016_pattern_prediction.sql',
        status: response2.status,
        result: result2
      })
    } catch (err: any) {
      results.push({
        migration: '20250000000016_pattern_prediction.sql',
        error: err.message
      })
    }

    return NextResponse.json({
      message: 'Migrations executed',
      results,
      sql1: migration1.substring(0, 200) + '...',
      sql2: migration2.substring(0, 200) + '...'
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
