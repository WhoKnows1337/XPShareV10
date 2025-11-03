import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import sanitizeHtml from 'sanitize-html';
import type { Platform, LinkMetadata } from '@/lib/types/link-preview';
import {
  sanitizeURL,
  isDirectMediaURL,
  isAllowedContentType,
  extractDomain,
} from '@/lib/validation/link-security';
import {
  checkRateLimit,
  getClientIP,
  rateLimitError,
  RATE_LIMIT_CONFIGS,
} from '@/lib/utils/rate-limiter';

// =============================================================================
// VALIDATION SCHEMAS
// =============================================================================

const RequestSchema = z.object({
  url: z.string().url('Invalid URL format').max(2048, 'URL too long'),
});

// =============================================================================
// PLATFORM DETECTION
// =============================================================================

function detectPlatform(url: string): Platform {
  const urlLower = url.toLowerCase();

  if (
    urlLower.includes('youtube.com/watch') ||
    urlLower.includes('youtu.be/') ||
    urlLower.includes('youtube.com/embed/') ||
    urlLower.includes('youtube.com/shorts/')
  ) {
    return 'youtube';
  }

  if (urlLower.includes('vimeo.com/')) {
    return 'vimeo';
  }

  if (
    urlLower.includes('twitter.com/') ||
    urlLower.includes('x.com/') ||
    urlLower.includes('t.co/')
  ) {
    return 'twitter';
  }

  if (urlLower.includes('spotify.com/') || urlLower.includes('spotify.link/')) {
    return 'spotify';
  }

  if (urlLower.includes('soundcloud.com/')) {
    return 'soundcloud';
  }

  if (urlLower.includes('tiktok.com/') || urlLower.includes('vm.tiktok.com/')) {
    return 'tiktok';
  }

  if (urlLower.includes('instagram.com/')) {
    return 'instagram';
  }

  if (urlLower.includes('facebook.com/') || urlLower.includes('fb.com/')) {
    return 'facebook';
  }

  if (
    urlLower.includes('google.com/maps') ||
    urlLower.includes('goo.gl/maps') ||
    urlLower.includes('maps.app.goo.gl')
  ) {
    return 'maps';
  }

  return 'website';
}

// =============================================================================
// oEmbed FETCHERS
// =============================================================================

async function fetchOEmbedData(
  url: string,
  platform: Platform
): Promise<Partial<LinkMetadata> | null> {
  try {
    let oembedEndpoint: string | null = null;

    switch (platform) {
      case 'youtube':
        oembedEndpoint = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
        break;
      case 'vimeo':
        oembedEndpoint = `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(url)}`;
        break;
      case 'twitter':
        oembedEndpoint = `https://publish.twitter.com/oembed?url=${encodeURIComponent(url)}`;
        break;
      case 'spotify':
        oembedEndpoint = `https://open.spotify.com/oembed?url=${encodeURIComponent(url)}`;
        break;
      case 'soundcloud':
        oembedEndpoint = `https://soundcloud.com/oembed?url=${encodeURIComponent(url)}&format=json`;
        break;
      case 'tiktok':
        oembedEndpoint = `https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`;
        break;
      default:
        return null;
    }

    if (!oembedEndpoint) return null;

    const response = await fetch(oembedEndpoint, {
      headers: {
        'User-Agent': 'XPShare/1.0 (+https://xpshare.com)',
      },
      signal: AbortSignal.timeout(10000), // 10s timeout
    });

    if (!response.ok) {
      console.error(`[oEmbed] ${platform} failed:`, response.status, response.statusText);
      return null;
    }

    const data = await response.json();
    console.log(`[oEmbed] ${platform} success:`, { hasTitle: !!data.title, hasAuthor: !!data.author_name });

    // Sanitize all string fields
    return {
      title: data.title ? sanitizeHtml(data.title, { allowedTags: [] }) : undefined,
      author_name: data.author_name ? sanitizeHtml(data.author_name, { allowedTags: [] }) : undefined,
      author_url: data.author_url || undefined,
      provider_name: data.provider_name || undefined,
      provider_url: data.provider_url || undefined,
      thumbnail_url: data.thumbnail_url || undefined,
      html: data.html || undefined,
      width: data.width || undefined,
      height: data.height || undefined,
    };
  } catch (error: any) {
    if (error.name === 'TimeoutError' || error.name === 'AbortError') {
      console.error(`oEmbed timeout for ${platform}`);
    } else {
      console.error(`Error fetching oEmbed data for ${platform}:`, error);
    }
    return null;
  }
}

