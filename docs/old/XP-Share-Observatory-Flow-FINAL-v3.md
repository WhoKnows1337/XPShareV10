# XP Share - Complete Entry Flow: Observatory Design System v3.0

## 🎨 Design System: "Observatory" - Scientific Mysticism

### Design Philosophy
**"Observatory Protocol"** - A blend of:
- **Research Laboratory:** Scientific, trustworthy, precise
- **Astronomical Observatory:** Discovery, patterns, stars
- **Warm Humanity:** Not cold-corporate, but inviting

The design communicates: "We take your experience seriously. We analyze with scientific methodology. We find patterns."

### Color Palette
```css
:root {
  /* Backgrounds - Deep Space */
  --space-deep: #0f1419;        /* Almost black, midnight */
  --space-mid: #1a2332;          /* Deep blue-grey */
  --space-light: #26354a;        /* Lighter panels */
  
  /* Primary Accent - Warm Scientific */
  --observatory-gold: #d4a574;   /* Warm brass/bronze */
  --observatory-light: #e8dcc0;  /* Parchment/moonlight */
  
  /* Text */
  --text-primary: #e8dcc0;       /* Primary readable */
  --text-secondary: rgba(232, 220, 192, 0.7);
  --text-tertiary: rgba(232, 220, 192, 0.5);
  --text-monospace: rgba(232, 220, 192, 0.5); /* For data/labels */
  
  /* Success/Error (scientific) */
  --success: #7fb069;            /* Soft green, not aggressive */
  --error: #d4726a;              /* Soft red, not alarming */
  --warning: #d4a574;            /* Same as accent */
  
  /* Glassmorphism */
  --glass-bg: rgba(26, 35, 50, 0.6);
  --glass-border: rgba(232, 220, 192, 0.15);
  --glass-backdrop: blur(20px);
}
```

### Typography
```css
/* Font Stack */
--font-primary: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 
                'Segoe UI', system-ui, sans-serif;
--font-monospace: 'SF Mono', 'Monaco', 'Cascadia Code', 
                  'Consolas', monospace;

/* Hierarchy */
--text-xs: 11px;   /* Labels, metadata */
--text-sm: 13px;   /* Body, descriptions */
--text-base: 15px; /* Primary text */
--text-lg: 18px;   /* Subheadings */
--text-xl: 24px;   /* Section titles */
--text-2xl: 28px;  /* Main headings */

/* Weights */
--font-regular: 400;
--font-medium: 500;
--font-semibold: 600;

/* Line Heights */
--leading-tight: 1.3;
--leading-normal: 1.6;
--leading-relaxed: 1.7;
```

### Animations & Accessibility

```css
/* Smooth Transitions */
--transition-fast: 150ms;
--transition-base: 200ms;
--transition-slow: 300ms;
--transition-slower: 500ms;

--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in: cubic-bezier(0.4, 0, 1, 1);

/* Subtle Glow Effect */
@keyframes gentle-glow {
  0%, 100% { 
    box-shadow: 0 0 10px rgba(212, 165, 116, 0.2);
  }
  50% { 
    box-shadow: 0 0 20px rgba(212, 165, 116, 0.3);
  }
}

/* Twinkling Stars */
@keyframes twinkle {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 1; }
}

/* CRITICAL: Accessibility */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Spacing System
```css
:root {
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;
  --space-20: 80px;
}
```

### Border Radius
```css
:root {
  --radius-sm: 6px;
  --radius-base: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 24px;
  --radius-full: 9999px;
}
```

---

## 🌟 Global Components

### Header Navigation
```
┌──────────────────────────────────────────────┐
│  🔭 XP Share                          ℹ INFO │
│  Pattern Observatory                         │
└──────────────────────────────────────────────┘
```

**Design:**
- Fixed top, transparent background with backdrop blur
- Observatory telescope icon (🔭)
- Monospace label "Pattern Observatory"
- Info button (ℹ) reveals protocol explanation

**Info Panel (Expandable):**
```
┌──────────────────────────────────────────────┐
│  Observatory Protocol: Share your experience │
│  in detail. Our pattern recognition system   │
│  analyzes semantic similarities, temporal    │
│  clusters, and geographic correlations to    │
│  find connections others may have missed.    │
└──────────────────────────────────────────────┘
```

### Progress Indicator (Dynamic)
```
┌──────────────────────────────────────────────┐
│  Step 2 of 4                    PROGRESS 50% │
│  [████████████░░░░░░░░]                      │
└──────────────────────────────────────────────┘
```

**Features:**
- Dynamic step counter (not fixed "Phase 1/4")
- Shows actual steps based on user path
- Glassmorphism background
- Gradient progress bar (gold → light)
- Glowing dot at progress point

**Styling:**
```css
.progress-indicator {
  position: fixed;
  top: 60px;
  left: 0;
  right: 0;
  z-index: 100;
  background: rgba(26, 35, 50, 0.6);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(232, 220, 192, 0.1);
  padding: 16px 20px;
}

.progress-text {
  font-size: 13px;
  font-family: var(--font-monospace);
  color: rgba(232, 220, 192, 0.7);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 8px;
}

