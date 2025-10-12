# XP Share - Eintragungsprozess: Vollständige Design-Spezifikation

## 🎨 Design System: Neon Cyberpunk Aesthetic

### Farbpalette
- **Background:** Metallisch Grau
  - Primary: `#1a1a1f`
  - Secondary: `#25252b`
- **Neon Colors:** 
  - Primär: Neon Blau `#00d4ff`
  - Success: Neon Grün `#00ff88`
  - Error: Neon Rot `#ff0055`
  - Warning: Neon Gelb `#ffff00`
  - Accent: Neon Purple `#b000ff`
- **Glassmorphism:** 
  - Background: `rgba(255, 255, 255, 0.05)`
  - Border: `rgba(0, 212, 255, 0.3)`
  - Backdrop-filter: `blur(20px)`

### Animationen & Accessibility
- **Vibrierende Boxen:** Pulsierender Neon-Schatten mit `box-shadow` animation
- **KRITISCH:** `@media (prefers-reduced-motion: reduce)` MUSS respektiert werden
  - Alle Animationen deaktivieren für betroffene User
  - Nur statische Highlights verwenden
- **Transitions:** `cubic-bezier(0.4, 0, 0.2, 1)` für smooth feel
- **TRON-Style:** Wave-Visualisierungen für Voice Input
- **Spring-Physics:** Für natürliche Bewegungen (Framer Motion)

### Global: Status-Anzeige (immer sichtbar oben)
```
┌────────────────────────────────────────────┐
│ Schritt 2/7 • 35% abgeschlossen             │
│ [▰▰▰▰▰▰▰▱▱▱▱▱▱▱▱▱▱▱▱▱]                    │
└────────────────────────────────────────────┘
```
- Leicht vibrierende Neon-blaue Progress Bar
- Zeigt aktuelle Schritt-Nummer und Prozent
- Farbverlauf: Gelb → Neon basierend auf Fortschritt
- Position: Fixed top, 60px height
- Transparent Background mit Glassmorphism

---

## 📝 SCHRITT 1: Text Input & Early Upload

### Layout Overview
```
┌──────────────────────────────────────────────────┐
│  Status Bar (fixed top)                          │
├──────────────────────────────────────────────────┤
│                                                  │
│  Was macht eine gute XP-Eintragung aus?         │
│  • Erzähle was passiert ist, wann und wo        │
│  • Je mehr Details, desto besser die Muster     │
│  • Irrelevant wirkende Details sind wichtig!    │
│                                                  │
│  ┌────────────────────────────────────────────┐ │
│  │                                            │ │
│  │  [Große Textbox - Auto-expanding]         │ │
│  │  Gestern Nacht, 3:33 Uhr...▲              │ │
│  │                                            │ │
│  │  [47 Wörter • 3 mehr bis Bronze +20 XP]   │ │
│  │  [▰▰▰▰▰▰▰▰▰▱▱▱▱▱▱▱▱▱▱▱] 47/50            │ │
│  │                                            │ │
│  └────────────────────────────────────────────┘ │
│                                                  │
│  [🎤 Voice]  [📷 Foto/OCR Upload]  [💾 Draft]  │
│                                                  │
│  [Weiter →]                                      │
└──────────────────────────────────────────────────┘
```

### Vibrierende Box Styling
```css
.experience-input {
  background: linear-gradient(145deg, #1a1a1f, #25252b);
  border: 2px solid #00d4ff;
  border-radius: 12px;
  padding: 24px;
  
  /* Pulsierender Glow */
  box-shadow: 
    0 0 20px rgba(0, 212, 255, 0.3),
    inset 0 0 20px rgba(0, 212, 255, 0.1);
  
  animation: pulse-glow 2s ease-in-out infinite;
}

@keyframes pulse-glow {
  0%, 100% { 
    box-shadow: 
      0 0 20px rgba(0, 212, 255, 0.3),
      inset 0 0 20px rgba(0, 212, 255, 0.1);
  }
  50% { 
    box-shadow: 
      0 0 30px rgba(0, 212, 255, 0.5),
      0 0 40px rgba(0, 212, 255, 0.3),
      inset 0 0 25px rgba(0, 212, 255, 0.15);
  }
}

/* Accessibility: Disable animations */
@media (prefers-reduced-motion: reduce) {
  .experience-input {
    animation: none;
    box-shadow: 0 0 20px rgba(0, 212, 255, 0.3);
  }
}
```

### Erklärung Header
**Text:** "Was macht eine gute XP-Eintragung aus?"

**Bullet Points:**
- Erzähle was passiert ist, wann und wo
- Je mehr Details, desto besser können wir Muster finden
- Irrelevant wirkende Details sind oft die wichtigsten!

**Styling:** 
- Neon-Blau für Überschrift
- Weiß/Hellgrau für Bullets
- Icon vor jedem Punkt (✨)

### Text Input Features

#### Animierter Cursor
- **Standard `|` Cursor ERSETZEN durch:** Pulsierendes Neon-Dreieck `▲`
- Animation: Fade in/out, leichtes Pulsieren
- Farbe: Neon-Blau `#00d4ff`

