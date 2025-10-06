# XP-Share Project Structure

Complete folder hierarchy and file organization for the Next.js application.

---

## Root Directory Structure

```
xp-share/
├── app/                      # Next.js App Router (routes & layouts)
├── components/               # React components
├── lib/                      # Utilities, services, helpers
├── public/                   # Static assets
├── messages/                 # i18n translation files
├── hooks/                    # Custom React hooks
├── types/                    # TypeScript type definitions
├── styles/                   # Global styles (if needed beyond Tailwind)
├── e2e/                      # End-to-end tests (Playwright)
├── .next/                    # Next.js build output (gitignored)
├── node_modules/             # Dependencies (gitignored)
├── .env.local                # Environment variables (gitignored)
├── .gitignore
├── next.config.js            # Next.js configuration
├── tailwind.config.ts        # Tailwind CSS configuration
├── tsconfig.json             # TypeScript configuration
├── package.json              # Dependencies & scripts
├── .eslintrc.json            # ESLint configuration
├── .prettierrc               # Prettier configuration
├── vitest.config.ts          # Vitest test configuration
├── playwright.config.ts      # Playwright E2E configuration
└── README.md                 # Project documentation
```

---

## `/app` Directory (App Router)

Next.js 14+ App Router structure with Server Components, layouts, and API routes.

```
app/
├── layout.tsx                         # Root layout (HTML shell, providers)
├── page.tsx                           # Landing page (/)
├── globals.css                        # Global Tailwind styles
├── error.tsx                          # Global error boundary
├── not-found.tsx                      # 404 page
│
├── (auth)/                            # Auth route group
│   ├── login/
│   │   └── page.tsx                   # Login page
│   ├── signup/
│   │   └── page.tsx                   # Signup page
│   ├── reset-password/
│   │   └── page.tsx                   # Password reset
│   └── layout.tsx                     # Auth layout (centered, no nav)
│
├── (main)/                            # Main app route group
│   ├── layout.tsx                     # Main layout (header, nav, footer)
│   │
│   ├── feed/
│   │   └── page.tsx                   # Experience feed
│   │
│   ├── search/
│   │   └── page.tsx                   # Search page
│   │
│   ├── map/
│   │   └── page.tsx                   # Map view (time travel)
│   │
│   ├── category/
│   │   └── [slug]/
│   │       └── page.tsx               # Category view
│   │
│   ├── experience/
│   │   └── [id]/
│   │       ├── page.tsx               # Experience detail (3-column)
│   │       ├── edit/
│   │       │   └── page.tsx           # Edit experience
│   │       └── loading.tsx            # Loading skeleton
│   │
│   ├── profile/
│   │   └── [id]/
│   │       ├── page.tsx               # User profile
│   │       ├── impact/
│   │       │   └── page.tsx           # Impact dashboard (Aha #3)
│   │       ├── edit/
│   │       │   └── page.tsx           # Edit profile
│   │       └── loading.tsx
│   │
│   ├── leaderboard/
│   │   └── page.tsx                   # XP leaderboard
│   │
│   └── notifications/
│       └── page.tsx                   # Notifications page (mobile)
│
├── submit/                            # Experience submission flow
│   ├── layout.tsx                     # Submission layout (progress bar)
│   ├── page.tsx                       # Screen 1: Entry point
│   ├── analyze/
│   │   └── page.tsx                   # Screen 2: AI analysis
│   ├── review/
│   │   └── page.tsx                   # Screen 3: Review AI suggestions
│   ├── questions/
│   │   └── page.tsx                   # Screen 4: Dynamic questions
│   ├── collaborative/
│   │   └── page.tsx                   # Screen 4.5: Collaborative input
│   ├── patterns/
│   │   └── page.tsx                   # Screen 5: Pattern matching
│   ├── preview/
│   │   └── page.tsx                   # Screen 5.5: Preview
│   ├── privacy/
│   │   └── page.tsx                   # Screen 6: Privacy settings
│   ├── location-privacy/
│   │   └── page.tsx                   # Screen 7: Location privacy
│   └── success/
│       └── page.tsx                   # Success screen
│
├── admin/                             # Admin panel
│   ├── layout.tsx                     # Admin layout (sidebar)
│   ├── page.tsx                       # Admin dashboard
│   ├── questions/
│   │   ├── page.tsx                   # Manage dynamic questions
│   │   └── [id]/
│   │       └── page.tsx               # Edit question
│   ├── moderation/
│   │   └── page.tsx                   # Content moderation
│   └── analytics/
│       └── page.tsx                   # Platform analytics
│
├── api/                               # API routes (Route Handlers)
│   ├── experiences/
│   │   ├── route.ts                   # GET (list), POST (create)
│   │   └── [id]/
│   │       ├── route.ts               # GET, PATCH, DELETE
│   │       ├── upvote/
│   │       │   └── route.ts           # POST upvote
│   │       ├── view/
│   │       │   └── route.ts           # POST track view
│   │       └── witness-verify/
│   │           └── route.ts           # POST witness verification
│   │
│   ├── users/
│   │   ├── search/
│   │   │   └── route.ts               # GET search users
│   │   └── [id]/
│   │       ├── route.ts               # GET, PATCH
│   │       ├── impact/
│   │       │   └── route.ts           # GET impact dashboard
│   │       └── similar/
│   │           └── route.ts           # GET similar users
│   │
│   ├── ai/
│   │   ├── analyze-text/
│   │   │   └── route.ts               # POST analyze text
│   │   ├── transcribe-audio/
│   │   │   └── route.ts               # POST transcribe audio
│   │   └── generate-embedding/
│   │       └── route.ts               # POST generate embedding
│   │
│   ├── patterns/
│   │   ├── similar-experiences/
│   │   │   └── route.ts               # POST find similar
│   │   ├── time-travel/
│   │   │   └── route.ts               # GET time-based patterns
│   │   ├── predictions/
│   │   │   └── route.ts               # GET pattern predictions
│   │   └── seasonal/
│   │       └── route.ts               # GET seasonal analysis
│   │
│   ├── notifications/
│   │   ├── route.ts                   # GET notifications
│   │   ├── [id]/
│   │   │   └── read/
│   │   │       └── route.ts           # PATCH mark as read
│   │   └── subscribe/
│   │       └── route.ts               # POST pattern alert subscription
│   │
│   ├── gamification/
│   │   ├── badges/
│   │   │   └── route.ts               # GET badges
│   │   ├── award-badge/
│   │   │   └── route.ts               # POST award badge (internal)
│   │   └── leaderboard/
│   │       └── route.ts               # GET leaderboard
│   │
│   ├── admin/
│   │   └── questions/
│   │       ├── route.ts               # POST create question
│   │       ├── [category]/
│   │       │   └── route.ts           # GET questions by category
│   │       └── [id]/
│   │           └── route.ts           # DELETE question
│   │
│   └── upload/
│       ├── audio/
│       │   └── route.ts               # POST upload audio to Supabase
│       ├── image/
│       │   └── route.ts               # POST upload image
│       └── avatar/
│           └── route.ts               # POST upload avatar
│
├── [locale]/                          # i18n dynamic segments (optional)
│   └── ...                            # Mirrored routes for each language
│
├── sitemap.ts                         # Dynamic sitemap generation
├── robots.ts                          # robots.txt generation
└── manifest.ts                        # PWA manifest
```

