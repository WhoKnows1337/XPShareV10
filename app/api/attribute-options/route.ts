import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/attribute-options?key=shape
 * Get dynamic attribute options including promoted custom values
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const attributeKey = searchParams.get('key');

    if (!attributeKey) {
      return NextResponse.json(
        { error: 'Missing required parameter: key' },
        { status: 400 }
      );
    }

    // Get the base schema with allowed_values and data_type
    const { data: schema, error: schemaError } = await supabase
      .from('attribute_schema')
      .select('key, data_type, allowed_values, display_name')
      .eq('key', attributeKey)
      .single();

    if (schemaError) {
      console.error('Error fetching attribute schema:', schemaError);
      // Return empty array if schema doesn't exist yet
      return NextResponse.json({
        options: [],
        attributeKey,
        dataType: 'text',
      });
    }

    // Convert allowed_values array to options format { value, label }
    const allowedValues = (schema?.allowed_values as string[]) || [];
    const options = allowedValues.map((value: string) => ({
      value,
      label: value.charAt(0).toUpperCase() + value.slice(1).replace(/_/g, ' '),
    }));

    return NextResponse.json({
      options,
      attributeKey,
      dataType: schema?.data_type || 'text',
      displayName: schema?.display_name || attributeKey,
    });
  } catch (error: any) {
    console.error('Attribute options GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
