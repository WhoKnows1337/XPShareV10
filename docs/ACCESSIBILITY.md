# Accessibility (a11y) - WCAG 2.1 AA Compliance Guide

## 🎯 Ziel

**Barrierefreie Plattform für ALLE User** - XP-Share muss für Menschen mit Behinderungen vollständig nutzbar sein.

### Warum kritisch:
- ✅ **Ethische Verantwortung** (Inklusion)
- ✅ **Gesetzliche Pflicht** (EU Accessibility Act, ADA, DSGVO)
- ✅ **Bessere UX** (für alle User)
- ✅ **SEO-Boost** (Google bevorzugt a11y-Sites)
- ✅ **Größere Reichweite** (15-20% der Bevölkerung)

### Compliance-Level:
**WCAG 2.1 Level AA** (Ziel: AAA wo möglich)

---

## 📋 WCAG 2.1 AA Checklist

### **1. Perceivable (Wahrnehmbar)**

#### **1.1 Text-Alternatives**
- [ ] Alle Bilder haben `alt`-Attribute
- [ ] Dekorative Bilder: `alt=""` (leerer String)
- [ ] Komplexe Grafiken: Detaillierte Beschreibungen
- [ ] Icons mit Text: `aria-label` oder `<span className="sr-only">`
- [ ] SVG-Icons: `<title>` und `role="img"`

**Beispiel:**
```tsx
// Gutes Beispiel
<Image src="/ufo.jpg" alt="Dreieckiges UFO über dem Bodensee bei Nacht" />

// Dekorativ (kein Alt-Text nötig)
<div className="bg-pattern" role="presentation" />

// Icon mit Label
<Button>
  <Heart className="w-4 h-4" aria-hidden="true" />
  <span>Like</span>
</Button>

// Icon ohne sichtbaren Text
<Button aria-label="Like this experience">
  <Heart className="w-4 h-4" />
</Button>

// SVG-Icon
<svg role="img" aria-labelledby="ufo-icon-title">
  <title id="ufo-icon-title">UFO Category Icon</title>
  {/* SVG-Path */}
</svg>
```

#### **1.2 Time-based-Media**
- [ ] Videos: Untertitel (Captions)
- [ ] Audio: Transkripte
- [ ] Auto-Play vermeiden (oder Pause-Button)
- [ ] Media-Player: Keyboard-steuerbar

**Beispiel:**
```tsx
// Video mit Captions
<video controls>
  <source src="/experience-video.mp4" type="video/mp4" />
  <track
    kind="captions"
    src="/captions-de.vtt"
    srcLang="de"
    label="Deutsch"
    default
  />
  <track
    kind="captions"
    src="/captions-en.vtt"
    srcLang="en"
    label="English"
  />
</video>

// Audio mit Transkript
<audio controls src="/experience-audio.mp3" />
<details className="mt-2">
  <summary>Transkript anzeigen</summary>
  <p>{transcript}</p>
</details>
```

#### **1.3 Adaptable (Anpassbar)**
- [ ] Semantisches HTML (nicht nur `<div>`)
- [ ] Heading-Hierarchie korrekt (h1 → h2 → h3)
- [ ] Listen mit `<ul>`, `<ol>`, `<li>`
- [ ] Forms mit `<label>` + `<input>` verknüpft
- [ ] ARIA-Landmarks (`role="navigation"`, `role="main"`, etc.)

**Beispiel:**
```tsx
// Semantisches HTML
<article>
  <header>
    <h1>UFO-Sichtung am Bodensee</h1>
    <p>Von @username · 15. März 2024</p>
  </header>

  <main>
    <p>Ich sah nachts ein leuchtendes Objekt...</p>
  </main>

  <footer>
    <nav aria-label="Experience actions">
      <Button>Like</Button>
      <Button>Comment</Button>
      <Button>Share</Button>
    </nav>
  </footer>
</article>

// Form mit Labels
<form>
  <Label htmlFor="search-input">Search experiences</Label>
  <Input
    id="search-input"
    type="search"
    placeholder="UFO, paranormal, dreams..."
  />
</form>

// ARIA-Landmarks
<header role="banner">...</header>
<nav role="navigation" aria-label="Main navigation">...</nav>
<main role="main">...</main>
<aside role="complementary">...</aside>
<footer role="contentinfo">...</footer>
```

#### **1.4 Distinguishable (Unterscheidbar)**
- [ ] **Color-Contrast: 4.5:1** (Text vs Background)
- [ ] **Large-Text: 3:1** (18pt+ oder 14pt+ Bold)
- [ ] Farbe nicht als einziger Indikator
- [ ] Text-Resize: 200% ohne Scroll (horizontal)
- [ ] Spacing: Nutzer kann anpassen

