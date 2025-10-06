# 🌟 XP-Share - Share Your Extraordinary Experiences

A modern platform for sharing paranormal, extraordinary, and unusual experiences with AI-powered pattern discovery and community insights.

## 📋 Project Status

**Version:** 0.1.0
**Status:** 🚧 Initial Setup Complete - Ready for Development
**Tech Stack:** Next.js 15 + Supabase + Neo4j + OpenAI + Mapbox

---

## 🎯 Quick Start

### Prerequisites

- Node.js 18.17+ or 20+ (recommended)
- npm 9+ or pnpm 8+
- Git
- Supabase account
- Neo4j Aura account
- OpenAI API key
- Mapbox account

### Installation

1. **Clone and Install**
   ```bash
   cd XPShareV10
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.local.example .env.local
   ```

   Edit `.env.local` and add your credentials:
   - Supabase URL and keys (from https://app.supabase.com)
   - Neo4j URI and credentials (from https://console.neo4j.io)
   - OpenAI API key (from https://platform.openai.com/api-keys)
   - Mapbox token (from https://account.mapbox.com/access-tokens)

3. **Database Setup**

   See detailed instructions in `docs/DEVELOPMENT-SETUP.md`

4. **Run Development Server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000)

---

## 📚 Documentation

All comprehensive specifications are in the `/docs/` directory:

| Document | Description |
|----------|-------------|
| **PROJECT-STRUCTURE.md** | Complete folder organization and file structure |
| **CODE-STYLE-GUIDE.md** | TypeScript conventions and coding patterns |
| **API-SPECIFICATION.md** | All 30 API endpoints with full schemas |
| **IMPLEMENTATION-ROADMAP.md** | Development phases and task prioritization |
| **EXPERIENCE-SUBMISSION-FLOW.md** | 7-step submission wizard (3256 lines!) |
| **EXPERIENCE-DETAIL-PAGE.md** | Detail page layout and components |
| **BROWSE-VIEWS.md** | Feed, Search, Map, Timeline views |
| **ADMIN-PANEL-SPEC.md** | Admin dashboard specification |
| **ACCESSIBILITY.md** | WCAG 2.1 AA requirements and checklist |
| **MULTILINGUAL-STRATEGY.md** | i18n implementation with next-intl |
| **XP-SHARE-PROJECT-PLAN.md** | Master architecture and database schemas |
| **DEVELOPMENT-SETUP.md** | Complete setup guide |

---

## 🏗️ Architecture

### Tech Stack

**Frontend:**
- Next.js 15 (App Router, Server Components)
- TypeScript (strict mode)
- Tailwind CSS
- shadcn/ui + Radix UI
- Framer Motion (animations)
- next-intl (i18n)

**Backend:**
- Supabase (PostgreSQL + Auth + Storage + RLS)
- Neo4j Aura (Graph database for pattern detection)
- OpenAI API (GPT-4o-mini, Whisper, Embeddings)

**Maps & Data:**
- Mapbox GL (interactive maps)
- pgvector (vector similarity search)

### Project Structure

```
XPShareV10/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication routes
│   ├── (main)/            # Main app routes
│   └── api/               # API routes
├── components/            # React components
│   ├── ui/               # shadcn/ui primitives
│   ├── experience/       # Experience-specific
│   ├── browse/           # Browse views
│   └── layout/           # Layout components
├── lib/                  # Core libraries
│   ├── supabase/        # Supabase client & types
│   ├── openai/          # OpenAI client
│   ├── neo4j/           # Neo4j client
│   ├── utils/           # Utility functions
│   └── hooks/           # Custom React hooks
├── docs/                 # Complete specifications
└── public/              # Static assets
```

---

## 🚀 Development Workflow

### Using the AI Development Agent

This project includes a comprehensive `.claude.md` file that guides AI-assisted development.

**Key Features:**
- 📖 Auto-references correct spec files
- ✅ Built-in checklists for each task type
- 🎯 Phase-based implementation roadmap
- ♿ Accessibility requirements enforced
- 🔒 Security best practices (RLS, no API key leaks)

**Example Usage:**
```
"Implement Experience Submission Flow Step 2"
→ Agent reads EXPERIENCE-SUBMISSION-FLOW.md
→ Creates components per PROJECT-STRUCTURE.md
→ Follows CODE-STYLE-GUIDE.md conventions
→ Adds accessibility per ACCESSIBILITY.md
→ Tests keyboard navigation
```

### Development Commands

```bash
# Development
npm run dev              # Start dev server (http://localhost:3000)
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint
npm run format           # Format with Prettier
npm run type-check       # TypeScript type checking
```

---

## 📦 Core Features (Planned)

### 1. Experience Submission (7-Step Flow)
- Multi-input: Text, Audio, Photo, Sketch
- AI auto-categorization (GPT-4o-mini)
- Dynamic category-specific questions
- Pattern preview before submission
- Privacy controls (public/community/private)
- Draft autosave with IndexedDB

### 2. Browse & Discovery
- Feed view with infinite scroll
- Advanced search with filters
- Interactive map (Mapbox)
- Timeline visualization
- 4 category types (UFO, Paranormal, Dream, Synchronicity)

### 3. Pattern Discovery (12 "Aha Moments")
- Vector similarity search (pgvector)
- Wave detection (clustered experiences)
- External event correlation (solar storms, moon phases)
- Geographic clustering
- Temporal patterns
- Cross-category insights

### 4. Social Features
- Comments system
- Witness verification
- Like/share functionality
- User profiles with stats

### 5. Gamification
- XP points & levels
- 40 badges across 8 categories
- Streak tracking
- Impact dashboard
- Leaderboard

### 6. Admin Panel
- Dynamic question catalog
- Analytics dashboard
- User management
- Content moderation

---

## 🗄️ Database Schema

### PostgreSQL (Supabase)

**Core Tables:**
- `user_profiles` - User data and stats
- `experiences` - Submitted experiences
- `experience_embeddings` - Vector embeddings (1536-dim)
- `badges` - Badge definitions
- `user_badges` - Earned badges
- `notifications` - User notifications
- `witness_verifications` - Witness confirmations

**See full schema in:** `docs/XP-SHARE-PROJECT-PLAN.md`

### Neo4j (Graph Database)

**Nodes:**
- `Experience` - Experience metadata
- `User` - User nodes

**Relationships:**
- `SIMILAR_TO` - Vector similarity
- `LOCATED_NEAR` - Geographic proximity
- `SAME_CATEGORY` - Category clustering
- `INSPIRED_BY` - Experience influence

---

## 🎨 Design System

**Colors:**
- Primary: Purple (`hsl(258 90% 66%)`)
- Background: Dark (`hsl(0 0% 3.9%)`)
- Foreground: Light (`hsl(0 0% 98%)`)

**Typography:**
- Font: Inter (via Google Fonts)
- Heading sizes: 4xl → xl
- Body: base (16px)

**Breakpoints:**
- Mobile: < 768px
- Tablet: 768px - 1023px
- Desktop: ≥ 1024px

**Accessibility:**
- WCAG 2.1 AA compliant
- Color contrast ≥ 4.5:1
- Keyboard navigation
- Screen reader support
- Focus management

---

## 🔒 Security

- ✅ Supabase RLS (Row Level Security) on all tables
- ✅ API keys in environment variables only
- ✅ Input validation with Zod schemas
- ✅ Rate limiting on AI endpoints
- ✅ CSRF protection
- ✅ XSS prevention (sanitized HTML)

---

## 🌍 Internationalization

**Supported Languages:**
- 🇩🇪 German (de) - Default
- 🇬🇧 English (en)
- 🇫🇷 French (fr)
- 🇪🇸 Spanish (es)

**Implementation:** next-intl

**See:** `docs/MULTILINGUAL-STRATEGY.md`

---

## 📈 Implementation Roadmap

### Phase 1: Foundation (Week 1-2)
- [x] Project initialization
- [ ] Database setup (Supabase migrations)
- [ ] External services (Neo4j, OpenAI, Mapbox)
- [ ] Core infrastructure

### Phase 2: Authentication (Week 3)
- [ ] Login/Register pages
- [ ] User profiles
- [ ] Avatar upload

### Phase 3: Submission Flow (Week 4-5)
- [ ] 7-step wizard
- [ ] AI integration
- [ ] Draft autosave

### Phase 4: Browse & Discovery (Week 6-7)
- [ ] Feed view
- [ ] Search & filters
- [ ] Map view

### Phase 5: Detail Page (Week 8)
- [ ] 3-column layout
- [ ] Comments system
- [ ] Pattern insights

### Phase 6: Pattern Discovery (Week 9-10)
- [ ] Vector similarity
- [ ] Wave detection
- [ ] External events

### Phase 7: Gamification (Week 11)
- [ ] XP & levels
- [ ] Badges
- [ ] Leaderboard

### Phase 8: Admin Panel (Week 12)
- [ ] Dashboard
- [ ] Question catalog
- [ ] Analytics

### Phase 9: Polish (Week 13-14)
- [ ] Accessibility audit
- [ ] Performance optimization
- [ ] Testing

**See full roadmap:** `docs/IMPLEMENTATION-ROADMAP.md`

---

## 🧪 Testing

### Testing Strategy

- **Unit Tests:** Components with Vitest
- **E2E Tests:** Critical flows with Playwright
- **Accessibility:** axe DevTools + manual testing
- **Performance:** Lighthouse audits

### Commands (to be added)

```bash
npm run test              # Run unit tests
npm run test:e2e          # Run E2E tests
npm run test:a11y         # Run accessibility tests
```

---

## 📝 Contributing

### Development Guidelines

1. **Always read the specs first!**
   - Check `/docs/` for relevant specification
   - Follow `CODE-STYLE-GUIDE.md` conventions
   - Reference `PROJECT-STRUCTURE.md` for file locations

2. **TypeScript strict mode**
   - No `any` types
   - Explicit return types for functions
   - Interface/type for all props

3. **Accessibility first**
   - ARIA labels on all interactive elements
   - Keyboard navigation support
   - Test with screen reader

4. **Server Components by default**
   - Only use `'use client'` when necessary
   - Fetch data in Server Components
   - Use Server Actions for mutations

### Code Review Checklist

- [ ] Matches specification exactly
- [ ] TypeScript types defined
- [ ] ARIA labels present
- [ ] Keyboard navigation works
- [ ] Mobile responsive
- [ ] Error handling added
- [ ] Loading states added

---

## 🐛 Known Issues

*None yet - project just initialized!*

---

## 📄 License

ISC

---

## 👥 Team

**Project Creator:** [Tom]
**AI Development Partner:** Claude (Anthropic)
**Development Methodology:** AI-Assisted Development with Comprehensive Specifications

---

## 🔗 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Neo4j Documentation](https://neo4j.com/docs/)
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

---

## 🎉 Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Setup environment
cp .env.local.example .env.local
# Edit .env.local with your credentials

# 3. Read the documentation
cat docs/DEVELOPMENT-SETUP.md

# 4. Start developing
npm run dev

# 5. Follow the roadmap
cat docs/IMPLEMENTATION-ROADMAP.md
```

---

**Built with ❤️ using Next.js, Supabase, Neo4j, OpenAI, and Claude AI**

*Last Updated: 2025-01-06*
