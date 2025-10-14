import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/attributes/available
 *
 * Returns attributes with their available values and counts
 * Used for filter dropdowns in search/feed
 *
 * Query params:
 * - category: Filter by category slug (optional)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const categoryFilter = searchParams.get('category');

    // Get attribute schema
    let schemaQuery = supabase
      .from('attribute_schema')
      .select('*')
      .eq('is_filterable', true)
      .order('sort_order');

    if (categoryFilter) {
      schemaQuery = schemaQuery.or(`category_slug.eq.${categoryFilter},category_slug.is.null`);
    }

    const { data: attributeSchema, error: schemaError } = await schemaQuery;

    if (schemaError) throw schemaError;
    if (!attributeSchema || attributeSchema.length === 0) {
      return NextResponse.json({
        success: true,
        attributes: {},
      });
    }

    // Get value counts for each attribute
    const result: Record<string, any> = {};

    for (const attr of attributeSchema) {
      // Build query for this attribute's values
      let valueQuery = supabase
        .from('experience_attributes')
        .select('attribute_value, experience_id')
        .eq('attribute_key', attr.key);

      // If category filter, join with experiences table
      if (categoryFilter) {
        const { data: experiences } = await supabase
          .from('experiences')
          .select('id')
          .eq('category', categoryFilter);

        if (experiences) {
          const expIds = experiences.map(e => e.id);
          valueQuery = valueQuery.in('experience_id', expIds);
        }
      }

      const { data: valueData, error: valueError } = await valueQuery;

      if (valueError) {
        console.error(`Error fetching values for ${attr.key}:`, valueError);
        continue;
      }

      // Count occurrences
      const valueCounts: Record<string, number> = {};
      valueData?.forEach(row => {
        valueCounts[row.attribute_value] = (valueCounts[row.attribute_value] || 0) + 1;
      });

      // Get translations for values
      const values = Object.entries(valueCounts)
        .map(([value, count]) => ({
          value,
          count,
          label_en: value,
          // These would come from translation files in real usage
        }))
        .sort((a, b) => b.count - a.count); // Sort by count descending

      result[attr.key] = {
        display_name: attr.display_name,
        display_name_de: attr.display_name_de,
        display_name_fr: attr.display_name_fr,
        display_name_es: attr.display_name_es,
        data_type: attr.data_type,
        allowed_values: attr.allowed_values ? JSON.parse(attr.allowed_values as string) : null,
        values,
        total_count: values.reduce((sum, v) => sum + v.count, 0),
      };
    }

    return NextResponse.json({
      success: true,
      attributes: result,
      category: categoryFilter,
    });

  } catch (error: any) {
    console.error('Get available attributes error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch available attributes', details: error.message },
      { status: 500 }
    );
  }
}
