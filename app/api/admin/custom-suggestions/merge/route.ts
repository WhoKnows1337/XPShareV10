import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * POST /api/admin/custom-suggestions/merge
 * Merge a custom value into an existing official attribute option
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
    const { suggestionId, mergeIntoValue } = body;

    if (!suggestionId || !mergeIntoValue) {
      return NextResponse.json(
        { error: 'Missing required fields: suggestionId, mergeIntoValue' },
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

    // Verify that the merge target exists in attribute_schema
    const { data: schema, error: schemaError } = await (supabase as any)
      .from('attribute_schema')
      .select('options')
      .eq('attribute_key', suggestion.attribute_key)
      .single();

    if (schemaError || !schema) {
      return NextResponse.json(
        { error: 'Attribute schema not found for this key', details: schemaError?.message },
        { status: 404 }
      );
    }

    const targetOptionExists = (schema as any).options?.some(
      (opt: any) => opt.value === mergeIntoValue
    );

    if (!targetOptionExists) {
      return NextResponse.json(
        { error: 'Target option does not exist in schema' },
        { status: 400 }
      );
    }

    // Update the suggestion status to merged
    const { error: statusError } = await (supabase as any)
      .from('custom_attribute_suggestions')
      .update({
        status: 'merged',
        merged_into: mergeIntoValue,
      })
      .eq('id', suggestionId);

    if (statusError) {
      console.error('Error updating suggestion status:', statusError);
      return NextResponse.json(
        { error: 'Failed to update suggestion status', details: statusError.message },
        { status: 500 }
      );
    }

    // Update all existing experience_attributes that used this custom value
    // to use the official value instead
    const { error: updateExperiencesError } = await supabase
      .from('experience_attributes')
      .update({
        attribute_value: mergeIntoValue,
        is_custom_value: false,
        promoted_from_custom: suggestion.custom_value,
      })
      .eq('attribute_key', suggestion.attribute_key)
      .eq('custom_value', suggestion.custom_value);

    if (updateExperiencesError) {
      console.error('Error updating experience attributes:', updateExperiencesError);
      // Don't fail the request, just log it
    }

    return NextResponse.json({
      success: true,
      message: 'Custom value merged successfully',
      mergedInto: mergeIntoValue,
    });
  } catch (error: any) {
    console.error('Custom suggestions merge error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
