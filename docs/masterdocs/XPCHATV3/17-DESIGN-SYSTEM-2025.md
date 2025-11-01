# XPChat v3 - Design System 2025++

**Status:** Draft
**Created:** 2025-10-26
**Last Updated:** 2025-10-26

---

## 🎯 TL;DR

**Modern AI Chat UI** inspired by ChatGPT, Claude, Perplexity - built with shadcn/ui + Framer Motion

| Component | Technology | Inspiration |
|-----------|-----------|-------------|
| **Chat Interface** | shadcn/ui + Tailwind | ChatGPT, Claude, Perplexity |
| **Animations** | Framer Motion | Smooth, accessible micro-interactions |
| **Design Tokens** | Tailwind Config | Consistent spacing, colors, typography |
| **Accessibility** | WCAG 2.1 AA | Reduced motion, keyboard nav, ARIA |
| **Dark Mode** | next-themes | System preference + manual toggle |
| **Component Library** | shadcn/ui | Copy-paste components, full control |

---

## 🎨 Design Philosophy

### 2025++ Principles

Based on research of modern AI interfaces (ChatGPT, Claude, Gemini, Perplexity):

1. **Problem-First, Not Personality-First**
   - Focus on helping users discover experiences
   - AI assistant is a tool, not a character
   - Clear, direct communication

2. **Context-Aware Interactions**
   - Remember user preferences (via Mastra Memory)
   - Surface relevant past conversations
   - Anticipate next steps

3. **Progressive Disclosure**
   - Show simple interface first
   - Reveal advanced features on demand
   - Don't overwhelm with options

4. **Streaming by Default**
   - Text streams token-by-token (like ChatGPT)
   - Show typing indicators during tool calls
   - Real-time feedback on AI actions

5. **Multimodal Inputs**
   - Text, voice, images
   - Drag-and-drop file uploads
   - Contextual suggestions

---

## 🏗️ Component Library: shadcn/ui

### Why shadcn/ui?

**Research Finding:** shadcn/ui is the dominant choice for React/Next.js projects in 2025

```typescript
// NOT a dependency - copy components into your codebase
// Full control, no version conflicts, no bloat
npx shadcn@latest init

// Add components as needed
npx shadcn@latest add button
npx shadcn@latest add input
npx shadcn@latest add dialog
```

**Advantages:**
- ✅ Copy-paste components (you own the code)
- ✅ Built on Radix UI primitives (accessible)
- ✅ Tailwind CSS styling (customizable)
- ✅ TypeScript by default
- ✅ Works with Next.js App Router
- ✅ No bundle bloat (only use what you need)

**Components we need:**
- `button` - Primary CTA, secondary actions
- `input` - Text input, search
- `textarea` - Multi-line text (experience submission)
- `dialog` - Modals, confirmations
- `dropdown-menu` - User menu, settings
- `toast` - Notifications (badge unlocked!)
- `avatar` - User profile images
- `card` - Experience cards
- `badge` - Category tags, XP level
- `progress` - XP progress bar
- `skeleton` - Loading states
- `scroll-area` - Scrollable chat history

---

## 🎨 Design Tokens

### Color System

```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        // Brand Colors
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          // ... (teal/cyan spectrum)
          500: '#06b6d4', // Main brand color
          900: '#164e63',
        },

        // UI Colors (Light Mode)
        background: '#ffffff',
        foreground: '#0a0a0a',
        muted: '#f4f4f5',
        'muted-foreground': '#71717a',

        // Chat Message Colors
        'user-message': '#f4f4f5',      // User bubble (light gray)
        'ai-message': '#ffffff',        // AI bubble (white)
        'tool-call': '#dbeafe',         // Tool call (light blue)

        // Semantic Colors
        success: '#10b981',    // Green
        warning: '#f59e0b',    // Amber
        error: '#ef4444',      // Red
        info: '#3b82f6',       // Blue
      },

      // Dark Mode Overrides
      '.dark': {
        '--background': '224 71% 4%',        // Almost black
        '--foreground': '213 31% 91%',       // Light gray
        '--user-message': '224 71% 8%',      // Dark gray
        '--ai-message': '224 71% 6%',        // Slightly darker
        '--tool-call': '217 91% 20%',        // Dark blue
      }
    }
  }
}
```