#### Progress Bar (Wort-Zähler)
**Anforderungen:**
- **Minimum:** 50 Wörter (Soft-Limit)
- **Maximum:** 9,999 Wörter
- **Verhalten:**
  - Bei <50 Wörtern: Gelb-Orange Farbverlauf
  - Bei 50+ Wörtern: Neon-Grün Farbverlauf
  - Bar füllt sich beim Tippen in Echtzeit

**Soft-Limit Warning (bei <50 Wörtern):**
```
⚠️ Kurze Einträge sind okay, aber mehr Details helfen 
   bei Pattern Discovery (+20 XP für 50+ Wörter)
```
- KEIN Hard-Block, User kann trotzdem weiter
- Motivierend, nicht einschränkend

**Dynamisches Wachstum:**
- Bei Erreichen von 50 Wörtern: Bar wird nicht 100%
- Stattdessen: Bar verschiebt sich in smooth Animation nach links
- Neue Milestone erscheint rechts (z.B. 150 Wörter für Silber)
- Bar skaliert weiter dynamisch

**Milestone System:**
```javascript
const MILESTONES = {
  bronze: { words: 50, xp: 20, color: '#CD7F32' },
  silver: { words: 150, xp: 50, color: '#C0C0C0' },
  gold: { words: 300, xp: 100, color: '#FFD700' },
  platinum: { words: 500, xp: 200, color: '#E5E4E2' }
};
```

**Anzeige:**
```
47 Wörter • Noch 3 bis Bronze-Tier (+20 XP)
[▰▰▰▰▰▰▰▰▰▱▱▱▱▱▱▱▱▱▱▱] 47/50
```

### Upload Buttons (Unten links)

#### 📷 Foto/OCR Upload Button
**Position:** Unten links neben Voice Button
**Icon:** Kamera-Symbol in Neon-Blau
**Hover:** Symbol wechselt zu Scanner-Icon, Neon-Grün
**Tooltip:** "Fotos, Videos, Audios oder handgeschriebene Notizen (OCR) hochladen"

**Funktionalität:**
- Öffnet File-Picker
- Akzeptiert: `.jpg`, `.png`, `.pdf`, `.mp4`, `.mov`, `.mp3`, `.wav`
- Bei handgeschriebenen Notizen: OCR-Processing via Tesseract.js oder Cloud OCR API
- Extracted Text wird in Textbox eingefügt mit Hinweis: 
  ```
  ✨ Via OCR erkannt - bitte prüfen und korrigieren
  ```

**Upload UI:**
- Thumbnails erscheinen unter Textbox
- Zeige Upload-Progress mit Neon-Blau-Bar
- Nach Upload: "3 Dateien hochgeladen" Badge

**Vorteil:**
- User kann Fotos SOFORT hochladen (nicht erst am Ende)
- Files werden gespeichert und in weiteren Schritten mitgenommen
- Kein zweifaches Hochladen nötig

#### 💾 Save Draft Button
**Position:** Unten links
**Icon:** Disketten-Symbol in Neon-Purple
**Tooltip:** "Entwurf speichern - jederzeit fortsetzen"

**Funktionalität:**
- Auto-Save alle 30 Sekunden
- Manuelles Speichern per Click
- Toast Notification: "Entwurf gespeichert ✓"
- Draft-System: localStorage + Backend Sync

### Voice Input System

#### Button Design (Initial)
**Position:** Mitte unten in der Box
**Icon:** Modernes Mikrofon-Symbol 🎤
**Farbe:** Neon-Blau

**Hover-Effekt:**
- Symbol transformiert zu pulsierende Wave-Form
- Farbe wechselt zu Neon-Grün
- Subtle Scale-Animation (1.0 → 1.1)
- Glow intensiviert sich

**Tooltip (on hover):**
```
🎤 Diktiere deine Experience
Wir transkribieren automatisch - du kannst danach editieren
```

#### Voice-Modus Aktivierung

**Transition:**
1. User klickt Mikrofon-Button
2. Button morpht zu Recording-Interface
3. Fenster expanded nach oben (nicht Overlay, sondern Toggle!)
4. Textbox bleibt sichtbar aber blurred im Hintergrund

**Voice Recording UI:**
```
┌────────────────────────────────────────────┐
│  🎤 Diktiere deine Experience              │
│                                            │
│  Sprich natürlich und erzähle             │
│  chronologisch. Wir erfassen alles.       │
│                                            │
│  ┌──────────────────────────────────────┐ │
│  │ ████▌▌▌▌████████▌▌▌▌█████▌▌▌▌        │ │ ← TRON Wave
│  │ ████▌▌▌▌████████▌▌▌▌█████▌▌▌▌        │ │
│  └──────────────────────────────────────┘ │
│                                            │
│  [Aufnahme läuft... 0:23]                 │
│                                            │
│  [⏸️ Pause] [⏹️ Fertig] [🗑️ Verwerfen]   │
└────────────────────────────────────────────┘
```

**TRON Wave Visualization:**
- Echtzeit-Audio-Waveform
- Farbe: Neon-Blau pulsierend basierend auf Lautstärke
- Höhe der Bars = Amplitude
- Smooth Animation mit Canvas oder SVG
- Library: WaveSurfer.js oder custom Canvas

