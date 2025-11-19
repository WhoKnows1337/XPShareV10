# Vercel KV Setup Guide

## Overview

XPShare uses Vercel KV (Redis) for production-ready rate limiting. This replaces the in-memory rate limiting system with a persistent, distributed solution.

## Features

✅ **Persistent** - Rate limits survive server restarts
✅ **Distributed** - Works across multiple server instances
✅ **Automatic Fallback** - Falls back to in-memory if KV unavailable
✅ **Production Ready** - Handles high traffic loads

---

## Setup Instructions

### Option 1: Vercel KV (Recommended for Vercel Deployments)

1. **Create KV Database via Dashboard**
   ```
   1. Go to https://vercel.com/dashboard
   2. Select your team: strangerr-mecom's projects
   3. Navigate to: Storage → Create Database
   4. Select: KV (Redis)
   5. Name: xpshare-rate-limit
   6. Region: Choose closest to users (e.g., Frankfurt)
   7. Click: Create
   ```

2. **Link to Project**
   ```
   1. After creation, click: Connect Project
   2. Select: xpshare-v10
   3. Environment: Production, Preview, Development (all)
   4. Click: Connect
   ```

3. **Get Environment Variables (Automatic)**
   - Vercel automatically adds to project environment variables:
     - `KV_REST_API_URL`
     - `KV_REST_API_TOKEN`
   - For local development, copy from:
     - Dashboard → Project Settings → Environment Variables
     - Or: Storage → KV → .env.local tab

4. **Add to .env.local (Local Development)**
   ```bash
   KV_REST_API_URL=https://your-kv-instance.upstash.io
   KV_REST_API_TOKEN=your-token-here
   ```

5. **Deploy or Restart Dev Server**
   ```bash
   # For production (automatically uses KV)
   vercel deploy

   # For local development
   pnpm dev
   ```

**Alternative: CLI Method**
```bash
# Install Vercel CLI globally (if not installed)
npm i -g vercel

# Login
vercel login

# Create KV store
vercel kv create xpshare-rate-limit --team strangerr-mecoms-projects

# Link to project
vercel link

# Pull environment variables to .env.local
vercel env pull .env.local
```

### Option 2: Upstash Redis (For Non-Vercel Deployments)