### Typography

```typescript
// fonts.ts
import { Inter, JetBrains_Mono } from 'next/font/google';

export const fontSans = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const fontMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

// Usage in layout.tsx
<body className={`${fontSans.variable} ${fontMono.variable} font-sans`}>
```

**Type Scale:**
- `text-xs` (0.75rem) - Metadata, timestamps
- `text-sm` (0.875rem) - Secondary text
- `text-base` (1rem) - Body text, chat messages
- `text-lg` (1.125rem) - Emphasis
- `text-xl` (1.25rem) - Section headers
- `text-2xl` (1.5rem) - Page titles
- `text-4xl` (2.25rem) - Hero text

### Spacing

```typescript
// Tailwind default scale (rem-based)
// We use the default 4px base unit:
// - 1 = 0.25rem (4px)
// - 2 = 0.5rem (8px)
// - 4 = 1rem (16px)
// - 8 = 2rem (32px)

// Common patterns:
// - Message bubble: p-4 (16px padding)
// - Chat gap: space-y-4 (16px vertical gap)
// - Section spacing: space-y-8 (32px)
```

---

## 💬 Chat Interface Components

### Message Bubbles

**Research Insight:** ChatGPT/Claude use distinct bubbles for user vs AI messages

```typescript
// components/chat/MessageBubble.tsx
import { motion } from 'framer-motion';

interface MessageBubbleProps {
  role: 'user' | 'assistant' | 'tool';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

export function MessageBubble({ role, content, timestamp, isStreaming }: MessageBubbleProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={cn(
        'group relative max-w-[85%] rounded-2xl px-4 py-3',
        role === 'user' && 'ml-auto bg-user-message',
        role === 'assistant' && 'mr-auto bg-ai-message border',
        role === 'tool' && 'mr-auto bg-tool-call border-blue-200'
      )}
    >
      {/* Message Content */}
      <div className="prose prose-sm dark:prose-invert">
        {isStreaming ? (
          <StreamingText text={content} />
        ) : (
          <Markdown>{content}</Markdown>
        )}
      </div>

      {/* Timestamp (show on hover) */}
      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
        <time className="text-xs text-muted-foreground">
          {formatRelativeTime(timestamp)}
        </time>
      </div>
    </motion.div>
  );
}
```

### Streaming Text

**Pattern:** Token-by-token text reveal (like ChatGPT)

```typescript
// components/chat/StreamingText.tsx
import { motion } from 'framer-motion';

export function StreamingText({ text }: { text: string }) {
  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.1 }}
    >
      {text}
      {/* Blinking cursor while streaming */}
      <motion.span
        animate={{ opacity: [1, 0] }}
        transition={{ repeat: Infinity, duration: 0.8 }}
        className="inline-block w-1 h-4 bg-primary ml-1"
      />
    </motion.span>
  );
}
```

### Typing Indicator

**Pattern:** Bouncing dots (ChatGPT style)

```typescript
// components/chat/TypingIndicator.tsx
import { motion } from 'framer-motion';

export function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-4 py-3 bg-ai-message border rounded-2xl w-fit">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 bg-muted-foreground rounded-full"
          animate={{ y: [0, -8, 0] }}
          transition={{
            repeat: Infinity,
            duration: 0.8,
            delay: i * 0.15, // Stagger animation
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}
```

### Tool Call Visualization

**Pattern:** Show AI "thinking" during tool execution

