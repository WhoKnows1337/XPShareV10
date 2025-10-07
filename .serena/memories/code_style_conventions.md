# Code Style & Conventions

## General Formatting
- **Indentation:** 2 spaces (no tabs)
- **Line Length:** Max 100 characters (flexible)
- **Semicolons:** No semicolons (Prettier enforced)
- **Quotes:** Single quotes for strings
- **Trailing Commas:** Always (ES5 compatible)

## TypeScript Rules
- **Strict Mode:** Always enabled (`strict: true`)
- **No `any`:** Never use `any`, use `unknown` or proper types
- **Explicit Return Types:** Always specify return types for functions
- **Interfaces vs Types:**
  - Use `interface` for object shapes
  - Use `type` for unions/intersections
- **Naming:**
  - Interfaces: PascalCase (e.g., `Experience`, `UserProfile`)
  - Types: PascalCase (e.g., `Visibility`, `Category`)
  - No `I` prefix for interfaces

## React/Next.js Conventions
- **Server Components First:** Default to Server Components, only use `'use client'` when necessary
- **Async Components:** Server Components can be async
- **Component Structure:**
  ```typescript
  // 1. Imports
  import { createClient } from '@/lib/supabase/server'
  
  // 2. Type definitions
  interface Props {
    id: string
  }
  
  // 3. Component
  export default async function Component({ id }: Props) {
    // Server-side data fetching
    const data = await fetchData(id)
    
    return <div>...</div>
  }
  ```

## File Naming
- **Components:** kebab-case (e.g., `experience-card.tsx`)
- **Pages:** Next.js conventions (e.g., `page.tsx`, `[id]/page.tsx`)
- **Utilities:** kebab-case (e.g., `date-utils.ts`)
- **Types:** kebab-case (e.g., `admin-questions.ts`)
- **Client Components:** Suffix with `-client.tsx`

## Component Organization
```
components/
├── ui/              # shadcn/ui primitives (button, card, etc.)
├── experience/      # Experience-specific components
├── browse/          # Browse views (feed, search, map)
├── admin/           # Admin panel components
├── layout/          # Layout components (header, footer)
└── [feature]/       # Feature-specific components
```

## Import Order
1. External libraries (React, Next.js, etc.)
2. Internal libraries (@/lib/*)
3. Components (@/components/*)
4. Types (@/lib/types/*)
5. Utilities
6. Styles

## Error Handling
- Always handle errors in Server Components
- Use try-catch blocks
- Return meaningful error states
- Never expose sensitive errors to client

## Accessibility
- WCAG 2.1 AA compliance required
- All interactive elements need ARIA labels
- Keyboard navigation support
- Focus management
- Color contrast ≥ 4.5:1