**Color-Contrast-Check:**
```typescript
// Tailwind-Config (WCAG-AA-compliant)
module.exports = {
  theme: {
    extend: {
      colors: {
        // Dark-Mode-Palette
        background: '#0a0a0a',      // Contrast: Base
        foreground: '#ededed',      // Contrast: 20.5:1 ✅
        primary: '#8b5cf6',         // Contrast: 4.7:1 ✅
        'primary-foreground': '#ffffff', // Contrast: 21:1 ✅
        secondary: '#27272a',       // Contrast: 1.3:1 (nur für Dekorativ)
        'secondary-foreground': '#fafafa', // Contrast: 18.5:1 ✅
        muted: '#27272a',
        'muted-foreground': '#a1a1aa', // Contrast: 7.8:1 ✅
        accent: '#27272a',
        'accent-foreground': '#fafafa',
        destructive: '#ef4444',     // Contrast: 5.2:1 ✅
        border: '#27272a',
        input: '#27272a',
        ring: '#8b5cf6'
      }
    }
  }
}

// Check mit Tool: https://webaim.org/resources/contrastchecker/
// Oder in CI/CD:
import { checkContrast } from 'polished'

const ratio = checkContrast('#8b5cf6', '#0a0a0a')
if (ratio < 4.5) {
  throw new Error(`Contrast ratio ${ratio} fails WCAG AA (needs 4.5:1)`)
}
```

**Farbe nicht als einziger Indikator:**
```tsx
// Schlecht (nur Farbe)
<Badge className="bg-red-500">Error</Badge>
<Badge className="bg-green-500">Success</Badge>

// Gut (Farbe + Icon/Text)
<Badge variant="destructive">
  <XCircle className="w-3 h-3 mr-1" />
  Error
</Badge>

<Badge variant="success">
  <CheckCircle className="w-3 h-3 mr-1" />
  Success
</Badge>
```

---

### **2. Operable (Bedienbar)**

#### **2.1 Keyboard-Accessible**
- [ ] **Alle Funktionen per Keyboard erreichbar**
- [ ] `Tab`-Order logisch
- [ ] `Enter`/`Space` für Buttons
- [ ] `Esc` schließt Dialoge/Dropdowns
- [ ] Keine Keyboard-Traps (kann immer raus)
- [ ] Skip-Links ("Skip to main content")

**Tab-Order:**
```tsx
// Automatisch korrekt (DOM-Order)
<Button>First</Button>
<Button>Second</Button>
<Button>Third</Button>

// Custom-Order (vermeiden, nur wenn nötig)
<Button tabIndex={2}>Second</Button>
<Button tabIndex={1}>First</Button>
<Button tabIndex={3}>Third</Button>

// Aus Tab-Order entfernen
<div tabIndex={-1}>Not focusable</div>
```

**Skip-Links:**
```tsx
// components/SkipLinks.tsx
export function SkipLinks() {
  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded focus:outline-none focus:ring-2 focus:ring-ring"
      >
        Skip to main content
      </a>

      <a
        href="#main-navigation"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-40 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded"
      >
        Skip to navigation
      </a>
    </>
  )
}

// app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <SkipLinks />
        <Navigation id="main-navigation" />
        <main id="main-content" tabIndex={-1}>
          {children}
        </main>
      </body>
    </html>
  )
}
```

**Keyboard-Event-Handling:**
```tsx
// Experience-Card (Keyboard-accessible)
export function ExperienceCard({ experience }) {
  const router = useRouter()

  const handleKeyDown = (e: KeyboardEvent) => {
    // Enter oder Space öffnet Experience
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      router.push(`/experiences/${experience.id}`)
    }
  }

  return (
    <div
      role="article"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className="cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary"
    >
      {/* Card-Content */}
    </div>
  )
}

// Dialog (Esc schließt)
export function ExperienceDialog({ open, onClose }) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (open) {
      window.addEventListener('keydown', handleEscape)
      return () => window.removeEventListener('keydown', handleEscape)
    }
  }, [open, onClose])

  return (
    <Dialog open={open} onOpenChange={onClose}>
      {/* Dialog-Content */}
    </Dialog>
  )
}
```

#### **2.2 Enough-Time**
- [ ] Kein Auto-Logout ohne Warnung
- [ ] Timeout: Min. 20 Sekunden Warnung
- [ ] Nutzer kann Zeit verlängern
- [ ] Auto-Refresh: Ausschaltbar

