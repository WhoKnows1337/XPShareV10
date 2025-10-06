# XP-Share Code Style Guide

Complete coding standards and conventions for consistent, maintainable code.

---

## Table of Contents

1. [General Principles](#1-general-principles)
2. [TypeScript](#2-typescript)
3. [React & Next.js](#3-react--nextjs)
4. [Components](#4-components)
5. [State Management](#5-state-management)
6. [API Routes](#6-api-routes)
7. [Styling](#7-styling)
8. [File Organization](#8-file-organization)
9. [Naming Conventions](#9-naming-conventions)
10. [Error Handling](#10-error-handling)
11. [Performance](#11-performance)
12. [Accessibility](#12-accessibility)
13. [Testing](#13-testing)

---

## 1. General Principles

### Code Philosophy

- **Clarity over Cleverness** - Write code that's easy to understand
- **Consistency** - Follow established patterns throughout the codebase
- **DRY (Don't Repeat Yourself)** - Extract reusable logic
- **KISS (Keep It Simple, Stupid)** - Avoid over-engineering
- **YAGNI (You Aren't Gonna Need It)** - Don't add unused features

### Formatting

- **Indentation:** 2 spaces (no tabs)
- **Line Length:** Max 100 characters (flexible for readability)
- **Semicolons:** No semicolons (Prettier config)
- **Quotes:** Single quotes for strings
- **Trailing Commas:** Always (ES5 compatible)

**Example:**
```typescript
// ✅ Good
const experience = {
  title: 'My Experience',
  category: 'UFO',
  tags: ['lights', 'hovering'],
}

// ❌ Bad
const experience = {
    title: "My Experience",
    category: "UFO",
    tags: ["lights", "hovering"]
};
```

---

## 2. TypeScript

### Strict Mode

Always use TypeScript strict mode.

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

### Type Definitions

**Prefer interfaces for objects, types for unions/intersections:**

```typescript
// ✅ Good - Interface for object shapes
interface Experience {
  id: string
  title: string
  category: string
  user_id: string
}

// ✅ Good - Type for unions
type Visibility = 'public' | 'community' | 'private'

// ✅ Good - Type for intersections
type ExperienceWithUser = Experience & { user: User }

// ❌ Bad - Type for simple objects
type Experience = {
  id: string
  title: string
}
```

### Explicit Return Types

Always specify return types for functions (except trivial cases).

```typescript
// ✅ Good
async function getExperience(id: string): Promise<Experience | null> {
  const { data } = await supabase.from('experiences').select('*').eq('id', id).single()
  return data
}

// ❌ Bad - Implicit return type
async function getExperience(id: string) {
  const { data } = await supabase.from('experiences').select('*').eq('id', id).single()
  return data
}

// ✅ OK for trivial cases
const double = (n: number) => n * 2
```

### Avoid `any`

Never use `any`. Use `unknown` if type is truly unknown, or create a proper type.

```typescript
// ❌ Bad
function processData(data: any) {
  return data.value
}

// ✅ Good
function processData(data: unknown) {
  if (typeof data === 'object' && data !== null && 'value' in data) {
    return (data as { value: string }).value
  }
  throw new Error('Invalid data format')
}

// ✅ Better - Proper type
interface DataWithValue {
  value: string
}

function processData(data: DataWithValue): string {
  return data.value
}
```

### Null vs Undefined

- Use `null` for intentional absence of value
- Use `undefined` for uninitialized or optional values
- Prefer optional properties over `undefined` union

```typescript
// ✅ Good
interface User {
  id: string
  email: string
  bio?: string // Optional, can be undefined
  deleted_at: string | null // Intentionally null when not deleted
}

// ❌ Bad
interface User {
  id: string
  email: string
  bio: string | undefined
  deleted_at: string | undefined | null
}
```

### Enums vs Union Types

Prefer union types over enums for better type safety.

```typescript
// ✅ Good - Union type
type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night'

// ❌ Bad - Enum (runtime overhead)
enum TimeOfDay {
  Morning = 'morning',
  Afternoon = 'afternoon',
  Evening = 'evening',
  Night = 'night',
}
```

### Generics

Use generics for reusable, type-safe functions.

```typescript
// ✅ Good
async function fetchData<T>(url: string): Promise<T> {
  const response = await fetch(url)
  return response.json() as Promise<T>
}

// Usage with specific type
const experience = await fetchData<Experience>('/api/experiences/123')

// ✅ Good - Generic with constraint
function findById<T extends { id: string }>(items: T[], id: string): T | undefined {
  return items.find((item) => item.id === id)
}
```

---

## 3. React & Next.js

### Component Types

**Server Components (default in Next.js 14+):**

```typescript
// app/feed/page.tsx
import { supabase } from '@/lib/supabase/server'

// ✅ Server Component - async, no hooks, no interactivity
export default async function FeedPage() {
  const { data: experiences } = await supabase.from('experiences').select('*')

  return (
    <div>
      {experiences?.map((exp) => (
        <ExperienceCard key={exp.id} experience={exp} />
      ))}
    </div>
  )
}
```

**Client Components:**

```typescript
// components/experience/upvote-button.tsx
'use client'

import { useState } from 'react'

// ✅ Client Component - uses hooks, interactivity
export function UpvoteButton({ experienceId, initialCount }: Props) {
  const [count, setCount] = useState(initialCount)
  const [isLoading, setIsLoading] = useState(false)

  const handleUpvote = async () => {
    setIsLoading(true)
    // ... API call
    setCount(count + 1)
    setIsLoading(false)
  }

  return <button onClick={handleUpvote}>{count} ↑</button>
}
```

### Server Actions (use sparingly)

```typescript
// app/actions/upvote.ts
'use server'

import { revalidatePath } from 'next/cache'
import { supabase } from '@/lib/supabase/server'

export async function upvoteExperience(experienceId: string) {
  const { data, error } = await supabase
    .from('experiences')
    .update({ upvote_count: supabase.raw('upvote_count + 1') })
    .eq('id', experienceId)

  if (error) throw error

  revalidatePath(`/experience/${experienceId}`)
  return data
}
```

### Hooks Best Practices

**Custom hooks always start with `use`:**

```typescript
// hooks/use-auth.ts
export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser()
      setUser(data.user)
      setIsLoading(false)
    }
    fetchUser()
  }, [])

  return { user, isLoading }
}
```

**Dependency arrays:**

```typescript
// ✅ Good - All dependencies listed
useEffect(() => {
  fetchData(userId, category)
}, [userId, category])

// ❌ Bad - Missing dependencies
useEffect(() => {
  fetchData(userId, category)
}, [userId])

// ✅ Good - Empty array for mount-only
useEffect(() => {
  console.log('Component mounted')
}, [])

// ❌ Bad - No array (runs on every render)
useEffect(() => {
  fetchData()
})
```

---

## 4. Components

### Component Structure

Follow this order:

1. Imports
2. Types/Interfaces
3. Component definition
4. Return JSX

```typescript
// ✅ Good structure
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { type Experience } from '@/types/experience'

interface ExperienceCardProps {
  experience: Experience
  onUpvote?: (id: string) => void
}

export function ExperienceCard({ experience, onUpvote }: ExperienceCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const handleClick = () => {
    setIsExpanded(!isExpanded)
  }

  return (
    <div className="card" onClick={handleClick}>
      <h3>{experience.title}</h3>
      {isExpanded && <p>{experience.story_text}</p>}
      <Button onClick={() => onUpvote?.(experience.id)}>Upvote</Button>
    </div>
  )
}
```

### Props

**Named exports for components:**

```typescript
// ✅ Good
export function ExperienceCard({ experience }: Props) { ... }

// ❌ Bad
export default function ExperienceCard({ experience }: Props) { ... }

// Exception: Page components (Next.js requirement)
// app/feed/page.tsx
export default function FeedPage() { ... }
```

**Props interface naming:**

```typescript
// ✅ Good - Suffix with Props
interface ExperienceCardProps {
  experience: Experience
  onUpvote?: (id: string) => void
}

// ❌ Bad
interface IExperienceCard { ... }
interface ExperienceCardInterface { ... }
```

**Props destructuring:**

```typescript
// ✅ Good - Destructure in params
export function ExperienceCard({ experience, onUpvote }: ExperienceCardProps) {
  return <div>{experience.title}</div>
}

// ❌ Bad - Props object
export function ExperienceCard(props: ExperienceCardProps) {
  return <div>{props.experience.title}</div>
}
```

### Conditional Rendering

```typescript
// ✅ Good - Logical AND for simple conditionals
{isLoading && <Spinner />}

// ✅ Good - Ternary for if/else
{user ? <Welcome user={user} /> : <Login />}

// ✅ Good - Early return for complex logic
if (!experience) {
  return <NotFound />
}

return <ExperienceDetail experience={experience} />

// ❌ Bad - Nested ternaries
{user ? user.isPremium ? <PremiumContent /> : <FreeContent /> : <Login />}
```

### Children Props

```typescript
// ✅ Good - ReactNode for children
interface CardProps {
  children: React.ReactNode
  title: string
}

export function Card({ children, title }: CardProps) {
  return (
    <div>
      <h2>{title}</h2>
      {children}
    </div>
  )
}
```

---

## 5. State Management

### Local State (useState)

Use for component-specific state.

```typescript
// ✅ Good
export function CommentForm() {
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    setIsSubmitting(true)
    await postComment(comment)
    setIsSubmitting(false)
    setComment('')
  }

  return <form onSubmit={handleSubmit}>...</form>
}
```

### Zustand (Global State)

Use for shared state across components.

```typescript
// lib/store/auth-store.ts
import { create } from 'zustand'

interface AuthState {
  user: User | null
  setUser: (user: User | null) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  logout: () => set({ user: null }),
}))

// Usage in component
import { useAuthStore } from '@/lib/store/auth-store'

export function Header() {
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)

  return <button onClick={logout}>{user?.username}</button>
}
```

### Server State (SWR)

Use for API data fetching.

```typescript
// ✅ Good - SWR for server state
import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function ExperienceList() {
  const { data, error, isLoading } = useSWR<Experience[]>('/api/experiences', fetcher)

  if (error) return <Error message={error.message} />
  if (isLoading) return <Skeleton />

  return (
    <div>
      {data?.map((exp) => (
        <ExperienceCard key={exp.id} experience={exp} />
      ))}
    </div>
  )
}
```

---

## 6. API Routes

### Route Handler Structure

```typescript
// app/api/experiences/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabase } from '@/lib/supabase/server'

// Validation schema
const createExperienceSchema = z.object({
  story_text: z.string().min(10).max(5000),
  category: z.string(),
  tags: z.array(z.string()),
})

// GET /api/experiences
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get('category')

    let query = supabase.from('experiences').select('*')
    if (category) {
      query = query.eq('category', category)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ experiences: data })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/experiences
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate
    const validated = createExperienceSchema.parse(body)

    // Auth check
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Create
    const { data, error } = await supabase
      .from('experiences')
      .insert({ ...validated, user_id: user.id })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

### Dynamic Routes

```typescript
// app/api/experiences/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'

interface Params {
  params: {
    id: string
  }
}

export async function GET(request: NextRequest, { params }: Params) {
  const { id } = params

  const { data, error } = await supabase.from('experiences').select('*').eq('id', id).single()

  if (error) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json(data)
}
```

### Error Handling

```typescript
// lib/api-helpers.ts
export function apiError(message: string, status: number = 500) {
  return NextResponse.json({ error: message }, { status })
}

export function apiSuccess<T>(data: T, status: number = 200) {
  return NextResponse.json(data, { status })
}

// Usage
import { apiError, apiSuccess } from '@/lib/api-helpers'

export async function GET(request: NextRequest) {
  try {
    const data = await fetchData()
    return apiSuccess(data)
  } catch (error) {
    return apiError('Failed to fetch data', 500)
  }
}
```

---

## 7. Styling

### Tailwind CSS

**Use Tailwind utility classes:**

```tsx
// ✅ Good
<div className="flex items-center gap-4 rounded-lg bg-white p-6 shadow-md">
  <h2 className="text-2xl font-bold text-gray-900">Title</h2>
</div>

// ❌ Bad - Custom CSS when Tailwind exists
<div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
  <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Title</h2>
</div>
```

### cn() Utility

Use for conditional classes:

```typescript
// lib/utils.ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Usage
import { cn } from '@/lib/utils'

<button
  className={cn(
    'rounded-lg px-4 py-2 font-medium',
    isPrimary ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-900',
    isDisabled && 'cursor-not-allowed opacity-50'
  )}
>
  Click me
</button>
```

### Responsive Design

```tsx
// ✅ Good - Mobile first
<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
  {/* Cards */}
</div>

// Breakpoints:
// sm: 640px
// md: 768px
// lg: 1024px
// xl: 1280px
// 2xl: 1536px
```

### Dark Mode

```tsx
// ✅ Good - Dark mode support
<div className="bg-white text-gray-900 dark:bg-gray-900 dark:text-white">
  Content
</div>
```

---

## 8. File Organization

### Import Order

1. React/Next imports
2. Third-party libraries
3. Internal components
4. Internal utilities
5. Types
6. Styles (if needed)

```typescript
// ✅ Good
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { ExperienceCard } from '@/components/experience/card'
import { supabase } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { type Experience } from '@/types/experience'
```

### Component File Structure

```typescript
// components/experience/card.tsx

// 1. Imports
import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { type Experience } from '@/types/experience'

// 2. Types
interface ExperienceCardProps {
  experience: Experience
  onUpvote?: (id: string) => void
}

// 3. Constants (if needed)
const MAX_PREVIEW_LENGTH = 200

// 4. Helper functions (private)
function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

// 5. Component
export function ExperienceCard({ experience, onUpvote }: ExperienceCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const previewText = truncateText(experience.story_text, MAX_PREVIEW_LENGTH)

  return (
    <Card>
      <h3>{experience.title}</h3>
      <p>{isExpanded ? experience.story_text : previewText}</p>
      <button onClick={() => setIsExpanded(!isExpanded)}>
        {isExpanded ? 'Show less' : 'Show more'}
      </button>
    </Card>
  )
}
```

---

## 9. Naming Conventions

### Variables & Functions

```typescript
// ✅ Good - camelCase
const userId = '123'
const experienceCount = 10
function fetchExperiences() { ... }
async function uploadAudio() { ... }

// ❌ Bad
const UserID = '123'
const experience_count = 10
function FetchExperiences() { ... }
```

### Constants

```typescript
// ✅ Good - UPPER_SNAKE_CASE for true constants
const MAX_FILE_SIZE = 25 * 1024 * 1024 // 25MB
const API_BASE_URL = 'https://api.xp-share.app'

// ✅ Good - camelCase for config objects
const badgeConfig = {
  firstExperience: { xp: 10, icon: 'Sparkles' },
  waveCreator: { xp: 50, icon: 'Waves' },
}
```

### Components

```typescript
// ✅ Good - PascalCase
export function ExperienceCard() { ... }
export function UpvoteButton() { ... }

// ❌ Bad
export function experienceCard() { ... }
export function upvote_button() { ... }
```

### Types & Interfaces

```typescript
// ✅ Good - PascalCase, no prefix
interface Experience { ... }
type Visibility = 'public' | 'private'

// ❌ Bad
interface IExperience { ... }
interface experienceType { ... }
type visibility = 'public' | 'private'
```

### Files & Folders

```typescript
// ✅ Good - kebab-case
components/experience/upvote-button.tsx
lib/upload/upload-audio.ts
hooks/use-auth.ts

// ❌ Bad
components/experience/UpvoteButton.tsx
lib/upload/uploadAudio.ts
hooks/UseAuth.ts
```

### Boolean Variables

```typescript
// ✅ Good - is/has/should prefix
const isLoading = true
const hasPermission = false
const shouldRender = true

// ❌ Bad
const loading = true
const permission = false
const render = true
```

### Event Handlers

```typescript
// ✅ Good - handle prefix
const handleClick = () => { ... }
const handleSubmit = async () => { ... }

// ❌ Bad
const onClick = () => { ... }
const click = () => { ... }
```

---

## 10. Error Handling

### Try/Catch

```typescript
// ✅ Good - Specific error handling
async function fetchExperience(id: string): Promise<Experience> {
  try {
    const response = await fetch(`/api/experiences/${id}`)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    if (error instanceof Error) {
      console.error('Failed to fetch experience:', error.message)
      throw error
    }
    throw new Error('Unknown error occurred')
  }
}
```

### Error Boundaries (React)

```typescript
// components/error-boundary.tsx
'use client'

import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <div>Something went wrong</div>
    }

    return this.props.children
  }
}
```

### Toast Notifications

```typescript
// ✅ Good - User-friendly error messages
import { toast } from '@/components/ui/use-toast'

async function upvoteExperience(id: string) {
  try {
    await fetch(`/api/experiences/${id}/upvote`, { method: 'POST' })
    toast({ title: 'Upvoted!', description: 'Thanks for your support' })
  } catch (error) {
    toast({
      title: 'Failed to upvote',
      description: 'Please try again later',
      variant: 'destructive',
    })
  }
}
```

---

## 11. Performance

### Lazy Loading

```typescript
// ✅ Good - Lazy load heavy components
import dynamic from 'next/dynamic'

const MapView = dynamic(() => import('@/components/map/experience-map'), {
  loading: () => <MapSkeleton />,
  ssr: false, // Disable SSR for map (needs window)
})

export function ExperiencePage() {
  return (
    <div>
      <ExperienceDetail />
      <MapView />
    </div>
  )
}
```

### Memoization

```typescript
// ✅ Good - Memoize expensive calculations
import { useMemo } from 'react'

export function ExperienceList({ experiences }: Props) {
  const sortedExperiences = useMemo(() => {
    return [...experiences].sort((a, b) => b.created_at.localeCompare(a.created_at))
  }, [experiences])

  return <div>{sortedExperiences.map((exp) => ...)}</div>
}

// ✅ Good - Memoize components
import { memo } from 'react'

export const ExperienceCard = memo(function ExperienceCard({ experience }: Props) {
  return <div>{experience.title}</div>
})
```

### Image Optimization

```typescript
// ✅ Good - Use next/image
import Image from 'next/image'

<Image
  src={experience.image_url}
  alt={experience.title}
  width={400}
  height={300}
  className="rounded-lg"
  placeholder="blur"
  blurDataURL={experience.blur_hash}
/>

// ❌ Bad - Plain img tag
<img src={experience.image_url} alt={experience.title} />
```

---

## 12. Accessibility

### Semantic HTML

```tsx
// ✅ Good
<nav>
  <ul>
    <li><a href="/feed">Feed</a></li>
    <li><a href="/search">Search</a></li>
  </ul>
</nav>

<main>
  <article>
    <h1>Experience Title</h1>
    <p>Story...</p>
  </article>
</main>

// ❌ Bad
<div>
  <div>
    <div onClick={() => navigate('/feed')}>Feed</div>
  </div>
</div>
```

### ARIA Labels

```tsx
// ✅ Good
<button aria-label="Upvote experience" onClick={handleUpvote}>
  ↑
</button>

<input
  type="search"
  placeholder="Search experiences..."
  aria-label="Search experiences"
/>

<nav aria-label="Main navigation">
  {/* nav items */}
</nav>
```

### Keyboard Navigation

```tsx
// ✅ Good
<div
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClick()
    }
  }}
>
  Click me
</div>
```

### Focus Management

```typescript
// ✅ Good - Focus visible
// tailwind.config.ts
export default {
  theme: {
    extend: {
      outline: {
        DEFAULT: ['2px solid transparent', '2px'],
      },
    },
  },
}

// CSS
.focus-visible:focus {
  @apply outline-none ring-2 ring-blue-600 ring-offset-2;
}
```

---

## 13. Testing

### Unit Tests (Vitest)

```typescript
// lib/utils.test.ts
import { describe, it, expect } from 'vitest'
import { cn, truncateText } from './utils'

describe('cn()', () => {
  it('merges class names', () => {
    expect(cn('px-4', 'py-2')).toBe('px-4 py-2')
  })

  it('handles conditional classes', () => {
    expect(cn('px-4', false && 'hidden', 'py-2')).toBe('px-4 py-2')
  })

  it('merges conflicting Tailwind classes', () => {
    expect(cn('px-4 py-2', 'px-6')).toBe('py-2 px-6')
  })
})

describe('truncateText()', () => {
  it('truncates text longer than max length', () => {
    const text = 'This is a long text'
    expect(truncateText(text, 10)).toBe('This is a ...')
  })

  it('does not truncate text shorter than max length', () => {
    const text = 'Short'
    expect(truncateText(text, 10)).toBe('Short')
  })
})
```

### Component Tests

```typescript
// components/experience/card.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { ExperienceCard } from './card'

describe('ExperienceCard', () => {
  const mockExperience = {
    id: '123',
    title: 'UFO Sighting',
    story_text: 'I saw a UFO...',
    category: 'UFO',
  }

  it('renders experience title', () => {
    render(<ExperienceCard experience={mockExperience} />)
    expect(screen.getByText('UFO Sighting')).toBeInTheDocument()
  })

  it('calls onUpvote when upvote button clicked', () => {
    const handleUpvote = vi.fn()
    render(<ExperienceCard experience={mockExperience} onUpvote={handleUpvote} />)

    fireEvent.click(screen.getByRole('button', { name: /upvote/i }))
    expect(handleUpvote).toHaveBeenCalledWith('123')
  })
})
```

### E2E Tests (Playwright)

```typescript
// e2e/submission-flow.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Experience Submission Flow', () => {
  test('user can submit experience', async ({ page }) => {
    await page.goto('/submit')

    // Screen 1: Enter text
    await page.fill('textarea[placeholder*="erlebt hast"]', 'Ich habe ein UFO gesehen...')
    await page.click('button:has-text("Weiter")')

    // Screen 3: Review AI suggestions
    await expect(page.locator('text=UFO')).toBeVisible()
    await page.click('button:has-text("Bestätigen")')

    // Screen 6: Privacy
    await page.click('input[value="public"]')
    await page.click('button:has-text("Veröffentlichen")')

    // Success
    await expect(page.locator('text=Erfolgreich veröffentlicht')).toBeVisible()
  })
})
```

---

## Code Review Checklist

Before submitting code, ensure:

- [ ] TypeScript strict mode passes with no errors
- [ ] All functions have explicit return types
- [ ] No `any` types used
- [ ] Props interfaces defined for all components
- [ ] Imports organized correctly
- [ ] Error handling implemented
- [ ] Accessibility attributes added (ARIA, keyboard nav)
- [ ] Responsive design tested (mobile, tablet, desktop)
- [ ] Performance optimized (lazy loading, memoization)
- [ ] ESLint passes with no warnings
- [ ] Prettier formatted
- [ ] Tests written for critical logic

---

## Quick Reference

| Category | Convention | Example |
|----------|------------|---------|
| Variables | camelCase | `const userId = '123'` |
| Constants | UPPER_SNAKE_CASE | `const MAX_FILE_SIZE = 25` |
| Functions | camelCase | `function fetchData() {}` |
| Components | PascalCase | `function ExperienceCard() {}` |
| Types/Interfaces | PascalCase | `interface Experience {}` |
| Files | kebab-case | `experience-card.tsx` |
| Folders | kebab-case | `aha-moments/` |
| CSS Classes | kebab-case | `class="experience-card"` |
| Boolean vars | is/has/should | `const isLoading = true` |
| Event handlers | handle prefix | `const handleClick = () => {}` |

---

**Code Style Guide Complete!** Consistent, maintainable, production-ready standards. 🚀