```typescript
// components/chat/ToolCallMessage.tsx
export function ToolCallMessage({ toolName, status }: ToolCallMessageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center gap-3 px-4 py-3 bg-tool-call border border-blue-200 rounded-2xl w-fit"
    >
      {/* Animated icon */}
      <motion.div
        animate={{ rotate: status === 'running' ? 360 : 0 }}
        transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
      >
        {getToolIcon(toolName)}
      </motion.div>

      {/* Tool name + status */}
      <div className="text-sm">
        <p className="font-medium">{getToolLabel(toolName)}</p>
        <p className="text-muted-foreground">{getStatusText(status)}</p>
      </div>
    </motion.div>
  );
}
```

---

## 🎬 Animation Patterns (Framer Motion)

### Message Entrance

```typescript
// Stagger children for smooth reveal
<motion.div
  initial="hidden"
  animate="visible"
  variants={{
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1, // 100ms delay between messages
      },
    },
  }}
>
  {messages.map((msg) => (
    <motion.div
      key={msg.id}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
      }}
    >
      <MessageBubble {...msg} />
    </motion.div>
  ))}
</motion.div>
```

### Smooth Scrolling

```typescript
// Auto-scroll to bottom on new message
import { useEffect, useRef } from 'react';

export function ChatContainer() {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages]);

  return (
    <div ref={scrollRef} className="overflow-y-auto">
      {/* Messages */}
    </div>
  );
}
```

### Reduced Motion Support

**Accessibility:** Respect `prefers-reduced-motion`

```typescript
// components/chat/AnimatedMessage.tsx
import { useReducedMotion } from 'framer-motion';

export function AnimatedMessage({ children }: { children: React.ReactNode }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: shouldReduceMotion ? 0 : 0.3,
        ease: 'easeOut',
      }}
    >
      {children}
    </motion.div>
  );
}
```

---

## 🌓 Dark Mode

### Implementation (next-themes)

```bash
pnpm add next-themes
```

```typescript
// app/providers.tsx
'use client';
import { ThemeProvider } from 'next-themes';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </ThemeProvider>
  );
}

// app/layout.tsx
import { Providers } from './providers';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

### Theme Toggle

```typescript
// components/ThemeToggle.tsx
'use client';
import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
```

---

## ♿ Accessibility (WCAG 2.1 AA)

### Keyboard Navigation

```typescript
// All interactive elements must be keyboard-accessible

// Chat input
<textarea
  ref={inputRef}
  aria-label="Chat message"
  placeholder="Type your message..."
  onKeyDown={(e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }}
/>

// Message actions (copy, regenerate)
<button
  aria-label="Copy message"
  onClick={handleCopy}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCopy();
    }
  }}
>
  <Copy className="h-4 w-4" />
</button>
```

### Screen Reader Support

```typescript
// Live regions for dynamic content
<div role="log" aria-live="polite" aria-atomic="false">
  {messages.map((msg) => (
    <div key={msg.id} role="article" aria-label={`Message from ${msg.role}`}>
      <MessageBubble {...msg} />
    </div>
  ))}
</div>

// Status announcements
<div className="sr-only" aria-live="assertive">
  {isStreaming && 'AI is responding'}
  {isToolExecuting && `Executing tool: ${toolName}`}
</div>
```

### Focus Management

```typescript
// Auto-focus input after message sent
useEffect(() => {
  if (!isStreaming) {
    inputRef.current?.focus();
  }
}, [isStreaming]);

// Skip to content link
<a
  href="#chat-messages"
  className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-background"
>
  Skip to messages
</a>
```

### Color Contrast

All colors must meet WCAG AA standards:
- Normal text: 4.5:1 contrast ratio
- Large text (18pt+): 3:1 contrast ratio
- UI components: 3:1 contrast ratio

**Use tools:**
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- Chrome DevTools Accessibility panel

---

## 📱 Mobile-First Patterns

### Touch-Friendly Targets

```typescript
// Minimum 44x44px touch targets
<button className="min-h-[44px] min-w-[44px] p-3">
  <Send className="h-5 w-5" />
