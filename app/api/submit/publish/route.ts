import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateEmbedding } from '@/lib/openai/client';
import { publishSchema, type PublishInput } from '@/lib/validation/submit-schemas';
import {
  sanitizeText,
  sanitizeRichText,
  sanitizeAttributeValue,
  sanitizeEmail,
  sanitizeLocation,
  sanitizeCoordinates,
  containsSuspiciousPatterns,
  sanitizeFileName,
  validateMimeType,
} from '@/lib/validation/sanitization';
import { copyInR2, deleteFromR2, extractKeyFromUrl, getPublicUrl } from '@/lib/storage/r2-client';

// ⚠️ CRITICAL: Force Node.js runtime for Supabase cookies() compatibility on Vercel
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Optimized Publish Experience API using PostgreSQL atomic function
 * Significantly reduced complexity - delegates transaction handling to DB
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const startTime = Date.now();

  try {
    // ============================================================
    // 1. AUTHENTICATION CHECK
    // ============================================================
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // ============================================================
    // 2. REQUEST VALIDATION & SANITIZATION
    // ============================================================
    const body = await request.json();

    const validation = publishSchema.safeParse(body);

    if (!validation.success) {
      console.error('[Publish] Validation error:', validation.error.flatten().fieldErrors);
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const data: PublishInput = validation.data;

    // 🔍 DEBUG: Log media data
    console.log('[Publish] Media data received:', {
      mediaUrls: body.mediaUrls,
      media: body.media,
      mediaLength: body.media?.length || 0,
    });

    // Security check for suspicious patterns
    if (containsSuspiciousPatterns(data.text)) {
      console.warn(`Suspicious patterns detected for user ${user.id}`);
      return NextResponse.json(
        { error: 'Content contains prohibited patterns' },
        { status: 400 }
      );
    }

    // ============================================================
    // 3. PREPARE DATA FOR ATOMIC FUNCTION
    // ============================================================
    const sanitizedData = {
      title: sanitizeText(data.title),
      text: sanitizeRichText(data.text),
      enhancedText: data.enhancedText ? sanitizeRichText(data.enhancedText) : undefined,
      category: data.category,
      tags: data.tags.map(tag => sanitizeText(tag)),
      location: data.location ? sanitizeLocation(data.location) : null,
      coordinates: (data.locationLat && data.locationLng)
        ? sanitizeCoordinates(data.locationLat, data.locationLng)
        : null,
    };

    const finalText = sanitizedData.enhancedText && data.enhancementEnabled
      ? sanitizedData.enhancedText
      : sanitizedData.text;

    // Generate embedding if text is substantial
    let embedding = null;
    if (finalText.length > 100) {
      try {
        embedding = await generateEmbedding(finalText);
      } catch (err) {
        console.error('Embedding generation failed:', err);
        // Continue without embedding - not critical
      }
    }

    // Prepare attributes for DB function
    const attributes = data.attributes ? await Promise.all(Object.entries(data.attributes).map(async ([key, attr]) => ({
      key,
      value: sanitizeAttributeValue(attr.value),
      customValue: attr.customValue ? sanitizeAttributeValue(attr.customValue) : null,
      confidence: Math.min(1, Math.max(0, attr.confidence)),
      isManuallyEdited: attr.isManuallyEdited || false,
    }))) : [];

    // Prepare witnesses for DB function (with separated email/userId fields)
    const witnesses = data.witnesses ? await Promise.all(data.witnesses.map(async (witness) => {
      const sanitizedName = sanitizeText(witness.name);

      // Separate email and userId - exactly one must be set
      if (witness.userId) {
        return {
          name: sanitizedName,
          userId: witness.userId,
          email: null,
        };
      } else if (witness.email) {
        return {
          name: sanitizedName,
          email: sanitizeEmail(witness.email),
          userId: null,
        };
      } else {
        // No contact info - still valid (optional witness contact)
        return {
          name: sanitizedName,
          email: null,
          userId: null,
        };
      }
    })) : [];

    // ============================================================
    // 4. CALL ATOMIC DATABASE FUNCTION
    // ============================================================
    const { data: result, error: dbError } = await supabase
      .rpc('publish_experience_atomic', {
        p_user_id: user.id,
        p_title: sanitizedData.title,
        p_story_text: finalText,
        p_category: sanitizedData.category,
        p_tags: sanitizedData.tags,
        p_date_occurred: data.dateOccurred || undefined,
        p_time_of_day: data.timeOfDay || undefined,
        p_duration: data.duration || undefined,
        p_location_text: sanitizedData.location ?? undefined,
        p_location_lat: sanitizedData.coordinates?.lat || undefined,
        p_location_lng: sanitizedData.coordinates?.lng || undefined,
        p_question_answers: data.questionAnswers || {},
        p_visibility: data.visibility,
        p_ai_enhancement_used: data.aiEnhancementUsed || false,
        p_user_edited_ai: data.userEditedAi || false,
        p_enhancement_model: data.enhancementModel || undefined,
        p_attributes: attributes,
        p_witnesses: witnesses,
        p_embedding: embedding,
        p_media_urls: data.mediaUrls || [], // Backwards compatibility
        p_media: data.media || [], // NEW: Media with metadata
      })
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        {
          error: 'Failed to save experience',
          details: dbError.message,
        },
        { status: 500 }
      );
    }

    const typedResult = result as any;
    const experienceId = typedResult.experience_id;

    // ============================================================
    // 4.5. SAVE MEDIA (if provided)
    // ============================================================
    if (data.media && data.media.length > 0) {
      try {
        console.log('[Publish] Processing', data.media.length, 'media files');

        // ✅ TWO-PATH SYSTEM: Copy from uploads-pending/ to experiences/
        const mediaToInsert = await Promise.all(data.media.map(async (item, index) => {
          let finalUrl = item.url;

          // Check if file is in pending location
          if (item.url.includes('/uploads-pending/')) {
            console.log('[Publish] Moving temp file to final location:', item.url);

            try {
              const tempKey = extractKeyFromUrl(item.url);
              if (!tempKey) {
                throw new Error('Invalid URL format');
              }

              // Generate final key: Replace uploads-pending/ with experiences/
              const finalKey = tempKey.replace('uploads-pending/', 'experiences/');

              // Copy to final location
              await copyInR2(tempKey, finalKey);

              // Update URL to final location
              finalUrl = getPublicUrl(finalKey);

              // Delete temp file (non-blocking, cleanup)
              deleteFromR2(tempKey).catch(err => {
                console.warn('[Publish] Failed to delete temp file:', tempKey, err);
              });

              console.log('[Publish] File moved:', tempKey, '→', finalKey);
            } catch (copyErr) {
              console.error('[Publish] Failed to copy file:', item.url, copyErr);
              // Continue with original URL if copy fails
            }
          }

          // 🔒 SECURITY: Sanitize fileName and validate mimeType
          const sanitizedFileName = item.fileName ? sanitizeFileName(item.fileName) : null;
          const validatedMimeType = item.mimeType ? validateMimeType(item.mimeType) : null;

          return {
            experience_id: experienceId,
            type: item.type,
            url: finalUrl, // ✅ Use final URL
            file_name: sanitizedFileName, // 🔒 SANITIZED: Removes HTML, path traversal, control chars
            mime_type: validatedMimeType, // 🔒 VALIDATED: Whitelist check
            file_size: item.size || null, // ✅ File size in bytes
            duration_seconds: item.duration || null,
            width: item.width || null,
            height: item.height || null,
            sort_order: index,
            created_by: user.id,
          };
        }));

        // 🔍 DEBUG: Log exactly what we're inserting
        console.log('[Publish] Inserting to DB:', JSON.stringify(mediaToInsert, null, 2));

        const { error: mediaError } = await supabase
          .from('experience_media')
          .insert(mediaToInsert);

        if (mediaError) {
          console.error('Failed to save media:', mediaError);
        } else {
          console.log('[Publish] Saved', mediaToInsert.length, 'media files to DB');
        }

        // ============================================================
        // 4.7. CLEANUP: Delete temporary upload entries from DB
        // ============================================================
        const { error: cleanupError } = await supabase
          .from('experience_media')
          .delete()
          .eq('experience_id', experienceId)
          .like('url', '%uploads-pending%');

        if (cleanupError) {
          console.warn('[Publish] Failed to cleanup temp URLs:', cleanupError);
          // Don't fail publish - just log warning
        } else {
          console.log('[Publish] Cleaned up temp URL entries from DB');
        }
      } catch (mediaErr) {
        console.error('Error inserting media:', mediaErr);
      }
    }

    // ============================================================
    // 4.6. SAVE EXTERNAL LINKS (if provided)
    // ============================================================
    if (data.externalLinks && data.externalLinks.length > 0) {
      try {
        const linksToInsert = data.externalLinks.map(link => ({
          experience_id: experienceId,
          url: link.url,
          platform: link.platform,
          title: link.title || null,
          description: link.description || null,
          thumbnail_url: link.thumbnail_url || null,
          author_name: link.author_name || null,
          author_url: link.author_url || null,
          provider_name: link.provider_name || null,
          provider_url: link.provider_url || null,
          html: link.html || null,
          width: link.width || null,
          height: link.height || null,
          duration: link.duration || null,
          created_by: user.id,
        }));

        const { error: linksError } = await supabase
          .from('experience_external_links')
          .insert(linksToInsert);

        if (linksError) {
          console.error('Failed to save external links:', linksError);
          // Don't fail the entire request, just log the error
        }
      } catch (linkErr) {
        console.error('Error inserting external links:', linkErr);
        // Continue - links are non-critical
      }
    }

    // ============================================================
    // 5. SUCCESS RESPONSE
    // ============================================================
    const processingTime = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      experienceId: typedResult.experience_id,
      xpEarned: typedResult.xp_earned,
      badgesEarned: typedResult.badges_earned || [],
      leveledUp: typedResult.leveled_up,
      newLevel: typedResult.new_level,
      processingTimeMs: processingTime,
    });

  } catch (error: any) {
    console.error('Publish endpoint error:', error);

    return NextResponse.json(
      {
        error: 'Failed to publish experience',
        message: error.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}