**Buttons während Recording:**
- **⏸️ Pause:** Gelbes Neon-Icon, pausiert Recording
- **⏹️ Fertig:** Neon-Grün, stoppt und transkribiert
- **🗑️ Verwerfen:** Neon-Rot, löscht Recording

#### Transkription & Text-Erscheinung

**Nach "Fertig" Click:**
1. Wave-Form stoppt
2. Loading-Animation erscheint: "Transkribiere... 🧠"
3. Text wird in Textbox eingefügt

**Text-Fade Animation:**
- NICHT klassischer Typewriter-Effekt (zu langsam)
- Stattdessen: Gesamter Text faded magisch ein
- Opacity 0 → 1 über 0.5 Sekunden
- Subtle Scale-Animation: 0.98 → 1.0
- Neon-Blau Glow umrandet Text kurz

**Info-Tooltip erscheint:**
```
✓ Transkription abgeschlossen

Bitte überprüfe den Text auf Fehler.
Voice-Erkennung ist gut, aber nicht perfekt.

[OK, verstanden]
```

**Buttons nach Transkription:**
- **Weiter →** (Neon-Grün) - Geht zu Schritt 2
- **🔄 Zurücksetzen** (links) - Löscht Text, zurück zu leerem Input
- **💾 Entwurf speichern** (links) - Speichert und erlaubt später fortsetzen

---

## ✨ SCHRITT 2: AI Preview & Critical Questions

### Transition
- Smooth morph von Schritt 1 zu Schritt 2
- Text-Box morpht zu Preview-Card
- Duration: 0.5s, easeInOut
- Während Transition: "Analysiere deine Experience... 🧠" Loading

### Layout
```
┌────────────────────────────────────────────────┐
│  ✨ Folgende Dinge wurden automatisch erkannt  │
├────────────────────────────────────────────────┤
│                                                │
│  📝 TITEL                                      │
│  Blaues Dreieck über Berlin                    │
│  [✏️ Bearbeiten]                               │
│                                                │
│  📂 KATEGORIE                                  │
│  UFO-Sichtung                  [Ändern ▼]      │
│                                                │
│  🏷️ TAGS                                       │
│  [UFO] [Blaues Licht] [Dreieck] [Berlin]      │
│  [Nacht] [Intelligent] [+ Hinzufügen]          │
│                                                │
│  ──────────────────────────────────────────    │
│                                                │
│  📋 Noch ein paar wichtige Infos               │
│                                                │
│  📅 Wann war das?                              │
│  [Datum Picker] [Zeit Picker]                  │
│                                                │
│  📍 Wo war das?                                │
│  [Berlin, Deutschland ▼]                       │
│                                                │
│  ✓ Kategorie bestätigen                        │
│  [UFO-Sichtung ist korrekt]                    │
│                                                │
│  [Weiter →]                                    │
└────────────────────────────────────────────────┘
```

### AI-Extraktion Preview

#### Header
**Text:** "✨ Folgende Dinge wurden automatisch erkannt"
**Styling:** Neon-Blau, Font-Size: 24px, Font-Weight: 600

#### Titel
- **Auto-generiert via OpenAI GPT-4o-mini**
- Prompt: "Create a SHORT, catchy title (max 6 words) for this experience"
- Beispiel: "Blaues Dreieck über Berlin"
- **Editierbar:** Click auf ✏️ Icon macht Feld zu Input
- Styling: Font-Size 20px, Font-Weight: 700

#### Kategorie
- **Backend-System leitet ab** aus Kategorie-Definitions (field_definitions table)
- Dropdown-Auswahl falls User ändern will
- Optionen: UFO-Sichtung, Traum, Nahtoderfahrung, Meditation, etc.
- Styling: Neon-Grün Badge wenn bestätigt

#### Tags
**NUR EINE Art von Tags (keine Haupt/Neben-Unterscheidung mehr)**

**Darstellung:**
- Alle Tags gleich styled
- Neon-Blau Background mit Glow
- Interaktiv: Hover → Neon-Grün
- Click auf X → Tag löscht sich mit Fade-Animation
- "+ Hinzufügen" Button öffnet Input-Field

**Tag Input:**
- User tippt → Auto-Suggest aus bestehenden Tags
- Enter oder Click → Tag wird hinzugefügt
- Max 12 Tags empfohlen

### Critical Questions (Tier 1)

**Ziel:** NUR 2-3 absolut notwendige Fragen
**Regel:** ALLES auf EINER Seite, KEINE Pagination

**Standard-Fragen (für alle Kategorien):**
1. **Datum/Zeit:** Wann war das?
   - Datum-Picker + Zeit-Picker
   - Default: "Heute" vorausgefüllt
   - User kann ändern

2. **Ort:** Wo war das?
   - Textfield mit Auto-Complete (Stadt-Datenbank)
   - Oder: "Unbekannt" / "Ich möchte es nicht angeben"
   - Privacy-Option: Genauigkeit wählen (Stadt, Region, Land)

3. **Kategorie-Bestätigung:** Ist UFO-Sichtung korrekt?
   - Checkbox: "Ja, Kategorie ist korrekt"
   - Falls nein: Dropdown erscheint