**Timeout-Warnung:**
```tsx
// hooks/useSessionTimeout.ts
export function useSessionTimeout() {
  const [showWarning, setShowWarning] = useState(false)
  const [timeLeft, setTimeLeft] = useState(120) // 2 Min Warning

  useEffect(() => {
    const sessionTimeout = 30 * 60 * 1000 // 30 Min
    const warningTime = sessionTimeout - 120 * 1000 // 2 Min vor Ende

    const warningTimer = setTimeout(() => {
      setShowWarning(true)
    }, warningTime)

    return () => clearTimeout(warningTimer)
  }, [])

  useEffect(() => {
    if (!showWarning) return

    const countdown = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Logout
          signOut()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(countdown)
  }, [showWarning])

  const extendSession = () => {
    setShowWarning(false)
    setTimeLeft(120)
    // Refresh-Session
    refreshSession()
  }

  return { showWarning, timeLeft, extendSession }
}

// Component
export function SessionTimeoutWarning() {
  const { showWarning, timeLeft, extendSession } = useSessionTimeout()

  if (!showWarning) return null

  return (
    <Alert variant="destructive" role="alert" aria-live="assertive">
      <AlertTitle>Session läuft ab</AlertTitle>
      <AlertDescription>
        Ihre Session endet in {timeLeft} Sekunden. Möchten Sie fortfahren?
      </AlertDescription>
      <Button onClick={extendSession} className="mt-2">
        Session verlängern
      </Button>
    </Alert>
  )
}
```

#### **2.3 Seizures-and-Physical-Reactions**
- [ ] **Kein Blinken >3x pro Sekunde**
- [ ] Kein Flackern
- [ ] Parallax-Effekte reduzierbar
- [ ] `prefers-reduced-motion` respektieren

**Motion-Safe:**
```tsx
// Respektiere prefers-reduced-motion
const MotionDiv = motion.div

export function AnimatedCard({ children }) {
  return (
    <MotionDiv
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        ease: 'easeOut'
      }}
      // Disable-Animations wenn User es wünscht
      {...(window.matchMedia('(prefers-reduced-motion: reduce)').matches && {
        initial: false,
        animate: false
      })}
    >
      {children}
    </MotionDiv>
  )
}

// CSS-Fallback
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

#### **2.4 Navigable**
- [ ] Klare Page-Titles (`<title>`)
- [ ] Focus-Order logisch
- [ ] Link-Purpose klar (nicht "Click here")
- [ ] Multiple-Ways (Navigation, Search, Sitemap)
- [ ] Focus-Visible (immer sichtbar)

**Page-Titles:**
```tsx
// app/experiences/[id]/page.tsx
export async function generateMetadata({ params }) {
  const experience = await getExperience(params.id)

  return {
    title: `${experience.title} by @${experience.user.username} | XP-Share`,
    description: experience.content.slice(0, 160)
  }
}

// Format: [Page] | [Section] | [Site]
// Browse: "UFO-Sichtungen | Browse | XP-Share"
// Search: "Search: ufo bodensee | XP-Share"
```

**Link-Purpose:**
```tsx
// Schlecht
<Link href="/experiences/123">Click here</Link>

// Gut
<Link href="/experiences/123">
  Read "UFO-Sichtung am Bodensee" by @username
</Link>

// Oder mit aria-label
<Link href="/experiences/123" aria-label="Read UFO-Sichtung am Bodensee by username">
  Read more
</Link>
```

**Focus-Visible:**
```css
/* Tailwind-Config */
module.exports = {
  theme: {
    extend: {
      ringWidth: {
        DEFAULT: '3px'
      },
      ringColor: {
        DEFAULT: 'hsl(var(--primary))'
      },
      ringOffsetWidth: {
        DEFAULT: '2px'
      }
    }
  }
}

/* Usage */
.focus-visible\:ring-4:focus-visible {
  outline: none;
  ring: 4px solid hsl(var(--primary));
  ring-offset: 2px;
}

/* Alle interaktiven Elemente */
button:focus-visible,
a:focus-visible,
input:focus-visible,
select:focus-visible,
textarea:focus-visible {
  @apply ring-4 ring-primary ring-offset-2;
}
```

---

### **3. Understandable (Verständlich)**

#### **3.1 Readable**
- [ ] Sprache definiert (`<html lang="de">`)
- [ ] Sprachwechsel markiert (`lang="en"`)
- [ ] Einfache Sprache (wo möglich)
- [ ] Abkürzungen erklärt

**Language-Tags:**
```tsx
// Root-Layout
export default function RootLayout({ children, params }) {
  return (
    <html lang={params.lang || 'de'}>
      <body>{children}</body>
    </html>
  )
}

// Inline-Language-Switch
<p>
  Diese Experience wurde übersetzt aus{' '}
  <span lang="en">English</span>.
</p>

// Abkürzungen
<abbr title="Unidentified Flying Object">UFO</abbr>
```

#### **3.2 Predictable**
- [ ] Navigation konsistent
- [ ] Komponenten konsistent
- [ ] Keine unerwarteten Context-Changes
- [ ] Formulare: Nur bei explizitem Submit

**Konsistente-Navigation:**
```tsx
// Gleiche Nav-Struktur auf allen Pages
export function MainNavigation() {
  return (
    <nav role="navigation" aria-label="Main navigation">
      <ul className="flex gap-6">
        <li>
          <NavLink href="/" icon={Home}>Home</NavLink>
        </li>
        <li>
          <NavLink href="/browse" icon={Compass}>Browse</NavLink>
        </li>
        <li>
          <NavLink href="/submit" icon={Plus}>Submit</NavLink>
        </li>
        <li>
          <NavLink href="/profile" icon={User}>Profile</NavLink>
        </li>
      </ul>
    </nav>
  )
}

