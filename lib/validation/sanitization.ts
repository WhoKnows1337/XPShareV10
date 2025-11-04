// ============================================================
// SANITIZATION UTILITIES FOR XSS & INJECTION PREVENTION
// Using sanitize-html (Node.js native, no jsdom needed)
// ============================================================

import sanitizeHtml from 'sanitize-html';

/**
 * Configuration for strict text sanitization - removes ALL HTML
 */
const STRIP_HTML_CONFIG: sanitizeHtml.IOptions = {
  allowedTags: [], // No HTML tags allowed
  allowedAttributes: {}, // No attributes allowed
  disallowedTagsMode: 'discard',
  allowedIframeHostnames: [],
};

/**
 * Configuration for rich text - allows basic formatting only
 */
const BASIC_HTML_CONFIG: sanitizeHtml.IOptions = {
  allowedTags: ['b', 'i', 'em', 'strong', 'u', 'br', 'p'],
  allowedAttributes: {},
  disallowedTagsMode: 'discard',
  allowedIframeHostnames: [],
};

/**
 * Strictly sanitize text input - removes ALL HTML/scripts
 * Use for: usernames, titles, tags, simple text fields
 */
export function sanitizeText(text: string): string {
  if (!text) return '';

  // First pass: Use sanitize-html to remove all HTML
  let clean = sanitizeHtml(text, STRIP_HTML_CONFIG);

  // Second pass: Remove potential SQL injection patterns
  clean = removeSQLPatterns(clean);

  // Third pass: Normalize whitespace
  clean = normalizeWhitespace(clean);

  return clean;
}

/**
 * Sanitize rich text content - allows basic formatting
 * Use for: experience descriptions, comments, rich text editors
 */
export function sanitizeRichText(text: string): string {
  if (!text) return '';

  // Allow basic formatting tags only
  let clean = sanitizeHtml(text, BASIC_HTML_CONFIG);

  // Remove SQL injection patterns
  clean = removeSQLPatterns(clean);

  return clean;
}

/**
 * Sanitize attribute values (enums, select options, etc.)
 */
export function sanitizeAttributeValue(value: any): string {
  if (value === null || value === undefined) return '';

  const stringValue = String(value);

  // Strip all HTML
  let clean = sanitizeHtml(stringValue, STRIP_HTML_CONFIG);

  // Remove special characters that could be used for injection
  clean = clean.replace(/[<>\"'`]/g, '');

  // Normalize whitespace
  clean = normalizeWhitespace(clean);

  return clean;
}

/**
 * Sanitize email addresses
 */
export function sanitizeEmail(email: string): string {
  if (!email) return '';

  // Strip all HTML first
  let clean = sanitizeHtml(email, STRIP_HTML_CONFIG);

  // Remove whitespace
  clean = clean.trim().toLowerCase();

  // Basic email validation pattern
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  if (!emailRegex.test(clean)) {
    throw new Error('Invalid email format');
  }

  return clean;
}

/**
 * Sanitize file names
 */
export function sanitizeFileName(fileName: string): string {
  if (!fileName) return '';

  // SECURITY: Strip HTML/scripts first
  let clean = sanitizeHtml(fileName, STRIP_HTML_CONFIG);

  // SECURITY: Remove path traversal patterns
  clean = clean.replace(/\.\.[\/\\]/g, ''); // Remove ../  and ..\
  clean = clean.replace(/^[\/\\]+/, ''); // Remove leading slashes
  clean = clean.replace(/[\/\\]+/g, '_'); // Replace slashes with underscores

  // SECURITY: Remove control characters (0x00-0x1F, 0x7F)
  clean = clean.replace(/[\x00-\x1F\x7F]/g, '');

  // SECURITY: Remove potentially dangerous characters
  clean = clean.replace(/[<>:"|?*]/g, '_');

  // Normalize whitespace
  clean = normalizeWhitespace(clean);

  // Limit length (filesystem + DB limits)
  if (clean.length > 255) {
    const ext = clean.match(/\.[^.]+$/)?.[0] || '';
    const nameWithoutExt = clean.slice(0, clean.length - ext.length);
    clean = nameWithoutExt.slice(0, 255 - ext.length) + ext;
  }

  return clean;
}

/**
 * Sanitize URLs
 */
export function sanitizeURL(url: string): string {
  if (!url) return '';

  // Strip HTML
  let clean = sanitizeHtml(url, STRIP_HTML_CONFIG);

  // Only allow http/https protocols
  try {
    const parsed = new URL(clean);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      throw new Error('Invalid URL protocol');
    }
    return parsed.href;
  } catch {
    return '';
  }
}

/**
 * Sanitize location text
 */
export function sanitizeLocation(location: string): string {
  if (!location) return '';

  // Basic text sanitization
  let clean = sanitizeText(location);

  // Remove coordinate-like patterns that might be injection attempts
  clean = clean.replace(/[();]/g, '');

  return clean;
}

/**
 * Validate and sanitize coordinates
 */
export function sanitizeCoordinates(lat: number, lng: number): { lat: number; lng: number } | null {
  // Validate latitude (-90 to 90)
  if (typeof lat !== 'number' || lat < -90 || lat > 90) {
    return null;
  }

  // Validate longitude (-180 to 180)
  if (typeof lng !== 'number' || lng < -180 || lng > 180) {
    return null;
  }

  // Round to reasonable precision (6 decimal places = ~0.1m accuracy)
  return {
    lat: Math.round(lat * 1000000) / 1000000,
    lng: Math.round(lng * 1000000) / 1000000,
  };
}

/**
 * Sanitize JSON data before storage
 */
export async function sanitizeJSON(data: any): Promise<any> {
  if (typeof data === 'string') {
    return sanitizeText(data);
  }

  if (Array.isArray(data)) {
    return await Promise.all(data.map(item => sanitizeJSON(item)));
  }

  if (data && typeof data === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(data)) {
      // Sanitize the key as well
      const cleanKey = sanitizeText(key);
      sanitized[cleanKey] = await sanitizeJSON(value);
    }
    return sanitized;
  }

  // Return numbers, booleans, null as-is
  return data;
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Remove common SQL injection patterns
 */
function removeSQLPatterns(text: string): string {
  // Remove SQL keywords that could indicate injection attempts
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|SCRIPT|JAVASCRIPT|ONERROR|ONLOAD)\b)/gi,
    /(--[^\n]*)/g, // SQL comments
    /(\/\*[\s\S]*?\*\/)/g, // Multi-line comments
  ];

  let clean = text;
  for (const pattern of sqlPatterns) {
    clean = clean.replace(pattern, '');
  }

  return clean;
}

