import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Get Available Attribute Keys API
 * Returns all available attribute keys with statistics
 * Used to populate the attribute filter UI
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    const supabase = await createClient();

    const { data: keys, error } = await supabase.rpc(
      'get_available_attribute_keys',
      {
        p_category_slug: category || null,
      }
    );

    if (error) {
      console.error('Error fetching attribute keys:', error);
      throw error;
    }

    return NextResponse.json({
      keys: keys || [],
      count: keys?.length || 0,
    });
  } catch (error: any) {
    console.error('Attribute keys API error:', error);

    return NextResponse.json(
      {
        error: 'Failed to fetch attribute keys',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
