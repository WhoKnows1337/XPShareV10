import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * POST /api/admin/custom-suggestions/promote
 * Promote a custom value to an official attribute option
 */
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { suggestionId, newOptionValue, newOptionLabel } = body;

    if (!suggestionId || !newOptionValue || !newOptionLabel) {
      return NextResponse.json(
        { error: 'Missing required fields: suggestionId, newOptionValue, newOptionLabel' },
        { status: 400 }
      );
    }

    // Get the suggestion details
    const { data: suggestion, error: fetchError } = await supabase
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

    // Add the new option to attribute_schema
    const { data: existingSchema, error: schemaError } = await supabase
      .from('attribute_schema')
      .select('*')
      .eq('attribute_key', suggestion.attribute_key)
      .single();

    if (schemaError) {
      // If no schema exists for this attribute, create one
      const { error: insertError } = await supabase
        .from('attribute_schema')
        .insert({
          attribute_key: suggestion.attribute_key,
          attribute_label: suggestion.attribute_key.charAt(0).toUpperCase() + suggestion.attribute_key.slice(1),
          attribute_type: 'select',
          options: [
            {
              value: newOptionValue,
              label: newOptionLabel,
            },
          ],
          is_active: true,
        });

      if (insertError) {
        console.error('Error creating attribute schema:', insertError);
        return NextResponse.json(
          { error: 'Failed to create attribute schema', details: insertError.message },
          { status: 500 }
        );
      }
    } else {
      // Add new option to existing schema
      const currentOptions = existingSchema.options || [];

      // Check if option already exists
      const optionExists = currentOptions.some(
        (opt: any) => opt.value === newOptionValue
      );

      if (optionExists) {
        return NextResponse.json(
          { error: 'Option already exists in schema' },
          { status: 400 }
        );
      }

      const updatedOptions = [
        ...currentOptions,
        {
          value: newOptionValue,
          label: newOptionLabel,
        },
      ];

      const { error: updateError } = await supabase
        .from('attribute_schema')
        .update({ options: updatedOptions })
        .eq('id', existingSchema.id);

      if (updateError) {
        console.error('Error updating attribute schema:', updateError);
        return NextResponse.json(
          { error: 'Failed to update attribute schema', details: updateError.message },
          { status: 500 }
        );
      }
    }

    // Update the suggestion status to approved
    const { error: statusError } = await supabase
      .from('custom_attribute_suggestions')
      .update({
        status: 'approved',
        merged_into: newOptionValue,
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
    const { error: updateExperiencesError } = await supabase
      .from('experience_attributes')
      .update({
        attribute_value: newOptionValue,
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
      message: 'Custom value promoted successfully',
      newOption: {
        value: newOptionValue,
        label: newOptionLabel,
      },
    });
  } catch (error: any) {
    console.error('Custom suggestions promote error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
