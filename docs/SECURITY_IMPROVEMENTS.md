# 🔒 XPShare V10 Security Improvements

## Overview
This document outlines the comprehensive security improvements implemented in XPShare V10 to protect against common web vulnerabilities and ensure data integrity.

## 🛡️ Implemented Security Measures

### 1. Input Validation with Zod

**Location:** `/lib/validation/submit-schemas.ts`

All API endpoints now use strict Zod validation schemas:

- **Text validation:** Min/max length, character limits
- **Email validation:** RFC-compliant email format checking
- **Coordinate validation:** Latitude/longitude bounds
- **File validation:** MIME type, size limits, extension checks
- **Category validation:** Enum-based strict categories
- **Attribute validation:** Sanitized values with confidence scores

**Example Usage:**
```typescript
import { publishSchema } from '@/lib/validation/submit-schemas';

const validation = publishSchema.safeParse(requestBody);
if (!validation.success) {
  return NextResponse.json({
    error: 'Validation failed',
    details: validation.error.flatten()
  }, { status: 400 });
}
```

### 2. XSS Prevention with DOMPurify

**Location:** `/lib/validation/sanitization.ts`

All user-generated content is sanitized using DOMPurify:

- **Text sanitization:** Removes all HTML/scripts
- **Rich text sanitization:** Allows basic formatting only
- **Attribute sanitization:** Canonicalized lowercase values
- **SQL pattern removal:** Prevents injection attempts
- **Suspicious pattern detection:** Logs potential attacks

**Sanitization Levels:**
- `sanitizeText()` - Strips ALL HTML, used for titles, tags
- `sanitizeRichText()` - Allows `<b>`, `<i>`, `<em>`, `<strong>`, `<p>`, `<br>`
- `sanitizeAttributeValue()` - Lowercase canonical values
- `sanitizeEmail()` - Email-specific sanitization

### 3. Rate Limiting

**Location:** `/middleware.ts`

Per-endpoint rate limiting to prevent abuse:

| Endpoint | Limit | Window |
|----------|-------|---------|
| `/api/submit/publish` | 10 requests | 1 hour |
| `/api/submit/analyze` | 30 requests | 15 minutes |
| `/api/submit/upload` | 50 requests | 15 minutes |
| `/api/experiences` | 60 requests | 1 minute |
| Default API | 100 requests | 1 minute |

**Headers Added:**
- `X-RateLimit-Limit` - Maximum requests allowed
- `X-RateLimit-Remaining` - Requests remaining
- `X-RateLimit-Reset` - Window reset time
- `Retry-After` - Seconds until retry (on 429)

### 4. Secure File Upload

**Location:** `/app/api/submit/upload/route.ts`

Multi-layer file validation:

1. **Size Validation:** Max 10MB per file
2. **MIME Type Whitelist:** Only specific image/audio/video formats
3. **Extension Validation:** Must match MIME type
4. **Magic Number Validation:** Checks file signatures (first bytes)
5. **Filename Sanitization:** Removes path traversal attempts
6. **Unique Storage:** Hash-based unique filenames

**Allowed MIME Types:**
- Images: `image/jpeg`, `image/png`, `image/webp`, `image/gif`
- Audio: `audio/mpeg`, `audio/wav`, `audio/webm`
- Video: `video/mp4`, `video/webm`, `video/quicktime`

### 5. Database Transactions

**Location:** `/app/api/submit/publish/route-secure.ts`

Atomic operations with rollback on failure:

```typescript
// Transaction-like behavior
try {
  const experience = await insertExperience();
  await insertAttributes(experience.id);
  await insertWitnesses(experience.id);
  await generateEmbedding(experience.id);
  return success();
} catch (error) {
  // Rollback on any failure
  await deleteExperience(experience.id);
  return error();
}
```

### 6. Security Headers

All API responses include:

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- Removed: `X-Powered-By`

### 7. Email Validation

**Location:** Uses `validator` package

- RFC-compliant email validation
- Prevents UTF-8 local parts
- Requires TLD
- Sanitizes before storage

### 8. SQL Injection Prevention

Multiple layers of protection:

1. **Parameterized Queries:** Supabase uses prepared statements
2. **Input Sanitization:** SQL patterns removed from text
3. **Canonical Values:** Lowercase, normalized attributes
4. **Type Validation:** Strict typing with TypeScript/Zod

### 9. Path Traversal Prevention

- Filename sanitization removes `..` and `/`
- Storage uses hash-based paths
- No direct file system access from user input

### 10. Suspicious Pattern Detection

Middleware checks for:
- Path traversal attempts (`..`, `//`)
- Script injection (`<script`)
- JavaScript protocols (`javascript:`)
- Event handlers (`onclick=`, etc.)

