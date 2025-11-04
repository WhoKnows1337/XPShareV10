import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { deleteFromR2, extractKeyFromUrl } from '@/lib/storage/r2-client';

// ⚠️ CRITICAL: Force Node.js runtime for Supabase cookies() compatibility on Vercel
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/media/cleanup
 *
 * Deletes uploaded files from R2 storage
 * Only deletes files from uploads-pending/ (safety check)
 * Used by reset button to clean up unpublished uploads
 */
export async function POST(request: NextRequest) {
  try {
    // ============================================================
    // 1. AUTHENTICATION CHECK
    // ============================================================
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // ============================================================
    // 2. VALIDATE REQUEST BODY
    // ============================================================
    const body = await request.json();
    const { urls } = body;

    if (!Array.isArray(urls)) {
      return NextResponse.json({
        error: 'Invalid request',
        message: 'urls must be an array'
      }, { status: 400 });
    }

    // ============================================================
    // 3. SAFETY CHECK: Only delete uploads-pending files
    // ============================================================
    const pendingUrls = urls.filter(url =>
      typeof url === 'string' && url.includes('/uploads-pending/')
    );

    if (pendingUrls.length === 0) {
      return NextResponse.json({
        success: true,
        deleted: 0,
        message: 'No pending uploads to delete'
      });
    }

    console.log(`[Cleanup] User ${user.id} deleting ${pendingUrls.length} temp files`);

    // ============================================================
    // 4. DELETE FILES FROM R2
    // ============================================================
    const results = await Promise.allSettled(
      pendingUrls.map(async (url) => {
        try {
          const key = extractKeyFromUrl(url);
          if (!key) {
            console.warn(`[Cleanup] Invalid URL format: ${url}`);
            return { success: false, url, error: 'Invalid URL format' };
          }

          // Verify key is in uploads-pending (extra safety)
          if (!key.startsWith('uploads-pending/')) {
            console.warn(`[Cleanup] Rejected attempt to delete non-pending file: ${key}`);
            return { success: false, url, error: 'Not a pending upload' };
          }

          await deleteFromR2(key);
          console.log(`[Cleanup] ✅ Deleted: ${key}`);
          return { success: true, url, key };
        } catch (err: any) {
          console.error(`[Cleanup] ❌ Failed to delete ${url}:`, err);
          return { success: false, url, error: err.message };
        }
      })
    );

    // ============================================================
    // 5. ANALYZE RESULTS
    // ============================================================
    const successCount = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
    const failedCount = results.length - successCount;

    console.log(`[Cleanup] Completed: ${successCount} deleted, ${failedCount} failed`);

    // ============================================================
    // 6. RETURN RESPONSE
    // ============================================================
    return NextResponse.json({
      success: true,
      deleted: successCount,
      failed: failedCount,
      total: results.length,
    });

  } catch (error: any) {
    console.error('[Cleanup] Endpoint error:', error);
    return NextResponse.json({
      error: 'Cleanup failed',
      message: error.message || 'Unknown error'
    }, { status: 500 });
  }
}
