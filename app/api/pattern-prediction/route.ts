import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category') || 'UFO'

    // Call the predict_next_wave function
    const { data, error } = await (supabase as any)
      .rpc('predict_next_wave', { p_category: category })

    if (error) {
      console.error('Pattern prediction RPC error:', error)
      return NextResponse.json({ error: 'Failed to fetch prediction' }, { status: 500 })
    }

    // Return the first result (or null if no results)
    const prediction = data && data.length > 0 ? data[0] : null

    return NextResponse.json({ prediction }, { status: 200 })
  } catch (error) {
    console.error('Pattern prediction API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
