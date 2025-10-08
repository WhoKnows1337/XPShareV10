import { NextResponse } from 'next/server'

export async function GET() {
  const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN

  if (!token) {
    return NextResponse.json({ error: 'Token not configured' }, { status: 500 })
  }

  return NextResponse.json({ token })
}
