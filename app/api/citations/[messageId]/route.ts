/**
 * Citations API Route
 *
 * GET /api/citations/[messageId] - Get citations for a specific message
 */

import { NextRequest, NextResponse } from 'next/server'
import { getCitationsForMessage } from '@/lib/citations/citation-tracker'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ messageId: string }> }
) {
  // TEMPORARILY DISABLED: Citations feature has schema issues (Bug #12)
  // Always return empty citations to prevent errors
  return NextResponse.json({ citations: [] }, { status: 200 })

  /* DISABLED CODE - Re-enable after fixing schema
  try {
    const { messageId } = await params

    if (!messageId) {
      return NextResponse.json({ error: 'Message ID is required' }, { status: 400 })
    }

    const citations = await getCitationsForMessage(messageId)

    return NextResponse.json({ citations }, { status: 200 })
  } catch (error) {
    console.error('[Citations API] Error (non-critical):', error)
    // Return empty citations instead of error to prevent UI breakage
    return NextResponse.json({ citations: [] }, { status: 200 })
  }
  */
}
