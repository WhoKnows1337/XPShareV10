import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // Read migration files
    const migrationsDir = path.join(process.cwd(), 'supabase', 'migrations')
    const migration1 = fs.readFileSync(
      path.join(migrationsDir, '20250000000015_similar_users.sql'),
      'utf8'
    )
    const migration2 = fs.readFileSync(
      path.join(migrationsDir, '20250000000016_pattern_prediction.sql'),
      'utf8'
    )

    // Execute migrations
    const results = []

    // Migration 1: similar_users
    const { error: error1 } = await (supabase as any).rpc('exec_sql', { sql: migration1 })
    results.push({
      migration: '20250000000015_similar_users.sql',
      success: !error1,
      error: error1?.message
    })

    // Migration 2: pattern_prediction
    const { error: error2 } = await (supabase as any).rpc('exec_sql', { sql: migration2 })
    results.push({
      migration: '20250000000016_pattern_prediction.sql',
      success: !error2,
      error: error2?.message
    })

    return NextResponse.json({ results })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