**Alle auf einer Seite!**
- Kein "Weiter" zwischen Fragen
- Alles sichtbar, scrollbar falls nötig
- "Weiter" Button erst am Ende

**Weiter Button:**
- Neon-Grün
- Text: "Weiter →"
- Disabled solange Pflichtfelder leer
- Hover: Intensiverer Glow

---

## 💎 SCHRITT 3: Optional Questions (Tier 2)

### Transition
- Von Schritt 2 nach 3 mit smooth morph
- Info-Card erscheint first

### Intro Card
```
┌────────────────────────────────────────────────┐
│  💎 Verdiene bis zu 50 XP!                     │
│                                                │
│  Diese Fragen helfen uns bessere               │
│  Verbindungen zu finden.                       │
│                                                │
│  Jede Frage: +10 XP                            │
│  Alle Fragen: +50 XP + Bonus Badge             │
│                                                │
│  [Fragen überspringen] [Zeig mir die Fragen →]│
└────────────────────────────────────────────────┘
```

**User Choice:**
- **Überspringen:** Geht direkt zu Schritt 4 (oder 5 wenn keine Uploads)
- **Zeig mir die Fragen:** Expanded zu Question-Cards

### Question Layout

**3-5 Fragen, dynamisch basierend auf Kategorie**

**Format:** Swipeable Cards (wie Tinder)
```
┌────────────────────────────────────────────────┐
│  Frage 2 von 5                        +10 XP   │
│  ──────────────────────────────────────        │
│                                                │
│  Wie lange dauerte die Sichtung?               │
│                                                │
│  ○ Weniger als 1 Minute                        │
│  ○ 1-5 Minuten                                 │
│  ○ Mehr als 5 Minuten                          │
│  ○ Weiß nicht mehr                             │
│                                                │
│  💡 Tipp: Längere Sichtungen korrelieren       │
│     mit klareren Details                       │
│                                                │
│  [← Zurück] [Überspringen] [Weiter →]         │
└────────────────────────────────────────────────┘
```

**Features:**
- **Vor/Zurück Navigation:** User kann zwischen Fragen springen
- **Überspringen:** Überspringt diese Frage, geht zur nächsten
- **Progress:** "Frage X von Y" oben
- **XP-Badge:** Zeigt +10 XP für diese Frage
- **Tipp/Info:** Erklärt WARUM diese Frage wichtig ist

**Question Types:**
- Single-Choice (Radio Buttons)
- Multi-Choice (Checkboxes)
- Scale (1-10 Slider mit Neon-Glow)
- Text (Optional, kurz)

**Dynamische Frage-Auswahl:**
- Backend `field_definitions` table definiert Fragen pro Kategorie
- `show_if_conditions` prüft ob Frage relevant ist (basierend auf Tags/Keywords)
- Sortierung nach `priority` (high → medium → low)
- Max 5 Fragen in diesem Tier

**XP Tracking:**
```
[Fortschritt: 30/50 XP]
[▰▰▰▰▰▰▰▱▱▱] 
```

**Fertig Button:**
- Nach letzter Frage oder bei Skip erscheint:
- "Fertig mit Tier 2 → +30 XP verdient!" Toast
- Auto-Advance zu nächstem Schritt

---

## 🌟 SCHRITT 4: Deep Dive Questions (Tier 3) - Optional

### Opt-In Screen
```
┌────────────────────────────────────────────────┐
│  🌟 XP Share lebt von den Details!             │
│                                                │
│  "Irrelevant wirkende Details sind oft         │
│   der Schlüssel zu versteckten Mustern."       │
│                                                │
│  Noch 2-5 Fragen beantworten?                  │
│  Jede Frage: +15 XP (wertvoller!)              │
│                                                │
│  🔓 Unlock Pattern Discovery Bonus             │
│                                                │
│  [Nein danke, weiter] [Ja, zeig die Fragen →] │
└────────────────────────────────────────────────┘
```

**User muss AKTIV wählen:**
- Default: Nicht automatisch aktiviert
- Nur wenn User "Ja" klickt → Deep Dive Questions

### Question Format

**Ähnlich wie Tier 2, aber:**
- +15 XP pro Frage (statt +10)
- 2-5 Fragen max
- Noch spezifischer/detaillierter
- Oft offene Text-Felder

**Beispiel-Fragen (UFO-Kategorie):**
```
1. Hattest du physische Symptome?
   (Text-Area, optional)
   
2. Gab es elektromagnetische Effekte?
   (Checkboxes: Lichter flackerten, Handy tot, etc.)
   
3. Wie fühltest du dich emotional?
   (Scale: Angst ←→ Frieden, 1-10 Slider)
```

**Completion Bonus:**
```
✨ Alle Tier 3 Fragen beantwortet!
+15 XP × 5 = 75 XP
+ Pattern Discovery Badge
+ Featured in Discovery Feed
```

---

## 📎 SCHRITT 5: Anhang-Details - Nur wenn Uploads existieren

**Condition:** Dieser Schritt erscheint NUR wenn User in Schritt 1 Dateien hochgeladen hat