/**
 * Normalize whitespace
 */
function normalizeWhitespace(text: string): string {
  return text
    .replace(/\s+/g, ' ') // Multiple spaces to single space
    .replace(/\n\s*\n/g, '\n') // Multiple newlines to single newline
    .trim();
}

/**
 * Check for suspicious patterns that indicate potential attacks
 */
export function containsSuspiciousPatterns(text: string): boolean {
  const suspiciousPatterns = [
    /<script[^>]*>.*?<\/script>/gi, // Script tags
    /javascript:/gi, // JavaScript protocol
    /on\w+\s*=/gi, // Event handlers (onclick, onerror, etc.)
    /data:text\/html/gi, // Data URIs with HTML
    /vbscript:/gi, // VBScript protocol
    /&#/g, // HTML entities (often used in XSS)
    /\\x[0-9a-f]{2}/gi, // Hex encoding
    /\\u[0-9a-f]{4}/gi, // Unicode encoding
  ];

  return suspiciousPatterns.some(pattern => pattern.test(text));
}

/**
 * MIME type whitelist for file uploads
 */
const ALLOWED_MIME_TYPES = [
  // Images
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  // Videos
  'video/mp4',
  'video/quicktime',
  'video/x-msvideo',
  'video/webm',
  // Audio
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/ogg',
  'audio/webm',
  'audio/x-m4a',
  // Documents
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // XLSX
  'application/vnd.ms-excel', // XLS
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // DOCX
  'application/msword', // DOC
];

/**
 * Validate MIME type against whitelist
 * Returns the validated MIME type or null if invalid
 */
export function validateMimeType(mimeType: string): string | null {
  if (!mimeType) return null;

  // Normalize to lowercase
  const normalized = mimeType.toLowerCase().trim();

  // Check against whitelist
  if (ALLOWED_MIME_TYPES.includes(normalized)) {
    return normalized;
  }

  console.warn(`[Security] Invalid MIME type rejected: ${mimeType}`);
  return null;
}

// ============================================================
// EXPORTS
// ============================================================

export default {
  sanitizeText,
  sanitizeRichText,
  sanitizeAttributeValue,
  sanitizeEmail,
  sanitizeFileName,
  sanitizeURL,
  sanitizeLocation,
  sanitizeCoordinates,
  sanitizeJSON,
  containsSuspiciousPatterns,
  validateMimeType,
};
