import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Admin Attribute API (Single)
 * GET - Get single attribute
 * PATCH - Update attribute
 * DELETE - Delete attribute
 */

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const supabase = await createClient();
    const { key } = await params;

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

    const { data: attribute, error } = await supabase
      .from('attribute_schema')
      .select('*')
      .eq('key', key)
      .single();

    if (error || !attribute) {
      return NextResponse.json({ error: 'Attribute not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      attribute,
    });

  } catch (error: any) {
    console.error('Get attribute error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch attribute', details: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const supabase = await createClient();
    const { key } = await params;

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

    // Build update object (only include provided fields)
    const updateData: any = {};
    if (display_name !== undefined) updateData.display_name = display_name;
    if (display_name_de !== undefined) updateData.display_name_de = display_name_de;
    if (display_name_fr !== undefined) updateData.display_name_fr = display_name_fr;
    if (display_name_es !== undefined) updateData.display_name_es = display_name_es;
    if (category_slug !== undefined) updateData.category_slug = category_slug || null;
    if (data_type !== undefined) updateData.data_type = data_type;
    if (allowed_values !== undefined) updateData.allowed_values = allowed_values ? JSON.stringify(allowed_values) : null;
    if (description !== undefined) updateData.description = description;
    if (is_searchable !== undefined) updateData.is_searchable = is_searchable;
    if (is_filterable !== undefined) updateData.is_filterable = is_filterable;
    if (sort_order !== undefined) updateData.sort_order = sort_order;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }

    // Validate enum type
    if (updateData.data_type === 'enum' && (!updateData.allowed_values || JSON.parse(updateData.allowed_values).length === 0)) {
      return NextResponse.json(
        { error: 'Enum type requires at least one allowed value' },
        { status: 400 }
      );
    }

    const { data: updatedAttribute, error } = await supabase
      .from('attribute_schema')
      .update(updateData)
      .eq('key', key)
      .select()
      .single();

    if (error || !updatedAttribute) {
      if (error?.code === '42P01') {
        return NextResponse.json({ error: 'Attribute not found' }, { status: 404 });
      }
      throw error;
    }

    return NextResponse.json({
      success: true,
      attribute: updatedAttribute,
    });

  } catch (error: any) {
    console.error('Update attribute error:', error);
    return NextResponse.json(
      { error: 'Failed to update attribute', details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const supabase = await createClient();
    const { key } = await params;

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

    // Check if attribute is in use
    const { data: usageCount } = await supabase
      .from('experience_attributes')
      .select('id', { count: 'exact', head: true })
      .eq('attribute_key', key);

    if (usageCount && usageCount.length > 0) {
      return NextResponse.json(
        {
          error: 'Cannot delete attribute that is in use',
          usage_count: usageCount.length,
        },
        { status: 409 }
      );
    }

    const { error } = await supabase
      .from('attribute_schema')
      .delete()
      .eq('key', key);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: `Attribute "${key}" deleted successfully`,
    });

  } catch (error: any) {
    console.error('Delete attribute error:', error);
    return NextResponse.json(
      { error: 'Failed to delete attribute', details: error.message },
      { status: 500 }
    );
  }
}