.progress-bar {
  height: 2px;
  background: rgba(232, 220, 192, 0.1);
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #d4a574, #e8dcc0);
  transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.progress-dot {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 4px;
  background: #e8dcc0;
  border-radius: 50%;
  box-shadow: 0 0 8px rgba(232, 220, 192, 0.6);
}
```

### Background Environment

**Starfield:**
- Fixed position, top half of screen
- Subtle twinkling stars (40-50 dots)
- Random sizes (1-2px)
- Low opacity (0.15)
- Different animation delays for natural effect

```css
.starfield {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 50%;
  opacity: 0.15;
  pointer-events: none;
}

.star {
  position: absolute;
  width: 1px;
  height: 1px;
  background: #e8dcc0;
  border-radius: 50%;
  animation: twinkle 3s ease-in-out infinite;
}
```

---

## 📝 SCREEN 1: Text Input + Voice + OCR

### Layout Overview
```
┌──────────────────────────────────────────────┐
│  [Header]                                    │
│  [Progress: Step 1 of 4 - 25%]              │
├──────────────────────────────────────────────┤
│                                              │
│  Dokumentiere deine Erfahrung                │
│  ═══                                         │
│                                              │
│  Beschreibe was passiert ist. Je            │
│  detaillierter, desto besser kann das       │
│  System Muster erkennen.                    │
│                                              │
│  ┌────────────────────────────────────────┐ │
│  │ ENTRY.TXT                              │ │
│  │                                        │ │
│  │ Last night at 3:33 AM, I observed...▌ │ │
│  │                                        │ │
│  │                                        │ │
│  │ WORD_COUNT: 0047                       │ │
│  │ → MORE DETAIL RECOMMENDED              │ │
│  │ [████████░░░░░░░░] 47/50              │ │
│  └────────────────────────────────────────┘ │
│                                              │
│  [🎤 Diktat] [📄 Notiz einscannen]         │
│                          [Weiter →]          │
│                                              │
│  🔒 Deine Daten bleiben verschlüsselt       │
└──────────────────────────────────────────────┘
```

### Main Card Design

```css
.entry-card {
  max-width: 800px;
  margin: 0 auto;
  background: rgba(26, 35, 50, 0.6);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(232, 220, 192, 0.15);
  border-radius: 16px;
  padding: 36px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  position: relative;
}
```

### Header Section

```css
.section-title {
  font-size: 28px;
  font-weight: 600;
  color: #e8dcc0;
  letter-spacing: -0.02em;
  margin-bottom: 8px;
}

.title-accent {
  width: 40px;
  height: 2px;
  background: linear-gradient(90deg, #d4a574, transparent);
  margin-bottom: 16px;
}

.section-description {
  color: rgba(232, 220, 192, 0.7);
  font-size: 15px;
  line-height: 1.7;
  max-width: 600px;
}
```

### Text Input Area

```css
.entry-label {
  position: absolute;
  left: 12px;
  top: 12px;
  font-size: 10px;
  font-family: var(--font-monospace);
  color: rgba(232, 220, 192, 0.3);
  letter-spacing: 0.05em;
  pointer-events: none;
}

.entry-textarea {
  width: 100%;
  min-height: 220px;
  background: rgba(15, 20, 25, 0.8);
  border: 1px solid rgba(232, 220, 192, 0.2);
  border-radius: 10px;
  padding: 36px 16px 16px 16px;
  color: #e8dcc0;
  font-size: 15px;
  line-height: 1.7;
  resize: vertical;
  outline: none;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.entry-textarea:focus {
  border-color: rgba(212, 165, 116, 0.5);
  box-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.4), 
    0 0 0 3px rgba(212, 165, 116, 0.1);
}

.entry-textarea::placeholder {
  color: rgba(232, 220, 192, 0.3);
}

/* Custom Scrollbar */
.entry-textarea::-webkit-scrollbar {
  width: 8px;
}

.entry-textarea::-webkit-scrollbar-track {
  background: rgba(15, 20, 25, 0.5);
  border-radius: 4px;
}

.entry-textarea::-webkit-scrollbar-thumb {
  background: rgba(232, 220, 192, 0.2);
  border-radius: 4px;
}

.entry-textarea::-webkit-scrollbar-thumb:hover {
  background: rgba(232, 220, 192, 0.3);
}
```

### Word Count & Progress

**Display:**
```
WORD_COUNT: 0047
→ MORE DETAIL RECOMMENDED
[████████░░░░░░░░] 47/50
```

**Milestone System:**
```javascript
const MILESTONES = {
  bronze: { words: 50, xp: 20, color: '#d4a574', label: '✓ OPTIMAL' },
  silver: { words: 150, xp: 50, color: '#C0C0C0', label: '✓ DETAILED' },
  gold: { words: 300, xp: 100, color: '#e8dcc0', label: '✓ COMPREHENSIVE' },
  platinum: { words: 500, xp: 200, color: '#f0f0f0', label: '✓ EXCEPTIONAL' }
};
```

```css
.word-counter {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 12px;
  font-family: var(--font-monospace);
  color: rgba(232, 220, 192, 0.5);
  margin-top: 12px;
}

.word-count-value {
  letter-spacing: 0.05em;
}

.word-count-status {
  color: #d4a574;
  transition: color 0.3s ease;
}

.word-count-status.optimal {
  color: #7fb069;
}
```

### Voice Input Button

```css
.voice-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 18px;
  background: rgba(232, 220, 192, 0.05);
  border: 1px solid rgba(232, 220, 192, 0.2);
  border-radius: 8px;
  color: rgba(232, 220, 192, 0.7);
  font-size: 13px;
  font-weight: 500;
  font-family: var(--font-monospace);
  letter-spacing: 0.02em;
  cursor: pointer;
  transition: all 0.2s ease;
}

.voice-button:hover {
  background: rgba(232, 220, 192, 0.08);
  border-color: rgba(232, 220, 192, 0.3);
  transform: scale(1.02);
}

.voice-button.recording {
  background: rgba(212, 165, 116, 0.15);
  border-color: rgba(212, 165, 116, 0.4);
  color: #d4a574;
}
```

### OCR Feature - "Notiz einscannen"

**User clicks "📄 Notiz einscannen":**

```
┌──────────────────────────────────────────────┐
│  Handgeschriebene Notiz einscannen          │
│                                              │
│  [📷 Foto aufnehmen] [📁 Bild hochladen]    │
│                                              │
│  ┌────────────────────────────────────────┐ │
│  │ [Vorschau des Bildes]                  │ │
│  │                                        │ │
│  │ Analysiere Text... 🔄                  │ │
│  └────────────────────────────────────────┘ │
└──────────────────────────────────────────────┘
```

**After OCR Processing (~2-3 seconds):**

```
┌──────────────────────────────────────────────┐
│  ✅ Text erkannt                             │
│                                              │
│  ┌────────────────────────────────────────┐ │
│  │ Erkannter Text:                        │ │
│  │                                        │ │
│  │ 3:33 AM, blue triangular object       │ │
│  │ hovering over Alexanderplatz          │ │
│  │ Silent, no sound                      │ │
│  │ Disappeared after 5 minutes           │ │
│  │                                        │ │
│  │ [✏️ Bearbeiten] [✓ Übernehmen]         │ │
│  └────────────────────────────────────────┘ │
└──────────────────────────────────────────────┘
```

**OCR Implementation:**

```javascript
const OCRProcessor = ({ file, onTextExtracted }) => {
  const [status, setStatus] = useState('processing');
  const [text, setText] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    extractTextFromImage(file)
      .then(extracted => {
        setText(extracted);
        setStatus('complete');
      })
      .catch(error => {
        setStatus('error');
        toast.error('Text konnte nicht erkannt werden');
      });
  }, [file]);

  const handleInsert = () => {
    onTextExtracted(text);
    toast.success('Text wurde eingefügt!');
  };

  if (status === 'processing') {
    return (
      <div className="ocr-processing">
        <Spinner />
        <span>Analysiere Text...</span>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="ocr-error">
        <span>❌ Fehler beim Erkennen</span>
        <button onClick={() => setStatus('idle')}>Erneut versuchen</button>
      </div>
    );
  }

  return (
    <div className="ocr-result">
      <div className="ocr-badge">✅ Text erkannt</div>
      
      {isEditing ? (
        <textarea 
          value={text} 
          onChange={(e) => setText(e.target.value)}
          className="ocr-edit-field"
        />
      ) : (
        <pre className="ocr-text">{text}</pre>
      )}
      
      <div className="ocr-actions">
        <button onClick={() => setIsEditing(!isEditing)}>
          {isEditing ? '✓ Fertig' : '✏️ Bearbeiten'}
        </button>
        <button onClick={handleInsert} className="ocr-insert-btn">
          ✓ Übernehmen
        </button>
      </div>
    </div>
  );
};

// Backend OCR function
const extractTextFromImage = async (file) => {
  // Option 1: Client-side with Tesseract.js
  const result = await Tesseract.recognize(file, 'deu+eng', {
    logger: m => console.log(m)
  });
  return result.data.text;
  
  // Option 2: Server-side with Google Vision API
  // const formData = new FormData();
  // formData.append('image', file);
  // const response = await fetch('/api/ocr', {
  //   method: 'POST',
  //   body: formData
  // });
  // return response.json().text;
};
```

**Styling:**

```css
.ocr-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 20, 25, 0.95);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.ocr-modal {
  max-width: 600px;
  width: 90%;
  background: rgba(26, 35, 50, 0.95);
  border: 1px solid rgba(232, 220, 192, 0.2);
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}

.ocr-processing {
  text-align: center;
  padding: 40px;
}

.ocr-badge {
  display: inline-block;
  padding: 6px 12px;
  background: rgba(127, 176, 105, 0.15);
  border: 1px solid rgba(127, 176, 105, 0.3);
  border-radius: 6px;
  color: #7fb069;
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 16px;
}

