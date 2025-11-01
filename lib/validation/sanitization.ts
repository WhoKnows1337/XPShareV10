import DOMPurify from 'isomorphic-dompurify';

// ============================================================
// SANITIZATION UTILITIES FOR XSS & INJECTION PREVENTION
// ============================================================

/**
 * Configuration for DOMPurify to strip all HTML but keep text content
 */
const STRIP_HTML_CONFIG = {
  ALLOWED_TAGS: [], // No HTML tags allowed
  ALLOWED_ATTR: [], // No attributes allowed
  KEEP_CONTENT: true, // Keep text content
  RETURN_DOM: false,
  RETURN_DOM_FRAGMENT: false,
};

/**
 * Configuration for DOMPurify to allow basic formatting
 */
const BASIC_HTML_CONFIG = {
  ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'u', 'br', 'p'],
  ALLOWED_ATTR: [],
  KEEP_CONTENT: true,
};

/**
 * Strictly sanitize text input - removes ALL HTML/scripts
 * Use for: usernames, titles, tags, simple text fields
 */
export function sanitizeText(text: string): string {
  if (!text) return '';

  // First pass: Use DOMPurify to remove all HTML
  let clean = DOMPurify.sanitize(text, STRIP_HTML_CONFIG) as string;

  // Second pass: Remove potential SQL injection patterns
  clean = removeSQLPatterns(clean);

  // Third pass: Normalize whitespace
  clean = normalizeWhitespace(clean);

  return clean;
}

/**
 * Sanitize rich text content - allows basic formatting
 * Use for: experience stories, descriptions, enhanced text
 */
export function sanitizeRichText(text: string): string {
  if (!text) return '';

  // Use DOMPurify with basic HTML config
  let clean = DOMPurify.sanitize(text, BASIC_HTML_CONFIG) as string;

  // Remove SQL patterns but preserve formatting
  clean = removeSQLPatterns(clean);

  return clean;
}

/**
 * Sanitize attribute values for database storage
 * Use for: custom attribute values, category-specific fields
 */
export function sanitizeAttributeValue(value: string): string {
  if (!value) return '';

  // Strip all HTML
  let clean = DOMPurify.sanitize(value, STRIP_HTML_CONFIG) as string;

  // Convert to lowercase for canonical storage
  clean = clean.toLowerCase();

  // Remove special characters that could cause issues
  clean = clean.replace(/[<>'"`;]/g, '');

  // Normalize whitespace
  clean = normalizeWhitespace(clean);

  // Truncate to reasonable length
  if (clean.length > 500) {
    clean = clean.substring(0, 500);
  }

  return clean;
}

/**
 * Sanitize email addresses
 */
export function sanitizeEmail(email: string): string {
  if (!email) return '';

  // Basic sanitization
  let clean = email.toLowerCase().trim();

  // Remove any HTML/script attempts
  clean = DOMPurify.sanitize(clean, STRIP_HTML_CONFIG) as string;

  // Remove suspicious characters
  clean = clean.replace(/[<>'"`;]/g, '');

  return clean;
}

/**
 * Sanitize file names
 */
export function sanitizeFileName(fileName: string): string {
  if (!fileName) return '';

  // Remove path traversal attempts
  let clean = fileName.replace(/\.\./g, '');
  clean = clean.replace(/[\/\\]/g, '');

  // Remove special characters
  clean = clean.replace(/[<>:"|?*]/g, '');

  // Limit length
  if (clean.length > 255) {
    const ext = clean.split('.').pop();
    const name = clean.substring(0, 250);
    clean = ext ? `${name}.${ext}` : name;
  }

  return clean;
}

/**
 * Sanitize URLs
 */
export function sanitizeUrl(url: string): string {
  if (!url) return '';

  try {
    const parsed = new URL(url);

    // Only allow http(s) protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return '';
    }

    // Reconstruct URL to remove any injection attempts
    return parsed.toString();
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
export function sanitizeJSON(data: any): any {
  if (typeof data === 'string') {
    return sanitizeText(data);
  }

  if (Array.isArray(data)) {
    return data.map(item => sanitizeJSON(item));
  }

  if (data && typeof data === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(data)) {
      // Sanitize the key as well
      const cleanKey = sanitizeText(key);
      sanitized[cleanKey] = sanitizeJSON(value);
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
 * Remove potential SQL injection patterns
 */
function removeSQLPatterns(text: string): string {
  // Remove common SQL keywords used in injection
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|CREATE|ALTER|EXEC|EXECUTE|SCRIPT|JAVASCRIPT)\b)/gi,
    /(--|#|\/\*|\*\/)/g, // SQL comments
    /(\bOR\b\s*\d+\s*=\s*\d+)/gi, // OR 1=1 patterns
    /(\bAND\b\s*\d+\s*=\s*\d+)/gi, // AND 1=1 patterns
    /(\'|\"|`|;|\\x[0-9a-f]{2}|\\u[0-9a-f]{4})/gi, // Quotes and hex/unicode escapes
  ];

  let clean = text;
  for (const pattern of sqlPatterns) {
    clean = clean.replace(pattern, '');
  }

  return clean;
}

/**
 * Normalize whitespace in text
 */
function normalizeWhitespace(text: string): string {
  return text
    .replace(/[\r\n]+/g, ' ') // Replace line breaks with space
    .replace(/\s+/g, ' ')     // Replace multiple spaces with single space
    .trim();                  // Remove leading/trailing whitespace
}

// ============================================================
// VALIDATION HELPERS
// ============================================================

/**
 * Check if text contains suspicious patterns
 */
export function containsSuspiciousPatterns(text: string): boolean {
  const patterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i, // Event handlers like onclick=
    /\beval\s*\(/i,
    /\bexec\s*\(/i,
    /SELECT.*FROM/i,
    /INSERT.*INTO/i,
    /UPDATE.*SET/i,
    /DELETE.*FROM/i,
    /DROP\s+(TABLE|DATABASE)/i,
    /\.\.\//,  // Path traversal
    /\\x[0-9a-f]{2}/i, // Hex escapes
    /\\u[0-9a-f]{4}/i, // Unicode escapes
  ];

  return patterns.some(pattern => pattern.test(text));
}

/**
 * Validate that sanitized text maintains essential content
 */
export function validateSanitization(original: string, sanitized: string): boolean {
  // If original had content, sanitized should too
  if (original.trim().length > 0 && sanitized.trim().length === 0) {
    return false;
  }

  // Check if too much content was removed (potential over-sanitization)
  const removalRatio = 1 - (sanitized.length / original.length);
  if (removalRatio > 0.5 && original.length > 100) {
    // More than 50% removed on substantial text might indicate an issue
    console.warn('Sanitization removed more than 50% of content', {
      original: original.length,
      sanitized: sanitized.length,
      ratio: removalRatio,
    });
  }

  return true;
}

// ============================================================
// EXPORT ALL SANITIZERS AS A COLLECTION
// ============================================================

export const sanitizers = {
  text: sanitizeText,
  richText: sanitizeRichText,
  attribute: sanitizeAttributeValue,
  email: sanitizeEmail,
  fileName: sanitizeFileName,
  url: sanitizeUrl,
  location: sanitizeLocation,
  coordinates: sanitizeCoordinates,
  json: sanitizeJSON,
};

export default sanitizers;