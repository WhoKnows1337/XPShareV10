import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get user session
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      type,
      title,
      description,
      screenshots,
      page_url,
      browser_info,
      console_logs,
    } = body;

    // Validate required fields
    if (!type || !title || !description) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const uploadedScreenshotUrls: string[] = [];

    // Upload all screenshots to Supabase Storage if provided
    if (screenshots && Array.isArray(screenshots) && screenshots.length > 0) {
      for (let i = 0; i < screenshots.length; i++) {
        const screenshot = screenshots[i];
        if (screenshot && screenshot.startsWith('data:image')) {
          try {
            // Convert base64 to blob
            const base64Data = screenshot.split(',')[1];
            const byteCharacters = atob(base64Data);
            const byteNumbers = new Array(byteCharacters.length);
            for (let j = 0; j < byteCharacters.length; j++) {
              byteNumbers[j] = byteCharacters.charCodeAt(j);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: 'image/png' });

            // Generate unique filename
            const filename = `feedback/${user.id}/${Date.now()}-${i}.png`;

            // Upload to Supabase Storage
            const { data: uploadData, error: uploadError } = await supabase.storage
              .from('feedback-screenshots')
              .upload(filename, blob, {
                contentType: 'image/png',
                upsert: false,
              });

            if (uploadError) {
              console.error('Screenshot upload error:', uploadError);
            } else {
              // Get public URL
              const {
                data: { publicUrl },
              } = supabase.storage
                .from('feedback-screenshots')
                .getPublicUrl(filename);

              uploadedScreenshotUrls.push(publicUrl);
            }
          } catch (uploadError) {
            console.error('Screenshot upload failed:', uploadError);
            // Continue with next screenshot
          }
        }
      }
    }

    // Insert feedback into database
    const { data: feedback, error: dbError } = await supabase
      .from('feedback')
      .insert({
        user_id: user.id,
        type,
        title,
        description,
        page_url,
        browser_info,
        console_logs,
        screenshots: uploadedScreenshotUrls,
        screenshot_url: uploadedScreenshotUrls[0] || null, // Keep for backward compatibility
        status: 'new',
        priority: 'medium',
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { error: 'Failed to save feedback' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        feedback,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Feedback API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get user session
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    const isAdmin = profile?.is_admin;

    // Build query based on user role
    let query = supabase.from('feedback').select(`
      *,
      user:user_profiles(id, username, avatar_url)
    `);

    // Non-admins can only see their own feedback
    if (!isAdmin) {
      query = query.eq('user_id', user.id);
    }

    // Add filters from query params
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');

    if (type) query = query.eq('type', type);
    if (status) query = query.eq('status', status);
    if (priority) query = query.eq('priority', priority);

    // Order by created_at descending
    query = query.order('created_at', { ascending: false });

    const { data: feedbackList, error } = await query;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to fetch feedback' }, { status: 500 });
    }

    return NextResponse.json({ feedback: feedbackList });
  } catch (error) {
    console.error('Feedback GET API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