</button>
```

### Swipe Gestures

```typescript
// Swipe to delete message (mobile)
import { motion, useMotionValue, useTransform } from 'framer-motion';

export function SwipeableMessage({ onDelete }: { onDelete: () => void }) {
  const x = useMotionValue(0);
  const opacity = useTransform(x, [-150, 0], [0, 1]);

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: -150, right: 0 }}
      dragElastic={0.2}
      style={{ x, opacity }}
      onDragEnd={(e, info) => {
        if (info.offset.x < -100) {
          onDelete();
        }
      }}
    >
      <MessageBubble />
    </motion.div>
  );
}
```

### Bottom Navigation

```typescript
// Fixed bottom input (mobile)
<div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 safe-area-inset-bottom">
  <form onSubmit={handleSend} className="flex gap-2">
    <textarea
      className="flex-1 resize-none rounded-lg"
      rows={1}
      maxLength={2000}
    />
    <Button type="submit" size="icon">
      <Send className="h-5 w-5" />
    </Button>
  </form>
</div>
```

---

## 🎯 Loading States

### Skeleton Screens

```typescript
// components/chat/MessageSkeleton.tsx
import { Skeleton } from '@/components/ui/skeleton';

export function MessageSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}
```

### Progressive Loading

```typescript
// Show partial content immediately, load full data async
export function ExperienceCard({ experienceId }: { experienceId: string }) {
  const { data: preview } = useSWR(`/api/experiences/${experienceId}/preview`);
  const { data: full } = useSWR(`/api/experiences/${experienceId}`);

  const experience = full || preview;

  return (
    <Card>
      {/* Show preview data immediately */}
      <h3>{experience?.title}</h3>
      <p>{experience?.excerpt}</p>

      {/* Show full content when loaded */}
      {full ? (
        <div>{full.fullContent}</div>
      ) : (
        <Skeleton className="h-20" />
      )}
    </Card>
  );
}
```

---

## ⚠️ Error States

### Error Messages

```typescript
// components/chat/ErrorMessage.tsx
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export function ErrorMessage({ error, onRetry }: ErrorMessageProps) {
  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Something went wrong</AlertTitle>
      <AlertDescription className="flex items-center justify-between">
        <span>{error.message}</span>
        <Button variant="outline" size="sm" onClick={onRetry}>
          Retry
        </Button>
      </AlertDescription>
    </Alert>
  );
}
```

### Graceful Degradation

```typescript
// Fallback to simple input if AI fails
export function ChatInput() {
  const [aiSuggestionsEnabled, setAiSuggestionsEnabled] = useState(true);

  const { data: suggestions, error } = useSWR(
    aiSuggestionsEnabled ? '/api/suggestions' : null
  );

  // Disable AI features on error
  useEffect(() => {
    if (error) {
      setAiSuggestionsEnabled(false);
    }
  }, [error]);

  return (
    <div>
      <textarea />
      {/* Show AI suggestions only if available */}
      {aiSuggestionsEnabled && suggestions && (
        <SuggestionChips suggestions={suggestions} />
      )}
    </div>
  );
}
```

---

## 🎉 Notification System

### Toast Notifications

```typescript
// Use shadcn/ui toast for transient messages
import { useToast } from '@/components/ui/use-toast';