### Layout
```
┌────────────────────────────────────────────────┐
│  📷 Details zu deinen Anhängen                 │
│                                                │
│  [Thumbnail 1] IMG_1234.jpg                    │
│  ├─ Was zeigt dieses Bild?                     │
│  │  [Textfeld: Optional beschreiben]           │
│  │                                             │
│  └─ ☐ Dies ist der Hauptbeweis                │
│     ☐ Kontext/Hintergrund                     │
│                                                │
│  [Thumbnail 2] video_2025.mp4                  │
│  ├─ Was ist hier zu sehen?                     │
│  │  [Textfeld]                                 │
│  │                                             │
│  └─ ☐ Hauptbeweis ☐ Kontext                   │
│                                                │
│  [Alle Details optional - überspringen okay]   │
│                                                │
│  [Überspringen] [Weiter →]                     │
└────────────────────────────────────────────────┘
```

**Features:**
- **Thumbnails:** Zeige Preview der hochgeladenen Dateien
- **Optional Descriptions:** User KANN beschreiben, MUSS aber nicht
- **Checkboxes:** Kategorisierung (Hauptbeweis vs Kontext)
- **Überspringen möglich:** Kein Zwang, Details hinzuzufügen

**Upload-Progress (falls hier nachträglich hochgeladen):**
```
Lade hoch... 47%
[▰▰▰▰▰▰▰▰▰▰▱▱▱▱▱▱▱▱▱▱]
```
- Neon-Blau Bar
- Prozent-Anzeige
- File-Name

---

## 👥 SCHRITT 6: Augenzeugen - Optional

### Intro
```
┌────────────────────────────────────────────────┐
│  👥 War jemand dabei?                          │
│                                                │
│  Experiences mit Augenzeugen:                  │
│  ✓ Sind glaubwürdiger                         │
│  ✓ Erscheinen höher im Feed                   │
│  ✓ Erhalten Trust Badge                       │
│  ✓ +50 XP pro bestätigtem Zeuge               │
│                                                │
│  [Nein, ich war allein] [Ja, hinzufügen →]    │
└────────────────────────────────────────────────┘
```

### Witness Hinzufügen

**3 Optionen:**
```
┌────────────────────────────────────────────────┐
│  Wie möchtest du Augenzeugen hinzufügen?       │
│                                                │
│  1️⃣ User suchen                                │
│     [🔍 Username eingeben]                     │
│     → Suche nach existierenden XP Share Users │
│                                                │
│  2️⃣ Per Email einladen                         │
│     [📧 Email-Adresse eingeben]                │
│     → Wir senden einen Invite                  │
│                                                │
│  3️⃣ Invite-Link teilen                         │
│     [📋 Link kopieren]                         │
│     → Teile per WhatsApp, Telegram, etc.      │
│                                                │
│  [Weiteren Zeugen hinzufügen] [Fertig →]      │
└────────────────────────────────────────────────┘
```

**Username-Suche:**
- Live-Search mit Auto-Complete
- Zeigt User-Avatar + Username
- Click → User wird als Witness getagged
- Status: "Ausstehend" bis User bestätigt

**Email-Invite:**
- Email-Input mit Validation
- Optional: Nachricht hinzufügen
- System sendet Email mit Link
- +25 XP wenn Invite zu neuem User führt
- +50 XP wenn neuer User Experience bestätigt

**Invite-Link:**
- Generiert unique Link: `xpshare.io/witness/abc123`
- Click → Kopiert in Clipboard
- Toast: "Link kopiert! Teile ihn mit deinen Zeugen"
- Link enthält Experience-ID + Invite-Code

**Witness Tracking:**
```
👤 Max Mustermann (ausstehend)
👤 jane@email.com (Email gesendet)
👤 [Invite-Link] (geteilt)
```

**XP Rewards:**
- +25 XP pro hinzugefügtem Witness (sofort)
- +50 XP wenn Witness Experience bestätigt
- +100 XP Bonus wenn 3+ Witnesses bestätigen (Trust Badge)

---

## 🎯 SCHRITT 7: Final Review & AI Enhancement

### Layout Overview
```
┌────────────────────────────────────────────────┐
│  🎯 Letzte Überprüfung                         │
├────────────────────────────────────────────────┤
│                                                │
│  Blaues Dreieck über Berlin          [✏️ Edit]│
│  ──────────────────────────────────────        │
│                                                │
│  [UFO] [Blaues Licht] [Dreieck]       [✏️]    │
│                                                │
│  ┌──────────────────────────────────────────┐ │
│  │ 🧠 AI Enhanced [●─────]                  │ │
│  │ ───────────────────────────────────────  │ │
│  │                                          │ │
│  │ Gestern Nacht, 3:33 Uhr, sah ich ein    │ │
│  │ blaues dreieckiges Objekt über Berlin.  │ │
│  │                                          │ │
│  │ ▌Das Objekt schwebte etwa 100 Meter    │ │ ← Neon Blau
│  │ ▌über dem Boden und war so groß wie    │ │   Glow
│  │ ▌ein Bus.                               │ │
│  │                                          │ │
│  │ Es bewegte sich intelligent             │ │
│  │                                          │ │
│  │ ▌und reagierte auf meine Gedanken.     │ │ ← Neon Grün
│  │                                          │ │   Glow
│  │ [Expand ↓]                              │ │
│  └──────────────────────────────────────────┘ │
│                                                │
│  🔒 Privatsphäre                               │
│  ○ Öffentlich    ● Anonym    ○ Privat         │
│                                                │
│  [Zurück] [Als Entwurf] [🚀 XP Speichern]     │
└────────────────────────────────────────────────┘
```

