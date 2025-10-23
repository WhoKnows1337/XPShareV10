/**
 * Single Memory API
 * DELETE /api/memories/[id] - Delete a specific memory
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { deleteMemory } from '@/lib/memory/memory-manager'

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    await deleteMemory(user.id, id)

    return NextResponse.json({
      success: true,
      message: 'Memory deleted',
    })
  } catch (error) {
    console.error('[Memories API] DELETE failed:', error)
    return NextResponse.json(
      { error: 'Failed to delete memory' },
      { status: 500 }
    )
  }
}
