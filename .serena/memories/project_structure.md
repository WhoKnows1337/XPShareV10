# Project Structure

## Root Directory
```
XPShareV10/
├── app/                    # Next.js App Router
├── components/             # React components
├── lib/                    # Core libraries & utilities
├── docs/                   # Complete specifications (3000+ lines each)
├── public/                 # Static assets
├── locales/                # i18n translation files (DE, EN, FR, ES)
├── messages/               # Translation messages
├── hooks/                  # Custom React hooks
├── __tests__/             # Test files
└── supabase/              # Supabase migrations & types
```

## App Directory (Next.js 15 App Router)
```
app/
├── [locale]/              # Internationalized routes
│   ├── (auth)/           # Auth group (login, register)
│   ├── (main)/           # Main app group
│   └── admin/            # Admin panel
├── api/                   # API routes (30 endpoints)
│   ├── experiences/      # Experience endpoints
│   ├── admin/            # Admin API endpoints
│   ├── patterns/         # Pattern detection
│   ├── badges/           # Gamification
│   └── ...
├── globals.css           # Global styles
├── sitemap.ts           # Dynamic sitemap
├── robots.ts            # Robots.txt
└── manifest.ts          # PWA manifest
```

## Components Organization
```
components/
├── ui/                   # shadcn/ui primitives (27 components)
│   ├── button.tsx
│   ├── card.tsx
│   ├── dialog.tsx
│   └── ...
├── admin/                # Admin panel (27 components)
│   ├── question-editor-dialog.tsx
│   ├── analytics-charts.tsx
│   ├── draggable-question-list.tsx
│   └── ...
├── experience/           # Experience components
│   ├── experience-card.tsx
│   ├── experience-detail.tsx
│   └── submission/       # 7-step submission flow
├── browse/               # Browse views
│   ├── feed/
│   ├── search/
│   ├── map/
│   └── timeline/
├── layout/               # Layout components
│   ├── header.tsx
│   ├── footer.tsx
│   └── navigation.tsx
├── profile/              # User profile components
├── patterns/             # Pattern display components
└── interactions/         # Comments, likes, shares
```

## Lib Directory
```
lib/
├── supabase/            # Supabase client & utilities
│   ├── client.ts       # Client-side client
│   ├── server.ts       # Server-side client
│   └── middleware.ts   # Auth middleware
├── openai/              # OpenAI integration
│   └── client.ts
├── neo4j/               # Neo4j graph database
│   └── client.ts
├── types/               # TypeScript type definitions
│   ├── admin-questions.ts
│   ├── experience.ts
│   └── ...
├── utils/               # Utility functions
│   ├── date-utils.ts
│   ├── xp-calculator.ts
│   └── ...
└── hooks/               # Custom React hooks
    ├── use-toast.ts
    └── ...
```

## Documentation (Critical)
```
docs/
├── ADMIN-PANEL-SPEC.md              # Admin panel (3571 lines)
├── EXPERIENCE-SUBMISSION-FLOW.md    # Submission wizard (3256 lines)
├── API-SPECIFICATION.md             # All API endpoints
├── CODE-STYLE-GUIDE.md              # This guide
├── PROJECT-STRUCTURE.md             # Detailed structure
├── IMPLEMENTATION-ROADMAP.md        # Development phases
├── MULTILINGUAL-STRATEGY.md         # i18n strategy
├── ACCESSIBILITY.md                 # WCAG requirements
└── admin_imp_report.md              # Implementation status report
```

## Important Files
- `middleware.ts` - i18n routing & auth
- `i18n.ts` - i18n configuration
- `next.config.ts` - Next.js + next-intl config
- `.claude.md` - AI development guide
- `tsconfig.json` - TypeScript strict config
- `tailwind.config.ts` - Tailwind + theme