### AI Enhanced Toggle & Inline Highlighting

**Toggle Design:**
```css
.neon-toggle {
  /* Neon Switch wie in meinem Beispiel */
  width: 50px;
  height: 24px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(0, 212, 255, 0.3);
  border-radius: 24px;
}

.neon-toggle.active {
  background: rgba(0, 212, 255, 0.3);
  border-color: #00d4ff;
  box-shadow: 0 0 10px rgba(0, 212, 255, 0.5);
}
```

**Text mit Inline-Highlighting:**

**AI Enhanced = ON (Default):**
- Original Text: Normale Farbe (Weiß/Hellgrau)
- **AI Added Text:** 
  - Neon-Blau `#00d4ff`
  - Background: `rgba(0, 212, 255, 0.1)`
  - Border-left: `3px solid #00d4ff`
  - Box-shadow: `0 0 10px rgba(0, 212, 255, 0.2)`
  - Padding: `2px 6px`
  - Margin: `0 2px`
  
- **AI Enhanced Text (verbessert):**
  - Neon-Grün `#00ff88`
  - Background: `rgba(0, 255, 136, 0.1)`
  - Border-left: `3px solid #00ff88`
  - Box-shadow: `0 0 10px rgba(0, 255, 136, 0.2)`

**Hover-Effekt:**
- Highlighted Text: Hover → Intensiverer Glow
- Optional: Tooltip zeigt Source
  ```
  💡 Hinzugefügt aus Frage:
     "Wie hoch war das Objekt?"
  ```

**AI Enhanced = OFF:**
- Zeigt RAW Original Text
- Keine Highlights
- Grauerer Farbton
- User sieht exakt was er getippt/diktiert hat

**Legende (unten wenn Enhanced):**
```
[■ Neon Blau] Aus deinen Antworten hinzugefügt
[■ Neon Grün] Verbessert für Klarheit
```

**Expand Button:**
- Bei langen Texten: Erste 3-4 Zeilen sichtbar
- "Expand ↓" Button in Neon-Blau
- Click → Zeigt kompletten Text
- "Collapse ↑" erscheint dann

### Privacy Settings

**3 Optionen:**
```
🔒 Privatsphäre

○ Öffentlich
  Jeder kann deine Experience sehen
  Erscheint im öffentlichen Feed
  
● Anonym
  Experience wird veröffentlicht
  Mit "Anonym" Badge statt Username
  Nachrichten erlauben: [✓]
  
○ Privat
  Nur du siehst diese Experience
  Nicht im Feed, nicht suchbar
```

**Anonym-Modus Details:**
- User-Badge zeigt "👤 Anonym" statt Username
- System weiß wer es ist (für Pattern Discovery)
- Aber: Öffentlich nicht erkennbar
- Optional: "Nachrichten erlauben" Checkbox
  - Wenn ✓: User können verschlüsselte Messages senden
  - System leitet weiter ohne Identity zu verraten

### Action Buttons

**3 Buttons:**
1. **Zurück:** 
   - Grauer Outline Button
   - Geht zu vorigem Schritt
   
2. **Als Entwurf:**
   - Neon-Purple Outline
   - Speichert ohne zu publishen
   - Toast: "Entwurf gespeichert ✓"
   
3. **🚀 XP Speichern:**
   - Großer Neon-Grün Filled Button
   - Glow-Effekt
   - Hover: Intensiver Glow + Scale 1.05
   - Click → Triggers Save & Similar Search

---

## 🎊 SCHRITT 8: Success & Similar Experiences

### Saving Animation

**User klickt "XP Speichern":**
1. Button disabled mit Loading Spinner
2. Screen blurred
3. Center Overlay erscheint:

```
┌────────────────────────────────────────────────┐
│                                                │
│         🌀 Speichere deine Experience...       │
│                                                │
│         [Rotating Neon Circle Animation]       │
│                                                │
│         Suche ähnliche Einträge...             │
│                                                │
└────────────────────────────────────────────────┘
```

**Loading States:**
- Phase 1: "Speichere..." (0.5s)
- Phase 2: "Generiere Embeddings..." (1s)
- Phase 3: "Suche ähnliche Experiences..." (1-2s)
- Phase 4: "Fertig! ✨"

### Success Screen