// NavLink immer gleich gestylt
export function NavLink({ href, icon: Icon, children }) {
  const isActive = usePathname() === href

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-lg transition-colors",
        isActive
          ? "bg-primary text-primary-foreground"
          : "hover:bg-accent"
      )}
      aria-current={isActive ? 'page' : undefined}
    >
      <Icon className="w-4 h-4" aria-hidden="true" />
      <span>{children}</span>
    </Link>
  )
}
```

**Keine unerwarteten Changes:**
```tsx
// Schlecht (Focus-Trap bei onChange)
<Select
  value={category}
  onValueChange={(val) => {
    setCategory(val)
    router.push(`/browse?category=${val}`) // ⚠️ Unerwarteter Page-Change!
  }}
/>

// Gut (Expliziter Button)
<div className="flex gap-2">
  <Select value={category} onValueChange={setCategory} />
  <Button onClick={() => router.push(`/browse?category=${category}`)}>
    Apply
  </Button>
</div>
```

#### **3.3 Input-Assistance**
- [ ] Fehler erkannt & beschrieben
- [ ] Labels & Instructions
- [ ] Error-Suggestions
- [ ] Error-Prevention (Confirmation)

**Form-Validation:**
```tsx
// Form mit Validation (React-Hook-Form + Zod)
const formSchema = z.object({
  title: z.string()
    .min(10, 'Title must be at least 10 characters')
    .max(100, 'Title must be less than 100 characters'),
  content: z.string()
    .min(50, 'Content must be at least 50 characters'),
  category: z.string()
    .min(1, 'Please select a category')
})

export function ExperienceForm() {
  const form = useForm({
    resolver: zodResolver(formSchema)
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {/* Title */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  aria-describedby="title-description title-error"
                  aria-invalid={!!form.formState.errors.title}
                />
              </FormControl>
              <FormDescription id="title-description">
                A short, descriptive title for your experience
              </FormDescription>
              <FormMessage id="title-error" role="alert" />
            </FormItem>
          )}
        />

        {/* Category */}
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger
                    aria-describedby="category-error"
                    aria-invalid={!!form.formState.errors.category}
                  >
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="ufo">🛸 UFO-Sichtungen</SelectItem>
                  <SelectItem value="paranormal">👻 Paranormal</SelectItem>
                  <SelectItem value="dreams">💭 Träume</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage id="category-error" role="alert" />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Publishing...' : 'Publish'}
        </Button>
      </form>
    </Form>
  )
}
```

**Error-Prevention:**
```tsx
// Confirmation bei destruktiven Aktionen
export function DeleteExperienceButton({ experienceId }) {
  const [showConfirm, setShowConfirm] = useState(false)

  const handleDelete = async () => {
    await deleteExperience(experienceId)
    router.push('/profile')
  }

  return (
    <>
      <Button
        variant="destructive"
        onClick={() => setShowConfirm(true)}
      >
        <Trash className="w-4 h-4 mr-2" />
        Delete
      </Button>

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              experience and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground"
            >
              Delete permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
```

---

### **4. Robust (Robust)**

#### **4.1 Compatible**
- [ ] Valides HTML
- [ ] Keine doppelten IDs
- [ ] ARIA korrekt verwendet
- [ ] Name, Role, Value für alle Controls

**ARIA-Best-Practices:**
```tsx
// Button (nativer Button hat role="button" automatisch)
<button>Click me</button>

// Custom-Button (braucht role)
<div
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleClick()
    }
  }}
>
  Click me
</div>

// Checkbox (Custom)
<div
  role="checkbox"
  aria-checked={isChecked}
  aria-labelledby="checkbox-label"
  tabIndex={0}
  onClick={() => setIsChecked(!isChecked)}
  onKeyDown={(e) => {
    if (e.key === ' ') {
      e.preventDefault()
      setIsChecked(!isChecked)
    }
  }}
>
  <CheckIcon className={isChecked ? 'visible' : 'hidden'} />
</div>
<span id="checkbox-label">Agree to terms</span>

// Tab-Panel
<Tabs value={activeTab} onValueChange={setActiveTab}>
  <TabsList role="tablist">
    <TabsTrigger value="tab1" role="tab" aria-selected={activeTab === 'tab1'}>
      Tab 1
    </TabsTrigger>
    <TabsTrigger value="tab2" role="tab" aria-selected={activeTab === 'tab2'}>
      Tab 2
    </TabsTrigger>
  </TabsList>

  <TabsContent value="tab1" role="tabpanel" aria-labelledby="tab1-trigger">
    Content 1
  </TabsContent>

  <TabsContent value="tab2" role="tabpanel" aria-labelledby="tab2-trigger">
    Content 2
  </TabsContent>
