# Conversational Canvas 2.0 - Implementation Documentation

## 🎯 Overview

Ein komplett neues, immersives Eintragungserlebnis für XP Share unter `/newxp2` - ein vollbildiger, interaktiver Canvas mit 7 durchdachten Phasen.

## 🚀 Quick Start

```bash
# Development
npm run dev

# Navigate to
http://localhost:3000/newxp2
```

## 📂 Projektstruktur

```
app/[locale]/newxp2/
├── layout.tsx                    # Fullscreen dark layout
├── page.tsx                      # Main orchestrator with phase routing
└── success/
    └── page.tsx                  # Success page with pattern matching results

components/newxp2/
├── phases/
│   ├── Phase1Entry.tsx           # ✍️ Text/Voice input with pulsing orb
│   ├── Phase2LiveExtraction.tsx  # ✨ Live AI extraction with floating cards
│   ├── Phase3Witnesses.tsx       # 👥 Witness management (placeholder)
│   ├── Phase4Media.tsx           # 📸 Media upload with drag & drop
│   ├── Phase5CanvasPreview.tsx   # 👁️ Visual story preview with completion score
│   ├── Phase6Privacy.tsx         # 🔒 Privacy selection with countdown
│   └── Phase7PatternMatch.tsx    # 🌌 Pattern matching results
│
├── canvas/
│   ├── CosmicBackground.tsx      # Animated star field with gradients
│   ├── PulsingOrb.tsx            # Morphing orb (idle/listening/thinking/celebrating)
│   └── FloatingCard.tsx          # Glassmorphism cards with drag & inline edit
│
├── effects/
│   └── ConfettiEffect.tsx        # Confetti celebration effect
│
└── ui/
    ├── XPBadge.tsx               # Persistent XP counter with gain animations
    └── AchievementPopup.tsx      # Achievement unlock popup

lib/stores/
└── newxp2Store.ts                # Zustand store with phase management
```

## 🎨 Die 7 Phasen

### Phase 1: Entry - "Speak Your Mind"
**Features:**
- Pulsing Orb in der Mitte (Apple Siri-Style)
- Text/Voice Toggle mit smooth transition
- Voice: Orb transformiert zu Waveform mit Audio-Visualisierung
- Text: Auto-focus Textarea mit Char/Word Counter
- Auto-Extraction nach 50+ Zeichen

**Components:** `Phase1Entry.tsx`, `PulsingOrb.tsx`, `CosmicBackground.tsx`

### Phase 2: Live Extraction - "The Magic Happens"
**Features:**
- Floating Cards erscheinen mit Staggered Animation
- Glassmorphism UI (backdrop-blur, borders)
- Magnetic snap positioning
- Inline-Edit durch Card-Tap
- Confidence Score als Farbe (grün → gelb → rot)
- Drag & Drop für Repositionierung

**Components:** `Phase2LiveExtraction.tsx`, `FloatingCard.tsx`

### Phase 3: Witnesses - "Who Was There?"
**Features:**
- Witness-Management (placeholder - zu implementieren)
- Swipe-to-Connect Interface (geplant)
- Platform/Email/Link Invite options

**Components:** `Phase3Witnesses.tsx`

### Phase 4: Media - "Show, Don't Just Tell"
**Features:**
- Drag & Drop Upload Zone
- Multi-file support (images, video, audio)
- Upload progress indicators
- Preview grid mit Remove buttons
- OCR-ready (zu integrieren)

**Components:** `Phase4Media.tsx`

### Phase 5: Preview - "See Your Story Take Shape"
**Features:**
- Circular progress ring (SVG)
- Visual story preview mit Hero Image
- Completion Score (0-100%)
- Missing suggestions list
- Metadata display (location, date, category, tags)

**Components:** `Phase5CanvasPreview.tsx`

### Phase 6: Privacy - "Your Story, Your Rules"
**Features:**
- 3 Privacy Levels (Public/Anonymous/Private)
- XP Rewards anzeigen (+50/+30/+10)
- Morphing Icons bei Selection
- Countdown Animation (3-2-1)
- Publish mit Sound/Haptic (optional)

**Components:** `Phase6Privacy.tsx`

### Phase 7: Pattern Matching - "You're Not Alone"
**Features:**
- "Searching the Cosmos..." Loading Animation
- Pattern Match Results als Cards
- Similarity Score (%)
- Insights Display ("12 people saw similar...")
- Auto-redirect zu Success Page

**Components:** `Phase7PatternMatch.tsx`

## 🎯 State Management

### Store Structure (`newxp2Store.ts`)

```typescript
interface NewXP2Store {
  // Phase Management
  currentPhase: Phase (1-7)
  setPhase, nextPhase, previousPhase, canProceed()

  // Canvas State
  cosmicAnimationEnabled: boolean
  orbState: 'idle' | 'listening' | 'thinking' | 'celebrating'

  // Input (Phase 1)
  inputMode: 'text' | 'voice'
  rawText, setText, isRecording, audioWaveform

  // Extraction (Phase 2)
  extractedData, floatingCards, triggerExtraction()

  // Witnesses (Phase 3)
  witnesses, swipeWitness()

  // Media (Phase 4)
  mediaFiles, uploadMedia(), removeMedia()

  // Preview (Phase 5)
  completionScore, missingSuggestions, calculateCompletion()

  // Privacy (Phase 6)
  privacyLevel, setPrivacy(), publish()

  // Pattern Matching (Phase 7)
  patternMatches, constellation, insights, findPatterns()

  // Gamification
  totalXP, achievements, addXP(), unlockAchievement(), triggerConfetti()
}
```