// =============================================================================
// OPEN GRAPH PARSER
// =============================================================================

async function fetchOpenGraphData(url: string): Promise<Partial<LinkMetadata> | null> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; XPShare/1.0; +https://xpshare.com)',
      },
      signal: AbortSignal.timeout(10000), // 10s timeout
    });

    if (!response.ok) {
      console.error('[OG] Fetch failed:', response.status, response.statusText);
      return null;
    }

    // Security: Check Content-Type before reading body
    const contentType = response.headers.get('content-type');
    if (!isAllowedContentType(contentType)) {
      console.error('[OG] Blocked dangerous Content-Type:', contentType);
      return null;
    }
    console.log('[OG] Content-Type OK:', contentType);

    const html = await response.text();

    // Security: Limit HTML size (prevent DoS)
    if (html.length > 500000) {
      // 500KB max
      console.error('[OG] HTML too large:', html.length);
      return null;
    }

    // Extract Open Graph tags
    const ogTitle = html.match(/<meta\s+property=["']og:title["']\s+content=["']([^"']*)["']/i)?.[1];
    const ogDescription = html.match(/<meta\s+property=["']og:description["']\s+content=["']([^"']*)["']/i)?.[1];
    const ogImage = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']*)["']/i)?.[1];
    const ogUrl = html.match(/<meta\s+property=["']og:url["']\s+content=["']([^"']*)["']/i)?.[1];
    const ogSiteName = html.match(/<meta\s+property=["']og:site_name["']\s+content=["']([^"']*)["']/i)?.[1];
    const ogType = html.match(/<meta\s+property=["']og:type["']\s+content=["']([^"']*)["']/i)?.[1];

    // Fallback to standard meta tags
    const title =
      ogTitle ||
      html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1] ||
      html.match(/<meta\s+name=["']title["']\s+content=["']([^"']*)["']/i)?.[1];

    const description =
      ogDescription ||
      html.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i)?.[1];

    const image =
      ogImage ||
      html.match(/<link\s+rel=["']image_src["']\s+href=["']([^"']*)["']/i)?.[1];

    // Security: Sanitize all extracted strings (prevent XSS)
    const result = {
      title: title ? sanitizeHtml(title, { allowedTags: [] }).substring(0, 200) : undefined,
      description: description ? sanitizeHtml(description, { allowedTags: [] }).substring(0, 500) : undefined,
      image: image || undefined,
      url: ogUrl || url,
      site_name: ogSiteName ? sanitizeHtml(ogSiteName, { allowedTags: [] }) : undefined,
      type: ogType || 'website',
    };
    console.log('[OG] Extracted:', { hasTitle: !!result.title, hasDesc: !!result.description, hasImage: !!result.image });
    return result;
  } catch (error: any) {
    if (error.name === 'TimeoutError' || error.name === 'AbortError') {
      console.error('[OG] Timeout fetching URL');
      throw new Error('TIMEOUT');
    } else {
      console.error('[OG] Error fetching Open Graph data:', error);
      throw new Error('NETWORK_ERROR');
    }
  }
}

// =============================================================================
// MAIN ROUTE HANDLER
// =============================================================================

export async function POST(request: NextRequest) {
  try {
    // 1. RATE LIMITING
    const clientIP = getClientIP(request);
    const rateLimitResult = checkRateLimit(clientIP, RATE_LIMIT_CONFIGS.LINK_PARSE);

    if (!rateLimitResult.allowed) {
      console.warn(`[LinkParse] Rate limit exceeded for IP: ${clientIP}`);
      return rateLimitError(rateLimitResult.resetAt, rateLimitResult.retryAfter!);
    }

    // 2. PARSE REQUEST BODY
    const body = await request.json();
    const validation = RequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation error',
          details: validation.error.format(),
        },
        { status: 400 }
      );
    }

    const { url } = validation.data;

    // 3. URL SECURITY VALIDATION
    const securityCheck = sanitizeURL(url);

    if (!securityCheck.isSafe) {
      console.error('[LinkParse] Unsafe URL blocked:', url, securityCheck.errors);
      return NextResponse.json(
        {
          success: false,
          error: 'URL security check failed',
          details: securityCheck.errors,
          warnings: securityCheck.warnings,
        },
        { status: 400 }
      );
    }

    const sanitizedUrl = securityCheck.sanitizedUrl!;

    console.log('[LinkParse] Processing URL:', sanitizedUrl);
    if (securityCheck.warnings.length > 0) {
      console.warn('[LinkParse] Warnings:', securityCheck.warnings);
    }

    // 4. DETECT PLATFORM
    const platform = detectPlatform(sanitizedUrl);

    // 5. DIRECT MEDIA URL HANDLING (Skip parsing, return immediately)
    if (isDirectMediaURL(sanitizedUrl)) {
      const domain = extractDomain(sanitizedUrl);
      const filename = sanitizedUrl.split('/').pop()?.split('?')[0] || 'Media';

      return NextResponse.json({
        success: true,
        data: {
          url: sanitizedUrl,
          title: filename,
          description: undefined,
          image: sanitizedUrl, // Use the URL as preview image
          platform: 'website',
          domain,
        } as LinkMetadata,
      });
    }

    // 6. FETCH METADATA
    let metadata: Partial<LinkMetadata> = {
      url: sanitizedUrl,
      platform,
      domain: extractDomain(sanitizedUrl),
    };

    // Try oEmbed first for supported platforms (faster)
    if (platform !== 'website') {
      const oembedData = await fetchOEmbedData(sanitizedUrl, platform);
      if (oembedData) {
        metadata = { ...metadata, ...oembedData };
      }
    }

    // Fallback to Open Graph if no oEmbed data
    if (!metadata.title) {
      try {
        const ogData = await fetchOpenGraphData(sanitizedUrl);
        if (ogData) {
          metadata = { ...metadata, ...ogData };
        }
      } catch (error: any) {
        // Return specific error codes for better UX
        if (error.message === 'TIMEOUT') {
          return NextResponse.json(
            {
              success: false,
              error: 'Link takes too long to load',
              code: 'TIMEOUT',
            },
            { status: 408 }
          );
        } else if (error.message === 'NETWORK_ERROR') {
          return NextResponse.json(
            {
              success: false,
              error: 'Could not reach the website',
              code: 'NETWORK_ERROR',
            },
            { status: 503 }
          );
        } else {
          throw error; // Unknown error
        }
      }
    }

    // 7. FALLBACK: Use author_name or URL if no title
    if (!metadata.title) {
      // For social media posts, use author name as title if available
      if (metadata.author_name) {
        metadata.title = `Post by ${metadata.author_name}`;
      } else if (platform === 'twitter') {
        // Extract username from Twitter URL: https://x.com/username/status/123
        const twitterMatch = sanitizedUrl.match(/(?:twitter\.com|x\.com)\/([^\/]+)\/status/i);
        if (twitterMatch && twitterMatch[1]) {
          metadata.title = `Post by @${twitterMatch[1]}`;
          metadata.author_name = twitterMatch[1];
        } else {
          metadata.title = 'Post on X';
        }
      } else {
        // Last resort: use domain name
        const urlObj = new URL(sanitizedUrl);
        metadata.title = urlObj.hostname;
        metadata.description = sanitizedUrl;
      }
    }

    return NextResponse.json({
      success: true,
      data: metadata as LinkMetadata,
    });
  } catch (error: any) {
    console.error('[LinkParse] Error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to parse link',
        message: error.message || 'Internal server error',
      },
      { status: 500 }
    );
  }
}

// OPTIONS handler for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
