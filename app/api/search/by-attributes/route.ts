import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Search Experiences by Attributes API
 * Enables filtering experiences by extracted attribute key-value pairs
 *
 * Query Parameters:
 * - filters: JSON array of {key, value} objects
 * - matchMode: 'all' (AND) or 'any' (OR)
 * - category: Optional category filter
 * - limit: Results per page (default: 20)
 * - offset: Pagination offset (default: 0)
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse filters from query string
    const filtersParam = searchParams.get('filters');
    const matchMode = searchParams.get('matchMode') || 'all';
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!filtersParam) {
      return NextResponse.json(
        { error: 'filters parameter is required' },
        { status: 400 }
      );
    }

    let attributeFilters;
    try {
      attributeFilters = JSON.parse(filtersParam);
    } catch (err) {
      return NextResponse.json(
        { error: 'Invalid filters JSON format' },
        { status: 400 }
      );
    }

    if (!Array.isArray(attributeFilters) || attributeFilters.length === 0) {
      return NextResponse.json(
        { error: 'filters must be a non-empty array of {key, value} objects' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Call the search function
    const { data: results, error: searchError } = await supabase.rpc(
      'search_experiences_by_attributes',
      {
        p_attribute_filters: attributeFilters,
        p_match_mode: matchMode,
        p_category_slug: category || null,
        p_limit: limit,
        p_offset: offset,
      }
    );

    if (searchError) {
      console.error('Attribute search error:', searchError);
      throw searchError;
    }

    // Get total count for pagination
    const { data: totalCount, error: countError } = await supabase.rpc(
      'count_experiences_by_attributes',
      {
        p_attribute_filters: attributeFilters,
        p_match_mode: matchMode,
        p_category_slug: category || null,
      }
    );

    if (countError) {
      console.error('Count error:', countError);
    }

    return NextResponse.json({
      experiences: results || [],
      total: totalCount || 0,
      hasMore: (offset + limit) < (totalCount || 0),
      filters: attributeFilters,
      matchMode,
    });
  } catch (error: any) {
    console.error('Attribute search API error:', error);

    return NextResponse.json(
      {
        error: 'Failed to search experiences by attributes',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