.ocr-text {
  padding: 16px;
  background: rgba(15, 20, 25, 0.6);
  border: 1px solid rgba(232, 220, 192, 0.15);
  border-radius: 8px;
  color: #e8dcc0;
  font-size: 14px;
  line-height: 1.7;
  white-space: pre-wrap;
  margin-bottom: 16px;
}

.ocr-edit-field {
  width: 100%;
  min-height: 120px;
  padding: 16px;
  background: rgba(15, 20, 25, 0.6);
  border: 1px solid rgba(232, 220, 192, 0.2);
  border-radius: 8px;
  color: #e8dcc0;
  font-size: 14px;
  line-height: 1.7;
  resize: vertical;
  margin-bottom: 16px;
}

.ocr-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.ocr-insert-btn {
  padding: 10px 20px;
  background: linear-gradient(135deg, #7fb069, #8fc979);
  color: #0f1419;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.ocr-insert-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(127, 176, 105, 0.3);
}
```

### Continue Button

```css
.continue-button {
  margin-left: auto;
  padding: 12px 28px;
  background: linear-gradient(135deg, #d4a574, #e8dcc0);
  color: #0f1419;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  font-family: var(--font-monospace);
  letter-spacing: 0.05em;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(212, 165, 116, 0.3);
}

.continue-button:disabled {
  background: rgba(232, 220, 192, 0.1);
  color: rgba(232, 220, 192, 0.3);
  box-shadow: none;
  cursor: not-allowed;
}

.continue-button:not(:disabled):hover {
  transform: scale(1.02);
  box-shadow: 0 6px 16px rgba(212, 165, 116, 0.4);
}
```

### Privacy Notice

```css
.privacy-panel {
  margin-top: 24px;
  padding: 20px;
  background: rgba(232, 220, 192, 0.02);
  border: 1px solid rgba(232, 220, 192, 0.08);
  border-radius: 10px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.privacy-icon {
  font-size: 16px;
  flex-shrink: 0;
  opacity: 0.5;
}

.privacy-text {
  font-size: 13px;
  color: rgba(232, 220, 192, 0.6);
  line-height: 1.6;
}
```

---

## ✨ SCREEN 2: AI Analysis + Questions

### Transition Animation
- Smooth transition from Screen 1
- Loading overlay: "Analysiere deine Erfahrung... 🧠"
- Duration: 2-3s for AI processing

### Layout
```
┌──────────────────────────────────────────────┐
│  [Progress: Step 2 of 4 - 50%]              │
├──────────────────────────────────────────────┤
│                                              │
│  ✨ Automatisch erkannt                      │
│  ═══                                         │
│                                              │
│  📝 TITEL                                    │
│  Blue Triangle Over Berlin        [✏️ Edit]  │
│                                              │
│  📂 KATEGORIE                                │
│  UFO Sighting                   [Change ▼]  │
│                                              │
│  🏷️ TAGS                                     │
│  [UFO] [Blue Light] [Triangle] [Berlin]     │
│  [Night] [Intelligent] [+ Add]               │
│                                              │
│  ──────────────────────────────────────────  │
│                                              │
│  📋 Pflichtangaben                           │
│  ═══                                         │
│                                              │
│  📅 Wann?                                    │
│  [11. Okt 2025 ▼] [03:33 ▼]                 │
│                                              │
│  📍 Wo?                                      │
│  [Berlin, Germany ▼]                         │
│                                              │
│  ⏱️ Dauer?                                   │
│  ○ <1 Min  ● 1-5 Min  ○ >5 Min              │
│                                              │
│  ──────────────────────────────────────────  │
│                                              │
│  💎 Bessere Muster-Erkennung?               │
│  ═══                                         │
│  Beantworte 8-10 Fragen für:                │
│  • Erweiterte Muster-Analyse                │
│  • +100 XP total                            │
│  • "Pattern Seeker" Badge                   │
│                                              │
│  Dauert ca. 5-8 Minuten                     │
│                                              │
│  [Nein danke] [Ja, Fragen zeigen ↓]         │
│                                              │
│                        [Weiter →]            │
└──────────────────────────────────────────────┘
```

### AI Results Section

```css
.ai-results-section {
  padding: 24px;
  background: rgba(232, 220, 192, 0.03);
  border: 1px solid rgba(232, 220, 192, 0.1);
  border-left: 3px solid #d4a574;
  border-radius: 10px;
  margin-bottom: 24px;
}

.ai-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  background: rgba(212, 165, 116, 0.15);
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  color: #d4a574;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 16px;
}

.ai-field {
  margin-bottom: 16px;
}

.ai-field-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  color: rgba(232, 220, 192, 0.6);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 8px;
}

.ai-title {
  font-size: 20px;
  font-weight: 700;
  color: #e8dcc0;
  padding: 12px;
  background: rgba(232, 220, 192, 0.03);
  border: 1px solid rgba(232, 220, 192, 0.1);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.ai-title:hover {
  background: rgba(232, 220, 192, 0.05);
  border-color: rgba(232, 220, 192, 0.2);
}
```

### Required Questions

```css
.required-section {
  margin-bottom: 24px;
}

.required-question {
  margin-bottom: 20px;
}

.question-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 600;
  color: #e8dcc0;
  margin-bottom: 12px;
}

.question-input {
  width: 100%;
  padding: 12px 16px;
  background: rgba(232, 220, 192, 0.05);
  border: 1px solid rgba(232, 220, 192, 0.2);
  border-radius: 8px;
  color: #e8dcc0;
  font-size: 15px;
  transition: all 0.2s ease;
}

.question-input:focus {
  outline: none;
  border-color: rgba(212, 165, 116, 0.5);
  box-shadow: 0 0 0 3px rgba(212, 165, 116, 0.1);
}

.radio-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.radio-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: rgba(232, 220, 192, 0.03);
  border: 1px solid rgba(232, 220, 192, 0.1);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.radio-option:hover {
  background: rgba(232, 220, 192, 0.05);
  border-color: rgba(232, 220, 192, 0.2);
}

.radio-option.selected {
  background: rgba(212, 165, 116, 0.15);
  border-color: rgba(212, 165, 116, 0.3);
}

.radio-option input[type="radio"] {
  width: 18px;
  height: 18px;
  accent-color: #d4a574;
}
```

### Extra Questions (Progressive Disclosure)

**When user clicks "Ja, Fragen zeigen":**

```
┌──────────────────────────────────────────────┐
│  💎 Extra Questions               3/10       │
│  ═══                                         │
│                                              │
│  ┌────────────────────────────────────────┐ │
│  │ ✓ Q1: Physical effects?     +10 XP ✓  │ │← Collapsed
│  └────────────────────────────────────────┘ │
│                                              │
│  ┌────────────────────────────────────────┐ │
│  │ ✓ Q2: Electromagnetic?      +10 XP ✓  │ │← Collapsed
│  └────────────────────────────────────────┘ │
│                                              │
│  ┌────────────────────────────────────────┐ │← ACTIVE
│  │ → Q3: Emotional state?      +10 XP    │ │
│  │   ═══════════════════════════════════  │ │
│  │                                        │ │
│  │   Wie hast du dich gefühlt?           │ │
│  │                                        │ │
│  │   Fear  ←─────●─────→ Peace           │ │
│  │         1  2  3  4  5  6  7  8  9  10 │ │
│  │                                        │ │
│  │   💡 Emotionale Zustände helfen bei   │ │
│  │      der Mustererkennung              │ │
│  │                                        │ │
│  │   [Überspringen] [Weiter →]           │ │
│  └────────────────────────────────────────┘ │
│                                              │
│  Progress: ●●●○○○○○○○                       │
│                                              │
│  [Alle überspringen] [Fertig wenn bereit]   │
└──────────────────────────────────────────────┘
```

**Implementation:**

```javascript
const ExtraQuestions = ({ onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  
  const questions = [
    {
      id: 'physical',
      title: 'Körperliche Effekte?',
      type: 'checkbox',
      options: ['Kopfschmerzen', 'Übelkeit', 'Kribbeln', 'Zeitverzerrung', 'Keine'],
      xp: 10
    },
    {
      id: 'electromagnetic',
      title: 'Elektromagnetische Effekte?',
      type: 'checkbox',
      options: ['Lichter flackerten', 'Handy ging aus', 'Elektronik ausgefallen', 'Keine'],
      xp: 10
    },
    {
      id: 'emotional',
      title: 'Emotionaler Zustand?',
      type: 'scale',
      min: 1,
      max: 10,
      labels: ['Angst', 'Frieden'],
      xp: 10
    },
    // ... 7 more questions
  ];
  
  const currentQuestion = questions[currentIndex];
  
  const handleNext = (answer) => {
    setAnswers({ ...answers, [currentQuestion.id]: answer });
    
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onComplete(answers);
    }
  };
  
  const handleSkip = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onComplete(answers);
    }
  };
  
  return (
    <div className="extra-questions-section">
      {/* Collapsed answered questions */}
      {questions.slice(0, currentIndex).map((q, i) => (
        <div key={q.id} className="question-card collapsed">
          <span>✓ Q{i+1}: {q.title}</span>
          <span className="xp-badge">+{q.xp} XP ✓</span>
        </div>
      ))}
      
      {/* Active question */}
      <div className="question-card active">
        <div className="question-header">
          <span className="question-number">→ Q{currentIndex + 1}</span>
          <span className="question-xp">+{currentQuestion.xp} XP</span>
        </div>
        
        <h3 className="question-title">{currentQuestion.title}</h3>
        
        <QuestionInput 
          type={currentQuestion.type}
          options={currentQuestion.options}
          onChange={handleNext}
        />
        
        {currentQuestion.tip && (
          <div className="question-tip">
            💡 {currentQuestion.tip}
          </div>
        )}
        
        <div className="question-actions">
          <button onClick={handleSkip} className="skip-btn">
            Überspringen
          </button>
          <button onClick={() => handleNext(currentAnswer)} className="next-btn">
            Weiter →
          </button>
        </div>
      </div>
      
      {/* Progress dots */}
      <div className="progress-dots">
        {questions.map((_, i) => (
          <div 
            key={i} 
            className={`dot ${i < currentIndex ? 'completed' : i === currentIndex ? 'active' : ''}`}
          />
        ))}
      </div>
      
      <button onClick={() => onComplete(answers)} className="skip-all-btn">
        Alle überspringen
      </button>
    </div>
  );
};
```

```css
.question-card {
  padding: 24px;
  background: rgba(26, 35, 50, 0.6);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(232, 220, 192, 0.15);
  border-radius: 12px;
  margin-bottom: 16px;
  transition: all 0.3s ease;
}

