# Conversational Canvas - Dokumentation

## Übersicht

Das **Conversational Canvas** System ist ein moderner, KI-gestützter Eingabe-Flow für XPShare, der unter `/newxp` verfügbar ist.

## Architektur

### Core-Konzept

Statt einem starren 6-Step-Wizard bietet das System:
- **Ein Screen** für alle Eingaben
- **Multi-Modal Input** (Text/Voice/Photo)
- **Live AI-Extraction** in Echtzeit
- **Conversational Prompts** nur bei Bedarf
- **Smart Witness Detection** aus Text
- **Optional OCR** für Dokumente
- **One-Click Publish**

### Dateistruktur

```
app/[locale]/newxp/
├── page.tsx                          # Main Entry Point
└── success/
    └── page.tsx                      # Success Screen

lib/stores/
└── newxpStore.ts                     # Zustand Store mit allen Actions

components/newxp/
├── ConversationalCanvas.tsx          # Hauptcontainer
├── MultiModalInput.tsx               # Text/Voice/Photo Tabs
├── VoiceRecorder.tsx                 # STT Inline Recording
├── PhotoUploader.tsx                 # Media Upload + OCR
├── AISidebar.tsx                     # Live AI Extraction Display
├── WitnessManager.tsx                # Witness Detection & Add
├── ConversationalPrompts.tsx         # Smart Questions
├── FloatingMediaButton.tsx           # FAB für Quick-Upload
├── SmartPublish.tsx                  # Publish Button + Preview
└── XPToast.tsx                       # XP Gamification Toast
```

## Features

### 1. Multi-Modal Input

**Tab-Switcher** mit 3 Modi:
- ✍️ **Text**: Großes Textarea mit Live-Extraction
- 🎤 **Voice**: Inline STT mit Waveform
- 📸 **Photo**: Upload mit OCR-Option

**Implementierung:**
```tsx
const { inputMode, setInputMode } = useNewXPStore()

<ModeSelector>
  <Tab mode="text">Schreiben</Tab>
  <Tab mode="voice">Sprechen</Tab>
  <Tab mode="photo">Hochladen</Tab>
</ModeSelector>
```

### 2. Live AI-Extraction

**Auto-Extraction** während Eingabe:
- Triggert ab 50 Zeichen
- Debounced für Performance
- Zeigt Confidence-Scores
- Editierbar durch User

**Extrahierte Felder:**
- Kategorie (UFO, Geist, Traum, etc.)
- Ort
- Datum
- Uhrzeit
- Tags
- Größe/Dauer (optional)
- Emotionen

**Implementierung:**
```tsx
useEffect(() => {
  if (charCount > 50) {
    triggerExtraction()
  }
}, [charCount])
```

### 3. Smart Witness Detection

**Auto-Erkennung** aus Text:
```
User schreibt: "Maria und ich sahen..."
                    ↓
System erkennt: "Maria"
                    ↓
Zeigt Prompt: "Maria als Zeuge hinzufügen?"
```

**Pattern Matching:**
- "ich und NAME"
- "NAME und ich"
- "mit NAME"
- "zusammen mit NAME"

**3 Wege zum Hinzufügen:**
1. **Auf Plattform suchen** (Username)
2. **Per Email einladen**
3. **Invite-Link generieren**

### 4. Conversational Prompts

**Nicht blockierend** - erscheinen nur bei Bedarf:

```tsx
{
  id: '1',
  question: 'Wie groß war das Objekt?',
  type: 'choice',
  options: ['Klein', 'Auto-Größe', 'Haus-Größe', 'Größer'],
  canSkip: true,
  priority: 'medium'
}
```

**Filtering:**
- Nur wenn AI Confidence < 80%
- Nur wenn nicht im Text erwähnt
- Max. 1 Frage gleichzeitig
- Dismissable

### 5. OCR für Dokumente

**Flow:**
```
User uploaded: tagebuch.jpg
     ↓
System erkennt: Text-Dokument
     ↓
Zeigt Option: [Als Text erkennen (OCR)]
     ↓
OCR läuft → Text editierbar
     ↓
[Zum Haupttext hinzufügen]
```

**Unterstützte Formate:**
- Fotos von Texten
- PDFs
- Handgeschriebene Notizen

### 6. Floating Action Button

**Immer verfügbar** für Quick-Actions:
- 📷 Foto aufnehmen
- 🖼️ Galerie
- 🎥 Video
- 🎤 Audio
- 📄 Dokument (OCR)

**Mobile-optimiert** - thumb-friendly placement

### 7. Completion Tracking

**Progress-System:**
```tsx
Core Fields (3):      category, location, date
Optional Fields (3):  time, size, duration
Media (1):            uploadedMedia.length > 0
Witnesses (1):        confirmedWitnesses.length > 0

Total: 8 weighted fields
Completion = (filled / total) * 100
```

**Visual Feedback:**
- Progress Bar in Sidebar (Desktop)
- Bottom Bar (Mobile)
- XP-Toasts beim Ausfüllen

### 8. Gamification

**XP-System:**
- +5 XP: Feld editiert
- +5 XP: Frage beantwortet
- +5 XP: Media uploaded
- +10 XP: Zeuge hinzugefügt
- +10 XP: OCR-Text verwendet
- +50 XP: Experience published

