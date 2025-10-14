import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Get Attribute Values API
 * Returns all unique values for a given attribute key with counts
 * Used to populate value dropdowns in the attribute filter UI
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const attributeKey = searchParams.get('key');
    const category = searchParams.get('category');
    const minCount = parseInt(searchParams.get('minCount') || '1');

    if (!attributeKey) {
      return NextResponse.json(
        { error: 'key parameter is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { data: values, error } = await supabase.rpc(
      'get_attribute_values_for_key',
      {
        p_attribute_key: attributeKey,
        p_category_slug: category || null,
        p_min_count: minCount,
      }
    );

    if (error) {
      console.error('Error fetching attribute values:', error);
      throw error;
    }

    return NextResponse.json({
      key: attributeKey,
      values: values || [],
      count: values?.length || 0,
    });
  } catch (error: any) {
    console.error('Attribute values API error:', error);

    return NextResponse.json(
      {
        error: 'Failed to fetch attribute values',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
