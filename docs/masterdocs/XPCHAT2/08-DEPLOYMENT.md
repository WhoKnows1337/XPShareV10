# XPChat Deployment Guide

**Target:** Vercel
**Environment:** Production
**Prerequisites:** All tests passing

---

## Pre-Deployment Checklist

### Code Quality
- [ ] All unit tests passing
- [ ] All integration tests passing
- [ ] All E2E tests passing
- [ ] No TypeScript errors (`npm run build`)
- [ ] No ESLint errors (`npm run lint`)
- [ ] Code reviewed (if team workflow)

### Performance
- [ ] Token usage < 3,500/request (verified)
- [ ] Simple query response time < 5s
- [ ] Complex query response time < 15s
- [ ] Load testing passed (10+ concurrent users)

### Environment Variables
- [ ] ANTHROPIC_API_KEY set in Vercel
- [ ] DIRECT_DATABASE_URL set in Vercel
- [ ] NEXT_PUBLIC_SUPABASE_URL set in Vercel
- [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY set in Vercel
- [ ] NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN set (if using maps)

### Documentation
- [ ] README updated
- [ ] API documentation complete
- [ ] User guide created
- [ ] Known limitations documented

---

## Environment Variables Setup

### Vercel Dashboard

1. Navigate to: https://vercel.com/[team]/[project]/settings/environment-variables

2. Add the following variables for **Production** environment:

```bash
# Anthropic API (Claude 3.7 Sonnet)
ANTHROPIC_API_KEY=sk-ant-api03-...

# Supabase Direct Connection (for PostgresStore)
DIRECT_DATABASE_URL=postgresql://postgres.xxx@db.xxx.supabase.co:5432/postgres

# Supabase Public (for client)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...

# Mapbox (for MapView component)
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=pk.eyJ1...

# App URLs
NEXT_PUBLIC_APP_URL=https://xpshare-v10.vercel.app
NEXT_PUBLIC_SITE_URL=https://xpshare-v10.vercel.app
NEXT_PUBLIC_DEFAULT_LOCALE=de
```

### Anthropic API Key

**Get API Key:**
1. Go to https://console.anthropic.com/settings/keys
2. Create new API key
3. Copy key (starts with `sk-ant-api03-...`)

**Upgrade to Paid Tier (Recommended):**
- Free tier: 20,000 tokens/minute
- Build tier ($20/mo): 80,000 tokens/minute
- Scale tier ($200/mo): 400,000 tokens/minute

**Cost Estimate:**
- 1,000 requests/user @ 2,900 tokens/request = 2.9M tokens
- Cost: ~$8.70 per 1,000 requests
- 100 users = $870/month

### Supabase Direct Connection

**Why Direct Connection?**
- Supabase Pooler (Supavisor) can cause "Tenant or user not found" errors
- Direct connection bypasses pooler and connects to PostgreSQL directly
- Required for Mastra PostgresStore

**Get Direct URL:**
1. Go to Supabase Dashboard → Settings → Database
2. Find "Direct Connection" section
3. Copy connection string
4. Format: `postgresql://postgres.[project-ref]:[password]@db.[project-ref].supabase.co:5432/postgres`

---

## Deployment Steps

### Option 1: GitHub Integration (Recommended)

1. **Push to GitHub:**
```bash
git add .
git commit -m "Add XPChat 2.0 implementation"
git push origin main
```

2. **Automatic Deployment:**
- Vercel detects push
- Runs build automatically
- Deploys to production if build succeeds

3. **Monitor Build:**
- Watch build logs in Vercel dashboard
- Check for errors

4. **Verify Deployment:**
- Test production URL: https://xpshare-v10.vercel.app/xpchat
- Check all features work

### Option 2: Manual Deployment (CLI)

```bash
# Install Vercel CLI (if not installed)
npm install -g vercel

# Login
vercel login

# Deploy to production
vercel --prod

# Follow prompts
```

---

## Vercel Configuration

### vercel.json

```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["fra1"],
  "functions": {
    "app/api/xpchat/route.ts": {
      "maxDuration": 120,
      "memory": 1024
    }
  }
}
```

**Key Settings:**
- `maxDuration: 120` - Allow 2 minutes for complex queries
- `memory: 1024` - 1GB RAM for agent processing
- `regions: ["fra1"]` - Deploy to Frankfurt (EU)

---

## Database Setup

### PostgresStore Tables

Mastra PostgresStore automatically creates tables on first use:

```sql
-- These tables are created automatically by Mastra
CREATE TABLE IF NOT EXISTS mastra_threads (
  id TEXT PRIMARY KEY,
  resource_id TEXT,
  title TEXT,
  metadata JSONB,
  status TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS mastra_messages (
  id TEXT PRIMARY KEY,
  thread_id TEXT REFERENCES mastra_threads(id),
  role TEXT NOT NULL,
  content TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_messages_thread_id ON mastra_messages(thread_id);
```

**No manual setup required!**

### RLS Policies (Optional)

If you want to allow users to view their own chat threads:

```sql
-- Enable RLS on Mastra tables
ALTER TABLE mastra_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE mastra_messages ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own threads
CREATE POLICY "Users can view own threads"
  ON mastra_threads
  FOR SELECT
  USING (auth.uid()::text = resource_id);

-- Policy: Users can view messages in their threads
CREATE POLICY "Users can view own messages"
  ON mastra_messages
  FOR SELECT
  USING (
    thread_id IN (
      SELECT id FROM mastra_threads WHERE resource_id = auth.uid()::text
    )
  );
```

---

## Post-Deployment Validation

### 1. Health Check

```bash
curl https://xpshare-v10.vercel.app/api/xpchat

# Expected response:
# {
#   "status": "ok",
#   "service": "xpchat-api",
#   "version": "2.0",
#   "model": "claude-3-7-sonnet",
#   "features": ["adaptive-extended-thinking", "optional-memory", "sse-streaming"]
# }
```

### 2. Simple Query Test

```bash
# Login to get auth token
curl -X POST https://xpshare-v10.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'

# Get token from response

# Test XPChat
curl -X POST https://xpshare-v10.vercel.app/api/xpchat \
  -H "Content-Type: application/json" \
  -H "Cookie: sb-access-token=YOUR_TOKEN" \
  -d '{
    "messages": [
      {"role": "user", "content": "Show UFOs in Berlin"}
    ]
  }'

# Verify:
# - Response status: 200
# - Content-Type: text/event-stream
# - Tool execution works
# - Response time < 5s
```

### 3. Complex Query Test

```bash
curl -X POST https://xpshare-v10.vercel.app/api/xpchat \
  -H "Content-Type: application/json" \
  -H "Cookie: sb-access-token=YOUR_TOKEN" \
  -d '{
    "messages": [
      {"role": "user", "content": "Compare dreams in Berlin vs Paris and show on timeline"}
    ]
  }'

# Verify:
# - Extended Thinking triggers
# - Multiple tools execute
# - Response time < 15s
```

### 4. Frontend Test

1. Navigate to https://xpshare-v10.vercel.app/xpchat
2. Login
3. Send test query: "Zeig mir UFO Sichtungen"
4. Verify:
   - UI renders correctly
   - Messages display
   - Tool visualizations work
   - No console errors

---

## Monitoring & Observability

### Vercel Analytics

Enable in Vercel Dashboard:
- Go to Analytics tab
- Enable Web Analytics
- View:
  - Page views
  - Response times
  - Error rates

### Anthropic Dashboard

Monitor token usage:
1. Go to https://console.anthropic.com/settings/usage
2. Track:
   - Tokens consumed
   - API calls
   - Cost
   - Rate limit usage

### Error Tracking (Optional)

Add Sentry or LogRocket:

```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  debug: false,
  environment: process.env.NODE_ENV,
})
```

### Custom Logging

Add structured logging:

```typescript
// lib/logger.ts
export function logXPChatRequest(data: {
  userId: string
  query: string
  complexityScore: number
  thinkingMode: string
  toolsCalled: string[]
  duration: number
  tokenUsage: number
}) {
  console.log('[XPChat]', JSON.stringify(data))

  // Send to analytics service (e.g., PostHog, Mixpanel)
  // analytics.track('xpchat_request', data)
}
```

---

## Rollback Procedure

### If Issues Occur

1. **Immediate Rollback (Vercel Dashboard):**
   - Go to Deployments tab
   - Find previous working deployment
   - Click "Promote to Production"

2. **Or via CLI:**
```bash
# List deployments
vercel ls

# Rollback to specific deployment
vercel rollback [deployment-url]
```

3. **Fix Issues:**
   - Create hotfix branch
   - Fix bugs
   - Test locally
   - Deploy hotfix

4. **Re-deploy:**
   - Merge hotfix to main
   - Vercel auto-deploys

---

## Scaling Considerations

### Current Setup (Build Tier)
- **Max Concurrent Users**: 10-25
- **Token Limit**: 80,000 tokens/minute
- **Cost**: $20/month + $8.70 per 1,000 requests

### If Scaling Needed

#### Option 1: Upgrade Anthropic Tier
- **Scale Tier**: 400,000 tokens/minute ($200/mo)
- **Supports**: 50-100 concurrent users

#### Option 2: Implement Request Queuing
```typescript
// Use BullMQ or similar
import { Queue } from 'bullmq'

const xpchatQueue = new Queue('xpchat', {
  connection: { host: 'localhost', port: 6379 }
})

// Add request to queue
await xpchatQueue.add('chat-request', {
  userId,
  messages,
})

// Process queue with rate limiting
```

#### Option 3: Cache Common Queries
```typescript
// Use Redis for caching
const cacheKey = `xpchat:${hash(query)}`
const cached = await redis.get(cacheKey)

if (cached) {
  return JSON.parse(cached)
}

// ... call agent
await redis.setex(cacheKey, 3600, JSON.stringify(result))
```

---

## Security Considerations

### API Keys
- ✅ All keys in Vercel env vars (not in code)
- ✅ Keys not exposed to client
- ✅ ANTHROPIC_API_KEY server-side only

### Authentication
- ✅ Supabase auth required
- ✅ RLS enforced on all queries
- ✅ User can only access own data + public experiences

### Rate Limiting (Recommended)

Add per-user rate limiting:

```typescript
// lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '1 m'), // 10 requests per minute
})

export async function checkRateLimit(userId: string) {
  const { success } = await ratelimit.limit(userId)
  return success
}
```

```typescript
// In API route
const allowed = await checkRateLimit(user.id)
if (!allowed) {
  return new Response('Rate limit exceeded', { status: 429 })
}
```

---

## Cost Monitoring

### Track Costs

```typescript
// After each request
const cost = (tokenUsage / 1_000_000) * 3 // $3 per 1M tokens

await supabase.from('xpchat_usage').insert({
  user_id: user.id,
  tokens: tokenUsage,
  cost,
  thinking_mode: thinkingMode,
  created_at: new Date().toISOString(),
})
```

### Monthly Report

```sql
-- Monthly cost per user
SELECT
  user_id,
  COUNT(*) as request_count,
  SUM(tokens) as total_tokens,
  SUM(cost) as total_cost
FROM xpchat_usage
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY user_id
ORDER BY total_cost DESC;
```

---

## Maintenance

### Regular Tasks

**Weekly:**
- [ ] Check error logs
- [ ] Review token usage trends
- [ ] Monitor response times
- [ ] Check user feedback

**Monthly:**
- [ ] Review cost vs. budget
- [ ] Analyze query patterns
- [ ] Update agent instructions if needed
- [ ] Optimize slow queries

**Quarterly:**
- [ ] Review and update documentation
- [ ] Consider new tools/features
- [ ] Evaluate model upgrades
- [ ] User satisfaction survey

---

## Deployment Timeline

| Step | Duration | When |
|------|----------|------|
| Pre-deployment checks | 1-2 hours | Before deployment |
| Environment setup | 30 minutes | Before deployment |
| Deploy to production | 10 minutes | Deployment day |
| Validation testing | 1 hour | After deployment |
| Monitor first 24h | Continuous | After deployment |
| User onboarding | Ongoing | After validation |

---

## Success Metrics (First 30 Days)

### Must Have ✅
- [ ] 95%+ uptime
- [ ] < 5% error rate
- [ ] Token usage < 3,500/request (avg)
- [ ] Response time < 5s for simple queries
- [ ] Cost within budget ($1,000/month)

### Nice to Have 🎯
- [ ] 99%+ uptime
- [ ] < 2% error rate
- [ ] Token usage < 3,000/request (avg)
- [ ] Response time < 3s for simple queries
- [ ] 100+ daily active users

---

## Support & Documentation

### User Documentation

Create user-facing docs:
- **Getting Started Guide**: How to use XPChat
- **Example Queries**: 20+ sample queries
- **Tips & Tricks**: Best practices
- **FAQ**: Common questions
- **Troubleshooting**: Common issues

### Developer Documentation

Maintain developer docs:
- **Architecture Overview**: How XPChat works
- **API Reference**: Endpoint documentation
- **Tool Reference**: All 8 tools explained
- **Contributing Guide**: How to add new tools
- **Changelog**: Version history

---

## Next Steps After Deployment

1. ✅ Monitor production for 24-48 hours
2. ✅ Gather user feedback
3. ✅ Fix critical bugs (if any)
4. ⏸️ Plan v2.1 improvements
5. ⏸️ Add new tools based on usage patterns

---

**Status:** Ready for Deployment ✅
**Last Updated:** 2025-10-24