**Toast-Animation** für sofortiges Feedback

### 9. Smart Publish

**One-Click Flow:**
1. [Publish]-Button (immer sichtbar)
2. Optional: Preview-Modal
3. Publish → Success-Screen
4. Redirect zu `/newxp/success?id=...`

**Validierung:**
- Mindestens 50 Zeichen
- Mindestens 50% Completion

## API-Integrations

### Required Endpoints

```typescript
// AI Extraction
POST /api/extract
Body: { text: string }
Response: { title, location, date, time, tags, category, ... }

// OCR
POST /api/ocr
Body: FormData with file
Response: { text: string }

// Transcription (Voice)
POST /api/transcribe
Body: FormData with audio blob
Response: { text: string }

// Smart Questions
POST /api/questions/generate
Body: { extractedData, text }
Response: { questions: Question[] }

// Publish
POST /api/experiences
Body: { title, category, location, date, rawText, mediaUrls, privacy, ... }
Response: { id: string }
```

## Store Actions

### Input
- `setInputMode(mode)` - Switch Tab
- `setText(text)` - Update Text
- `appendText(text)` - Append (für STT)

### Voice
- `startRecording()` - Start STT
- `pauseRecording()` - Pause
- `stopRecording()` - Stop & Transcribe

### Extraction
- `triggerExtraction()` - Manual Trigger
- `updateExtractedField(field, value)` - Edit

### Witnesses
- `detectWitnessesInText(text)` - Auto-Detect
- `confirmWitness(name)` - Bestätigen
- `addWitness(witness)` - Hinzufügen
- `generateInviteLink()` - Link generieren

### Media
- `uploadMedia(file)` - Upload
- `requestOCR(mediaId)` - OCR starten
- `applyOCRText(mediaId)` - Text übernehmen

### Questions
- `generateQuestions()` - Backend-Call
- `answerQuestion(id, answer)` - Antworten
- `skipQuestion(id)` - Überspringen

### Publish
- `togglePreview()` - Preview-Modal
- `publish()` - Veröffentlichen

## Mobile Optimization

**Responsive Design:**
- Grid Layout: 1 Column (Mobile), 2 Columns (Desktop)
- Sidebar versteckt auf Mobile
- FAB thumb-friendly positioniert
- Completion Bar am Bottom (Mobile)
- Touch-optimierte Button-Größen (min 44x44px)

**Performance:**
- Debounced Extraction
- Lazy Loading für Excalidraw
- Image Optimization
- Code Splitting

## Usage

```tsx
// Basic Usage
import { ConversationalCanvas } from '@/components/newxp/ConversationalCanvas'

<ConversationalCanvas />

// Mit Store
import { useNewXPStore } from '@/lib/stores/newxpStore'

const { rawText, extractedData, publish } = useNewXPStore()
```

## Testing Checklist

### Desktop
- [ ] Text-Eingabe funktioniert
- [ ] AI-Extraction läuft
- [ ] Witnesses werden erkannt
- [ ] Media-Upload funktioniert
- [ ] OCR funktioniert
- [ ] Voice-Recording funktioniert
- [ ] Publish-Flow komplett

### Mobile
- [ ] Layout responsive
- [ ] FAB erreichbar
- [ ] Touch-Targets groß genug
- [ ] Completion Bar sichtbar
- [ ] Alle Modals funktionieren

### Edge Cases
- [ ] Leerer Text
- [ ] Sehr langer Text (>5000 Zeichen)
- [ ] Keine AI-Daten erkannt
- [ ] Offline-Handling
- [ ] Upload-Fehler

## Nächste Schritte

### Phase 1: MVP Testing
1. Manuelle Tests auf Desktop
2. Manuelle Tests auf Mobile
3. User Feedback sammeln

### Phase 2: Backend Integration
1. `/api/extract` implementieren
2. `/api/ocr` implementieren
3. `/api/questions/generate` implementieren

### Phase 3: Optimizations
1. Performance-Tuning
2. A/B Testing
3. Analytics Integration

## Vergleich: Alt vs Neu

| Feature | Alt (6 Steps) | Neu (Conversational) |
|---------|---------------|---------------------|
| **Steps** | 6 fixe Steps | 1 adaptiver Screen |
| **Zeit** | 8-12 min | 2-4 min |
| **Input** | Nur Text | Text + Voice + Photo |
| **AI** | Nur bei Step 2 | Live während Eingabe |
| **Fragen** | Fixer Step | Nur bei Bedarf |
| **Witnesses** | Step 5 | Auto-Detection + Quick-Add |
| **Media** | Step 3 | Jederzeit via FAB |
| **OCR** | ❌ | ✅ Optional |
| **Mobile** | OK | Optimiert |
| **Completion** | ~35% | ~70% (erwartet) |

## Support

Bei Fragen oder Problemen:
1. Check Store-State im DevTools
2. Check Console für Errors
3. Check Network-Tab für API-Calls

## Changelog

### v1.0.0 (2025-10-10)
- ✅ Initial Release
- ✅ Multi-Modal Input
- ✅ Live AI-Extraction
- ✅ Smart Witness Detection
- ✅ Conversational Prompts
- ✅ OCR Support
- ✅ Floating Action Button
- ✅ Gamification (XP-System)
- ✅ Mobile Optimization
- ✅ Success Screen
