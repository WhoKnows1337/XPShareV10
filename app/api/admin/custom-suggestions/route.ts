import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/admin/custom-suggestions
 * List all custom attribute value suggestions for admin review
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check if user is admin
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // TODO: Add proper admin check
    // For now, any authenticated user can access

    // Get all custom value suggestions
    const { data: suggestions, error: suggestionsError } = await supabase
      .from('custom_attribute_suggestions')
      .select('*')
      .order('times_used', { ascending: false });

    if (suggestionsError) {
      console.error('Error fetching suggestions:', suggestionsError);
      return NextResponse.json(
        { error: 'Failed to fetch suggestions', details: suggestionsError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      suggestions: suggestions || [],
      total: suggestions?.length || 0,
    });
  } catch (error: any) {
    console.error('Custom suggestions GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
