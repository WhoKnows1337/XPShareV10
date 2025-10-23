/**
 * Branches API Route
 *
 * GET /api/branches/[chatId] - Get branches for a chat
 * POST /api/branches/[chatId] - Create a new branch
 */

import { NextRequest, NextResponse } from 'next/server'
import { getBranchesForChat, createBranch } from '@/lib/branches/branch-manager'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ chatId: string }> }
) {
  try {
    const { chatId } = await params

    if (!chatId) {
      return NextResponse.json({ error: 'Chat ID is required' }, { status: 400 })
    }

    const branches = await getBranchesForChat(chatId)

    return NextResponse.json({ branches }, { status: 200 })
  } catch (error) {
    console.error('[Branches API] Error fetching branches:', error)
    return NextResponse.json(
      { error: 'Failed to load branches' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ chatId: string }> }
) {
  try {
    const { chatId } = await params
    const { parentMessageId, branchName } = await request.json()

    if (!chatId) {
      return NextResponse.json({ error: 'Chat ID is required' }, { status: 400 })
    }

    if (!branchName) {
      return NextResponse.json({ error: 'Branch name is required' }, { status: 400 })
    }

    const branch = await createBranch(chatId, parentMessageId || '', branchName)

    return NextResponse.json({ branch }, { status: 201 })
  } catch (error) {
    console.error('[Branches API] Error creating branch:', error)
    return NextResponse.json(
      { error: 'Failed to create branch' },
      { status: 500 }
    )
  }
}