### Persistence
- LocalStorage via Zustand Persist
- Saved: `rawText`, `extractedData`, `privacyLevel`, `currentPhase`
- Session: Media files, witnesses, patterns

## 🎨 Design System

### Colors (Cosmic Theme)
```css
--cosmic-bg-start: #0a0a1a
--cosmic-bg-end: #1a0a2e
--cosmic-accent: #6366f1 (blue-500)
--cosmic-glow: #a855f7 (purple-500)
--cosmic-star: #fbbf24 (yellow-400)
```

### Glassmorphism
```css
background: rgba(255, 255, 255, 0.1)
backdrop-filter: blur(20px)
border: 1px solid rgba(255, 255, 255, 0.2)
```

### Animations
- **Entry:** Fade in + Scale spring
- **Phase Transitions:** Slide horizontal (x: -100 → 0 → 100)
- **Floating Cards:** Fly in from random position, bounce settle
- **Orb:** Continuous pulse (scale + opacity)
- **Confetti:** 3s burst from center

## 📡 API Integration

### Bestehende Endpoints
```typescript
POST /api/extract                      # AI text extraction ✅
POST /api/media/upload                 # Media upload ✅
POST /api/transcribe                   # Voice to text ✅
POST /api/experiences                  # Publish experience ✅
POST /api/patterns/similar-experiences # Pattern matching ✅
```

### Neue Endpoints (optional)
```typescript
POST /api/newxp2/questions             # Dynamic question generation
POST /api/witnesses/search             # Witness platform search
POST /api/ocr                          # OCR for documents
```

## 🎮 User Flow

```
1. User visits /newxp2
   ↓
2. Phase 1: Choose Text or Voice
   ↓ (min 50 chars)
3. Phase 2: AI extracts data → Floating Cards appear
   ↓ (min 2 high-confidence fields)
4. Phase 3: Add witnesses (optional, can skip)
   ↓
5. Phase 4: Upload media (optional, can skip)
   ↓
6. Phase 5: Review story preview
   ↓
7. Phase 6: Select privacy → Countdown → Publish
   ↓
8. Phase 7: Pattern matching animation
   ↓
9. Success page → View/Share/New Experience
```

## 🎯 Key Features

### ✨ Immersive Animations
- Framer Motion for all transitions
- Spring physics for natural feel
- Staggered animations for cards
- Particle system for background

### 🎨 Modern UI
- Dark mode first
- Glassmorphism throughout
- Cosmic theme with gradients
- Responsive (Mobile/Tablet/Desktop)

### 🎧 Audio Features
- Voice recording with waveform
- Real-time audio visualization (Canvas API)
- Transcription via OpenAI Whisper

### 🎯 Gamification
- XP system (+5 to +50 per action)
- Achievement unlocks
- Confetti celebrations
- Progress tracking

### ♿ Accessibility
- Keyboard navigation
- ARIA labels
- Focus management
- Skip links

## 🐛 Known Issues / TODOs

### Zu implementieren:
- [ ] Witness search & invite system (Phase 3)
- [ ] OCR integration (Phase 4)
- [ ] Dynamic questions API (Phase 2)
- [ ] Sound effects (optional)
- [ ] Haptic feedback (mobile)
- [ ] AR Preview (future)
- [ ] Collaborative editing (future)

### Performance:
- [ ] Reduce particle count on low-end devices
- [ ] Lazy load phase components
- [ ] Optimize waveform rendering
- [ ] Add service worker for offline

## 🔧 Development

### Adding a new Phase
1. Create `PhaseXNewName.tsx` in `components/newxp2/phases/`
2. Add to `page.tsx` phase router
3. Update `NewXP2Store` interface
4. Add navigation logic
5. Update phase indicator

### Adding new Floating Card field
1. Update `ExtractedData` type in store
2. Add to extraction prompt in `/api/extract`
3. Card will auto-appear if confidence > 60

### Styling Guidelines
- Use Tailwind classes
- Glassmorphism: `bg-white/10 backdrop-blur-xl border border-white/20`
- Gradients: `bg-gradient-to-r from-blue-500 to-purple-500`
- Animations: Framer Motion with spring physics
- Dark text: `text-white` / `text-white/60` / `text-white/40`

## 📊 Analytics Events (geplant)

```typescript
// Track user progress
analytics.track('newxp2_phase_entered', { phase: 1-7 })
analytics.track('newxp2_input_mode_changed', { mode: 'text' | 'voice' })
analytics.track('newxp2_card_edited', { field: string })
analytics.track('newxp2_published', { privacy: string, xp: number })
```

## 🚀 Deployment

```bash
# Build
npm run build

# Test production build
npm run start

# Deploy to Vercel
vercel --prod
```

## 📝 Notes

- Store persists to localStorage → User kann Session fortsetzen
- Cosmic background uses CSS animations (performant)
- Waveform uses Canvas API (60 FPS)
- All transitions use GPU-accelerated transforms
- Mobile: Touch gestures for swipe
- Desktop: Keyboard shortcuts (←/→ for phases)

## 🎉 Credits

Implementiert mit:
- Next.js 15
- Framer Motion
- Zustand
- Tailwind CSS
- canvas-confetti
- OpenAI API

---

**Version:** 1.0
**Last Updated:** 2025-10-10
**Status:** ✅ Ready for testing