**Nach Loading (2-3 Sekunden):**
```
┌────────────────────────────────────────────────┐
│  ✨ Experience gespeichert!                    │
│                                                │
│  +150 XP verdient 🎉                           │
│  Level 3 → Level 4                             │
│  Neue Badge: "Truth Seeker"                    │
│                                                │
│  ──────────────────────────────────────────    │
│                                                │
│  🔍 Wir haben ähnliche Experiences gefunden!   │
│                                                │
│  Top Matches:                                  │
│                                                │
│  ┌──────────────────────────────────────────┐ │
│  │ 🛸 Dreieckiges Objekt über München       │ │
│  │ @user123 • vor 2 Wochen                  │ │
│  │                                          │ │
│  │ 89% Ähnlichkeit                          │ │
│  │ ▌Übereinstimmung: Blaues Licht, Dreieck │ │
│  │ ▌Bewegung, Nacht, Intelligentes         │ │
│  │ ▌Verhalten                               │ │
│  │                                          │ │
│  │ [Öffnen →]                               │ │
│  └──────────────────────────────────────────┘ │
│                                                │
│  ┌──────────────────────────────────────────┐ │
│  │ 🌃 Lichter über Berlin                   │ │
│  │ @jane_doe • vor 1 Monat                  │ │
│  │                                          │ │
│  │ 76% Ähnlichkeit                          │ │
│  │ ▌Übereinstimmung: Ort (Berlin), 3:33    │ │
│  │ ▌Uhr, Blaues Licht                       │ │
│  │                                          │ │
│  │ [Öffnen →]                               │ │
│  └──────────────────────────────────────────┘ │
│                                                │
│  [Alle 12 Matches anzeigen]  [X Schließen]    │
└────────────────────────────────────────────────┘
```

### Similar Experiences Cards

**Card Design:**
- Glassmorphism Background
- Neon-Blau Border
- Thumbnail (falls vorhanden)
- Titel + Username + Zeitstempel
- **Confidence Score:** 
  - Prozent-Anzeige (z.B. 89%)
  - Farbcodiert: >80% = Grün, 60-80% = Gelb, <60% = Orange
- **Match-Gründe:**
  - "Übereinstimmung: Blaues Licht, Dreieck..."
  - Inline in Neon-Blau highlighted
  - Max 3-4 Gründe anzeigen

**Interaktionen:**
- **[Öffnen →]:** Öffnet Experience in neuem Overlay/Modal
- **Card-Click:** Gleiches wie Öffnen-Button
- **Hover:** Card liftet, Glow intensiviert

### "Alle anzeigen" View

**User klickt "Alle 12 Matches anzeigen":**
- Neue Seite oder Full-Screen Overlay
- Filter/Sort Options:
  ```
  Sortieren: [Ähnlichkeit ▼] [Datum ▼] [Ort ▼]
  Ansicht:   [■ Kacheln] [≡ Liste] [🗺️ Karte]
  ```
- **Kachel-Ansicht:** Grid mit Cards (3 Spalten Desktop, 1 Mobile)
- **Listen-Ansicht:** Kompakte Liste mit Titel + Score
- **Karten-Ansicht:** Map mit Pins (falls Geo-Data vorhanden)

**Pagination:**
- Infinite Scroll
- Oder: "Mehr laden" Button

### Close & Navigate

**[X Schließen] Button:**
- Schließt Overlay
- User landet auf seiner eigenen Experience-Seite
- Post ist nun live (falls Public/Anonym)

**Experience-Seite:**
- Zeigt eigenen Post
- Comments-Section
- Share-Buttons
- "Weitere ähnliche finden" Button

---

## 📊 Zusammenfassung: Optimierter Flow

### Screen-Übersicht (Minimum Path)
```
1. Text Input + Early Upload (1 Screen)
2. AI Preview + Critical Questions (1 Screen - max 3 Fragen)
3. Final Review + Similar (1 Screen)

= 3 SCREENS minimum
= 2-3 Fragen minimum
= 3-5 Minuten
```

### Screen-Übersicht (Full Path)
```
1. Text Input + Early Upload
2. AI Preview + Critical Questions
3. Optional Questions Tier 2 (opt-in)
4. Deep Dive Tier 3 (opt-in)
5. Anhang-Details (nur wenn Uploads)
6. Witnesses (opt-in)
7. Final Review
8. Similar Experiences

= Max 8 Screens
= Max 15 Fragen
= 10-15 Minuten
= 200+ XP möglich
```

### XP Breakdown
```
Text eingeben (50+ Wörter):          +20 XP
Text eingeben (300+ Wörter):         +100 XP
Critical Questions (3):              +0 XP (Pflicht)
Tier 2 Questions (5 × 10):           +50 XP
Tier 3 Questions (5 × 15):           +75 XP
Anhang-Details:                      +10 XP
Witness hinzufügen:                  +25 XP
Witness bestätigt:                   +50 XP
Experience veröffentlicht:           +50 XP
──────────────────────────────────────────
TOTAL (Full Path):                   +380 XP
+ Pattern Discovery Badge
+ Featured Listing
```

### Gamification Milestones
```
Bronze:   50 Wörter     (+20 XP)
Silver:   150 Wörter    (+50 XP)
Gold:     300 Wörter    (+100 XP)
Platinum: 500 Wörter    (+200 XP)

Badges:
- First Post (automatisch)
- Truth Seeker (3 Tier 3 completed)
- Storyteller (10+ Experiences)
- Witness Network (5+ witnesses)
- Pattern Finder (found in 10+ similar)
```