</Tabs>
```

---

## 🧪 Testing-Strategy

### **1. Automated-Testing**

#### **axe-core (Playwright)**
```typescript
// e2e/a11y.spec.ts
import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.describe('Accessibility', () => {
  test('Homepage should not have accessibility violations', async ({ page }) => {
    await page.goto('/')

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()

    expect(results.violations).toEqual([])
  })

  test('Experience-Detail-Page should not have violations', async ({ page }) => {
    await page.goto('/experiences/test-id')

    const results = await new AxeBuilder({ page }).analyze()

    expect(results.violations).toEqual([])
  })

  test('Form-Validation-Errors should be accessible', async ({ page }) => {
    await page.goto('/submit')

    // Submit ohne Daten
    await page.click('button[type="submit"]')

    // Check Fehler sind in ARIA-live-Region
    const errorMessage = page.locator('[role="alert"]')
    await expect(errorMessage).toBeVisible()

    // axe-Check
    const results = await new AxeBuilder({ page }).analyze()
    expect(results.violations).toEqual([])
  })
})
```

#### **Lighthouse-CI**
```yaml
# .github/workflows/lighthouse.yml
name: Lighthouse CI

on: [push]

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Run Lighthouse CI
        run: |
          npm install -g @lhci/cli
          lhci autorun
        env:
          LHCI_GITHUB_APP_TOKEN: ${{ secrets.LHCI_GITHUB_APP_TOKEN }}

# lighthouserc.js
module.exports = {
  ci: {
    collect: {
      url: [
        'http://localhost:3000/',
        'http://localhost:3000/browse',
        'http://localhost:3000/experiences/test-id'
      ],
      numberOfRuns: 3
    },
    assert: {
      assertions: {
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }]
      }
    },
    upload: {
      target: 'temporary-public-storage'
    }
  }
}
```

### **2. Manual-Testing**

#### **Keyboard-only-Test**
```
Checklist:
□ Tab durch alle Elemente (logische Reihenfolge)
□ Shift+Tab geht rückwärts
□ Enter aktiviert Links/Buttons
□ Space aktiviert Buttons/Checkboxes
□ Pfeiltasten navigieren in Dropdowns/Radio-Groups
□ Esc schließt Dialoge/Dropdowns
□ Keine Keyboard-Traps (kann immer raus)
□ Focus immer sichtbar (Ring)
□ Skip-Links funktionieren
```

#### **Screen-Reader-Test**

**NVDA (Windows, kostenlos):**
```
Test-Ablauf:
1. NVDA starten (Ctrl+Alt+N)
2. Seite laden
3. Mit Pfeiltasten durch Page navigieren
4. H (Headings), L (Links), F (Forms), B (Buttons) testen
5. Tab-Navigation testen
6. Forms ausfüllen & submitten
7. Fehler-Announcements prüfen

Prüfen:
□ Heading-Struktur klar
□ Links beschreibend
□ Form-Labels korrekt
□ Fehler werden angesagt
□ Landmarks erkennbar
□ Alt-Texte vorhanden
```

**VoiceOver (macOS):**
```
Aktivierung: Cmd+F5

Shortcuts:
- VO+A: Start reading
- VO+→: Next element
- VO+←: Previous element
- VO+U: Rotor (Headings, Links, Forms)
- VO+Space: Activate element
```

**TalkBack (Android):**
```
Aktivierung: Settings → Accessibility → TalkBack

Gesten:
- Swipe-Right: Next
- Swipe-Left: Previous
- Double-Tap: Activate
- L-Gesture: Zurück
```

#### **Color-Contrast-Test**
```bash
# Chrome-DevTools
1. Öffne DevTools (F12)
2. Elements-Tab
3. Styles-Panel → Color-Picker
4. Contrast-Ratio wird angezeigt (AA/AAA)

# Tools:
- https://webaim.org/resources/contrastchecker/
- https://colorable.jxnblk.com/
- https://contrast-ratio.com/
```

#### **Zoom-Test (200%)**
```
Browser-Zoom: Ctrl+Plus (bis 200%)

Prüfen:
□ Kein horizontaler Scroll
□ Text lesbar
□ Keine Überlappungen
□ Buttons erreichbar
□ Formulare benutzbar
```

---

## 🛠️ Common-Pitfalls & Solutions

### **Pitfall 1: Icon-only-Buttons**
```tsx
// ❌ Schlecht
<Button>
  <Heart className="w-4 h-4" />
</Button>

// ✅ Gut
<Button aria-label="Like this experience">
  <Heart className="w-4 h-4" aria-hidden="true" />
</Button>

