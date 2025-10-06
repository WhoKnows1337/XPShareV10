# XP-Share Deployment Guide

This guide covers deploying XP-Share to production using Vercel (recommended) or other platforms.

## Prerequisites

Before deploying, ensure you have:

- ✅ Supabase project created and configured
- ✅ Anthropic API key for AI features
- ✅ Mapbox API token for maps
- ✅ All environment variables documented
- ✅ Database migrations applied
- ✅ Initial data seeded (badges, questions)

## Environment Variables

Create these environment variables in your deployment platform:

### Required Variables

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Anthropic AI
ANTHROPIC_API_KEY=your_anthropic_api_key

# Mapbox Maps
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_access_token

# Application URL
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### Optional Variables

```env
# Analytics (if using Vercel Analytics)
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=your_analytics_id
```

---

## Deployment Options

### Option 1: Vercel (Recommended)

Vercel provides the best experience for Next.js applications with zero-config deployments.

#### 1. Install Vercel CLI

```bash
npm i -g vercel
```

#### 2. Login to Vercel

```bash
vercel login
```

#### 3. Deploy

```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

#### 4. Configure Environment Variables

Via Vercel Dashboard:
1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add all required variables from above
4. Redeploy to apply changes

Via CLI:
```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add ANTHROPIC_API_KEY
vercel env add NEXT_PUBLIC_MAPBOX_TOKEN
vercel env add NEXT_PUBLIC_APP_URL
```

#### 5. Custom Domain

1. Go to Project Settings → Domains
2. Add your custom domain
3. Configure DNS records as shown
4. Update `NEXT_PUBLIC_APP_URL` to match your domain

---

### Option 2: Railway

Railway offers simple deployments with automatic SSL.

#### 1. Install Railway CLI

```bash
npm i -g @railway/cli
```

#### 2. Login and Initialize

```bash
railway login
railway init
```

#### 3. Add Environment Variables

```bash
railway variables set NEXT_PUBLIC_SUPABASE_URL=your_value
railway variables set NEXT_PUBLIC_SUPABASE_ANON_KEY=your_value
railway variables set SUPABASE_SERVICE_ROLE_KEY=your_value
railway variables set ANTHROPIC_API_KEY=your_value
railway variables set NEXT_PUBLIC_MAPBOX_TOKEN=your_value
railway variables set NEXT_PUBLIC_APP_URL=your_value
```

#### 4. Deploy

```bash
railway up
```

---

### Option 3: Netlify

#### 1. Install Netlify CLI

```bash
npm i -g netlify-cli
```

#### 2. Login and Deploy

```bash
netlify login
netlify init
netlify deploy --prod
```

#### 3. Configure Build Settings

Create `netlify.toml` in project root:

```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

#### 4. Add Environment Variables

Via Netlify Dashboard or CLI:
```bash
netlify env:set NEXT_PUBLIC_SUPABASE_URL your_value
netlify env:set NEXT_PUBLIC_SUPABASE_ANON_KEY your_value
netlify env:set SUPABASE_SERVICE_ROLE_KEY your_value
netlify env:set ANTHROPIC_API_KEY your_value
netlify env:set NEXT_PUBLIC_MAPBOX_TOKEN your_value
netlify env:set NEXT_PUBLIC_APP_URL your_value
```

---

### Option 4: Self-Hosted (Docker)

#### 1. Create Dockerfile

Already exists in project root (if not, create):

```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

#### 2. Build and Run

```bash
# Build image
docker build -t xp-share .

# Run container
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL=your_value \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=your_value \
  -e SUPABASE_SERVICE_ROLE_KEY=your_value \
  -e ANTHROPIC_API_KEY=your_value \
  -e NEXT_PUBLIC_MAPBOX_TOKEN=your_value \
  -e NEXT_PUBLIC_APP_URL=https://your-domain.com \
  xp-share
```

#### 3. Docker Compose (Optional)

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
      - SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
      - NEXT_PUBLIC_MAPBOX_TOKEN=${NEXT_PUBLIC_MAPBOX_TOKEN}
      - NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
    restart: unless-stopped
```

Run with:
```bash
docker-compose up -d
```

---

## Database Setup

### 1. Run Migrations

In your Supabase project:

1. Go to SQL Editor
2. Run all migration files from `supabase/migrations/` in order
3. Verify tables were created correctly

### 2. Seed Initial Data

Run the seeding SQL scripts:

```sql
-- Insert initial badges
INSERT INTO badges (name, description, icon_name, rarity, criteria_type, criteria_value, xp_reward) VALUES
  ('First Post', 'Share your first experience', 'star', 'common', 'experience_count', 1, 50),
  ('Explorer', 'Share 10 experiences', 'compass', 'common', 'experience_count', 10, 100),
  -- ... (continue with all badges)
```

### 3. Configure RLS Policies

Ensure Row Level Security is enabled on all tables and policies are in place.

---

## Post-Deployment Checklist

After deployment, verify:

- [ ] Application loads without errors
- [ ] Authentication works (login/signup)
- [ ] Experience submission flow completes
- [ ] Feed displays experiences
- [ ] Search functionality works
- [ ] Map view renders correctly
- [ ] Admin panel accessible (for admin users)
- [ ] Notifications system works
- [ ] Badge awarding triggers properly
- [ ] Language switcher functions
- [ ] Share functionality works
- [ ] Report system functional

---

## Performance Optimization

### 1. Enable Caching

Configure caching headers in `next.config.ts`:

```typescript
async headers() {
  return [
    {
      source: '/:path*',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=3600, must-revalidate',
        },
      ],
    },
  ]
}
```

### 2. Image Optimization

Images are automatically optimized via Next.js Image component. Ensure:
- AVIF/WebP formats enabled (already configured)
- Proper image sizes specified
- Remote patterns configured for Supabase

### 3. Enable Compression

Already enabled in `next.config.ts`:
```typescript
compress: true
```

---

## Monitoring & Analytics

### Vercel Analytics

If deploying to Vercel, analytics are automatically enabled.

### Custom Monitoring

Consider integrating:
- **Sentry** - Error tracking
- **PostHog** - Product analytics
- **LogRocket** - Session replay
- **Datadog** - Application monitoring

---

## Troubleshooting

### Build Errors

**Issue**: Build fails with TypeScript errors
```bash
# Run type check locally
npm run type-check

# Fix errors and redeploy
```

**Issue**: Missing environment variables
```bash
# Verify all required variables are set
vercel env ls
```

### Runtime Errors

**Issue**: Supabase connection fails
- Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Check Supabase project is active
- Verify RLS policies allow access

**Issue**: AI features not working
- Verify `ANTHROPIC_API_KEY` is valid
- Check API key has sufficient credits
- Review API rate limits

**Issue**: Map not loading
- Verify `NEXT_PUBLIC_MAPBOX_TOKEN` is valid
- Check Mapbox token has required scopes
- Ensure domain is added to allowed URLs

---

## Security Considerations

### Environment Variables

- ✅ Never commit `.env.local` to git
- ✅ Use different keys for production vs development
- ✅ Rotate API keys periodically
- ✅ Use service role key only in API routes (never client-side)

### Supabase Security

- ✅ Enable RLS on all tables
- ✅ Review and test RLS policies
- ✅ Use parameterized queries to prevent SQL injection
- ✅ Implement rate limiting on sensitive endpoints

### API Security

- ✅ Validate all user inputs
- ✅ Implement CORS properly
- ✅ Use HTTPS only (enforced by deployment platforms)
- ✅ Sanitize user-generated content

---

## Scaling Considerations

As your application grows:

### Database

- **Connection Pooling**: Use Supabase connection pooler
- **Indexes**: Add indexes on frequently queried columns
- **Read Replicas**: Consider read replicas for high traffic

### Caching

- **Redis**: Implement Redis for session storage and caching
- **CDN**: Use CDN for static assets
- **ISR**: Utilize Incremental Static Regeneration for semi-static pages

### API Limits

- **Rate Limiting**: Implement rate limiting on API routes
- **Queuing**: Use queue system for heavy operations
- **Background Jobs**: Move expensive tasks to background workers

---

## Backup & Recovery

### Database Backups

Supabase automatically backs up your database. To create manual backups:

1. Go to Supabase Dashboard → Database → Backups
2. Create manual backup before major changes
3. Download backups periodically for local storage

### Code Backups

- Keep code in Git repository (GitHub/GitLab)
- Tag releases: `git tag v1.0.0`
- Maintain separate branches for production/staging

---

## Support & Resources

- **Next.js Docs**: https://nextjs.org/docs
- **Vercel Docs**: https://vercel.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **Deployment Issues**: Check GitHub Issues or create new issue

---

**Last Updated**: 2025-01-06

🤖 Generated with [Claude Code](https://claude.com/claude-code)