export function useNotifications() {
  const { toast } = useToast();

  return {
    success: (message: string) => toast({
      title: 'Success',
      description: message,
      variant: 'default',
    }),

    error: (message: string) => toast({
      title: 'Error',
      description: message,
      variant: 'destructive',
    }),

    badgeUnlocked: (badge: Badge) => toast({
      title: '🎉 Badge Unlocked!',
      description: (
        <div className="flex items-center gap-3">
          <img src={badge.iconUrl} alt="" className="h-12 w-12" />
          <div>
            <p className="font-medium">{badge.name}</p>
            <p className="text-sm text-muted-foreground">{badge.description}</p>
          </div>
        </div>
      ),
      duration: 5000,
    }),
  };
}
```

---

## 🚀 Onboarding Flow

### First-Time User Experience

```typescript
// components/onboarding/OnboardingDialog.tsx
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export function OnboardingDialog() {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: 'Welcome to XPChat',
      description: 'Discover extraordinary experiences through AI-powered conversations.',
      action: 'Get Started',
    },
    {
      title: 'Ask Anything',
      description: 'Search, visualize, and analyze experiences using natural language.',
      action: 'Try It',
    },
    {
      title: 'Share Your Story',
      description: 'Submit your own experiences with AI-guided prompts.',
      action: 'Start',
    },
  ];

  return (
    <Dialog open={isFirstVisit}>
      <DialogContent>
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
        >
          <h2 className="text-2xl font-bold">{steps[step].title}</h2>
          <p className="text-muted-foreground">{steps[step].description}</p>

          <div className="flex gap-2 mt-6">
            {step > 0 && (
              <Button variant="outline" onClick={() => setStep(step - 1)}>
                Back
              </Button>
            )}
            <Button onClick={() => step < steps.length - 1 ? setStep(step + 1) : handleComplete()}>
              {steps[step].action}
            </Button>
          </div>

          {/* Progress indicators */}
          <div className="flex gap-1 mt-4">
            {steps.map((_, i) => (
              <div
                key={i}
                className={cn(
                  'h-1 flex-1 rounded-full',
                  i <= step ? 'bg-primary' : 'bg-muted'
                )}
              />
            ))}
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
```

---

## 📐 Layout Patterns

### 3-Zone Layout (Mobile)

Based on [12-MOBILE-FIRST.md](./12-MOBILE-FIRST.md):

```typescript
// app/xpchat/layout.tsx
export default function XPChatLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-screen">
      {/* Top: Navbar with user menu */}
      <header className="border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold">XPChat</h1>
          <ThemeToggle />
        </div>
      </header>

      {/* Middle: Chat messages (scrollable) */}
      <main className="flex-1 overflow-y-auto px-4 py-6">
        {children}
      </main>

      {/* Bottom: Input (fixed) */}
      <footer className="border-t bg-background p-4">
        <ChatInput />
      </footer>
    </div>
  );
}
```

### Desktop Sidebar

```typescript
// Desktop: Sidebar with conversation history
<div className="hidden lg:flex h-screen">
  {/* Sidebar (left) */}
  <aside className="w-64 border-r p-4">
    <Button className="w-full mb-4">New Chat</Button>
    <ConversationHistory />
  </aside>

  {/* Main chat area (right) */}
  <main className="flex-1 flex flex-col">
    <ChatMessages />
    <ChatInput />
  </main>
</div>
```

---

## 🎨 Visualization Integration

Based on [09-VISUAL-SYSTEM.md](./09-VISUAL-SYSTEM.md):

### Embedded Visualizations

```typescript
// Show visualizations inline in chat messages
export function VisualizationMessage({ data, type }: VisualizationMessageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-full overflow-hidden rounded-xl border bg-card"
    >
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b px-4 py-2">
        <h3 className="text-sm font-medium">{getVisualizationTitle(type)}</h3>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" onClick={handleFullscreen}>
            <Maximize2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleDownload}>
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Visualization */}
      <div className="p-4">
        {type === 'map' && <MapVisualization data={data} />}
        {type === 'timeline' && <TimelineVisualization data={data} />}
        {type === 'dashboard' && <DashboardVisualization data={data} />}
        {type === 'network' && <NetworkVisualization data={data} />}
        {type === 'comparison' && <ComparisonVisualization data={data} />}
      </div>
    </motion.div>
  );
}
```

---

## 📊 Performance Budget

### Core Web Vitals Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| **LCP** | <2.5s | Largest Contentful Paint |
| **FID** | <100ms | First Input Delay |
| **CLS** | <0.1 | Cumulative Layout Shift |
| **FCP** | <1.8s | First Contentful Paint |
| **TTI** | <3.8s | Time to Interactive |

### Bundle Size Limits

```typescript
// next.config.ts
const nextConfig = {
  experimental: {
    bundlePagesRouterDependencies: true,
  },

  // Warn if bundles exceed these sizes
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },

  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  },
};
```

**Target Bundle Sizes:**
- Initial JS: <100kb (gzipped)
- Initial CSS: <20kb (gzipped)
- Images: WebP/AVIF, lazy-loaded
- Fonts: Subset, preloaded

---

## 🧪 Testing Strategy

### Visual Regression Testing

```bash
# Use Playwright for visual regression tests
pnpm add -D @playwright/test