## 📊 Security Monitoring

### Logging

All security events are logged:

```typescript
console.warn('Suspicious request detected:', {
  url: request.url,
  ip: getClientIP(request),
  timestamp: new Date().toISOString(),
});
```

### Metrics to Monitor

1. **Rate Limit Hits:** Track 429 responses
2. **Validation Failures:** Track 400 responses
3. **Suspicious Patterns:** Monitor console warnings
4. **Failed Uploads:** Track file validation rejections
5. **Rollback Events:** Monitor transaction failures

## 🚀 Production Recommendations

### 1. Replace In-Memory Rate Limiting

Current implementation uses `Map()` for rate limiting. For production:

```typescript
// Use Vercel KV or Redis
import { kv } from '@vercel/kv';

const rateLimit = await kv.get(rateLimitKey);
await kv.set(rateLimitKey, newValue, { ex: windowSeconds });
```

### 2. Add Virus Scanning

For file uploads, integrate with:
- ClamAV for self-hosted
- VirusTotal API
- AWS/GCP malware detection services

### 3. Implement CSP Headers

Add Content Security Policy:

```typescript
response.headers.set(
  'Content-Security-Policy',
  "default-src 'self'; script-src 'self' 'unsafe-inline' *.supabase.co; ..."
);
```

### 4. Add Request Signing

For critical operations:

```typescript
const signature = crypto
  .createHmac('sha256', process.env.API_SECRET)
  .update(JSON.stringify(payload))
  .digest('hex');
```

### 5. Implement Audit Logging

Track all sensitive operations:

```sql
CREATE TABLE audit_log (
  id UUID PRIMARY KEY,
  user_id UUID,
  action VARCHAR(50),
  resource_type VARCHAR(50),
  resource_id UUID,
  ip_address VARCHAR(45),
  user_agent TEXT,
  metadata JSONB,
  created_at TIMESTAMP
);
```

## 🔍 Testing Checklist

### Input Validation Tests
- [ ] Submit text with < 50 characters (should fail)
- [ ] Submit text with > 50,000 characters (should fail)
- [ ] Submit with script tags (should be sanitized)
- [ ] Submit with SQL keywords (should be sanitized)

### File Upload Tests
- [ ] Upload file > 10MB (should fail)
- [ ] Upload .exe file (should fail)
- [ ] Upload file with mismatched extension (should fail)
- [ ] Upload 11 files at once (should fail)

### Rate Limiting Tests
- [ ] Submit 11 experiences in 1 hour (should rate limit)
- [ ] Make 31 analyze requests in 15 minutes (should rate limit)
- [ ] Check rate limit headers are present

### XSS Tests
- [ ] Submit `<script>alert('xss')</script>` (should be removed)
- [ ] Submit `javascript:alert(1)` in URL field (should be sanitized)
- [ ] Submit `<img src=x onerror=alert(1)>` (should be removed)

### SQL Injection Tests
- [ ] Submit `'; DROP TABLE experiences; --` (should be sanitized)
- [ ] Submit `' OR '1'='1` in search (should be safe)
- [ ] Submit `UNION SELECT * FROM users` (keywords removed)

### Path Traversal Tests
- [ ] Upload file named `../../etc/passwd` (should be sanitized)
- [ ] Access `/api/../../../env` (should be blocked)

## 🛠️ Maintenance

### Regular Updates
- Update dependencies monthly: `npm update`
- Review OWASP Top 10 quarterly
- Audit security logs weekly
- Test rate limits after deployments

### Security Headers Check
Use [securityheaders.com](https://securityheaders.com) to verify headers

### Dependency Scanning
```bash
npm audit
npm audit fix
```

## 📝 Security Incident Response

1. **Detect:** Monitor logs for suspicious patterns
2. **Contain:** Rate limit or block affected IPs
3. **Investigate:** Check audit logs and access patterns
4. **Remediate:** Patch vulnerability
5. **Document:** Record incident and response
6. **Review:** Update security measures

## 🎯 Next Steps

1. **Implement OAuth:** Add social login providers
2. **2FA Support:** Add TOTP/SMS verification
3. **API Keys:** For programmatic access
4. **IP Allowlisting:** For admin endpoints
5. **WAF Integration:** CloudFlare/AWS WAF
6. **Penetration Testing:** Professional security audit

## 📚 References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security](https://nextjs.org/docs/app/building-your-application/configuring/security)
- [Supabase Security](https://supabase.com/docs/guides/platform/security)
- [DOMPurify Documentation](https://github.com/cure53/DOMPurify)
- [Zod Validation](https://zod.dev/)

---

*Last Updated: November 2024*
*Security Contact: security@xpshare.app*