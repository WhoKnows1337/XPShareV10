# XP-Share Development Setup Guide

Complete guide for initializing the XP-Share project from scratch.

---

## 1. Prerequisites

- **Node.js**: v18.17+ or v20+ (recommended: v20 LTS)
- **npm**: v9+ or **pnpm**: v8+ (pnpm recommended for faster installs)
- **Git**: Latest version
- **VS Code**: Recommended IDE with extensions:
  - ESLint
  - Prettier
  - Tailwind CSS IntelliSense
  - TypeScript and JavaScript Language Features

---

## 2. Project Initialization

### Create Next.js Project

```bash
npx create-next-app@latest xp-share --typescript --tailwind --app --no-src-dir --import-alias "@/*"
cd xp-share
```

**Options selected:**
- ✅ TypeScript
- ✅ ESLint
- ✅ Tailwind CSS
- ✅ App Router
- ❌ src/ directory (use root-level app/)
- ✅ Import alias (@/*)

### Install Dependencies

```bash
npm install \
  # UI Components
  @radix-ui/react-alert-dialog \
  @radix-ui/react-avatar \
  @radix-ui/react-checkbox \
  @radix-ui/react-dialog \
  @radix-ui/react-dropdown-menu \
  @radix-ui/react-label \
  @radix-ui/react-popover \
  @radix-ui/react-progress \
  @radix-ui/react-select \
  @radix-ui/react-separator \
  @radix-ui/react-slider \
  @radix-ui/react-switch \
  @radix-ui/react-tabs \
  @radix-ui/react-toast \
  @radix-ui/react-tooltip \
  # Aceternity UI (manual components)
  # shadcn/ui CLI (see section 3)
  \
  # Animation
  framer-motion \
  @framer-motion/react \
  \
  # Supabase
  @supabase/supabase-js \
  @supabase/auth-helpers-nextjs \
  @supabase/auth-ui-react \
  @supabase/auth-ui-shared \
  \
  # Neo4j
  neo4j-driver \
  \
  # OpenAI
  openai \
  \
  # Maps
  mapbox-gl \
  react-map-gl \
  @mapbox/mapbox-gl-geocoder \
  \
  # Internationalization
  next-intl \
  \
  # Form Handling
  react-hook-form \
  @hookform/resolvers \
  zod \
  \
  # Date/Time
  date-fns \
  \
  # Icons
  lucide-react \
  react-icons \
  \
  # Rich Text Editor
  @tiptap/react \
  @tiptap/starter-kit \
  @tiptap/extension-link \
  @tiptap/extension-image \
  @tiptap/extension-placeholder \
  \
  # Audio Recording
  recordrtc \
  \
  # Utilities
  clsx \
  tailwind-merge \
  class-variance-authority \
  \
  # State Management
  zustand \
  \
  # Data Fetching
  swr \
  \
  # Analytics (Optional)
  @vercel/analytics \
  \
  # Image Optimization
  sharp
```

```bash
npm install -D \
  # TypeScript Types
  @types/node \
  @types/react \
  @types/react-dom \
  @types/mapbox-gl \
  @types/recordrtc \
  \
  # Linting & Formatting
  eslint \
  eslint-config-next \
  prettier \
  prettier-plugin-tailwindcss \
  \
  # Tailwind
  tailwindcss \
  postcss \
  autoprefixer \
  tailwindcss-animate
```

### Install shadcn/ui Components

```bash
npx shadcn-ui@latest init
```

**Configuration:**
- Style: Default
- Base color: Slate
- CSS variables: Yes

```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add input
npx shadcn-ui@latest add textarea
npx shadcn-ui@latest add select
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add avatar
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add separator
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add toast
npx shadcn-ui@latest add progress
npx shadcn-ui@latest add slider
npx shadcn-ui@latest add switch
npx shadcn-ui@latest add checkbox
npx shadcn-ui@latest add label
npx shadcn-ui@latest add popover
npx shadcn-ui@latest add tooltip
```

---

## 3. Environment Variables

Create `.env.local` in project root:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Neo4j Aura
NEO4J_URI=neo4j+s://your-instance-id.databases.neo4j.io
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=your-password

# OpenAI
OPENAI_API_KEY=sk-proj-your-api-key

# Mapbox
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=pk.your-mapbox-token

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_DEFAULT_LOCALE=de

# Optional: Analytics
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=your-analytics-id
```

**Where to get credentials:**
- **Supabase**: https://app.supabase.com → Project Settings → API
- **Neo4j Aura**: https://console.neo4j.io → Instance → Connect
- **OpenAI**: https://platform.openai.com/api-keys
- **Mapbox**: https://account.mapbox.com/access-tokens/

---

## 4. Supabase Setup

### Create Supabase Project

1. Go to https://app.supabase.com
2. Create new project:
   - **Name**: xp-share
   - **Database Password**: (save securely)
   - **Region**: Choose closest to users (e.g., eu-central-1)
3. Wait for provisioning (~2 minutes)

### Install pgvector Extension

Run in Supabase SQL Editor:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

### Run Database Migrations

Copy schemas from **XP-SHARE-PROJECT-PLAN.md** section "**PostgreSQL-Schemas (Supabase)**" to Supabase SQL Editor and execute:

```sql
-- Users (extends Supabase auth.users)
CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  location_city TEXT,
  location_country TEXT,
  languages TEXT[] DEFAULT ARRAY['de'],
  total_xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  total_experiences INTEGER DEFAULT 0,
  total_contributions INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Experiences
CREATE TABLE public.experiences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  location_text TEXT,
  location_lat NUMERIC,
  location_lng NUMERIC,
  date_occurred DATE,
  time_of_day TEXT,
  title TEXT NOT NULL,
  story_text TEXT,
  story_audio_url TEXT,
  story_transcription TEXT,
  emotions TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  is_anonymous BOOLEAN DEFAULT FALSE,
  visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'community', 'private')),
  language TEXT DEFAULT 'de',
  embedding VECTOR(1536),
  view_count INTEGER DEFAULT 0,
  upvote_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Badges
CREATE TABLE public.badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  icon_name TEXT,
  category TEXT,
  xp_reward INTEGER DEFAULT 0,
  rarity TEXT CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Badges (join table)
CREATE TABLE public.user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  badge_id UUID REFERENCES public.badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- Experience Views (tracking)
CREATE TABLE public.experience_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experience_id UUID REFERENCES public.experiences(id) ON DELETE CASCADE,
  viewer_user_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  viewer_ip TEXT,
  viewed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  link_url TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pattern Alerts
CREATE TABLE public.pattern_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  pattern_category TEXT,
  pattern_location_lat NUMERIC,
  pattern_location_lng NUMERIC,
  pattern_radius_km NUMERIC,
  min_experience_count INTEGER DEFAULT 3,
  time_window_days INTEGER DEFAULT 30,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_triggered_at TIMESTAMPTZ
);

-- Witness Verifications
CREATE TABLE public.witness_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experience_id UUID REFERENCES public.experiences(id) ON DELETE CASCADE,
  witness_user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  verification_comment TEXT,
  status TEXT DEFAULT 'verified' CHECK (status IN ('verified', 'disputed')),
  verified_at TIMESTAMPTZ DEFAULT NOW()
);

-- Research Citations
CREATE TABLE public.research_citations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experience_id UUID REFERENCES public.experiences(id) ON DELETE CASCADE,
  citation_title TEXT NOT NULL,
  citation_authors TEXT,
  citation_url TEXT,
  citation_doi TEXT,
  relevance_score NUMERIC,
  added_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_experiences_user_id ON public.experiences(user_id);
CREATE INDEX idx_experiences_category ON public.experiences(category);
CREATE INDEX idx_experiences_created_at ON public.experiences(created_at DESC);
CREATE INDEX idx_experiences_embedding ON public.experiences USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_experience_views_experience_id ON public.experience_views(experience_id);
```

### Enable Row Level Security (RLS)

```sql
-- Enable RLS on all tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- User Profiles: Users can read all, update only their own
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.user_profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.user_profiles FOR UPDATE
  USING (auth.uid() = id);

-- Experiences: Public/Community visible, private only to owner
CREATE POLICY "Public experiences are viewable by everyone"
  ON public.experiences FOR SELECT
  USING (visibility = 'public' OR (visibility = 'community' AND auth.uid() IS NOT NULL) OR user_id = auth.uid());

CREATE POLICY "Users can insert own experiences"
  ON public.experiences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own experiences"
  ON public.experiences FOR UPDATE
  USING (auth.uid() = user_id);

-- Notifications: Users can only see their own
CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);
```

### Configure Storage Buckets

Run in Supabase SQL Editor:

```sql
-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('audio', 'audio', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('images', 'images', true);
```

Enable RLS policies for storage:

```sql
-- Avatars: Public read, authenticated write
CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Authenticated users can upload avatars"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

-- Audio: Public read, authenticated write
CREATE POLICY "Audio files are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'audio');

CREATE POLICY "Authenticated users can upload audio"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'audio' AND auth.role() = 'authenticated');
```

---

## 5. Neo4j Aura Setup

### Create Neo4j Instance

1. Go to https://console.neo4j.io
2. Create new instance:
   - **Instance Type**: AuraDB Free
   - **Name**: xp-share-graph
   - **Region**: Choose closest to Supabase region
3. Download credentials (`.txt` file) - **SAVE SECURELY**
4. Copy URI, username, password to `.env.local`

### Initialize Graph Schema

Use Neo4j Browser (https://your-instance.databases.neo4j.io/browser/) or Cypher queries:

```cypher
// Create constraints
CREATE CONSTRAINT experience_id IF NOT EXISTS FOR (e:Experience) REQUIRE e.id IS UNIQUE;
CREATE CONSTRAINT user_id IF NOT EXISTS FOR (u:User) REQUIRE u.id IS UNIQUE;

// Create indexes
CREATE INDEX experience_category IF NOT EXISTS FOR (e:Experience) ON (e.category);
CREATE INDEX user_location IF NOT EXISTS FOR (u:User) ON (u.location_country);

// Example: Create relationships (will be populated via API)
// MATCH (e1:Experience {id: $exp1_id}), (e2:Experience {id: $exp2_id})
// CREATE (e1)-[:SIMILAR_TO {similarity_score: $score}]->(e2)
```

**Relationship Types:**
- `SIMILAR_TO` - Between similar experiences (from vector embeddings)
- `AUTHORED_BY` - Experience → User
- `INSPIRED_BY` - Experience influenced by another
- `LOCATED_NEAR` - Geographic proximity
- `SAME_CATEGORY` - Category clustering

---

## 6. OpenAI Setup

1. Create account at https://platform.openai.com
2. Generate API key: https://platform.openai.com/api-keys
3. Add to `.env.local`
4. (Optional) Set usage limits in OpenAI Dashboard → Usage limits

**Models Used:**
- `gpt-4o-mini` - Text generation (category suggestions, pattern detection)
- `whisper-1` - Audio transcription
- `text-embedding-3-small` - Generate embeddings (1536 dimensions)

---

## 7. Mapbox Setup

1. Create account at https://account.mapbox.com
2. Navigate to Access Tokens
3. Create new token:
   - **Name**: XP-Share Production
   - **Scopes**: All default scopes
4. Copy token to `.env.local`

**Map Style Used:**
- `mapbox://styles/mapbox/light-v11` (Light theme)
- `mapbox://styles/mapbox/dark-v11` (Dark theme)

---

## 8. Development Scripts

Add to `package.json`:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "format": "prettier --write .",
    "type-check": "tsc --noEmit",
    "supabase:types": "npx supabase gen types typescript --project-id your-project-id > lib/supabase/types.ts"
  }
}
```

---

## 9. Configuration Files

### `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### `tailwind.config.ts`

```typescript
import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config
```

### `.prettierrc`

```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

### `.eslintrc.json`

```json
{
  "extends": ["next/core-web-vitals", "prettier"],
  "rules": {
    "@typescript-eslint/no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }],
    "react/no-unescaped-entities": "off"
  }
}
```

---

## 10. First Run

```bash
npm run dev
```

Visit http://localhost:3000

**Expected outcome:**
- Default Next.js landing page loads
- No console errors
- Ready to start building XP-Share components

---

## 11. Seed Data (Optional)

Create 10 badge definitions:

```sql
INSERT INTO public.badges (name, description, icon_name, category, xp_reward, rarity) VALUES
  ('first_experience', '🎉 Erste Erfahrung geteilt!', 'Sparkles', 'milestone', 10, 'common'),
  ('wave_creator', '🌊 Eine Welle gestartet (3+ ähnliche XPs)', 'Waves', 'social', 50, 'rare'),
  ('verified_witness', '✅ Als Zeuge verifiziert', 'ShieldCheck', 'trust', 20, 'rare'),
  ('pattern_discoverer', '🔍 Muster entdeckt', 'Search', 'insight', 30, 'epic'),
  ('multicultural', '🌍 3+ Sprachen verwendet', 'Globe', 'diversity', 40, 'epic'),
  ('thought_leader', '💡 100+ Aufrufe auf 1 XP', 'Lightbulb', 'impact', 100, 'legendary'),
  ('early_adopter', '🚀 Unter den ersten 100 Usern', 'Rocket', 'milestone', 50, 'legendary'),
  ('night_owl', '🦉 XP um 2-4 Uhr geteilt', 'Moon', 'fun', 15, 'common'),
  ('streak_master', '🔥 7-Tage Streak erreicht', 'Flame', 'engagement', 75, 'epic'),
  ('cross_pollinator', '🌸 XPs in 5+ Kategorien', 'FlowerLotus', 'diversity', 60, 'rare');
```

---

## 12. Troubleshooting

### Supabase Connection Issues

- Check `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are correct
- Verify Supabase project is active (not paused)
- Check RLS policies allow read access

### Neo4j Connection Issues

- Verify URI uses `neo4j+s://` (not `bolt://`)
- Check firewall allows outbound connections on port 7687
- Test connection in Neo4j Browser first

### OpenAI Rate Limits

- Free tier: 3 requests/minute
- Add billing to increase limits
- Implement request queuing in production

### Build Errors

```bash
# Clear cache
rm -rf .next
npm run build
```

---

## 13. Next Steps

After setup is complete:

1. ✅ Read **PROJECT-STRUCTURE.md** to understand folder organization
2. ✅ Read **CODE-STYLE-GUIDE.md** for coding conventions
3. ✅ Read **API-SPECIFICATION.md** for endpoint contracts
4. ✅ Read **IMPLEMENTATION-ROADMAP.md** for task prioritization
5. 🚀 Start development with Phase 1 tasks

---

**Setup Complete!** You're ready to build XP-Share. 🎉