---

## `/components` Directory

Organized by feature/domain, with shared UI components separate.

```
components/
├── ui/                                # shadcn/ui components
│   ├── button.tsx
│   ├── input.tsx
│   ├── textarea.tsx
│   ├── select.tsx
│   ├── dialog.tsx
│   ├── dropdown-menu.tsx
│   ├── avatar.tsx
│   ├── badge.tsx
│   ├── card.tsx
│   ├── separator.tsx
│   ├── tabs.tsx
│   ├── toast.tsx
│   ├── toaster.tsx
│   ├── progress.tsx
│   ├── slider.tsx
│   ├── switch.tsx
│   ├── checkbox.tsx
│   ├── label.tsx
│   ├── popover.tsx
│   ├── tooltip.tsx
│   └── alert-dialog.tsx
│
├── layout/                            # Layout components
│   ├── header.tsx                     # Main header (nav, search, notifications)
│   ├── footer.tsx                     # Footer
│   ├── sidebar.tsx                    # Sidebar (if used)
│   ├── notification-dropdown.tsx      # Notification bell dropdown
│   ├── language-switcher.tsx          # Language selector
│   └── mobile-nav.tsx                 # Mobile navigation menu
│
├── auth/                              # Authentication components
│   ├── login-form.tsx                 # Login form
│   ├── signup-form.tsx                # Signup form
│   ├── reset-password-form.tsx        # Password reset
│   └── auth-provider.tsx              # Auth context provider
│
├── submit/                            # Submission flow components
│   ├── progress-indicator.tsx         # 7-step progress bar
│   ├── text-input.tsx                 # Screen 1: Text input
│   ├── audio-recorder.tsx             # Screen 1: Audio recording
│   ├── photo-upload.tsx               # Screen 1: Photo upload
│   ├── waveform.tsx                   # Audio waveform visualization
│   ├── analysis-skeleton.tsx          # Loading skeleton
│   ├── category-selector.tsx          # Screen 3: Category picker
│   ├── tag-chips.tsx                  # Screen 3: Tag chips
│   ├── location-input.tsx             # Screen 3: Location autocomplete
│   ├── datetime-picker.tsx            # Screen 3: Date/time
│   ├── emotion-selector.tsx           # Screen 3: Emotion picker
│   ├── question-renderer.tsx          # Screen 4: Dynamic questions
│   ├── witness-input.tsx              # Screen 4.5: Witness tagging
│   ├── similar-list.tsx               # Screen 5: Similar experiences
│   ├── preview-desktop.tsx            # Screen 5.5: Desktop preview
│   └── preview-mobile.tsx             # Screen 5.5: Mobile preview
│
├── experience/                        # Experience display components
│   ├── card.tsx                       # Experience card (feed/search)
│   ├── main-content.tsx               # Detail page: Main column
│   ├── metadata-sidebar.tsx           # Detail page: Metadata sidebar
│   ├── insights-sidebar.tsx           # Detail page: Insights sidebar
│   ├── upvote-button.tsx              # Upvote button
│   ├── share-button.tsx               # Share button
│   └── comments.tsx                   # Comments section
│
├── profile/                           # Profile components
│   ├── user-stats.tsx                 # User stats card
│   ├── badges-showcase.tsx            # Badge collection display
│   ├── edit-form.tsx                  # Profile edit form
│   ├── avatar-upload.tsx              # Avatar upload
│   ├── impact-stats.tsx               # Impact dashboard stats
│   └── experience-grid.tsx            # User's experiences grid
│
├── feed/                              # Feed components
│   ├── filters.tsx                    # Feed filters (category, location, date)
│   ├── sort-dropdown.tsx              # Sort dropdown (latest, popular)
│   └── infinite-scroll.tsx            # Infinite scroll container
│
├── search/                            # Search components
│   ├── search-input.tsx               # Search bar with autocomplete
│   ├── advanced-filters.tsx           # Advanced search filters
│   └── search-results.tsx             # Search results list
│
├── category/                          # Category view components
│   ├── header.tsx                     # Category header with stats
│   └── filters.tsx                    # Category-specific filters
│
├── map/                               # Map components
│   ├── experience-map.tsx             # Mapbox GL map
│   ├── heatmap-layer.tsx              # Heatmap overlay
│   ├── playback-controls.tsx          # Play/pause/speed controls
│   └── marker-cluster.tsx             # Clustered markers
│
├── aha-moments/                       # Aha Moment components (12 total)
│   ├── cluster-formation.tsx          # Aha #1: Cluster animation
│   ├── time-travel-slider.tsx         # Aha #2: Time travel
│   ├── influence-network.tsx          # Aha #3: Influence graph
│   ├── similar-users.tsx              # Aha #4: Similar users
│   ├── pattern-prediction.tsx         # Aha #5: Predictions
│   ├── wave-creator-badge.tsx         # Aha #6: Wave badge animation
│   ├── pattern-alert-banner.tsx       # Aha #7: Real-time alert
│   ├── pattern-alert-subscribe.tsx    # Aha #8: Alert subscription
│   ├── seasonal-chart.tsx             # Aha #9: Seasonal patterns
│   ├── witness-verify.tsx             # Aha #10: Witness verification
│   ├── cross-category.tsx             # Aha #11: Cross-category insights
│   └── thank-you-banner.tsx           # Aha #12: Thank you at 100 views
│
├── gamification/                      # Gamification components
│   ├── xp-progress.tsx                # XP progress bar
│   ├── level-up.tsx                   # Level-up animation
│   ├── badge-card.tsx                 # Single badge display
│   └── badge-toast.tsx                # Badge earned toast
│
├── leaderboard/                       # Leaderboard components
│   ├── leaderboard-table.tsx          # Leaderboard table
│   └── filter.tsx                     # Time range filter
│
├── admin/                             # Admin components
│   ├── question-builder.tsx           # Question form builder
│   ├── moderation-actions.tsx         # Moderation action buttons
│   └── analytics-chart.tsx            # Analytics charts
│
├── a11y/                              # Accessibility components
│   ├── announcer.tsx                  # Screen reader announcer
│   ├── skip-to-content.tsx            # Skip to content link
│   └── focus-trap.tsx                 # Focus trap for modals
│
└── providers/                         # Context providers
    ├── theme-provider.tsx             # Theme (dark mode) provider
    ├── toast-provider.tsx             # Toast notifications provider
    └── zustand-provider.tsx           # Zustand state provider (if needed)
```