// ✅ Noch besser (Tooltip)
<TooltipProvider>
  <Tooltip>
    <TooltipTrigger asChild>
      <Button aria-label="Like this experience">
        <Heart className="w-4 h-4" aria-hidden="true" />
      </Button>
    </TooltipTrigger>
    <TooltipContent>Like</TooltipContent>
  </Tooltip>
</TooltipProvider>
```

### **Pitfall 2: Focus-Trap in Modals**
```tsx
// ❌ Schlecht (Focus entkommt)
<Dialog open={open}>
  <DialogContent>
    <Input autoFocus />
    <Button>Save</Button>
  </DialogContent>
</Dialog>

// ✅ Gut (Focus-Trap via Radix-UI)
import * as DialogPrimitive from '@radix-ui/react-dialog'

// shadcn/ui Dialog nutzt Radix → automatischer Focus-Trap!
<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent>
    {/* Focus bleibt im Dialog */}
    <Input autoFocus />
    <Button>Save</Button>
  </DialogContent>
</Dialog>

// Custom-Focus-Trap-Hook
import { useFocusTrap } from '@mantine/hooks'

export function CustomDialog({ open, onClose }) {
  const ref = useRef<HTMLDivElement>(null)
  useFocusTrap(ref, open)

  return (
    <div ref={ref}>
      {/* Content */}
    </div>
  )
}
```

### **Pitfall 3: Live-Regions nicht genutzt**
```tsx
// ❌ Schlecht (Screen-Reader erfährt nichts)
const [likeCount, setLikeCount] = useState(0)

<Button onClick={() => setLikeCount(prev => prev + 1)}>
  <Heart /> {likeCount}
</Button>

// ✅ Gut (Announcement)
const [likeCount, setLikeCount] = useState(0)
const [announcement, setAnnouncement] = useState('')

const handleLike = () => {
  setLikeCount(prev => prev + 1)
  setAnnouncement('Experience liked')
  setTimeout(() => setAnnouncement(''), 1000)
}

<>
  <Button onClick={handleLike}>
    <Heart /> {likeCount}
  </Button>

  <div role="status" aria-live="polite" className="sr-only">
    {announcement}
  </div>
</>
```

### **Pitfall 4: Custom-Components ohne Semantik**
```tsx
// ❌ Schlecht
<div className="checkbox" onClick={toggle}>
  {checked && <CheckIcon />}
</div>

// ✅ Gut
<div
  role="checkbox"
  aria-checked={checked}
  tabIndex={0}
  onClick={toggle}
  onKeyDown={(e) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault()
      toggle()
    }
  }}
  className="checkbox focus-visible:ring-4"
>
  {checked && <CheckIcon aria-hidden="true" />}
</div>

// ✅ Am besten: Native-Element nutzen
<input
  type="checkbox"
  checked={checked}
  onChange={toggle}
  className="w-4 h-4"
/>
```

### **Pitfall 5: Form-Errors nicht verknüpft**
```tsx
// ❌ Schlecht
<Input id="email" />
{error && <p className="text-red-500">{error}</p>}

// ✅ Gut
<Input
  id="email"
  aria-invalid={!!error}
  aria-describedby={error ? 'email-error' : undefined}
