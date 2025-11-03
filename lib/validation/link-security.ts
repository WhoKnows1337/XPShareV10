/**
 * Link Security Utilities
 * Protects against malicious URLs, phishing, and dangerous file types
 */

/**
 * Dangerous file extensions that should be blocked in URLs
 */
const DANGEROUS_EXTENSIONS = [
  // Executables
  '.exe', '.bat', '.cmd', '.scr', '.vbs', '.com', '.pif', '.msi',
  '.dll', '.sys', '.drv', '.cpl',

  // Scripts
  '.js', '.vbe', '.jse', '.ws', '.wsf', '.wsc', '.wsh',
  '.ps1', '.psm1', '.psd1', '.ps1xml', '.pssc', '.psc1',
  '.sh', '.bash', '.zsh', '.fish',

  // Archives that might contain executables
  '.scr', '.jar',

  // Other dangerous
  '.app', '.deb', '.rpm', '.dmg', '.pkg',
];

/**
 * Suspicious TLDs often used for spam/malware
 * Source: Spamhaus & URLhaus databases
 */
const SUSPICIOUS_TLDS = [
  '.tk', '.ml', '.ga', '.cf', '.gq', // Free TLDs (Freenom)
  '.pw', '.cc', '.ws', '.info', // Often abused
  '.top', '.work', '.download', '.link', // Recently flagged
];

/**
 * Allowed URL protocols
 */
const ALLOWED_PROTOCOLS = ['http:', 'https:'];

/**
 * Blocked URL protocols that could be dangerous
 */
const BLOCKED_PROTOCOLS = [
  'javascript:', 'data:', 'file:', 'ftp:', 'ftps:',
  'blob:', 'about:', 'vbscript:', 'tel:', 'sms:',
];

/**
 * Maximum allowed URL length (browser standard)
 */
const MAX_URL_LENGTH = 2048;

export interface URLSecurityCheck {
  isValid: boolean;
  isSafe: boolean;
  warnings: string[];
  errors: string[];
  sanitizedUrl?: string;
}

/**
 * Check if URL contains dangerous file extensions
 */
export function hasDangerousExtension(url: string): boolean {
  try {
    const parsed = new URL(url);
    const pathname = parsed.pathname.toLowerCase();

    // Check if pathname ENDS with a dangerous extension (before query params)
    for (const ext of DANGEROUS_EXTENSIONS) {
      if (pathname.endsWith(ext)) {
        return true;
      }
    }

    return false;
  } catch {
    // If URL parsing fails, do a simple check
    const lowerUrl = url.toLowerCase();
    for (const ext of DANGEROUS_EXTENSIONS) {
      // Check if it ends with the extension (not just contains)
      if (lowerUrl.endsWith(ext)) {
        return true;
      }
    }
    return false;
  }
}

/**
 * Check if URL uses a suspicious TLD
 */
export function hasSuspiciousTLD(url: string): boolean {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.toLowerCase();

    for (const tld of SUSPICIOUS_TLDS) {
      if (hostname.endsWith(tld)) {
        return true;
      }
    }

    return false;
  } catch {
    return false;
  }
}

/**
 * Check if URL is an IP address instead of a domain
 */
export function isIPAddress(url: string): boolean {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname;

    // IPv4 pattern
    const ipv4Pattern = /^(\d{1,3}\.){3}\d{1,3}$/;

    // IPv6 pattern (simplified)
    const ipv6Pattern = /^\[?[0-9a-fA-F:]+\]?$/;

    return ipv4Pattern.test(hostname) || ipv6Pattern.test(hostname);
  } catch {
    return false;
  }
}

/**
 * Check if domain is extremely short (potential typosquatting)
 */
export function hasShortDomain(url: string): boolean {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname;

    // Extract domain without TLD
    const parts = hostname.split('.');
    if (parts.length < 2) return false;

    const domain = parts[parts.length - 2];

    // Flag if domain is less than 3 chars (excluding TLD)
    return domain.length < 3;
  } catch {
    return false;
  }
}

/**
 * Sanitize and validate URL
 */
export function sanitizeURL(url: string): URLSecurityCheck {
  const warnings: string[] = [];
  const errors: string[] = [];

  // 1. Length check
  if (url.length > MAX_URL_LENGTH) {
    errors.push(`URL too long (max ${MAX_URL_LENGTH} characters)`);
    return { isValid: false, isSafe: false, warnings, errors };
  }

  // 2. Parse URL
  let parsed: URL;
  try {
    parsed = new URL(url.trim());
  } catch (error) {
    errors.push('Invalid URL format');
    return { isValid: false, isSafe: false, warnings, errors };
  }

  // 3. Protocol check
  if (!ALLOWED_PROTOCOLS.includes(parsed.protocol)) {
    if (BLOCKED_PROTOCOLS.includes(parsed.protocol)) {
      errors.push(`Dangerous protocol: ${parsed.protocol}`);
    } else {
      errors.push(`Protocol not allowed: ${parsed.protocol} (only http/https)`);
    }
    return { isValid: false, isSafe: false, warnings, errors };
  }

  // 4. Check for dangerous extensions
  if (hasDangerousExtension(url)) {
    errors.push('URL contains dangerous file extension');
    return { isValid: false, isSafe: false, warnings, errors };
  }

  // 5. Check for suspicious TLD
  if (hasSuspiciousTLD(url)) {
    warnings.push('URL uses a suspicious top-level domain');
  }

  // 6. Check if IP address
  if (isIPAddress(url)) {
    warnings.push('URL uses IP address instead of domain name');
  }

  // 7. Check for short domain (potential typosquatting)
  if (hasShortDomain(url)) {
    warnings.push('URL has unusually short domain name');
  }

  // 8. Check for multiple subdomains (potential phishing)
  const subdomainCount = parsed.hostname.split('.').length - 2;
  if (subdomainCount > 3) {
    warnings.push('URL has many subdomains (potential phishing)');
  }

  // Return sanitized URL
  const sanitizedUrl = parsed.href;
  const isSafe = errors.length === 0;
  const isValid = true;

  return {
    isValid,
    isSafe,
    warnings,
    errors,
    sanitizedUrl,
  };
}

/**
 * Detect if URL is a direct media file (image/video)
 * Skip OG-parsing for these
 */
export function isDirectMediaURL(url: string): boolean {
  const mediaExtensions = [
    // Images
    '.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.ico', '.bmp',
    // Videos
    '.mp4', '.webm', '.mov', '.avi', '.mkv', '.flv', '.wmv',
    // Audio
    '.mp3', '.wav', '.ogg', '.m4a', '.flac', '.aac',
  ];

  const lowerUrl = url.toLowerCase();

  // Check if URL path ends with media extension (before query params)
  try {
    const parsed = new URL(url);
    const pathname = parsed.pathname.toLowerCase();

    return mediaExtensions.some(ext => pathname.endsWith(ext));
  } catch {
    // Fallback to simple string check
    return mediaExtensions.some(ext => lowerUrl.includes(ext));
  }
}

/**
 * Check if Content-Type header is safe
 */
export function isAllowedContentType(contentType: string | null): boolean {
  if (!contentType) return false;

  const allowed = [
    'text/html',
    'text/plain',
    'application/json',
    'application/xml',
    'application/xhtml+xml',
    'image/',
    'video/',
    'audio/',
  ];

  const lowerType = contentType.toLowerCase();

  return allowed.some(type => lowerType.startsWith(type));
}

/**
 * Extract domain from URL for logging/rate limiting
 */
export function extractDomain(url: string): string | null {
  try {
    const parsed = new URL(url);
    return parsed.hostname;
  } catch {
    return null;
  }
}