1. **Create Account**
   - Go to [upstash.com](https://upstash.com)
   - Create free account

2. **Create Redis Database**
   - Dashboard → Create Database
   - Choose region closest to your users
   - Select Free tier (10K commands/day)

3. **Get Environment Variables**
   - Click on your database → REST API tab
   - Copy `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`

4. **Add to .env.local**
   ```bash
   # Rename to match Vercel KV naming
   KV_REST_API_URL=https://your-redis.upstash.io
   KV_REST_API_TOKEN=your-token-here
   ```

---

## Rate Limit Configuration

Current limits (configurable in `lib/rate-limit/vercel-kv-limiter.ts`):

| Endpoint | Limit | Window |
|----------|-------|--------|
| `/api/submit/publish` | 10 | 1 hour |
| `/api/submit/analyze` | 30 | 15 min |
| `/api/submit/upload` | 50 | 15 min |
| `/api/search` | 100 | 1 min |
| `/api/experiences` | 200 | 1 min |
| Default | 100 | 1 min |

---

## Testing

### Test Rate Limiting Works

```bash
# Test with curl
for i in {1..15}; do
  echo "Request $i:"
  curl -i http://localhost:3000/api/search \
    -H "Content-Type: application/json" \
    -d '{"query": "test"}'
  echo "\n---\n"
done

# Should see:
# Requests 1-10: 200 OK
# Requests 11+: 429 Too Many Requests
```

### Test Headers

```bash
curl -i http://localhost:3000/api/search \
  -H "Content-Type: application/json" \
  -d '{"query": "test"}'

# Check for headers:
# X-RateLimit-Limit: 100
# X-RateLimit-Remaining: 99
# X-RateLimit-Reset: 2025-01-19T...
```

---

## Pricing

### Vercel KV Free Tier (Hobby Plan)
```
Storage: 256 MB
Commands: 10,000 per day
Bandwidth: 1 GB per month

✅ Sufficient for: 100-500 users/day
```

### Vercel KV Pro Tier
```
Storage: 1 GB
Commands: 500,000 per day
Bandwidth: 10 GB per month

Price: $20/month (flat)
✅ Sufficient for: 10,000+ users/day
```

### Upstash Free Tier
```
Commands: 10,000 per day
Storage: 256 MB
Bandwidth: 200 MB per day

✅ Sufficient for: 100-500 users/day
```

### Upstash Pay-as-you-go
```
$0.20 per 100K commands
$0.25 per GB storage/month

✅ Cost Example:
- 20K commands/day × 30 = 600K commands/month
- Cost: 600K ÷ 100K × $0.20 = $1.20/month
```

---

## Monitoring

### View Rate Limit Stats

Create admin endpoint to monitor rate limiting:

```typescript
// app/api/admin/rate-limits/route.ts
import { getRateLimitStats } from '@/lib/rate-limit/vercel-kv-limiter'

export async function GET() {
  const stats = await getRateLimitStats()
  return Response.json(stats)
}
```

### Vercel KV Dashboard

- Vercel Dashboard → Storage → KV → Your Database
- View: Commands/sec, Storage usage, Active connections

### Upstash Dashboard

- Upstash Dashboard → Your Database
- View: Requests, Storage, Latency

---

## Fallback Behavior

The system automatically falls back to in-memory rate limiting if:

1. KV environment variables are not set
2. KV connection fails
3. KV rate limits are exhausted

**Fallback Mode:**
- ⚠️ Rate limits reset on server restart
- ⚠️ Each server instance has separate limits
- ✅ Still provides basic protection

---

## Migration from In-Memory

The migration is **automatic and zero-downtime**:

1. Old deploys: Use in-memory (as before)
2. Add KV env vars → Deploy
3. New deploys: Use KV automatically
4. No code changes required

---

## Troubleshooting

### "KV_REST_API_URL is not defined"

**Solution:** Add to `.env.local`:
```bash
KV_REST_API_URL=https://...
KV_REST_API_TOKEN=...
```

### "ECONNREFUSED" or timeout errors

**Solution:** Check KV is accessible from your region:
```bash
curl -i "$KV_REST_API_URL/get/test" \
  -H "Authorization: Bearer $KV_REST_API_TOKEN"
```

### Rate limits not persisting across restarts

**Solution:** Verify KV is actually being used:
```typescript
// Check middleware console
// Should see: "✅ PRODUCTION: Use Vercel KV"
// NOT: "⚠️ FALLBACK: Use in-memory store"
```

### "Rate limit exceeded" errors in logs

**Solution:** This is working as intended! Adjust limits in:
```typescript
// lib/rate-limit/vercel-kv-limiter.ts
const RATE_LIMITS = {
  '/api/submit/publish': { limit: 20, window: 3600 }, // Increase from 10 to 20
}
```

---

## Security Best Practices

✅ **DO:**
- Use environment variables for KV credentials
- Monitor rate limit stats regularly
- Adjust limits based on legitimate usage patterns
- Enable HTTPS for KV connections

❌ **DON'T:**
- Commit KV credentials to git
- Set limits too low (blocks legitimate users)
- Disable rate limiting in production
- Share KV credentials across projects

---

## Next Steps

1. **Monitor Usage** - Check KV commands/day after 1 week
2. **Adjust Limits** - Fine-tune based on user behavior
3. **Add Admin Dashboard** - Create UI to view/reset rate limits
4. **Implement Whitelist** - Allow trusted IPs to bypass limits

---

## Support

- **Vercel KV Docs:** https://vercel.com/docs/storage/vercel-kv
- **Upstash Docs:** https://docs.upstash.com/redis
- **XPShare Issues:** https://github.com/your-org/xpshare/issues
