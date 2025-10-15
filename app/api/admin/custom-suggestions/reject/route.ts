import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * POST /api/admin/custom-suggestions/reject
 * Reject a custom value suggestion (spam, invalid, etc.)
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check if user is admin
    const {
      data: { user },
      error: userError,
    } = await (supabase as any).auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { suggestionId } = body;

    if (!suggestionId) {
      return NextResponse.json(
        { error: 'Missing required field: suggestionId' },
        { status: 400 }
      );
    }

    // Get the suggestion details
    const { data: suggestion, error: fetchError } = await (supabase as any)
      .from('custom_attribute_suggestions')
      .select('*')
      .eq('id', suggestionId)
      .single();

    if (fetchError || !suggestion) {
      return NextResponse.json(
        { error: 'Suggestion not found', details: fetchError?.message },
        { status: 404 }
      );
    }

    // Update the suggestion status to rejected
    const { error: statusError } = await (supabase as any)
      .from('custom_attribute_suggestions')
      .update({
        status: 'rejected',
      })
      .eq('id', suggestionId);

    if (statusError) {
      console.error('Error updating suggestion status:', statusError);
      return NextResponse.json(
        { error: 'Failed to update suggestion status', details: statusError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Custom value rejected successfully',
    });
  } catch (error: any) {
    console.error('Custom suggestions reject error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