---

## 🎯 Design Tokens (für Developer)

### Colors
```css
:root {
  /* Backgrounds */
  --bg-primary: #1a1a1f;
  --bg-secondary: #25252b;
  --bg-tertiary: #2f2f35;
  
  /* Neon Colors */
  --neon-blue: #00d4ff;
  --neon-green: #00ff88;
  --neon-red: #ff0055;
  --neon-yellow: #ffff00;
  --neon-purple: #b000ff;
  
  /* Text */
  --text-primary: #ffffff;
  --text-secondary: #e0e0e0;
  --text-tertiary: #a0a0a0;
  
  /* Glassmorphism */
  --glass-bg: rgba(255, 255, 255, 0.05);
  --glass-border: rgba(0, 212, 255, 0.3);
  
  /* Shadows */
  --glow-blue: 0 0 20px rgba(0, 212, 255, 0.5);
  --glow-green: 0 0 20px rgba(0, 255, 136, 0.5);
  --glow-red: 0 0 20px rgba(255, 0, 85, 0.5);
}
```

### Typography
```css
:root {
  /* Font Family */
  --font-primary: 'Inter', -apple-system, sans-serif;
  
  /* Font Sizes */
  --text-xs: 12px;
  --text-sm: 14px;
  --text-base: 16px;
  --text-lg: 18px;
  --text-xl: 20px;
  --text-2xl: 24px;
  --text-3xl: 30px;
  --text-4xl: 36px;
  
  /* Font Weights */
  --font-regular: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;
  
  /* Line Heights */
  --leading-tight: 1.2;
  --leading-normal: 1.5;
  --leading-relaxed: 1.8;
}
```

### Spacing
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

### Animations
```css
:root {
  --transition-fast: 150ms;
  --transition-base: 200ms;
  --transition-slow: 300ms;
  --transition-slower: 500ms;
  
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
}

/* Pulse Animation */
@keyframes pulse-glow {
  0%, 100% { 
    box-shadow: 0 0 20px rgba(0, 212, 255, 0.3);
  }
  50% { 
    box-shadow: 0 0 40px rgba(0, 212, 255, 0.6);
  }
}

/* Accessibility */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
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

## 📱 Mobile Considerations

### Responsive Breakpoints
```css
/* Mobile First */
@media (min-width: 640px)  { /* sm */ }
@media (min-width: 768px)  { /* md */ }
@media (min-width: 1024px) { /* lg */ }
@media (min-width: 1280px) { /* xl */ }
```

### Mobile-Specific Adjustments
- Voice Input: Größerer Button (min 48px touch target)
- Text Input: Auto-focus on mobile, Keyboard-friendly
- Cards: Single column auf Mobile
- Swipeable: Touch-Gestures für Question Cards
- Upload: Native Camera/Gallery Picker
- Progress Bar: Sticky top auf Mobile

### Performance
- Lazy Load Images/Videos
- Virtualized Lists für lange Similar-Listen
- Service Worker für Offline-Draft
- IndexedDB für lokale Draft-Speicherung

---

## 🔐 Security & Privacy

### Data Handling
- All uploads encrypted in transit (HTTPS)
- Optional E2E encryption für Private Experiences
- Anonym-Mode: No IP/Device fingerprinting stored
- GDPR: Full data export + deletion on request

### Content Moderation
- AI Pre-Screening (OpenAI Moderation API)
- User Reports System
- Human Moderator Review für flagged content
- Automatic blur für NSFW media

---

## 🎯 Success Metrics

### Track:
- **Completion Rate:** % der User die Schritt 7 erreichen
- **Drop-off Points:** Wo brechen User ab?
- **Average Questions Answered:** Tier 2 + 3
- **Upload Rate:** % mit Attachments
- **Witness Add Rate:** % mit Witnesses
- **Similar Match Quality:** User Feedback auf Matches
- **Time to Complete:** Durchschnitt pro Tier

### Goals:
- Completion Rate: >70%
- Drop-off bei Tier 3: <40% (opt-in ist okay)
- Average Time: 5-8 Minuten für Standard Path
- Match Quality Score: >80% "relevant"

---

## 📝 Implementation Notes

### Tech Stack Recommendation
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
1. **Week 1-2:** Schritt 1 (Text Input + Voice)
2. **Week 3:** Schritt 2 (AI Preview + Critical Q)
3. **Week 4:** Schritt 7 (Final Review + Similar)
4. **Week 5-6:** Tier 2/3 Questions System
5. **Week 7:** Upload + Witness System
6. **Week 8:** Polish + Testing

### Testing Checklist
- [ ] Accessibility: WCAG 2.1 AA compliance
- [ ] Keyboard Navigation: Tab-Index korrekt
- [ ] Screen Reader: ARIA labels
- [ ] Mobile: Touch targets min 48px
- [ ] Performance: Lighthouse Score >90
- [ ] Cross-Browser: Chrome, Safari, Firefox
- [ ] Voice Input: Test auf iOS + Android
- [ ] AI Quality: Titel/Tags accuracy >85%

---

**Ende der Spezifikation**

Version: 1.0  
Datum: 2025-10-12  
Status: Ready for Development