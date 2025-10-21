/**
 * Memories API
 * GET /api/memories - Get all user memories
 * POST /api/memories - Create new memory
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUserMemories, saveMemory } from '@/lib/memory/memory-manager'

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const memories = await getUserMemories(user.id)

    return NextResponse.json({
      success: true,
      memories: memories.map((m) => ({
        id: m.id,
        scope: m.scope,
        key: m.key,
        value: m.value,
        confidence: m.confidence,
        source: m.source,
        createdAt: m.createdAt.toISOString(),
        updatedAt: m.updatedAt.toISOString(),
      })),
    })
  } catch (error) {
    console.error('[Memories API] GET failed:', error)
    return NextResponse.json(
      { error: 'Failed to load memories' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { scope, key, value, confidence = 0.8, source = 'manual' } = body

    if (!scope || !key || !value) {
      return NextResponse.json(
        { error: 'Missing required fields: scope, key, value' },
        { status: 400 }
      )
    }

    await saveMemory(user.id, {
      scope,
      key,
      value,
      confidence,
      source,
    })

    return NextResponse.json({
      success: true,
      message: 'Memory saved',
    })
  } catch (error) {
    console.error('[Memories API] POST failed:', error)
    return NextResponse.json(
      { error: 'Failed to save memory' },
      { status: 500 }
    )
  }
}