---

## `/lib` Directory

Business logic, utilities, and service integrations.

```
lib/
├── supabase/
│   ├── client.ts                      # Supabase client (client-side)
│   ├── server.ts                      # Supabase client (server-side)
│   ├── types.ts                       # Generated database types
│   └── middleware.ts                  # Auth middleware helpers
│
├── neo4j/
│   ├── client.ts                      # Neo4j driver instance
│   ├── queries.ts                     # Cypher query helpers
│   └── create-relationships.ts        # Create graph relationships
│
├── openai/
│   ├── client.ts                      # OpenAI client instance
│   ├── analyze-text.ts                # Text analysis function
│   ├── transcribe-audio.ts            # Audio transcription
│   └── generate-embedding.ts          # Embedding generation
│
├── notifications/
│   ├── send.ts                        # Send notification helper
│   ├── alert-triggers.ts              # Pattern alert triggers
│   └── types.ts                       # Notification types
│
├── gamification/
│   ├── award-badge.ts                 # Award badge logic
│   ├── calculate-xp.ts                # XP calculation
│   ├── check-level-up.ts              # Level-up detection
│   └── badge-triggers.ts              # Badge award triggers
│
├── pattern-detection/
│   ├── wave-detection.ts              # Wave pattern detection
│   ├── seasonal-analysis.ts           # Seasonal pattern analysis
│   ├── predictions.ts                 # Pattern prediction algorithm
│   └── cross-category-insights.ts     # Cross-category connections
│
├── ai-translation/
│   ├── translate.ts                   # AI translation (3-layer strategy)
│   └── language-detection.ts          # Detect language
│
├── upload/
│   ├── upload-audio.ts                # Upload audio to Supabase Storage
│   ├── upload-image.ts                # Upload image
│   └── upload-avatar.ts               # Upload avatar
│
├── validation/
│   ├── experience-schema.ts           # Zod schema for experiences
│   ├── user-schema.ts                 # Zod schema for users
│   └── question-validation.ts         # Dynamic question validation
│
├── utils.ts                           # General utilities (cn, formatDate, etc.)
├── errors.ts                          # Error handling utilities
├── api-helpers.ts                     # API response helpers
├── env.ts                             # Environment variable validation
├── draft-storage.ts                   # IndexedDB draft storage
├── moon-phase.ts                      # Moon phase calculation
├── similar-users-intro.ts             # Similar users intro message
└── constants.ts                       # App constants (categories, badges, etc.)
```