.question-card.collapsed {
  padding: 12px 16px;
  background: rgba(127, 176, 105, 0.05);
  border-color: rgba(127, 176, 105, 0.2);
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
}

.question-card.collapsed:hover {
  background: rgba(127, 176, 105, 0.08);
}

.question-card.active {
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.question-number {
  font-size: 13px;
  font-family: var(--font-monospace);
  color: rgba(232, 220, 192, 0.5);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.question-xp {
  padding: 4px 10px;
  background: rgba(212, 165, 116, 0.15);
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  font-family: var(--font-monospace);
  color: #d4a574;
}

.question-title {
  font-size: 18px;
  font-weight: 600;
  color: #e8dcc0;
  margin-bottom: 20px;
  line-height: 1.5;
}

.question-tip {
  margin-top: 16px;
  padding: 14px;
  background: rgba(212, 165, 116, 0.05);
  border: 1px solid rgba(212, 165, 116, 0.15);
  border-left: 3px solid #d4a574;
  border-radius: 8px;
  font-size: 13px;
  color: rgba(232, 220, 192, 0.7);
  line-height: 1.6;
}

.question-actions {
  display: flex;
  gap: 12px;
  margin-top: 20px;
}

.skip-btn {
  flex: 1;
  padding: 12px;
  background: rgba(232, 220, 192, 0.05);
  border: 1px solid rgba(232, 220, 192, 0.2);
  border-radius: 8px;
  color: rgba(232, 220, 192, 0.7);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.skip-btn:hover {
  background: rgba(232, 220, 192, 0.08);
}

.next-btn {
  flex: 2;
  padding: 12px;
  background: linear-gradient(135deg, #d4a574, #e8dcc0);
  color: #0f1419;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.next-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(212, 165, 116, 0.3);
}

.progress-dots {
  display: flex;
  gap: 6px;
  justify-content: center;
  margin: 24px 0;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: rgba(232, 220, 192, 0.2);
  transition: all 0.3s;
}

.dot.completed {
  background: #7fb069;
  box-shadow: 0 0 8px rgba(127, 176, 105, 0.5);
}

.dot.active {
  background: #d4a574;
  box-shadow: 0 0 8px rgba(212, 165, 116, 0.5);
  transform: scale(1.3);
}
```

---

## 📝 SCREEN 3: Enhanced Text + Summary

### Transition
- "Einbettung läuft..." overlay (1-2s)
- Progress dots animation
- Text fades in with highlights

### Layout
```
┌──────────────────────────────────────────────┐
│  [Progress: Step 3 of 4 - 75%]              │
├──────────────────────────────────────────────┤
│                                              │
│  🎚️ KI-Anreicherungen    [●────○] Ein       │
│                                              │
│  ──────────────────────────────────────────  │
│                                              │
│  📋 Kurzzusammenfassung           [✏️ Edit]  │
│  ┌────────────────────────────────────────┐ │
│  │ Beobachtung eines blauen, dreieckigen  │ │
│  │ Objekts über Berlin um 3:33 Uhr        │ │
│  │ morgens. Schwebte etwa 100 Meter hoch, │ │
│  │ bewegte sich intelligent und reagierte │ │
│  │ scheinbar auf Gedanken.                │ │
│  └────────────────────────────────────────┘ │
│                                              │
│  ℹ️ Diese Zusammenfassung erscheint als     │
│     Preview in der Liste und Suche.         │
│                                              │
│  ──────────────────────────────────────────  │
│                                              │
│  📝 Blue Triangle Over Berlin     [✏️ Edit]  │
│  🏷️ UFO • Berlin • Triangle • Night  [✏️]   │
│                                              │
│  ──────────────────────────────────────────  │
│                                              │
│  ┌────────────────────────────────────────┐ │
│  │                                        │ │
│  │ Last night at 3:33 AM, I observed a   │ │
│  │ blue triangular object over Berlin.   │ │
│  │                                        │ │
│  │ ▌The object hovered approximately 100 │ │← Warm
│  │ ▌meters above ground level and        │ │  glow
│  │ ▌appeared to be roughly the size of a │ │
│  │ ▌bus.                                  │ │
│  │                                        │ │
│  │ It moved with clear intelligence...   │ │
│  │                                        │ │
│  │ ▌The craft seemed to respond directly │ │← Green
│  │ ▌to my thoughts and observations.     │ │  glow
│  │                                        │ │
│  └────────────────────────────────────────┘ │
│                                              │
│              [Weiter →]                      │
└──────────────────────────────────────────────┘
```

### AI Enhancement Toggle

```css
.enhancement-toggle-container {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: rgba(232, 220, 192, 0.03);
  border: 1px solid rgba(232, 220, 192, 0.1);
  border-radius: 8px;
  margin-bottom: 24px;
}

.toggle-label {
  flex: 1;
  font-size: 14px;
  font-weight: 500;
  color: #e8dcc0;
}

.toggle-switch {
  position: relative;
  width: 50px;
  height: 24px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(232, 220, 192, 0.3);
  border-radius: 24px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.toggle-switch.active {
  background: rgba(212, 165, 116, 0.3);
  border-color: #d4a574;
  box-shadow: 0 0 10px rgba(212, 165, 116, 0.5);
}

.toggle-slider {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 18px;
  height: 18px;
  background: #e8dcc0;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.toggle-switch.active .toggle-slider {
  left: 28px;
  background: #d4a574;
}
```

### Kurzzusammenfassung (Summary)

```css
.summary-section {
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid rgba(232, 220, 192, 0.1);
}

.summary-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.summary-label {
  font-size: 14px;
  font-weight: 600;
  color: rgba(232, 220, 192, 0.8);
  display: flex;
  align-items: center;
  gap: 8px;
}

.summary-edit-btn {
  padding: 6px 12px;
  background: rgba(232, 220, 192, 0.05);
  border: 1px solid rgba(232, 220, 192, 0.2);
  border-radius: 6px;
  color: rgba(232, 220, 192, 0.7);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.summary-edit-btn:hover {
  background: rgba(232, 220, 192, 0.08);
  border-color: rgba(232, 220, 192, 0.3);
}

.summary-content {
  padding: 16px;
  background: rgba(232, 220, 192, 0.03);
  border: 1px solid rgba(232, 220, 192, 0.1);
  border-left: 3px solid #d4a574;
  border-radius: 8px;
  font-size: 15px;
  line-height: 1.6;
  color: rgba(232, 220, 192, 0.9);
  margin-bottom: 12px;
}

.summary-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: rgba(232, 220, 192, 0.6);
  line-height: 1.6;
}

.summary-info-icon {
  font-size: 14px;
  flex-shrink: 0;
}

/* Edit Mode */
.summary-textarea {
  width: 100%;
  min-height: 100px;
  padding: 12px;
  background: rgba(15, 20, 25, 0.6);
  border: 1px solid rgba(232, 220, 192, 0.2);
  border-radius: 8px;
  color: #e8dcc0;
  font-size: 15px;
  line-height: 1.6;
  resize: vertical;
  margin-bottom: 12px;
}

.summary-counter {
  text-align: right;
  font-size: 12px;
  font-family: var(--font-monospace);
  color: rgba(232, 220, 192, 0.5);
  margin-bottom: 12px;
}

.summary-counter.warning {
  color: #d4a574;
}

.summary-counter.error {
  color: #d4726a;
}

.summary-actions {
  display: flex;
  gap: 8px;
}

.summary-regenerate {
  padding: 8px 16px;
  background: rgba(212, 165, 116, 0.1);
  border: 1px solid rgba(212, 165, 116, 0.3);
  border-radius: 6px;
  color: #d4a574;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
}

.summary-regenerate:hover {
  background: rgba(212, 165, 116, 0.15);
  border-color: rgba(212, 165, 116, 0.5);
}

.summary-save {
  padding: 8px 16px;
  background: linear-gradient(135deg, #7fb069, #8fc979);
  border: none;
  border-radius: 6px;
  color: #0f1419;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.summary-save:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(127, 176, 105, 0.3);
}
```

**Summary Generation:**

```javascript
// Backend function
const generateSummary = async (fullText) => {
  const prompt = `
    Erstelle eine prägnante Zusammenfassung des folgenden Erfahrungsberichts.
    
    Anforderungen:
    - Maximal 3-4 Sätze
    - 150-200 Zeichen ideal
    - Objektiv und sachlich
    - Wichtigste Details: Was, Wann, Wo
    - Für Preview/Snippet geeignet
    
    Text:
    ${fullText}
    
    Zusammenfassung:
  `;
  
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 100,
    temperature: 0.7
  });
  
  return response.choices[0].message.content;
};
```

### Title & Tags (Compact)

```css
.metadata-section {
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid rgba(232, 220, 192, 0.1);
}

.metadata-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.title-text {
  font-size: 20px;
  font-weight: 700;
  color: #e8dcc0;
}

.title-edit {
  padding: 6px 12px;
  background: rgba(232, 220, 192, 0.05);
  border: 1px solid rgba(232, 220, 192, 0.2);
  border-radius: 6px;
  color: rgba(232, 220, 192, 0.7);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.metadata-tags {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.tag-icon {
  font-size: 14px;
  color: rgba(232, 220, 192, 0.5);
}

.tag-item {
  font-size: 14px;
  color: rgba(232, 220, 192, 0.8);
}

.tag-separator {
  color: rgba(232, 220, 192, 0.3);
}

.tags-edit {
  padding: 4px 8px;
  background: rgba(232, 220, 192, 0.05);
  border: 1px solid rgba(232, 220, 192, 0.2);
  border-radius: 4px;
  color: rgba(232, 220, 192, 0.7);
  font-size: 12px;
  cursor: pointer;
}
```

### Enhanced Text Editor

```css
.text-editor-container {
  margin-bottom: 24px;
}

.text-editor {
  padding: 20px;
  background: rgba(15, 20, 25, 0.6);
  border: 1px solid rgba(232, 220, 192, 0.15);
  border-radius: 10px;
  font-size: 15px;
  line-height: 1.8;
  color: #e8dcc0;
  min-height: 300px;
  cursor: text;
}

.text-original {
  color: rgba(232, 220, 192, 0.9);
}

.text-added {
  color: #d4a574;
  background: rgba(212, 165, 116, 0.1);
  border-left: 3px solid #d4a574;
  padding: 2px 6px;
  margin: 0 2px;
  border-radius: 2px;
  box-shadow: 0 0 10px rgba(212, 165, 116, 0.2);
  transition: all 0.2s ease;
}

.text-added:hover {
  background: rgba(212, 165, 116, 0.15);
  box-shadow: 0 0 15px rgba(212, 165, 116, 0.3);
}

.text-enhanced {
  color: #7fb069;
  background: rgba(127, 176, 105, 0.1);
  border-left: 3px solid #7fb069;
  padding: 2px 6px;
  margin: 0 2px;
  border-radius: 2px;
  box-shadow: 0 0 10px rgba(127, 176, 105, 0.2);
  transition: all 0.2s ease;
}

.text-enhanced:hover {
  background: rgba(127, 176, 105, 0.15);
  box-shadow: 0 0 15px rgba(127, 176, 105, 0.3);
}
```

**Editing behavior:**

```javascript
const EnhancedTextEditor = ({ text, highlights }) => {
  const [content, setContent] = useState(text);
  const [activeHighlights, setActiveHighlights] = useState(highlights);

  const handleChange = (newText, cursorPosition) => {
    // Remove highlights in edited range
    const updatedHighlights = activeHighlights.filter(h => {
      return !isPositionInRange(cursorPosition, h.start, h.end);
    });
    
    setActiveHighlights(updatedHighlights);
    setContent(newText);
  };

  return (
    <ContentEditable
      html={renderWithHighlights(content, activeHighlights)}
      onChange={handleChange}
      className="text-editor"
    />
  );
};
```

---

## 📎 SCREEN 4: Files + Witnesses

### Layout
```
┌──────────────────────────────────────────────┐
│  [Progress: Step 4 of 4 - 100%]             │
├──────────────────────────────────────────────┤
│                                              │
│  Ergänzende Informationen                   │
│  ═══                                         │
│                                              │
│  ──────────────────────────────────────────  │
│                                              │
│  📎 Medien hinzufügen                        │
│                                              │
│  💡 Bilder und Videos unterstützen deine    │
│     Erfahrung mit visuellen Beweisen        │
│                                              │
│  ┌────────────────────────────────────────┐ │
│  │ [📷 Foto/Bild] [🎥 Video] [✍️ Skizze]  │ │
│  └────────────────────────────────────────┘ │
│                                              │
│  Hochgeladene Dateien (2):                  │
│                                              │
│  ┌──────────────────────────────────────┐  │
│  │ ┌──────┐  IMG_1234.jpg           [❌]│  │
│  │ │ 🖼️   │  ┌─────────────────────┐   │  │
│  │ │[thumb]│  │ Was zeigt das Bild? │   │  │
│  │ └──────┘  │ [Optional...]       │   │  │
│  │           │                     │   │  │
│  │           │ ☑ Hauptbeweis       │   │  │
│  │           │ ☐ Kontext           │   │  │
│  │           └─────────────────────┘   │  │
│  └──────────────────────────────────────┘  │
│                                              │
│  ┌──────────────────────────────────────┐  │
│  │ ┌──────┐  night_video.mp4        [❌]│  │
│  │ │ 🎥▶️ │  2.3 MB • 0:34            │  │
│  │ │[thumb]│  ┌─────────────────────┐   │  │
│  │ └──────┘  │ Was ist zu sehen?   │   │  │
│  │           │ [Optional...]       │   │  │
│  │           │                     │   │  │
│  │           │ ☑ Hauptbeweis       │   │  │
│  │           │ ☐ Kontext           │   │  │
│  │           └─────────────────────┘   │  │
│  └──────────────────────────────────────┘  │
│                                              │
│  ──────────────────────────────────────────  │
│                                              │
│  👥 Zeugen hinzufügen                        │
│                                              │
│  💡 Bestätigte Zeugen stärken das Vertrauen │
│     in deine Erfahrung (+50 XP pro Person)  │
│                                              │
│  ┌────────────────────────────────────────┐ │
│  │ [🔍 Benutzer suchen]                   │ │
│  │ [✉️ Per E-Mail einladen]               │ │
│  │ [🔗 Link teilen]                       │ │
│  └────────────────────────────────────────┘ │
│                                              │
│  Hinzugefügte Zeugen (1):                   │
│  👤 Max Mustermann (ausstehend) +25 XP      │
│                                              │
│  ──────────────────────────────────────────  │
│                                              │
│  [← Zurück] [Überspringen]                  │
│                       [🚀 Publish  ▼]        │
│                                              │
│  💡 Tipp: Klicke auf ▼ für mehr Optionen   │
└──────────────────────────────────────────────┘
```

### File Upload Section

**Encouragement:**

```css
.encouragement-note {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: rgba(212, 165, 116, 0.08);
  border-left: 3px solid #d4a574;
  border-radius: 6px;
  font-size: 14px;
  color: rgba(232, 220, 192, 0.8);
  margin-bottom: 16px;
}

.encouragement-icon {
  font-size: 16px;
  flex-shrink: 0;
}
```

**File Card:**

```css
.file-card {
  display: flex;
  gap: 16px;
  padding: 16px;
  background: rgba(232, 220, 192, 0.03);
  border: 1px solid rgba(232, 220, 192, 0.1);
  border-radius: 10px;
  margin-bottom: 16px;
  position: relative;
}

.file-thumbnail {
  width: 100px;
  height: 100px;
  flex-shrink: 0;
  border-radius: 8px;
  overflow: hidden;
  background: rgba(15, 20, 25, 0.8);
  position: relative;
}

.file-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.file-thumbnail.video::after {
  content: '▶️';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 32px;
  opacity: 0.8;
}

.file-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.file-name {
  font-size: 14px;
  font-weight: 500;
  color: #e8dcc0;
}

.file-meta {
  font-size: 12px;
  color: rgba(232, 220, 192, 0.5);
}

.file-info-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.file-info-label {
  font-size: 13px;
  color: rgba(232, 220, 192, 0.6);
  font-weight: 500;
}

.file-info-input {
  padding: 10px 12px;
  background: rgba(15, 20, 25, 0.6);
  border: 1px solid rgba(232, 220, 192, 0.15);
  border-radius: 6px;
  color: #e8dcc0;
  font-size: 14px;
  resize: vertical;
  min-height: 60px;
}

.file-type-options {
  display: flex;
  gap: 16px;
}

.file-type-checkbox {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: rgba(232, 220, 192, 0.7);
  cursor: pointer;
}

.file-type-checkbox input[type="checkbox"] {
  width: 16px;
  height: 16px;
  accent-color: #d4a574;
}

.file-remove {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 28px;
  height: 28px;
  background: rgba(212, 114, 106, 0.8);
  border: none;
  border-radius: 50%;
  color: white;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.file-remove:hover {
  background: rgba(212, 114, 106, 1);
  transform: scale(1.1);
}

/* Mobile */
@media (max-width: 768px) {
  .file-card {
    flex-direction: column;
  }
  
  .file-thumbnail {
    width: 100%;
    height: 200px;
  }
}
```

### Witnesses Section

```css
.witnesses-section {
  margin-top: 32px;
  padding-top: 32px;
  border-top: 1px solid rgba(232, 220, 192, 0.1);
}

.witnesses-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.witness-method-btn {
  padding: 14px 18px;
  background: rgba(232, 220, 192, 0.05);
  border: 1px solid rgba(232, 220, 192, 0.2);
  border-radius: 8px;
  color: rgba(232, 220, 192, 0.8);
  font-size: 14px;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 12px;
}

.witness-method-btn:hover {
  background: rgba(232, 220, 192, 0.08);
  border-color: rgba(232, 220, 192, 0.3);
  transform: translateX(4px);
}

.witness-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 20px;
}

.witness-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  background: rgba(232, 220, 192, 0.03);
  border: 1px solid rgba(232, 220, 192, 0.1);
  border-radius: 8px;
}

.witness-icon {
  font-size: 20px;
}

.witness-info {
  flex: 1;
}

.witness-name {
  font-size: 14px;
  font-weight: 500;
  color: #e8dcc0;
}

.witness-status {
  font-size: 12px;
  color: rgba(232, 220, 192, 0.5);
}

.witness-status.pending {
  color: #d4a574;
}

.witness-xp {
  font-size: 13px;
  font-weight: 600;
  color: #d4a574;
  font-family: var(--font-monospace);
}
```

### Split Publish Button

```css
.split-button-wrapper {
  position: relative;
  display: inline-flex;
}

.split-button-container {
  display: inline-flex;
}

.split-button-main {
  padding: 14px 24px;
  background: linear-gradient(135deg, #d4a574, #e8dcc0);
  color: #0f1419;
  border: none;
  border-radius: 8px 0 0 8px;
  font-size: 15px;
  font-weight: 600;
  font-family: var(--font-monospace);
  letter-spacing: 0.05em;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.2s;
}

.split-button-main:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(212, 165, 116, 0.4);
}

.split-button-dropdown {
  padding: 14px 12px;
  background: linear-gradient(135deg, #d4a574, #e8dcc0);
  color: #0f1419;
  border: none;
  border-left: 1px solid rgba(15, 20, 25, 0.2);
  border-radius: 0 8px 8px 0;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.split-button-dropdown:hover {
  background: linear-gradient(135deg, #c99564, #d8ccb0);
}

/* First-time Tooltip */
.first-time-tooltip {
  position: absolute;
  bottom: calc(100% + 12px);
  left: 50%;
  transform: translateX(-50%);
  padding: 12px 16px;
  background: rgba(212, 165, 116, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(212, 165, 116, 0.5);
  border-radius: 8px;
  color: #0f1419;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  animation: tooltipBounce 0.5s ease-out;
  box-shadow: 0 4px 12px rgba(212, 165, 116, 0.4);
}

.tooltip-arrow {
  position: absolute;
  bottom: -6px;
  left: 50%;
  transform: translateX(-50%) rotate(45deg);
  width: 12px;
  height: 12px;
  background: rgba(212, 165, 116, 0.95);
  border-right: 1px solid rgba(212, 165, 116, 0.5);
  border-bottom: 1px solid rgba(212, 165, 116, 0.5);
}

@keyframes tooltipBounce {
  0%, 100% { transform: translateX(-50%) translateY(0); }
  50% { transform: translateX(-50%) translateY(-5px); }
}

/* Visibility Menu */
.visibility-menu {
  position: absolute;
  bottom: 100%;
  right: 0;
  margin-bottom: 8px;
  min-width: 280px;
  background: rgba(26, 35, 50, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(232, 220, 192, 0.2);
  border-radius: 10px;
  padding: 12px;
  box-shadow: 0 -8px 32px rgba(0, 0, 0, 0.4);
  animation: slideUp 0.2s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.visibility-option {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 8px;
}

.visibility-option:hover {
  background: rgba(232, 220, 192, 0.05);
}

.visibility-option.selected {
  background: rgba(212, 165, 116, 0.15);
  border: 1px solid rgba(212, 165, 116, 0.3);
}

.option-radio {
  width: 18px;
  height: 18px;
  margin-top: 2px;
  accent-color: #d4a574;
}

.option-content {
  flex: 1;
}

.option-title {
  font-size: 15px;
  font-weight: 600;
  color: #e8dcc0;
  margin-bottom: 4px;
}

.option-description {
  font-size: 13px;
  color: rgba(232, 220, 192, 0.6);
  line-height: 1.5;
  margin-bottom: 4px;
}

.option-reward {
  font-size: 13px;
  font-weight: 600;
  color: #d4a574;
}
```

**Implementation:**

```javascript
const SplitPublishButton = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(true);
  const [visibility, setVisibility] = useState('public');

  useEffect(() => {
    const hasSeenTooltip = localStorage.getItem('publish_tooltip_seen');
    if (hasSeenTooltip) {
      setShowTooltip(false);
    }
  }, []);

  const handleDropdownClick = () => {
    setMenuOpen(!menuOpen);
    localStorage.setItem('publish_tooltip_seen', 'true');
    setShowTooltip(false);
  };

  const handlePublish = () => {
    publish(visibility);
  };

  return (
    <div className="split-button-wrapper">
      <div className="split-button-container">
        <button 
          className="split-button-main"
          onClick={handlePublish}
        >
          🚀 Publish
        </button>
        
        <button 
          className="split-button-dropdown"
          onClick={handleDropdownClick}
        >
          ▼
        </button>
      </div>

      {showTooltip && (
        <div className="first-time-tooltip">
          💡 Tipp: Klicke auf ▼ für mehr Optionen
          <div className="tooltip-arrow"></div>
        </div>
      )}

      {menuOpen && (
        <div className="visibility-menu">
          <div 
            className={`visibility-option ${visibility === 'public' ? 'selected' : ''}`}
            onClick={() => setVisibility('public')}
          >
            <input type="radio" checked={visibility === 'public'} className="option-radio" readOnly />
            <div className="option-content">
              <div className="option-title">Öffentlich</div>
              <div className="option-description">
                Alle können deine Erfahrung sehen. Erscheint im Public Feed.
              </div>
              <div className="option-reward">+50 XP</div>
            </div>
          </div>
          
          <div 
            className={`visibility-option ${visibility === 'anonymous' ? 'selected' : ''}`}
            onClick={() => setVisibility('anonymous')}
          >
            <input type="radio" checked={visibility === 'anonymous'} className="option-radio" readOnly />
            <div className="option-content">
              <div className="option-title">Anonym</div>
              <div className="option-description">
                Erfahrung ist öffentlich, aber dein Name wird nicht angezeigt.
              </div>
              <div className="option-reward">+50 XP</div>
            </div>
          </div>
          
          <div 
            className={`visibility-option ${visibility === 'private' ? 'selected' : ''}`}
            onClick={() => setVisibility('private')}
          >
            <input type="radio" checked={visibility === 'private'} className="option-radio" readOnly />
            <div className="option-content">
              <div className="option-title">Privat</div>
              <div className="option-description">
                Nur für dich sichtbar. Nicht in Feed oder Suche.
              </div>
              <div className="option-reward">+0 XP</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
```

---

## 🎊 SUCCESS SCREEN: Similar Experiences

### Publishing Animation

```
┌──────────────────────────────────────────────┐
│                                              │
│         🌀 Speichere Erfahrung...            │
│                                              │
│         [Rotating constellation]             │
│                                              │
│         Suche ähnliche Erfahrungen...        │
│                                              │
└──────────────────────────────────────────────┘
```

```css
.publishing-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 20, 25, 0.95);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.publishing-container {
  text-align: center;
  padding: 60px;
  background: rgba(26, 35, 50, 0.8);
  border: 1px solid rgba(232, 220, 192, 0.2);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}

.publishing-icon {
  font-size: 64px;
  margin-bottom: 20px;
  animation: rotate 2s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.publishing-text {
  font-size: 18px;
  font-weight: 600;
  color: #e8dcc0;
  margin-bottom: 12px;
}

.publishing-subtext {
  font-size: 14px;
  color: rgba(232, 220, 192, 0.6);
}
```

### Success Screen

```
┌──────────────────────────────────────────────┐
│  ✨ Erfahrung veröffentlicht!                │
│                                              │
│  +150 XP verdient 🎉                         │
│  Level 3 → Level 4                           │
│  Neues Badge: "Truth Seeker"                 │
│                                              │
│  ──────────────────────────────────────────  │
│                                              │
│  🔍 Ähnliche Erfahrungen gefunden!           │
│                                              │
│  Top Matches:                                │
│                                              │
│  ┌────────────────────────────────────────┐ │
│  │ 🛸 Triangular Object Over Munich      │ │
│  │ @user123 • Vor 2 Wochen               │ │
│  │                                        │ │
│  │ 89% Similarity                         │ │
│  │ ▌Match: Blue Light, Triangle,         │ │
│  │ ▌Movement, Night, Intelligent         │ │
│  │                                        │ │
│  │ [Ansehen →]                            │ │
│  └────────────────────────────────────────┘ │
│                                              │
│  [Alle 12 Matches] [Zur Erfahrung] [✕]      │
└──────────────────────────────────────────────┘
```

```css
.success-screen {
  max-width: 700px;
  margin: 40px auto;
  padding: 40px;
  background: rgba(26, 35, 50, 0.8);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(232, 220, 192, 0.2);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  text-align: center;
}

.success-icon {
  font-size: 64px;
  margin-bottom: 20px;
  animation: bounce 0.6s ease-out;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
}

.success-title {
  font-size: 28px;
  font-weight: 600;
  color: #e8dcc0;
  margin-bottom: 24px;
}

.success-stats {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 32px;
  padding: 20px;
  background: rgba(212, 165, 116, 0.1);
  border-radius: 10px;
}

.stat-item {
  font-size: 16px;
  color: #e8dcc0;
}

.stat-item.xp {
  font-size: 20px;
  font-weight: 700;
  color: #d4a574;
}

.similar-card {
  padding: 20px;
  background: rgba(232, 220, 192, 0.05);
  border: 1px solid rgba(232, 220, 192, 0.15);
  border-radius: 10px;
  margin-bottom: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;
}

.similar-card:hover {
  background: rgba(232, 220, 192, 0.08);
  border-color: rgba(232, 220, 192, 0.25);
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #e8dcc0;
  margin-bottom: 8px;
}

.card-meta {
  font-size: 13px;
  color: rgba(232, 220, 192, 0.5);
  margin-bottom: 12px;
}

.card-similarity {
  display: inline-block;
  padding: 6px 12px;
  background: rgba(127, 176, 105, 0.15);
  border-radius: 6px;
  font-size: 18px;
  font-weight: 700;
  font-family: var(--font-monospace);
  color: #7fb069;
  margin-bottom: 12px;
}

.card-matches {
  font-size: 13px;
  color: rgba(232, 220, 192, 0.7);
  line-height: 1.7;
}

.match-highlight {
  color: #d4a574;
  font-weight: 500;
}
```

---

## 📊 Flow Summary

### Complete Flow (4 Screens)
```
SCREEN 1: Text Input + Voice + OCR (3-5 min)
├─ Textarea with word counter
├─ Voice dictation
├─ OCR for handwritten notes
└─ [Weiter →]

↓

SCREEN 2: AI Analysis + Questions (3-5 min)
├─ AI Results (Title, Tags, Category)
├─ Required Questions (3)
├─ Optional: Extra Questions (8-10)
└─ [Weiter →]

↓

SCREEN 3: Enhanced Text + Summary (2-3 min)
├─ AI Enhancement Toggle
├─ Kurzzusammenfassung (editable)
├─ Title + Tags (compact)
├─ Text Editor with highlights
└─ [Weiter →]

↓

SCREEN 4: Files + Witnesses (2-3 min)
├─ File Upload (Photo/Video/Sketch)
├─ Witnesses (Search/Invite/Link)
├─ Split Publish Button
└─ [🚀 Publish]

↓

SUCCESS: Similar Experiences
├─ XP Summary
├─ Similar Matches
└─ [View Experience]
```

### Time Estimates
```
Minimum Path (Skip everything optional):
Screen 1 (50 words) + Screen 2 (required only) + Screen 3 + Screen 4 (skip)
= 5-8 minutes

Balanced Path (Some extras):
Screen 1 (150 words) + Screen 2 (3-5 extra Q) + Screen 3 + Screen 4 (1 file)
= 10-15 minutes

Full Path (Everything):
Screen 1 (300+ words + OCR) + Screen 2 (all 10 extra Q) + Screen 3 + Screen 4 (files + witnesses)
= 20-25 minutes
```

### XP Breakdown (Updated)
```
Text entry (50+ words):          +20 XP
Text entry (150+ words):         +50 XP
Text entry (300+ words):         +100 XP
Text entry (500+ words):         +200 XP

Required Questions (3 × 10):     +30 XP
Extra Quick Questions (5 × 10):  +50 XP
Extra Detailed Questions (5 × 12): +60 XP
Extra Questions Completion:      +110 XP (total)

File upload:                     +10 XP per file
Witness added:                   +25 XP
Witness confirmed:               +50 XP
3+ Witnesses confirmed:          +100 XP (Trust Badge)

Experience published:            +50 XP
────────────────────────────────────
TOTAL (Full Path):               ~450 XP maximum

Badges:
• First Post (automatic)
• Pattern Seeker (all 10 extra questions)
• Storyteller (10+ experiences)
• Witness Network (5+ witnesses confirmed)
• Trust Badge (3+ witnesses on single experience)
• Pattern Finder (found in 10+ similar experiences)
```

---

## 🔐 Security & Privacy

### Data Handling
- All uploads encrypted in transit (HTTPS)
- Optional E2E encryption for Private Experiences
- Anonymous Mode: No IP/Device fingerprinting stored
- GDPR: Full data export + deletion on request

### Content Moderation
- AI Pre-Screening (OpenAI Moderation API)
- User Reports System
- Human Moderator Review for flagged content
- Automatic blur for NSFW media

---

## 🎯 Success Metrics

### Track:
- **Completion Rate:** % of users reaching Success Screen
- **Drop-off Points:** Where do users abandon?
- **Average Questions Answered:** Extra questions participation
- **Upload Rate:** % with attachments
- **Witness Add Rate:** % with witnesses
- **Similar Match Quality:** User feedback on matches
- **Time to Complete:** Average per path

### Goals:
- Completion Rate: >70%
- Drop-off at Extra Questions: <50% (opt-in is okay)
- Average Time: 10-15 minutes for balanced path
- Match Quality Score: >80% "relevant"

---

## 📱 Responsive Design

### Breakpoints
```css
/* Mobile First Approach */
@media (min-width: 640px)  { /* sm - tablets */ }
@media (min-width: 768px)  { /* md - small laptops */ }
@media (min-width: 1024px) { /* lg - desktops */ }
@media (min-width: 1280px) { /* xl - large desktops */ }
```

### Mobile Adjustments

```css
@media (max-width: 768px) {
  .entry-card {
    padding: 24px 20px;
    border-radius: 12px;
  }
  
  .section-title {
    font-size: 24px;
  }
  
  .question-card {
    padding: 20px;
  }
  
  .file-card {
    flex-direction: column;
  }
  
  .file-thumbnail {
    width: 100%;
    height: 200px;
  }
  
  .split-button-wrapper {
    width: 100%;
  }
  
  .split-button-container {
    width: 100%;
  }
  
  .split-button-main {
    flex: 1;
  }
}
```

---

## 🛠️ Implementation Notes

### Tech Stack
```
Frontend: Next.js 14+ (App Router)
UI: Framer Motion + Tailwind CSS
Voice: Web Speech API + Whisper API fallback
AI: OpenAI API (GPT-4o-mini, text-embedding-3-large)
Database: Supabase (PostgreSQL + pgvector + PostGIS)
Storage: Cloudflare R2 or Supabase Storage
OCR: Tesseract.js (client) + Google Vision API (server)
Analytics: PostHog or Mixpanel
```

### Priority Order (MVP)
```
Week 1-2: Screen 1 (Text Input + Voice + OCR)
Week 3: Screen 2 (AI Analysis + Required Questions)
Week 4: Screen 3 (Enhanced Text + Summary)
Week 5: Screen 4 (Files + Witnesses)
Week 6: Success Screen + Similar Experiences
Week 7-8: Polish + Testing
```

### Critical Features for MVP
1. ✅ Text Input with word counter
2. ✅ Voice dictation
3. ✅ OCR for handwritten notes
4. ✅ AI title/tags/category generation
5. ✅ Required questions
6. ✅ AI summary generation
7. ✅ Text enhancement with highlights
8. ✅ File upload (photos/videos)
9. ✅ Split publish button
10. ✅ Similar experiences matching

---

**End of Specification**

Version: 3.0 - Streamlined 4-Screen Flow  
Date: 2025-10-12  
Status: Complete - Ready for Development
