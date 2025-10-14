import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Admin Attributes API
 * GET - List all attribute schemas
 * POST - Create new attribute schema
 */

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check admin auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (!profile?.is_admin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Get query params
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const type = searchParams.get('type');

    // Build query
    let query = supabase
      .from('attribute_schema')
      .select('*')
      .order('sort_order');

    if (category && category !== 'all') {
      if (category === 'generic') {
        query = query.is('category_slug', null);
      } else {
        query = query.eq('category_slug', category);
      }
    }

    if (type && type !== 'all') {
      query = query.eq('data_type', type);
    }

    const { data: attributes, error } = await query;

    if (error) throw error;

    return NextResponse.json({
      success: true,
      attributes: attributes || [],
      total: attributes?.length || 0,
    });

  } catch (error: any) {
    console.error('Get attributes error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch attributes', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check admin auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (!profile?.is_admin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const {
      key,
      display_name,
      display_name_de,
      display_name_fr,
      display_name_es,
      category_slug,
      data_type,
      allowed_values,
      description,
      is_searchable,
      is_filterable,
      sort_order,
    } = body;

    // Validation
    if (!key || !display_name || !data_type) {
      return NextResponse.json(
        { error: 'Missing required fields: key, display_name, data_type' },
        { status: 400 }
      );
    }

    // Key must be lowercase with underscores only
    if (!/^[a-z_]+$/.test(key)) {
      return NextResponse.json(
        { error: 'Key must be lowercase with underscores only (e.g., "my_attribute")' },
        { status: 400 }
      );
    }

    // For enum type, allowed_values is required
    if (data_type === 'enum' && (!allowed_values || !Array.isArray(allowed_values) || allowed_values.length === 0)) {
      return NextResponse.json(
        { error: 'Enum type requires at least one allowed value' },
        { status: 400 }
      );
    }

    // Insert attribute
    const { data: newAttribute, error } = await supabase
      .from('attribute_schema')
      .insert({
        key,
        display_name,
        display_name_de: display_name_de || null,
        display_name_fr: display_name_fr || null,
        display_name_es: display_name_es || null,
        category_slug: category_slug || null,
        data_type,
        allowed_values: allowed_values ? JSON.stringify(allowed_values) : null,
        description: description || null,
        is_searchable: is_searchable ?? true,
        is_filterable: is_filterable ?? true,
        sort_order: sort_order ?? 999,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: `Attribute with key "${key}" already exists` },
          { status: 409 }
        );
      }
      throw error;
    }

    return NextResponse.json({
      success: true,
      attribute: newAttribute,
    }, { status: 201 });

  } catch (error: any) {
    console.error('Create attribute error:', error);
    return NextResponse.json(
      { error: 'Failed to create attribute', details: error.message },
      { status: 500 }
    );
  }
}