---

## `/hooks` Directory

Custom React hooks.

```
hooks/
├── use-ai-analysis.ts                 # AI text analysis hook
├── use-infinite-experiences.ts        # Infinite scroll hook
├── use-supabase-query.ts              # Supabase query wrapper
├── use-auth.ts                        # Auth context hook
├── use-notifications.ts               # Notifications hook
├── use-badges.ts                      # User badges hook
├── use-debounce.ts                    # Debounce hook
├── use-local-storage.ts               # localStorage hook
├── use-media-query.ts                 # Responsive media query
└── use-map-animation.ts               # Map animation hook (time travel)
```

---

## `/types` Directory

Shared TypeScript types.

```
types/
├── experience.ts                      # Experience types
├── user.ts                            # User types
├── notification.ts                    # Notification types
├── badge.ts                           # Badge types
├── pattern.ts                         # Pattern types
├── api.ts                             # API response types
└── global.d.ts                        # Global type declarations
```

---

## `/messages` Directory

i18n translation files.

```
messages/
├── de.json                            # German translations
├── en.json                            # English translations
├── fr.json                            # French translations
└── es.json                            # Spanish translations
```

**Structure example (de.json):**
```json
{
  "nav": {
    "feed": "Feed",
    "search": "Suche",
    "map": "Karte",
    "submit": "Teilen"
  },
  "submit": {
    "screen1": {
      "title": "Teile deine Erfahrung",
      "placeholder": "Erzähl mir, was du erlebt hast..."
    }
  }
}
```

---

## `/public` Directory

Static assets.