/>
{error && (
  <p id="email-error" role="alert" className="text-destructive">
    {error}
  </p>
)}
```

---

## 🎨 Accessible-Design-Patterns

### **Pattern 1: Accessible-Cards**
```tsx
export function AccessibleExperienceCard({ experience }) {
  const router = useRouter()

  return (
    <article
      role="article"
      aria-labelledby={`exp-title-${experience.id}`}
      className="group"
    >
      {/* Image */}
      <Link
        href={`/experiences/${experience.id}`}
        aria-label={`View ${experience.title} by ${experience.user.username}`}
      >
        <div className="relative aspect-video">
          <Image
            src={experience.heroImage}
            alt={`Thumbnail for ${experience.title}`}
            fill
            className="object-cover"
          />
        </div>
      </Link>

      {/* Content */}
      <div className="p-4">
        <h3
          id={`exp-title-${experience.id}`}
          className="font-semibold mb-2"
        >
          <Link
            href={`/experiences/${experience.id}`}
            className="hover:text-primary focus-visible:text-primary focus-visible:outline-none"
          >
            {experience.title}
          </Link>
        </h3>

        <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
          {experience.content}
        </p>

        {/* Meta */}
        <div className="flex items-center justify-between">
          <Link
            href={`/@${experience.user.username}`}
            className="flex items-center gap-2 hover:opacity-80 focus-visible:ring-2 focus-visible:ring-primary rounded"
          >
            <Avatar src={experience.user.avatar} size="xs" />
            <span className="text-sm">@{experience.user.username}</span>
          </Link>

          <div
            className="flex items-center gap-3 text-sm text-muted-foreground"
            aria-label="Engagement statistics"
          >
            <span aria-label={`${experience.likeCount} likes`}>
              <Heart className="w-4 h-4 inline mr-1" aria-hidden="true" />
              {experience.likeCount}
            </span>
            <span aria-label={`${experience.commentCount} comments`}>
              <MessageSquare className="w-4 h-4 inline mr-1" aria-hidden="true" />
              {experience.commentCount}
            </span>
          </div>
        </div>
      </div>
    </article>
  )
}
```

### **Pattern 2: Accessible-Tabs**
```tsx
export function AccessibleTabs({ tabs, defaultValue }) {
  const [activeTab, setActiveTab] = useState(defaultValue)

  return (
    <div>
      <div role="tablist" aria-label="Experience sections">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            role="tab"
            aria-selected={activeTab === tab.value}
            aria-controls={`panel-${tab.value}`}
            id={`tab-${tab.value}`}
            onClick={() => setActiveTab(tab.value)}
            onKeyDown={(e) => {
              const currentIndex = tabs.findIndex(t => t.value === tab.value)

              if (e.key === 'ArrowRight') {
                const nextTab = tabs[(currentIndex + 1) % tabs.length]
                setActiveTab(nextTab.value)
                document.getElementById(`tab-${nextTab.value}`)?.focus()
              } else if (e.key === 'ArrowLeft') {
                const prevTab = tabs[(currentIndex - 1 + tabs.length) % tabs.length]
                setActiveTab(prevTab.value)
                document.getElementById(`tab-${prevTab.value}`)?.focus()
              }
            }}
            className={cn(
              "px-4 py-2 border-b-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
              activeTab === tab.value
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {tabs.map((tab) => (
        <div
          key={tab.value}
          role="tabpanel"
          id={`panel-${tab.value}`}
          aria-labelledby={`tab-${tab.value}`}
          hidden={activeTab !== tab.value}
          className="py-4"
        >
          {tab.content}
        </div>
      ))}
    </div>
  )
}
```

### **Pattern 3: Accessible-Command-Palette**
```tsx
export function AccessibleCommandPalette() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput
        placeholder="Search experiences..."
        aria-label="Search experiences"
      />

      <CommandList role="listbox" aria-label="Search results">
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Categories" role="group" aria-label="Categories">
          {categories.map((cat) => (
            <CommandItem
              key={cat.slug}
              value={cat.slug}
              onSelect={() => {
                router.push(`/browse?category=${cat.slug}`)
                setOpen(false)
              }}
              role="option"
            >
              <span className="mr-2" aria-hidden="true">{cat.icon}</span>
              <span>{cat.name}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Suggestions" role="group" aria-label="Suggestions">
          <CommandItem
            value="bodensee-solar"
            onSelect={() => {
              router.push('/browse?q=bodensee+solar')
              setOpen(false)
            }}
            role="option"
          >
            <Sparkles className="mr-2 w-4 h-4" aria-hidden="true" />
            <span>Bodensee + Solar-Sturm</span>
            <Badge variant="secondary" className="ml-auto">
              Trending
            </Badge>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
```

---

## 📱 Mobile-Accessibility

### **Touch-Targets (Min. 44x44px)**
```css
/* Tailwind-Config */
module.exports = {
  theme: {
    extend: {
      minHeight: {
        'touch': '44px'
      },
      minWidth: {
        'touch': '44px'
      }
    }
  }
}

/* Usage */
<Button className="min-h-touch min-w-touch">
  Submit
</Button>

/* Icons in Buttons */
<Button className="p-3"> {/* 12px padding + 20px icon = 44px */}
  <Heart className="w-5 h-5" />
</Button>
```

### **Swipe-Gestures (Announce)**
```tsx
// Swipeable-Tabs mit Announcement
export function SwipeableTabs({ tabs }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [announcement, setAnnouncement] = useState('')

  const handlers = useSwipeable({
    onSwipedLeft: () => {
      const nextIndex = Math.min(activeIndex + 1, tabs.length - 1)
      setActiveIndex(nextIndex)
      setAnnouncement(`Switched to ${tabs[nextIndex].label}`)
    },
    onSwipedRight: () => {
      const prevIndex = Math.max(activeIndex - 1, 0)
      setActiveIndex(prevIndex)
      setAnnouncement(`Switched to ${tabs[prevIndex].label}`)
    }
  })

  return (
    <>
      <div {...handlers}>
        {/* Tab-Content */}
      </div>

      <div role="status" aria-live="polite" className="sr-only">
        {announcement}
      </div>
    </>
  )
}
```

---

## 🎯 Implementation-Checklist

### **Level 1: Foundation (Must-Have)**
- [ ] Semantic-HTML (headings, landmarks, lists)
- [ ] Alt-Texte für alle Bilder
- [ ] Keyboard-Navigation (alle Funktionen)
- [ ] Focus-Visible (immer sichtbar)
- [ ] Skip-Links
- [ ] Color-Contrast (WCAG AA: 4.5:1)
- [ ] Form-Labels verknüpft
- [ ] ARIA-Landmarks
- [ ] Valid-HTML

### **Level 2: Enhanced (Should-Have)**
- [ ] Screen-Reader-Tests (NVDA, VoiceOver)
- [ ] Live-Regions (Announcements)
- [ ] Error-Prevention (Confirmations)
- [ ] Timeout-Warnings
- [ ] Motion-Safe (prefers-reduced-motion)
- [ ] Touch-Targets (44x44px)
- [ ] Zoom-Support (200%)

### **Level 3: Advanced (Nice-to-Have)**
- [ ] ARIA-Descriptions (komplexe Komponenten)
- [ ] Custom-Focus-Order (wo sinnvoll)
- [ ] Heading-Navigation-Support
- [ ] Voice-Control-kompatibel
- [ ] High-Contrast-Mode-Support
- [ ] Screen-Reader-Virtual-Cursor-Support

### **Testing**
- [ ] axe-DevTools (Chrome-Extension)
- [ ] Lighthouse-CI (Automated)
- [ ] Playwright-axe (E2E)
- [ ] NVDA-Test (Windows)
- [ ] VoiceOver-Test (macOS/iOS)
- [ ] TalkBack-Test (Android)
- [ ] Keyboard-only-Test
- [ ] Color-Contrast-Check
- [ ] Zoom-Test (200%)

---

## 📚 Resources

### **Tools**
- **axe DevTools:** https://www.deque.com/axe/devtools/
- **WAVE:** https://wave.webaim.org/
- **Lighthouse:** Chrome DevTools
- **Contrast-Checker:** https://webaim.org/resources/contrastchecker/
- **ARIA-Authoring-Practices:** https://www.w3.org/WAI/ARIA/apg/

### **Screen-Readers**
- **NVDA (Windows):** https://www.nvaccess.org/ (kostenlos)
- **JAWS (Windows):** https://www.freedomscientific.com/products/software/jaws/
- **VoiceOver (macOS/iOS):** Built-in (Cmd+F5)
- **TalkBack (Android):** Built-in

### **Docs**
- **WCAG 2.1:** https://www.w3.org/WAI/WCAG21/quickref/
- **MDN-Accessibility:** https://developer.mozilla.org/en-US/docs/Web/Accessibility
- **Radix-UI-Primitives:** https://www.radix-ui.com/primitives (shadcn/ui nutzt das!)
- **A11y-Project:** https://www.a11yproject.com/

---

## 🚨 Legal-Requirements

### **EU Accessibility Act (ab 2025)**
- Gilt für: E-Commerce, Banking, Transport, **Digital-Services**
- XP-Share = Digital-Service → **MUSS WCAG AA erfüllen**
- Strafen: Bis zu 4% Jahresumsatz

### **Americans with Disabilities Act (ADA)**
- Gilt für: US-basierte Services
- Keine expliziten Standards, aber: WCAG 2.1 AA = Safe-Harbor
- Klagen möglich bei Nicht-Compliance

### **DSGVO (Accessibility-Aspekt)**
- Art. 21: Recht auf Zugang zu Informationen
- Betrifft auch Menschen mit Behinderungen
- Accessibility = Teil der Compliance

---

## ✅ Final-Checklist (Production)

### **Before-Launch**
```bash
# 1. Automated-Tests
npm run test:a11y          # Playwright-axe
npm run lighthouse         # Lighthouse-CI

# 2. Manual-Tests
- [ ] Keyboard-only-Navigation (30 Min)
- [ ] NVDA-Test (Windows, 30 Min)
- [ ] VoiceOver-Test (macOS, 30 Min)
- [ ] Zoom-Test 200% (15 Min)
- [ ] Color-Contrast-Check (DevTools)

# 3. Documentation
- [ ] Accessibility-Statement auf Website
- [ ] Kontakt für Accessibility-Issues
- [ ] Roadmap für weitere Verbesserungen

# 4. CI/CD
- [ ] axe-Tests in Pipeline
- [ ] Lighthouse-CI configured
- [ ] Contrast-Check in Build
```

### **Accessibility-Statement (Pflicht)**
```markdown
# Accessibility-Statement

XP-Share ist bestrebt, eine barrierefreie Plattform für alle User zu sein.

## Compliance-Status
- WCAG 2.1 Level AA: **Konform**
- Getestet mit: NVDA, VoiceOver, Lighthouse, axe

## Bekannte-Einschränkungen
- Map-View: Teilweise eingeschränkt für Screen-Reader
- Graph-Visualisierung: Alternative-Text-Beschreibung verfügbar

## Feedback
Bei Accessibility-Problemen kontaktieren Sie uns:
- Email: accessibility@xp-share.com
- Antwort innerhalb: 2 Werktage

## Letzte-Prüfung
05. Januar 2025
```

---

*Stand: 2025-01-05 (ACCESSIBILITY v1.0)*