# tests/visual/chat.spec.ts
import { test, expect } from '@playwright/test';

test('chat interface renders correctly', async ({ page }) => {
  await page.goto('/xpchat');

  // Take screenshot
  await expect(page).toHaveScreenshot('chat-light.png');

  // Switch to dark mode
  await page.click('[aria-label="Toggle theme"]');
  await expect(page).toHaveScreenshot('chat-dark.png');
});
```

### Accessibility Testing

```bash
# Use axe-core for a11y testing
pnpm add -D @axe-core/playwright

# tests/a11y/chat.spec.ts
import { test, expect } from '@playwright/test';
import { injectAxe, checkA11y } from '@axe-core/playwright';

test('chat interface is accessible', async ({ page }) => {
  await page.goto('/xpchat');
  await injectAxe(page);

  // Run axe checks
  await checkA11y(page, null, {
    detailedReport: true,
    detailedReportOptions: {
      html: true,
    },
  });
});
```

---

## 📚 Related Documentation

- [01A-ARCHITECTURE-DECISIONS.md](./01A-ARCHITECTURE-DECISIONS.md) - Tech stack & memory strategy
- [03-TOOLS.md](./03-TOOLS.md) - Chat agent tools (unifiedSearch, visualize, etc.)
- [09-VISUAL-SYSTEM.md](./09-VISUAL-SYSTEM.md) - Data visualization components
- [12-MOBILE-FIRST.md](./12-MOBILE-FIRST.md) - Mobile-specific patterns & PWA
- [04-UX-SCENARIOS.md](./04-UX-SCENARIOS.md) - User personas & journeys

---

## 🔄 Implementation Checklist

### Phase 1: Foundation (Week 1)
- [ ] Install shadcn/ui + required components
- [ ] Configure Tailwind design tokens
- [ ] Set up next-themes for dark mode
- [ ] Install Framer Motion
- [ ] Configure fonts (Inter + JetBrains Mono)

### Phase 2: Core Components (Week 2)
- [ ] Build MessageBubble component
- [ ] Implement StreamingText with cursor
- [ ] Create TypingIndicator (bouncing dots)
- [ ] Build ToolCallMessage visualization
- [ ] Add message entrance animations

### Phase 3: Interactions (Week 3)
- [ ] Implement auto-scroll behavior
- [ ] Add keyboard navigation
- [ ] Build ThemeToggle component
- [ ] Create ErrorMessage component
- [ ] Add toast notifications

### Phase 4: Mobile (Week 4)
- [ ] Implement 3-zone mobile layout
- [ ] Add swipe gestures
- [ ] Create bottom navigation
- [ ] Test touch targets (44x44px)
- [ ] Add safe-area-inset support

### Phase 5: Accessibility (Week 5)
- [ ] Add ARIA labels & roles
- [ ] Implement live regions
- [ ] Add focus management
- [ ] Test with screen readers
- [ ] Verify color contrast

### Phase 6: Polish (Week 6)
- [ ] Create onboarding flow
- [ ] Add skeleton loaders
- [ ] Implement progressive loading
- [ ] Test reduced motion
- [ ] Visual regression tests

---

**Last Updated:** 2025-10-26
**Status:** ✅ Ready for implementation
**Based on Research:** ChatGPT, Claude, Gemini, Perplexity UI patterns (2025++)