```
public/
├── images/
│   ├── logo.svg                       # XP-Share logo
│   ├── logo-dark.svg                  # Dark mode logo
│   └── placeholder-avatar.png         # Default avatar
│
├── icons/
│   ├── badge-icons/                   # Custom badge SVG icons
│   │   ├── wave-creator.svg
│   │   ├── first-experience.svg
│   │   └── ...
│   └── category-icons/                # Category SVG icons
│       ├── ufo.svg
│       ├── paranormal.svg
│       └── ...
│
├── sounds/
│   ├── badge-earned.mp3               # Badge notification sound
│   └── level-up.mp3                   # Level-up sound
│
├── fonts/                             # Custom fonts (if needed)
│
├── favicon.ico
├── apple-touch-icon.png
└── robots.txt                         # Generated by app/robots.ts
```

---

## `/e2e` Directory

End-to-end tests (Playwright).

```
e2e/
├── submission-flow.spec.ts            # Test full submission flow
├── auth.spec.ts                       # Test login/signup
├── feed.spec.ts                       # Test feed browsing
├── search.spec.ts                     # Test search
└── helpers/
    ├── login.ts                       # Login helper
    └── create-experience.ts           # Create experience helper
```

---

## Environment Variables (`.env.local`)

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx

# Neo4j
NEO4J_URI=neo4j+s://xxx.databases.neo4j.io
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=xxx

# OpenAI
OPENAI_API_KEY=sk-xxx

# Mapbox
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=pk.xxx

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_DEFAULT_LOCALE=de

# Optional
SENTRY_DSN=xxx
VERCEL_ANALYTICS_ID=xxx
```

---

## Key File Naming Conventions

### Pages (App Router)
- `page.tsx` - Route page component
- `layout.tsx` - Layout wrapper
- `loading.tsx` - Loading UI
- `error.tsx` - Error boundary
- `not-found.tsx` - 404 page
- `route.ts` - API route handler

### Components
- **PascalCase for files:** `ExperienceCard.tsx` ❌
- **kebab-case for files:** `experience-card.tsx` ✅
- **PascalCase for exports:** `export function ExperienceCard()` ✅

### Utilities/Libs
- **kebab-case:** `api-helpers.ts`, `upload-audio.ts` ✅
- **camelCase for exports:** `export function uploadAudio()` ✅

### Hooks
- **kebab-case files:** `use-auth.ts` ✅
- **camelCase exports:** `export function useAuth()` ✅

### Types
- **kebab-case files:** `experience.ts` ✅
- **PascalCase exports:** `export type Experience = {...}` ✅

---

## Import Alias

Configure in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"],
      "@/components/*": ["./components/*"],
      "@/lib/*": ["./lib/*"],
      "@/hooks/*": ["./hooks/*"],
      "@/types/*": ["./types/*"]
    }
  }
}
```

**Usage:**
```typescript
// ✅ Good
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'

// ❌ Avoid
import { Button } from '../../../components/ui/button'
```

---

## Git Ignore

```.gitignore
# Dependencies
node_modules/
.pnp
.pnp.js

# Next.js
.next/
out/
build/
dist/

# Environment
.env
.env.local
.env.*.local

# Testing
coverage/
.nyc_output/
playwright-report/
test-results/

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# OS
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# Supabase
.supabase/
```

---

## Folder Organization Principles

1. **Feature-Based Structure** - Group by domain (submit, experience, profile)
2. **Flat When Possible** - Avoid deep nesting (max 3 levels)
3. **Co-location** - Keep related files close (component + test + styles)
4. **Separation of Concerns** - UI components, business logic (lib), data (api)
5. **Scalability** - Easy to add new features without restructuring

---

## Quick Reference: Where to Put Files

| File Type | Location | Example |
|-----------|----------|---------|
| New page | `app/(main)/[route]/page.tsx` | `app/(main)/settings/page.tsx` |
| API endpoint | `app/api/[domain]/route.ts` | `app/api/comments/route.ts` |
| UI component | `components/[domain]/` | `components/feed/filters.tsx` |
| Utility function | `lib/[domain]/` | `lib/upload/upload-video.ts` |
| Custom hook | `hooks/use-*.ts` | `hooks/use-comments.ts` |
| Type definition | `types/[domain].ts` | `types/comment.ts` |
| Translation | `messages/[locale].json` | `messages/de.json` |
| Static asset | `public/[type]/` | `public/images/banner.jpg` |

---

**Project Structure Complete!** All folders and files organized for optimal development workflow. 🚀
