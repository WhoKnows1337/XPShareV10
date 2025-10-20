# XPShare AI - Deployment & Production Guide

**Version:** 1.0
**Related:** 07_IMPLEMENTATION_PHASES.md

---

## 🚀 Production Deployment Checklist

### Pre-Deployment

- [ ] All migrations tested locally
- [ ] All tests passing (unit + integration)
- [ ] Environment variables configured
- [ ] Database backups enabled
- [ ] Monitoring setup
- [ ] Error tracking configured
- [ ] Rate limiting tested
- [ ] Security audit completed

---

## 🔧 Environment Setup

### Required Environment Variables

```bash
# .env.production

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...

# OpenAI
OPENAI_API_KEY=sk-proj-xxx...

# Vercel (auto-set)
VERCEL_URL=auto
VERCEL_ENV=production

# Optional: Redis (caching)
REDIS_URL=redis://...

# Optional: Sentry (error tracking)
SENTRY_DSN=https://...
```

---

## 📦 Database Migrations

### Using Supabase CLI

```bash
# 1. Link to production project
supabase link --project-ref your-project-ref

# 2. Apply migrations
supabase db push

# 3. Verify
supabase db diff
```

### Using Supabase MCP (Recommended)

```typescript
// scripts/apply-migrations.ts
import { mcp__supabase__apply_migration } from 'mcp'

const migrations = [
  '001_enable_extensions',
  '002_add_fts_columns',
  '003_add_geo_indexes',
  // ... all migrations
]

for (const migration of migrations) {
  console.log(`Applying ${migration}...`)

  await mcp__supabase__apply_migration({
    name: migration,
    query: await readMigrationFile(`./migrations/${migration}.sql`)
  })

  console.log(`✓ ${migration} applied`)
}
```

---

## 🏗️ Vercel Deployment

### 1. Connect Repository

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Link project
vercel link

# Deploy to production
vercel --prod
```

### 2. Configure Build Settings

**vercel.json:**
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "regions": ["fra1"],
  "env": {
    "NEXT_PUBLIC_SUPABASE_URL": "@supabase-url",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "@supabase-anon-key",
    "SUPABASE_SERVICE_ROLE_KEY": "@supabase-service-role-key",
    "OPENAI_API_KEY": "@openai-api-key"
  }
}
```

### 3. Edge Functions Configuration

```typescript
// app/api/discover/route.ts
export const runtime = 'edge'
export const maxDuration = 30
export const dynamic = 'force-dynamic'
```

---

## 🔍 Monitoring Setup

### Vercel Analytics

```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

### Sentry Error Tracking

```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

**sentry.server.config.ts:**
```typescript
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.VERCEL_ENV || 'development',
  tracesSampleRate: 0.1,
  integrations: [
    new Sentry.BrowserTracing(),
  ],
})
```

### Custom Query Logging

```typescript
// lib/monitoring/logger.ts
import { createClient } from '@supabase/supabase-js'

export async function logQuery(
  functionName: string,
  duration: number,
  params: any,
  resultCount: number,
  userId?: string
) {
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  await supabase.from('query_performance_log').insert({
    function_name: functionName,
    execution_time_ms: duration,
    parameters: params,
    result_count: resultCount,
    user_id: userId,
  })
}
```

---

## ⚡ Performance Optimization

### 1. Enable Caching

**Redis Setup (Optional):**
```typescript
// lib/cache/redis.ts
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.REDIS_URL!,
  token: process.env.REDIS_TOKEN!,
})

export async function getCached<T>(
  key: string,
  ttl: number,
  fetcher: () => Promise<T>
): Promise<T> {
  const cached = await redis.get(key)

  if (cached) return cached as T

  const data = await fetcher()
  await redis.set(key, data, { ex: ttl })

  return data
}
```

### 2. Database Optimization

```sql
-- Create materialized views
REFRESH MATERIALIZED VIEW CONCURRENTLY category_stats;
REFRESH MATERIALIZED VIEW CONCURRENTLY user_rankings;

-- Analyze tables
ANALYZE experiences;
ANALYZE experience_attributes;

-- Vacuum
VACUUM ANALYZE experiences;
```

### 3. CDN Configuration

```typescript
// next.config.js
module.exports = {
  images: {
    domains: ['xxx.supabase.co'],
    formats: ['image/avif', 'image/webp'],
  },
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['@/components', 'lucide-react'],
  },
}
```

---

## 🔒 Security

### 1. Rate Limiting

```typescript
// middleware.ts
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(60, '1 m'), // 60 requests per minute
})

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/api/discover')) {
    const ip = request.ip ?? '127.0.0.1'
    const { success } = await ratelimit.limit(ip)

    if (!success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      )
    }
  }

  return NextResponse.next()
}
```

### 2. Input Validation

```typescript
// lib/validation/sanitize.ts
import DOMPurify from 'isomorphic-dompurify'

export function sanitizeInput(input: string): string {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  })
}

export function validateUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}
```

### 3. CORS Configuration

```typescript
// middleware.ts (add CORS headers)
export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  response.headers.set('Access-Control-Allow-Origin', 'https://xpshare.com')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  return response
}
```

---

## 📊 Load Testing

```bash
# Install k6
brew install k6

# Run load test
k6 run load-test.js
```

**load-test.js:**
```javascript
import http from 'k6/http'
import { check, sleep } from 'k6'

export const options = {
  stages: [
    { duration: '2m', target: 100 },  // Ramp up to 100 users
    { duration: '5m', target: 100 },  // Stay at 100 users
    { duration: '2m', target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% of requests < 2s
    http_req_failed: ['rate<0.05'],    // < 5% error rate
  },
}

export default function () {
  const payload = JSON.stringify({
    messages: [
      { id: '1', role: 'user', content: 'Show me UFO sightings in Berlin' }
    ]
  })

  const res = http.post('https://xpshare.com/api/discover', payload, {
    headers: { 'Content-Type': 'application/json' },
  })

  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 2s': (r) => r.timings.duration < 2000,
  })

  sleep(1)
}
```

---

## 🔄 CI/CD Pipeline

**GitHub Actions (.github/workflows/deploy.yml):**
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test

      - name: Build
        run: npm run build
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

---

## 📋 Post-Deployment Checklist

- [ ] All API endpoints responding
- [ ] Database migrations applied
- [ ] RLS policies active
- [ ] Rate limiting working
- [ ] Monitoring dashboards showing data
- [ ] Error tracking receiving events
- [ ] Load test passed
- [ ] Backup verified
- [ ] Documentation updated
- [ ] Team notified

---

**Next:** See 11_IMPLEMENTATION_CHECKLIST.md for complete task tracking.
