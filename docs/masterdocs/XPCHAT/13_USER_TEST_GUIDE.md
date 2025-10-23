# XPShare XPCHAT - User Test Guide

**Version:** 1.0
**Last Updated:** 2025-10-21
**Purpose:** Complete user manual and testing checklist for all XPCHAT features

---

## 📖 Table of Contents

1. [What is XPCHAT?](#what-is-xpchat)
2. [Getting Started](#getting-started)
3. [Core Search Features](#core-search-features)
4. [Analytics Features](#analytics-features)
5. [Pattern Discovery](#pattern-discovery)
6. [Advanced Features](#advanced-features)
7. [Visualizations](#visualizations)
8. [User Experience Features](#user-experience-features)
9. [Complete Test Scenarios](#complete-test-scenarios)
10. [Expected Behaviors](#expected-behaviors)

---

## What is XPCHAT?

XPCHAT ist dein **AI-gestützter Discovery Assistant** für die XPShare Plattform. Es handelt sich um ein intelligentes Chat-Interface, das dir hilft, außergewöhnliche Erfahrungen (Experiences) zu finden, zu analysieren und Muster zu entdecken.

### Was kann XPCHAT?

- **🔍 Suchen**: Finde Experiences nach Ort, Zeit, Kategorie, Attributen oder semantischer Ähnlichkeit
- **📊 Analysieren**: Erhalte Statistiken, Trends und Vergleiche über Experience-Kategorien
- **🔗 Verbinden**: Entdecke Zusammenhänge zwischen Experiences und Mustern in den Daten
- **💡 Verstehen**: Lass dir Insights generieren, Vorhersagen treffen und Follow-up Fragen vorschlagen
- **📈 Visualisieren**: Sieh deine Ergebnisse als Karte, Timeline, Netzwerk-Graph oder Dashboard
- **💾 Exportieren**: Speichere Ergebnisse als JSON oder CSV für weitere Analysen

### Warum XPCHAT nutzen?

Statt manuell durch Filter und Suchmasken zu klicken, **sprichst du einfach in natürlicher Sprache** mit XPCHAT:
- ❌ **Vorher**: "Ich muss in die Suche → Filter setzen → Kategorie wählen → Datum eingeben → Ort suchen..."
- ✅ **Jetzt**: "Zeig mir UFO Sichtungen in Deutschland aus den letzten 2 Jahren"

---

## Getting Started

### Zugriff auf XPCHAT

1. **Öffne die Discover-Seite**: Navigiere zu `/discover` in deinem Browser
2. **Sieh das Chat-Interface**: Du siehst ein leeres Eingabefeld mit Beispielabfragen darüber
3. **Klicke auf eine Beispielabfrage ODER schreibe deine eigene Frage**
4. **Warte auf die Antwort**: Die AI antwortet in Echtzeit mit streaming text

### Erste Schritte

**Einfache Test-Queries:**
- "Zeig mir die neuesten 10 Experiences"
- "Wie viele UFO Sichtungen gibt es?"
- "Welche Kategorien sind am beliebtesten?"

**Expected Behavior:**
- Die AI sollte innerhalb von 1-2 Sekunden mit dem Antworten beginnen
- Text erscheint Wort für Wort (streaming)
- Wenn Tools verwendet werden, siehst du Tool-Karten mit Ergebnissen
- Du kannst die Antwort jederzeit mit dem STOP-Button unterbrechen

---

## Core Search Features

XPCHAT hat **5 Such-Tools**, die automatisch basierend auf deiner Anfrage ausgewählt werden.

### 1. Advanced Search (Kombinierte Suche)

**Was es macht**: Sucht Experiences nach Kategorie, Ort, Zeit, Datum, Tags und Attributen

**Test-Query:**
```
Zeig mir Traum-Experiences aus Berlin in 2024
```

**Expected Behavior:**
- Tool "advanced_search" wird verwendet
- Ergebnisse zeigen nur Experiences mit category="dreams"
- location_text enthält "Berlin"
- date_occurred ist in 2024
- Visualisierung: Wahrscheinlich Map (wenn Koordinaten vorhanden)

**Weitere Test-Queries:**
- "Finde NDEs in den USA zwischen 2020 und 2023"
- "Suche Synchronizitäts-Erlebnisse mit dem Tag 'numbers'"
- "Zeig mir Astral Projection Experiences in einem Radius von 50km um München"

---

### 2. Search by Attributes (Attribut-Filter)

**Was es macht**: Filtert Experiences basierend auf spezifischen Attributen (z.B. intensity > 8, witness_count EXISTS)

**Test-Query:**
```
Finde Experiences mit intensity größer als 8 UND witness_count vorhanden
```

**Expected Behavior:**
- Tool "search_by_attributes" wird verwendet
- Conditions: [{ field: "intensity", operator: "greater_than", value: 8 }, { field: "witness_count", operator: "exists" }]
- Logic: "AND"
- Nur Experiences mit intensity > 8 UND Zeugen werden zurückgegeben

**Weitere Test-Queries:**
- "Zeig mir Experiences wo duration_minutes größer als 60"
- "Finde Experiences mit emotional_impact = 'life_changing' ODER 'profound'"
- "Suche Experiences mit weather_condition = 'clear' UND time_of_day = 'night'"

---

### 3. Semantic Search (Bedeutungs-Suche)

**Was es macht**: Findet Experiences basierend auf **semantischer Ähnlichkeit** (nicht exakte Wörter, sondern Bedeutung)

**Test-Query:**
```
Finde Experiences über außerkörperliche Erfahrungen
```

**Expected Behavior:**
- Tool "semantic_search" wird verwendet
- Findet nicht nur Experiences mit "außerkörperlich" im Text, sondern auch:
  - Astral Projection
  - Out-of-body experiences
  - Soul travel
  - etc. (alles semantisch ähnlich)
- Similarity Scores werden angezeigt (0-1)

**Weitere Test-Queries:**
- "Suche Erlebnisse über Zeitverzerrung"
- "Finde Experiences mit telepathischer Kommunikation"
- "Zeig mir Begegnungen mit nicht-menschlichen Wesen"

---

### 4. Full Text Search (Volltext-Suche)

**Was es macht**: Durchsucht **Titel und Beschreibungen** nach exakten Wörtern oder Phrasen

**Test-Query:**
```
Suche nach "blue light" in Experiences
```

**Expected Behavior:**
- Tool "full_text_search" wird verwendet
- Findet alle Experiences wo "blue light" im title ODER description vorkommt
- Funktioniert auch auf Deutsch: "blaues Licht"
- Ranking nach Relevanz

**Weitere Test-Queries:**
- "Finde Experiences mit 'portal' im Text"
- "Suche nach 'missing time'"
- "Zeig mir Experiences mit 'humming sound'"

---

### 5. Geo Search (Geografische Suche)

**Was es macht**: Findet Experiences basierend auf **geografischer Nähe** (Radius-Suche oder Bounding Box)

**Test-Query:**
```
Finde UFO Sichtungen in einem Radius von 100km um Köln
```

**Expected Behavior:**
- Tool "geo_search" wird verwendet
- Latitude/Longitude von Köln wird automatisch ermittelt (50.9375, 6.9603)
- Radius: 100km (100000 Meter)
- Nur Experiences mit location_lat/lng innerhalb des Radius
- Visualisierung: Map mit Radius-Circle

**Weitere Test-Queries:**
- "Zeig mir Experiences in einem Rechteck von 48°N, 11°E bis 49°N, 12°E"
- "Finde Traum-Experiences in einem 50km Radius um Paris"
- "Suche Ghost Sightings entlang der Route Berlin → München"

---

## Analytics Features

XPCHAT hat **5 Analytics-Tools** für statistische Analysen.

### 1. Rank Users (User-Rankings)

**Was es macht**: Rankt User nach Anzahl Experiences, Badges, XP oder anderen Metriken

**Test-Query:**
```
Zeig mir die Top 10 User mit den meisten Experiences
```

**Expected Behavior:**
- Tool "rank_users" wird verwendet
- Metric: "experience_count"
- Limit: 10
- Ergebnisse zeigen Username, experience_count, evtl. badges/xp
- Visualisierung: Wahrscheinlich Bar Chart oder Table

**Weitere Test-Queries:**
- "Wer hat die meisten Badges?"
- "Ranke User nach XP level"
- "Zeig mir Top 5 Contributors in der Kategorie Dreams"

---

### 2. Analyze Category (Kategorie-Analyse)

**Was es macht**: Analysiert eine **einzelne Kategorie** (Anzahl, Durchschnitt, Zeitverlauf, Top-Locations)

**Test-Query:**
```
Analysiere die Kategorie UFO
```

**Expected Behavior:**
- Tool "analyze_category" wird verwendet
- Category: "ufo"
- Ergebnisse:
  - Total count
  - Average intensity
  - Average duration
  - Timeline data (Experiences pro Monat/Jahr)
  - Top locations (Geo-Cluster)
- Visualisierung: Timeline Chart + Map

**Weitere Test-Queries:**
- "Wie entwickelt sich die Kategorie Dreams über Zeit?"
- "Analysiere Synchronicity Experiences"
- "Zeig mir Statistiken für NDE"

---

### 3. Compare Categories (Kategorie-Vergleich)

**Was es macht**: Vergleicht **zwei oder mehr Kategorien** (Counts, Intensity, Growth Rate)

**Test-Query:**
```
Vergleiche UFO mit Dreams
```

**Expected Behavior:**
- Tool "compare_categories" wird verwendet
- Categories: ["ufo", "dreams"]
- Ergebnisse:
  - Count comparison (UFO: X, Dreams: Y)
  - Intensity comparison
  - Temporal trends (wer wächst schneller?)
  - Geographic distribution
- Visualisierung: Multi-line Timeline Chart + Comparison Table

**Weitere Test-Queries:**
- "Vergleiche NDE, OBE und Astral Projection"
- "UFO vs Ghost Sightings: Welche Kategorie ist populärer?"
- "Zeig mir Unterschiede zwischen Meditation und Psychedelic Experiences"

---

### 4. Temporal Analysis (Zeit-Analyse)

**Was es macht**: Analysiert Experiences über **Zeiträume** (Trends, Spikes, Saisonalität)

**Test-Query:**
```
Zeig mir den zeitlichen Verlauf von UFO Sichtungen in den letzten 5 Jahren
```

**Expected Behavior:**
- Tool "temporal_analysis" wird verwendet
- Category: "ufo"
- Time range: letzten 5 Jahre
- Granularity: "month" oder "week"
- Ergebnisse:
  - Timeline data (count per period)
  - Trends (steigend/fallend/stabil)
  - Spikes (ungewöhnliche Anstiege)
  - Saisonale Muster (z.B. mehr im Sommer)
- Visualisierung: Timeline Chart mit Trend-Line

**Weitere Test-Queries:**
- "Gibt es saisonale Muster bei Dream Experiences?"
- "Zeig mir Wachstum von Synchronicity Experiences seit 2020"
- "Wann gab es die meisten NDE Reports?"

---

### 5. Attribute Correlation (Attribut-Korrelation)

**Was es macht**: Findet **Korrelationen** zwischen Attributen (z.B. intensity vs witness_count)

**Test-Query:**
```
Gibt es einen Zusammenhang zwischen intensity und witness_count?
```

**Expected Behavior:**
- Tool "attribute_correlation" wird verwendet
- Attributes: ["intensity", "witness_count"]
- Ergebnisse:
  - Correlation coefficient (-1 bis +1)
  - Interpretation (positiv/negativ/keine Korrelation)
  - Scatter plot data (wenn möglich)
- Visualisierung: Scatter Plot oder Heatmap

**Weitere Test-Queries:**
- "Korreliert duration_minutes mit emotional_impact?"
- "Gibt es einen Zusammenhang zwischen time_of_day und category?"
- "Zeig mir Korrelationen zwischen allen numerischen Attributen"

---

## Pattern Discovery

XPCHAT hat **2 Tools** für Muster- und Beziehungserkennung.

### 1. Find Connections (Verbindungen finden)

**Was es macht**: Findet **ähnliche Experiences** basierend auf:
- Semantischer Ähnlichkeit (Embedding-Vektoren)
- Geografischer Nähe
- Zeitlicher Nähe
- Geteilten Attributen

**Test-Query:**
```
Finde ähnliche Experiences zu Experience ID abc123
```

**Expected Behavior:**
- Tool "find_connections" wird verwendet
- Experience ID: abc123
- Min similarity: 0.7 (default)
- Ergebnisse:
  - Liste ähnlicher Experiences mit Similarity Scores
  - Gründe für Ähnlichkeit (semantic/geo/temporal/attributes)
  - Visualisierung: Network Graph mit Experience-Nodes

**Weitere Test-Queries:**
- "Zeig mir Experiences die meiner letzten Submission ähneln"
- "Finde Connections zwischen UFO Sichtungen in der gleichen Region"
- "Welche Experiences sind mit dem Thema 'Zeitreise' verbunden?"

---

### 2. Detect Patterns (Muster erkennen)

**Was it macht**: Findet **Muster** in den Daten:
- Geografische Cluster (DBSCAN)
- Zeitliche Muster (Spikes, Trends)
- Semantische Cluster (Theme Detection)
- Attribut-Muster (häufige Kombinationen)

**Test-Query:**
```
Gibt es geografische Cluster bei UFO Sichtungen?
```

**Expected Behavior:**
- Tool "detect_patterns" wird verwendet
- Pattern type: "geographic"
- Category: "ufo"
- Ergebnisse:
  - Liste von Clustern (Centroid, Count, Radius)
  - Cluster-Namen (z.B. "Arizona UFO Corridor")
  - Visualisierung: Map mit Cluster-Circles

**Weitere Test-Queries:**
- "Finde zeitliche Muster bei NDE Experiences"
- "Gibt es wiederkehrende Themen in Dream Experiences?"
- "Zeig mir Hotspots für Ghost Sightings weltweit"

---

## Advanced Features

XPCHAT hat **4 erweiterte Features** für tiefere Analysen.

### 1. Generate Insights (Insights generieren)

**Was es macht**: Generiert **automatische Insights** aus Daten:
- Temporal Spikes (ungewöhnliche Anstiege)
- Geographic Hotspots
- Trends (steigend/fallend)
- Anomalies (Ausreißer)
- Pattern Matches

**Test-Query:**
```
Generiere Insights für UFO Experiences
```

**Expected Behavior:**
- Tool "generate_insights" wird verwendet
- Category: "ufo"
- Ergebnisse:
  - 3-5 Insight Cards mit:
    - Type (spike/trend/hotspot/anomaly)
    - Confidence Score (0-1)
    - Evidence (Daten die den Insight stützen)
    - Explanation (Was bedeutet das?)
- Visualisierung: Insight Cards mit Icons

**Weitere Test-Queries:**
- "Welche Insights gibt es zu Dream Experiences?"
- "Finde interessante Muster in allen Kategorien"
- "Zeig mir Anomalien in NDE Reports"

---

### 2. Predict Trends (Trends vorhersagen)

**Was es macht**: Trifft **Vorhersagen** über zukünftige Entwicklungen:
- Linear Regression
- Exponential Growth
- Seasonal Forecasting
- Confidence Intervals

**Test-Query:**
```
Sage vorher wie sich UFO Sichtungen entwickeln werden
```

**Expected Behavior:**
- Tool "predict_trends" wird verwendet
- Category: "ufo"
- Forecast period: 6 months (default)
- Ergebnisse:
  - Historische Daten (last 12 months)
  - Prediction data (next 6 months)
  - Confidence intervals (upper/lower bound)
  - Trend direction (steigend/fallend/stabil)
  - R² score (model accuracy)
- Visualisierung: Timeline Chart mit Prediction Line

**Weitere Test-Queries:**
- "Wie werden sich Dream Experiences entwickeln?"
- "Vorhersage für NDE Reports in den nächsten 12 Monaten"
- "Wird Synchronicity wachsen oder sinken?"

---

### 3. Suggest Follow-Ups (Follow-up Fragen vorschlagen)

**Was es macht**: Schlägt **kontextbasierte Follow-up Fragen** vor basierend auf:
- Aktueller Konversation
- Bisher genutzten Tools
- Gefundenen Ergebnissen
- Typischen User-Workflows

**Test-Query:**
```
Was kann ich noch fragen?
```

**Expected Behavior:**
- Tool "suggest_followups" wird verwendet
- Context: Bisherige Chat-Nachrichten
- Ergebnisse:
  - 3-5 Follow-up Vorschläge als Buttons
  - Vorschläge sind relevant zum Kontext
  - Ein Klick fügt die Frage direkt ins Input-Feld ein
- Visualisierung: Follow-Up Suggestion Buttons

**Expected Suggestions (nach "Zeig mir UFO Sichtungen"):**
- "Wo sind die meisten UFO Hotspots?"
- "Gibt es zeitliche Muster bei UFO Sichtungen?"
- "Vergleiche UFO mit Ghost Sightings"
- "Zeig mir ähnliche Experiences zu den Top 3 Results"
- "Generiere Insights für UFO Experiences"

---

### 4. Export Results (Ergebnisse exportieren)

**Was es macht**: Exportiert **Ergebnisse** in verschiedenen Formaten:
- JSON (strukturiert mit Metadata)
- CSV (flach, Excel-kompatibel)
- Markdown (für Dokumentation)

**Test-Query:**
```
Exportiere die letzten Ergebnisse als JSON
```

**Expected Behavior:**
- Tool "export_results" wird verwendet
- Format: "json"
- Data: Letztes Tool-Result (oder ganze Conversation)
- Ergebnisse:
  - Download-Link erscheint
  - Dateiname: `xpshare_export_[timestamp].json`
  - Klick auf Link = Download beginnt
- File Content:
  ```json
  {
    "exported_at": "2025-10-21T...",
    "query": "...",
    "results": [...],
    "metadata": {...}
  }
  ```

**Weitere Test-Queries:**
- "Exportiere als CSV"
- "Lade die Conversation als JSON herunter"
- "Speichere die Ergebnisse für Excel"

---

## Visualizations

XPCHAT wählt **automatisch** die beste Visualisierung basierend auf deinen Daten. Es gibt **6 Visualisierungstypen**.

### 1. Map (Karte)

**Wann verwendet**: Wenn Ergebnisse geografische Koordinaten haben (location_lat/lng)

**Was zeigt es**:
- Marker für jede Experience (farbcodiert nach Kategorie)
- Popups mit Title, Description, Date
- Cluster bei vielen Markern
- Zoom/Pan Controls
- Auto-Centering auf Ergebnisse

**Test-Query:**
```
Zeig mir UFO Sichtungen weltweit auf einer Karte
```

**Expected Behavior:**
- Map-Visualisierung wird verwendet
- Marker in verschiedenen Ländern
- Purple Marker für UFO Kategorie
- Klick auf Marker = Popup mit Details

---

### 2. Timeline (Zeitverlauf)

**Wann verwendet**: Wenn Ergebnisse zeitliche Daten haben (date_occurred oder temporal aggregation)

**Was zeigt es**:
- Line Chart mit Zeit auf X-Achse
- Count/Value auf Y-Achse
- Gruppierung nach Kategorie (multi-line)
- Granularität (day/week/month/year)
- Hover-Tooltips

**Test-Query:**
```
Zeig mir den zeitlichen Verlauf von Dream Experiences seit 2020
```

**Expected Behavior:**
- Timeline-Visualisierung wird verwendet
- X-Achse: Monate von 2020 bis heute
- Y-Achse: Anzahl Experiences
- Blaue Linie für Dreams
- Hover = Exact count für den Monat

---

### 3. Network Graph (Netzwerk-Graph)

**Wann verwendet**: Wenn Ergebnisse Beziehungen/Connections haben (find_connections, detect_patterns)

**Was zeigt es**:
- 3D Force-Directed Graph
- Nodes = Experiences (farbcodiert nach Kategorie)
- Links = Connections (Dicke = Similarity Score)
- Interaktiv (Rotate, Zoom, Drag)
- Animated Particles auf starken Verbindungen

**Test-Query:**
```
Zeig mir Verbindungen zwischen UFO Sichtungen in Deutschland
```

**Expected Behavior:**
- Network Graph wird verwendet
- Purple Nodes für UFO Experiences
- Lines zwischen ähnlichen Experiences
- Dicke Lines = hohe Similarity
- Rotating particles auf stärksten Verbindungen
- Klick auf Node = Details im Sidebar

---

### 4. Heatmap (Hitzekarte)

**Wann verwendet**: Wenn Ergebnisse Matrix-Daten haben (Category × Time, Attribute Correlations)

**Was zeigt es**:
- 2D Grid mit farbcodierten Zellen
- X-Achse: Eine Dimension (z.B. Monate)
- Y-Achse: Andere Dimension (z.B. Kategorien)
- Farb-Intensität = Value (Count/Correlation)
- Color Scale Legend

**Test-Query:**
```
Zeig mir eine Heatmap von Kategorien über Zeit
```

**Expected Behavior:**
- Heatmap-Visualisierung wird verwendet
- Y-Achse: UFO, Dreams, NDE, etc.
- X-Achse: Monate
- Helle Zellen = viele Experiences
- Dunkle Zellen = wenige/keine Experiences

---

### 5. Bar Chart / Ranking

**Wann verwendet**: Wenn Ergebnisse Rankings/Vergleiche sind (rank_users, compare_categories)

**Was zeigt es**:
- Horizontal oder Vertical Bars
- Sortiert nach Value (descending)
- Labels mit Namen und Werten
- Farbcodierung nach Kategorie
- Hover-Tooltips

**Test-Query:**
```
Zeig mir die Top 10 Kategorien
```

**Expected Behavior:**
- Bar Chart wird verwendet
- 10 Bars sortiert nach Count (absteigend)
- Kategorien auf Y-Achse
- Count auf X-Achse
- Farbcodierung pro Kategorie

---

### 6. Dashboard (Multi-Viz)

**Wann verwendet**: Wenn Ergebnisse mehrere Dimensionen haben (analyze_category mit Timeline + Map + Stats)

**Was zeigt es**:
- Kombinierte Visualisierung mit Tabs
- Summary Stats Cards oben
- Tabs: Overview, Map, Timeline, Network
- Responsive Grid Layout

**Test-Query:**
```
Erstelle ein Dashboard für UFO Experiences
```

**Expected Behavior:**
- Dashboard wird verwendet
- Stats Cards: Total Count, Avg Intensity, Top Location
- Tab 1 (Overview): Summary + Charts
- Tab 2 (Map): Geographic Distribution
- Tab 3 (Timeline): Temporal Trends
- Tab 4 (Network): Related Experiences

---

## User Experience Features

XPCHAT hat **17 moderne UX Features** für das beste Chat-Erlebnis.

### 1. Citations & Source Attribution

**Was es macht**: Zeigt **Quellen** für AI-Antworten als Footnotes

**How to test**:
1. Frage: "Zeig mir UFO Sichtungen in Berlin"
2. AI antwortet mit Text + Tool Results
3. Scrolle nach unten zur AI-Antwort
4. **Expected**: Unter der Antwort siehst du "Citations" mit [1][2][3] Badges
5. Klick auf [1] = Öffnet Experience Detail Page
6. Hover über [1] = Zeigt Tooltip mit Snippet

**Expected Behavior**:
- Jede relevante Experience wird als Citation markiert
- Relevance Score wird angezeigt (High/Medium/Low)
- Tool Source wird angezeigt (z.B. "semantic_search")
- Clickable Links zu Experiences

---

### 2. Memory System & Personalization

**Was es macht**: Lernt deine **Präferenzen** und passt Antworten an

**How to test**:
1. Sage: "Ich bevorzuge UFO Experiences"
2. Sage: "Ich komme aus Deutschland"
3. Navigiere zu `/discover/preferences`
4. **Expected**: Du siehst 2 Memories:
   - Preference: "prefers UFO category"
   - Location: "lives in Germany"
5. Frage jetzt: "Zeig mir interessante Experiences"
6. **Expected**: AI priorisiert UFO Experiences aus Deutschland

**Expected Behavior**:
- Preferences werden automatisch extrahiert
- Memories haben Confidence Scores (0-1)
- Du kannst Memories manuell löschen/hinzufügen
- AI nutzt Memories in System Prompt

**Weitere Tests**:
- "Ich mag keine Ghost Experiences" → Preference wird gespeichert
- "Meine Lieblingsfarbe ist Blau" → Wird NICHT gespeichert (irrelevant)
- "Ich suche immer nach Zeugen" → Search Preference wird gespeichert

---

### 3. Message Actions (Copy/Edit/Regenerate/Share/Rate)

**Was es macht**: Aktionen für jede Nachricht

**How to test**:
1. Hover über eine AI-Antwort
2. **Expected**: Buttons erscheinen rechts oben:
   - 📋 Copy (kopiert Text in Clipboard)
   - 🔄 Regenerate (generiert neue Antwort)
   - ⭐ Rate (Thumbs Up/Down)
   - 🔗 Share (teilt Nachricht via native Share API)
3. Hover über eine User-Nachricht
4. **Expected**: Zusätzlicher Button:
   - ✏️ Edit (bearbeitet deine Nachricht)

**Expected Behavior**:
- Copy: Toast "Copied to clipboard"
- Regenerate: AI generiert neue Antwort mit gleichem Tool-Call
- Rate: Thumbs glow, Feedback wird in DB gespeichert
- Share: Native Share Dialog öffnet (mobile) oder Copy Link (desktop)
- Edit: Nachricht wird editierbar, Enter = Re-send

---

### 4. Abort/Stop Streaming

**Was es macht**: Stoppt AI-Antwort während sie generiert wird

**How to test**:
1. Frage: "Analysiere alle Kategorien" (lange Antwort)
2. **Expected**: Während AI tippt, erscheint STOP Button (floating, rechts unten)
3. Klick auf STOP
4. **Expected**:
   - Streaming stoppt sofort (< 100ms)
   - Partielle Antwort bleibt erhalten
   - STOP Button verschwindet

**Expected Behavior**:
- Button nur während Streaming sichtbar
- Latency < 100ms
- Keine Fehler nach Stop
- Du kannst sofort neue Frage stellen

---

### 5. File Attachments & Multi-Modal Input

**Was es macht**: Upload von **Bildern und Dateien** zur Analyse

**How to test**:
1. Klicke auf 📎 Icon im Input-Feld
2. Wähle ein Bild (PNG/JPG/WebP/GIF, max 10MB)
3. **Expected**: Preview erscheint über dem Input
4. Schreibe: "Was siehst du in diesem Bild?"
5. Sende die Nachricht
6. **Expected**:
   - AI analysiert das Bild mit GPT-4o Vision
   - Beschreibung des Bildinhalts
   - OCR von Text im Bild (falls vorhanden)
   - Kontext-Analyse (ist es XP-relevant?)

**Expected Behavior**:
- Drag & Drop funktioniert
- File Size Validation (> 10MB = Error)
- File Type Validation (nur Images + Text Files)
- Preview zeigt Thumbnail
- Automatic Vision Analysis im Background
- Extracted Text wird in DB gespeichert

**Weitere Tests**:
- Upload PDF → Sollte funktionieren (Text Extraction)
- Upload Video → Sollte fehlschlagen (not supported yet)
- Upload 20MB Bild → Error: "File too large"

---

### 6. Structured Error States

**Was es macht**: Zeigt **hilfreiche Fehler** mit Recovery Actions

**How to test**:
1. Disconnect Internet
2. Frage: "Zeig mir UFO Experiences"
3. **Expected**: Error Display erscheint:
   - Icon: 🌐 (Network Error)
   - Message: "No internet connection"
   - Actions: [Retry] [Check Connection]
4. Klick auf [Retry]
5. **Expected**: API Call wird wiederholt

**Error Types to test**:
- **Network Error**: Disconnect WiFi
- **Rate Limit Error**: Sende 15 Requests in 1 Minute
- **Timeout Error**: API dauert > 120s (schwer zu testen)
- **Auth Error**: Logout + try to send message
- **Generic Error**: Ungültige Query (z.B. "asdfghjkl123")

**Expected Behavior**:
- Jeder Error Type hat eigenes Icon + Message
- Recovery Actions sind kontextbasiert
- Error Details sind user-friendly (kein Stack Trace)

---

### 7. Context/Active Tools Banner

**Was es macht**: Zeigt **aktive Filter und Tools** als Banner oben

**How to test**:
1. Frage: "Zeig mir UFO Experiences aus Berlin mit intensity > 8"
2. **Expected**: Banner erscheint oben:
   - 🏷️ Active Filters:
     - Category: UFO [X]
     - Location: Berlin [X]
     - Intensity: > 8 [X]
   - 🔧 Active Tools:
     - advanced_search (✓ completed)
3. Klick auf [X] bei "Category: UFO"
4. **Expected**: Filter wird entfernt, neue Suche ohne Category-Filter

**Expected Behavior**:
- Banner nur sichtbar wenn Filter/Tools aktiv
- Expandable wenn viele Filter (> 5)
- Tool Status Colors:
  - 🟡 Running
  - 🟢 Completed
  - 🔴 Failed
- Auto-remove completed tools after 5s

---

### 8. Rich Content Rendering

**Was es macht**: Rendert **Code, Tables, JSON** in der AI-Antwort

**How to test - Code Blocks**:
1. Frage: "Zeig mir ein SQL Query Beispiel"
2. **Expected**: AI antwortet mit Code Block:
   ```sql
   SELECT * FROM experiences WHERE category = 'ufo';
   ```
3. **Expected**:
   - Syntax Highlighting (SQL Keywords blau)
   - Line Numbers (optional)
   - Copy Button (top right)
   - Download Button
   - Language Badge ("SQL")

**How to test - Tables**:
1. Frage: "Zeig mir Top 5 Kategorien als Tabelle"
2. **Expected**: AI antwortet mit Markdown Table → wird als DataTable gerendert:
   - Sortierbare Spalten (click header)
   - Hover Rows
   - CSV Export Button
   - Pagination (bei > 10 Zeilen)

**How to test - JSON**:
1. Frage: "Exportiere die letzten Ergebnisse als JSON"
2. **Expected**: JSON wird als JsonViewer gerendert:
   - Collapsible Nodes ({ } und [ ])
   - Syntax Highlighting
   - Copy Button

**Expected Behavior**:
- Automatische Erkennung von Code Blocks (```language)
- Automatische Erkennung von Tables (| Header |)
- Automatische Erkennung von JSON ({ ... })
- Keine externen Dependencies (pure CSS/JS)

---

### 9. Enhanced Session Management

**Was es macht**: Pin, Archive, Search, Export von Chats

**How to test - Pin Chats**:
1. Öffne Chat Sidebar (links)
2. Hover über einen Chat
3. Klick auf ⋮ (3 dots)
4. **Expected**: Dropdown Menu:
   - 📌 Pin Chat
   - 📁 Archive Chat
   - 🗑️ Delete Chat
   - 📤 Export
5. Klick auf Pin
6. **Expected**:
   - Chat erscheint oben in der Liste
   - Pin Icon 📌 wird angezeigt

**How to test - Archive Chats**:
1. Klick auf ⋮ bei einem Chat
2. Klick auf Archive
3. **Expected**:
   - Chat verschwindet aus der Liste
4. Toggle "Show Archived" (bottom of sidebar)
5. **Expected**: Archivierte Chats werden angezeigt

**How to test - Search Chats**:
1. Schreibe in Search Box oben in Sidebar: "UFO"
2. **Expected**: Nur Chats mit "UFO" im Titel werden angezeigt

**How to test - Export Session**:
1. Klick auf ⋮ bei einem Chat
2. Klick auf Export
3. Wähle Format: JSON/Markdown/CSV
4. **Expected**: Download beginnt

**Expected Behavior**:
- Pinned Chats immer oben (auch bei Neusortierung)
- Archived Chats haben Timestamp (archived_at)
- Search ist case-insensitive + real-time
- Export enthält alle Nachrichten + Metadata

---

### 10. Keyboard Shortcuts

**Was es macht**: Schnellzugriff via Tastatur

**How to test**:
1. Drücke `Cmd/Ctrl + K`
2. **Expected**: Focus springt ins Input-Feld
3. Drücke `Cmd/Ctrl + N`
4. **Expected**: Neuer Chat wird erstellt
5. Drücke `Cmd/Ctrl + /` oder `?`
6. **Expected**: Shortcuts Modal öffnet mit Liste aller Shortcuts

**Available Shortcuts**:
- `Cmd/Ctrl + K`: Focus Search
- `Cmd/Ctrl + N`: New Chat
- `Cmd/Ctrl + /` oder `?`: Show Shortcuts
- `Escape`: Close Modal (falls offen)
- Future: `Cmd/Ctrl + Enter`: Send Message

**Expected Behavior**:
- Platform-aware: ⌘ auf Mac, Ctrl auf Windows/Linux
- Input/Textarea Exception: Shortcuts deaktiviert wenn du tippst (außer Escape)
- Shortcuts Modal zeigt Kategorien:
  - Navigation
  - Chat Actions
  - UI Controls

---

### 11. Accessibility (ARIA)

**Was es macht**: Screen Reader Support + Keyboard Navigation

**How to test - Screen Reader**:
1. Aktiviere Screen Reader (NVDA/VoiceOver)
2. Tab durch die UI
3. **Expected**:
   - Buttons haben ARIA labels ("Export results", "Clear chat history")
   - Input hat aria-describedby="input-hint"
   - Message List hat role="log" + aria-live="polite"
   - Suggestions haben role="group"

**How to test - Keyboard Navigation**:
1. Tab ins Input-Feld
2. Drücke ↓ (Down Arrow)
3. **Expected**: Fokus springt zur ersten Suggestion
4. Drücke ↓ nochmal
5. **Expected**: Fokus zur zweiten Suggestion
6. Drücke Enter
7. **Expected**: Suggestion wird ins Input übernommen
8. Drücke Home
9. **Expected**: Fokus zur ersten Suggestion
10. Drücke End
11. **Expected**: Fokus zur letzten Suggestion

**How to test - Skip Link**:
1. Refresh Page
2. Drücke Tab (erste Aktion nach Page Load)
3. **Expected**: "Skip to content" Link wird sichtbar
4. Drücke Enter
5. **Expected**: Fokus springt zu #chat-input

**Expected Behavior**:
- WCAG 2.1 AA Foundation
- Perceivable: Text Alternatives für alle UI-Elemente
- Operable: Alle Funktionen via Keyboard erreichbar
- Understandable: Vorhersagbares Verhalten, Hints
- Robust: Valid ARIA

---

### 12. Branching Conversations

**Was es macht**: Erstelle **alternative Gesprächsverläufe** ab jedem Punkt

**How to test**:
1. Frage: "Zeig mir UFO Experiences"
2. AI antwortet mit Ergebnissen
3. Hover über die AI-Antwort
4. **Expected**: Branch Button erscheint (🌿 icon)
5. Klick auf Branch Button
6. **Expected**: Dialog öffnet "Create New Branch"
7. Name: "Alternative UFO Search"
8. Klick OK
9. **Expected**:
   - Neuer Branch wird erstellt
   - Chat history stoppt bei dieser Nachricht
   - Du kannst jetzt eine alternative Frage stellen

**How to test - Branch Switching**:
1. Öffne Chat Sidebar
2. **Expected**: Bei Chats mit Branches siehst du Branch Indicator (🌿 2)
3. Klick auf Chat
4. **Expected**: BranchSelector erscheint (Dropdown oder Tree View)
5. Wähle Branch "Alternative UFO Search"
6. **Expected**: Nachrichten filtern sich auf diesen Branch

**Expected Behavior**:
- Branches haben Namen + Message Count
- Parent Message ist sichtbar in allen Branches
- Nur Nachrichten nach Branch Point unterscheiden sich
- BranchButton in allen Nachrichten (nicht nur AI)
- ARIA labels für Screen Reader

---

### 13. Collaborative Sharing

**Was es macht**: Teile **Chat Sessions** via Link

**How to test**:
1. Öffne einen Chat mit interessanten Ergebnissen
2. Klick auf ⋮ (Chat Dropdown in Sidebar)
3. Klick auf "Share"
4. **Expected**: ShareDialog öffnet
5. Wähle Expiry: "7 days"
6. Klick "Generate Link"
7. **Expected**:
   - Share Link wird generiert: `https://xpshare.com/share/abc123xyz`
   - Toast: "Link copied to clipboard"
8. Öffne Link in Incognito Tab
9. **Expected**:
   - Read-Only Chat View
   - Alle Nachrichten + Tool Results sichtbar
   - View Count angezeigt (z.B. "Viewed 1 times")
   - Expiry Info (z.B. "Expires in 6 days")
   - "Copy conversation" Button

**How to test - Expiry**:
1. Erstelle Link mit Expiry "1 hour"
2. Warte 61 Minuten
3. Öffne Link
4. **Expected**: Error "This shared chat has expired"

**Expected Behavior**:
- Links haben unique tokens (nanoid 16 chars)
- View Count incrementiert bei jedem Access
- Expired Links nicht mehr zugänglich
- Ownership Check: Nur Creator kann Share erstellen
- RLS Policy: Jeder kann gültigen Share sehen

**Expiry Options**:
- Never (permanenter Link)
- 1 hour
- 24 hours
- 7 days (default)
- 30 days

---

### 14. Cost/Token Tracking

**Was es macht**: Zeigt **Token Usage + Kosten** pro Nachricht und Session

**How to test**:
1. Frage: "Zeig mir alle Kategorien"
2. **Expected**: Unter der AI-Antwort siehst du Token Badge:
   - 🔢 234 tokens
   - $0.0023 (GPT-4o-mini pricing)
3. Scroll zum Top der Chat-Session
4. **Expected**: Session Cost Summary:
   - 📊 Total: 1,234 tokens
   - 💰 Cost: $0.012
   - 📈 Avg per message: 308 tokens

**How to test - Preferences Page**:
1. Navigiere zu `/discover/preferences`
2. **Expected**: Stats Cards zeigen:
   - 🔢 Total Tokens (today/week/month/all)
   - 💰 Total Cost
   - 📊 Breakdown by Model

**Expected Behavior**:
- Token estimation: ~4 chars per token (approximation)
- GPT-4o-mini pricing: $0.15/$0.60 per 1M tokens (input/output)
- Tracking in usage_tracking table
- RLS: Users see nur ihre eigenen Stats

**Token Breakdown**:
- Prompt Tokens (input)
- Completion Tokens (output)
- Total Tokens
- Cost per Token Type

---

### 15. Prompt Library

**Was es macht**: Sammlung von **Template-Prompts** mit Variablen

**How to test**:
1. Klick auf "Prompt Library" Button (links neben Input)
2. **Expected**: Prompt Library Modal öffnet
3. **Expected**: 6+ System Templates:
   - "Show me {category} experiences in {location}..."
   - "Analyze dream patterns related to {theme}..."
   - "Compare {category1} vs {category2}..."
   - etc.
4. Klick auf ersten Template
5. **Expected**: Variable Substitution Dialog öffnet:
   - Input für {category}: [UFO]
   - Input für {location}: [Berlin]
6. Klick "Use Template"
7. **Expected**:
   - Prompt wird ins Input-Feld eingefügt: "Show me UFO experiences in Berlin..."
   - Du kannst es noch anpassen vor dem Senden

**How to test - Create Custom Template**:
1. Im Prompt Library Modal, klick "Create New"
2. Title: "My Custom Search"
3. Prompt: "Find {category} with intensity > {min_intensity}"
4. Category: "search"
5. **Expected**: Template wird gespeichert
6. **Expected**: Template erscheint in der Liste
7. Use Count = 0

**How to test - Favorites**:
1. Hover über einen Template
2. Klick auf ⭐ (Star Icon)
3. **Expected**: Template wird favorited (Star gelb)
4. Filter by: "Favorites only"
5. **Expected**: Nur favorited templates angezeigt

**Expected Behavior**:
- Variables extrahiert via regex: /\{(\w+)\}/g
- fillTemplate() ersetzt {var} mit Werten
- Use Count incrementiert bei jedem Use
- System Templates (is_system=true) können nicht bearbeitet werden
- RLS: Users sehen eigene + System Templates

---

### 16. Message Threading

**Was es macht**: **Replies** auf spezifische Nachrichten (verschachtelte Threads)

**How to test**:
1. Frage: "Zeig mir UFO Experiences"
2. AI antwortet mit Liste
3. Hover über die erste Experience in der Antwort
4. **Expected**: Reply Button erscheint
5. Klick auf Reply
6. **Expected**:
   - Input-Feld fokussiert
   - "Replying to: [Quote der Message]" wird angezeigt über dem Input
7. Schreibe: "Erzähl mir mehr über diese Experience"
8. Send
9. **Expected**:
   - Neue AI-Antwort erscheint als **verschachtelte Reply**
   - Visual Connector (└─) zeigt Parent → Child Beziehung
   - Thread ist collapsible (Chevron Icon)

**How to test - Collapse/Expand**:
1. Klick auf Chevron Icon bei Parent Message
2. **Expected**: Thread collapsed (Replies versteckt)
3. **Expected**: Badge zeigt "2 replies"
4. Klick nochmal
5. **Expected**: Thread expanded (Replies wieder sichtbar)

**Expected Behavior**:
- reply_to_id in DB gespeichert
- thread_id gruppiert alle Replies
- Nested Rendering (max 5 Ebenen empfohlen)
- Visual Connectors (lines + icons)
- Orphaned Messages (missing parent) werden als Top-Level angezeigt
- ARIA labels für Screen Reader

---

### 17. Offline Mode

**Was es macht**: **Funktioniert auch ohne Internet** (Service Worker + Message Queue)

**How to test - Service Worker**:
1. Öffne DevTools → Application → Service Workers
2. **Expected**: "/sw.js" ist registriert + active
3. **Expected**: Cache "xpshare-v1" existiert mit gecachten Pages:
   - /
   - /discover
   - /offline

**How to test - Offline Detection**:
1. Disconnect WiFi
2. **Expected**: OfflineBanner erscheint oben:
   - 🔴 Offline
   - "You are offline. Messages will be queued."
3. Reconnect WiFi
4. **Expected**:
   - 🟢 Online
   - Banner verschwindet nach 3s

**How to test - Message Queue**:
1. Disconnect WiFi
2. Frage: "Zeig mir UFO Experiences"
3. **Expected**:
   - Message wird NICHT gesendet
   - Erscheint in Queue (localStorage)
   - OfflineBanner zeigt: "1 message queued"
4. Frage nochmal: "Analysiere Dreams"
5. **Expected**: "2 messages queued"
6. Reconnect WiFi
7. **Expected**:
   - Auto-Sync startet (nach 1s delay)
   - Beide Messages werden gesendet
   - AI antwortet nacheinander
   - Queue Badge verschwindet

**How to test - Manual Sync**:
1. Disconnect WiFi
2. Sende 3 Messages
3. **Expected**: "3 messages queued"
4. Reconnect WiFi (aber auto-sync ist deaktiviert in DevTools)
5. Klick auf "Sync now" Button im Banner
6. **Expected**: Messages werden manuell gesynced

**Expected Behavior**:
- Service Worker cacht core pages
- Message Queue in localStorage (persistent)
- Auto-Sync on reconnect (mit 1s delay)
- Retry mit exponential backoff (max 3 retries)
- Connection Indicator in Navbar (🟢/🔴)
- ARIA live regions für Status Updates

---

## Complete Test Scenarios

Hier sind **End-to-End Test-Szenarien**, die mehrere Features kombinieren.

### Scenario 1: "UFO Researcher Journey"

**Ziel**: Finde alle UFO-relevanten Informationen für einen Research Report

**Steps**:
1. **Start**: Öffne `/discover`
2. **Search**: "Zeig mir alle UFO Sichtungen in den USA in den letzten 5 Jahren"
   - Expected: advanced_search tool
   - Expected: Map visualization mit USA-Markern
3. **Analyze**: "Analysiere die Kategorie UFO"
   - Expected: analyze_category tool
   - Expected: Timeline Chart + Stats Cards
4. **Patterns**: "Gibt es geografische Cluster bei UFO Sichtungen?"
   - Expected: detect_patterns tool (geographic)
   - Expected: Map mit Cluster-Circles
5. **Insights**: "Generiere Insights für UFO Experiences"
   - Expected: generate_insights tool
   - Expected: 3-5 Insight Cards (spikes/trends/hotspots)
6. **Export**: "Exportiere alle Ergebnisse als JSON"
   - Expected: export_results tool
   - Expected: Download-Link für JSON File
7. **Save**: Pin den Chat als "UFO Research 2025"
   - Expected: Chat erscheint oben in Sidebar mit 📌
8. **Share**: Erstelle Share Link (7 days expiry)
   - Expected: Link kopiert, kann mit Team geteilt werden

**Expected Duration**: 5-10 Minuten
**Success Criteria**: Alle Steps erfolgreich, Export-File enthält Daten, Share-Link funktioniert

---

### Scenario 2: "Dream Pattern Discovery"

**Ziel**: Entdecke Muster in Dream Experiences

**Steps**:
1. **Search**: "Finde Dream Experiences mit emotional_impact = 'profound'"
   - Expected: search_by_attributes tool
   - Expected: Liste von intensiven Traum-Experiences
2. **Connections**: "Finde Verbindungen zwischen diesen Experiences"
   - Expected: find_connections tool
   - Expected: Network Graph mit Dream-Nodes
3. **Temporal**: "Gibt es zeitliche Muster bei Dream Experiences?"
   - Expected: temporal_analysis tool
   - Expected: Timeline Chart zeigt Saisonalität
4. **Insights**: "Was sind die Hauptthemen in diesen Träumen?"
   - Expected: detect_patterns tool (semantic)
   - Expected: Liste von wiederkehrenden Themen
5. **Follow-Up**: Klick auf Follow-Up Suggestion "Compare Dreams vs Lucid Dreams"
   - Expected: compare_categories tool
   - Expected: Comparison Chart
6. **Branch**: Erstelle Branch "Alternative Dream Analysis"
   - Expected: Branch wird erstellt
7. **Alternative**: In neuem Branch: "Suche Dream Experiences mit 'flying' im Text"
   - Expected: full_text_search tool
   - Expected: Andere Ergebnisse als im Main Branch
8. **Compare Branches**: Switch zwischen Main und Alternative Branch
   - Expected: Nachrichten filtern sich unterschiedlich

**Expected Duration**: 10-15 Minuten
**Success Criteria**: Branching funktioniert, beide Branches zeigen unterschiedliche Ergebnisse

---

### Scenario 3: "Multi-Modal UFO Report"

**Ziel**: Reiche UFO-Foto ein und lass es analysieren

**Steps**:
1. **Upload**: Klick auf 📎, wähle UFO-Foto (z.B. klassisches "Flying Saucer" Bild)
   - Expected: Preview erscheint
2. **Ask**: "Was siehst du in diesem Bild?"
   - Expected: GPT-4o Vision analysiert das Bild
   - Expected: Beschreibung: "The image shows a disc-shaped object in the sky..."
3. **OCR**: Wenn Text im Bild: "Extrahiere den Text aus diesem Bild"
   - Expected: OCR extrahiert Text
4. **Context**: "Finde ähnliche UFO Sichtungen basierend auf dieser Beschreibung"
   - Expected: semantic_search mit Vision-Description als Query
   - Expected: Liste ähnlicher Experiences
5. **Visualize**: "Zeig mir diese Sichtungen auf einer Karte"
   - Expected: Map visualization
6. **Export**: "Exportiere die Conversation mit dem Bild als Markdown"
   - Expected: MD-File enthält Bild-Link + Conversation

**Expected Duration**: 5 Minuten
**Success Criteria**: Vision API funktioniert, ähnliche Experiences werden gefunden

---

### Scenario 4: "Collaborative Research Team"

**Ziel**: Team arbeitet zusammen an UFO-Analyse

**Steps**:
1. **User A**: Erstellt umfassende UFO-Analyse (wie Scenario 1)
2. **User A**: Teilt Chat via Share Link (30 days expiry)
3. **User B**: Öffnet Share Link
   - Expected: Read-Only View
   - Expected: View Count = 1
4. **User B**: Klick auf "Copy conversation"
   - Expected: Alle Nachrichten kopiert in Clipboard
5. **User B**: Erstellt eigenen Chat, paste Conversation
6. **User B**: "Vergleiche diese UFO-Daten mit Ghost Sightings"
   - Expected: compare_categories tool
7. **User B**: Teilt seine Analyse zurück an User A
8. **User A**: Öffnet Link von User B
   - Expected: Sieht User B's erweiterte Analyse

**Expected Duration**: 15 Minuten (2 Users)
**Success Criteria**: Beide User können Chats teilen und weiterarbeiten

---

### Scenario 5: "Offline Field Research"

**Ziel**: Nutze XPCHAT ohne Internet (z.B. auf Expedition)

**Steps**:
1. **Pre-Cache**: Öffne `/discover` mit WiFi → Service Worker cacht Pages
2. **Go Offline**: Disable WiFi
   - Expected: OfflineBanner erscheint "🔴 Offline"
3. **Queue Messages**: Schreibe 3 Fragen:
   - "Zeig mir UFO Sichtungen in Arizona"
   - "Analysiere die Kategorie UFO"
   - "Gibt es Hotspots in der Region?"
   - Expected: "3 messages queued" Badge
4. **Navigate Offline**: Gehe zu `/` → `/discover` → `/offline`
   - Expected: Alle Pages laden (aus Cache)
5. **Go Online**: Enable WiFi
   - Expected: Auto-Sync startet nach 1s
   - Expected: Alle 3 Messages werden gesendet
   - Expected: AI antwortet nacheinander
6. **Verify Queue**: Check localStorage
   - Expected: Queue ist leer (all messages synced)

**Expected Duration**: 5 Minuten
**Success Criteria**: Offline-Modus funktioniert, Messages werden nach Reconnect gesynced

---

## Expected Behaviors

### General AI Behavior

**Response Time**:
- First token: < 2 seconds
- Streaming: ~50 tokens/second
- Tool calls: 2-5 seconds (depending on complexity)

**Answer Quality**:
- Relevant: AI versteht Kontext und gibt passende Antworten
- Accurate: Tool-Calls sind korrekt parametrisiert
- Helpful: Follow-up Suggestions sind nützlich
- Concise: Nicht zu verbose, direkt auf den Punkt

**Tool Selection**:
- Automatic: AI wählt richtiges Tool basierend auf Query
- Multi-Tool: Bei komplexen Fragen werden mehrere Tools kombiniert
- Fallback: Wenn kein Tool passt, gibt AI allgemeine Antwort

---

### Visualization Auto-Selection

**Map**:
- Trigger: Ergebnisse haben location_lat/lng
- Example Queries:
  - "Zeig mir UFO Sichtungen weltweit"
  - "Wo sind die meisten Ghost Sightings?"
  - "Finde Experiences in Europa"

**Timeline**:
- Trigger: Ergebnisse haben zeitliche Dimension
- Example Queries:
  - "Wie entwickeln sich Dream Experiences über Zeit?"
  - "Zeig mir einen Trend für UFO Sichtungen"
  - "Gibt es saisonale Muster?"

**Network Graph**:
- Trigger: Ergebnisse haben Connections/Relationships
- Example Queries:
  - "Finde Verbindungen zwischen Experiences"
  - "Zeig mir ähnliche Experiences als Graph"
  - "Gibt es Cluster von zusammenhängenden Erlebnissen?"

**Heatmap**:
- Trigger: Ergebnisse sind Matrix-Daten (Category × Time, Correlations)
- Example Queries:
  - "Zeig mir Kategorien über Zeit als Heatmap"
  - "Gibt es Korrelationen zwischen Attributen?"
  - "Vergleiche alle Kategorien über die letzten 12 Monate"

**Bar Chart**:
- Trigger: Ergebnisse sind Rankings/Vergleiche
- Example Queries:
  - "Top 10 User"
  - "Welche Kategorie ist am beliebtesten?"
  - "Ranke Locations nach Experience Count"

**Dashboard**:
- Trigger: Komplexe Analysen mit mehreren Dimensionen
- Example Queries:
  - "Erstelle ein Dashboard für UFO Experiences"
  - "Analysiere alle Kategorien"
  - "Zeig mir einen Überblick über alle Daten"

---

### Error Handling

**Network Errors**:
- Display: "🌐 No internet connection"
- Recovery: [Retry] [Check Connection]

**Rate Limit Errors**:
- Display: "⏱️ Too many requests. Please wait."
- Recovery: [Wait] [Upgrade Plan]
- Prevention: Show rate limit warning at 80%

**Timeout Errors**:
- Display: "⏰ Request timed out (> 120s)"
- Recovery: [Retry] [Simplify Query]

**Auth Errors**:
- Display: "🔒 Authentication required"
- Recovery: [Login] [Signup]

**Generic Errors**:
- Display: "⚠️ Something went wrong"
- Recovery: [Retry] [Contact Support]
- Details: Expandable error message (für debugging)

---

### Performance Expectations

**Page Load**:
- Initial Load: < 3 seconds
- Chat History Load: < 1 second
- Visualization Render: < 2 seconds

**API Calls**:
- Simple Search: < 2 seconds
- Complex Analytics: < 5 seconds
- Generate Insights: < 10 seconds

**Streaming**:
- First Token Latency: < 2 seconds
- Tokens per Second: ~50
- Stop Latency: < 100ms

**Database Queries**:
- SQL Functions: < 2 seconds (with indexes)
- Materialized Views: < 500ms
- Semantic Search: < 3 seconds (with vector index)

---

### Accessibility Standards

**WCAG 2.1 AA Compliance**:
- ✅ Perceivable: Text alternatives, color contrast, resizable text
- ✅ Operable: Keyboard accessible, enough time, navigation
- ✅ Understandable: Readable, predictable, input assistance
- ✅ Robust: Compatible with assistive technologies

**Keyboard Navigation**:
- Tab: Durch alle interaktive Elemente
- Enter/Space: Aktiviert Buttons
- Arrow Keys: Listen-Navigation
- Escape: Schließt Modals
- Shortcuts: Siehe "Keyboard Shortcuts" Section

**Screen Reader Support**:
- ARIA Labels auf allen Buttons
- ARIA Live Regions für dynamische Updates
- ARIA Roles (log, group, dialog)
- Focus Management bei Modals

---

## Troubleshooting

### Common Issues

**1. "AI antwortet nicht"**
- Check: Internet Connection
- Check: Rate Limit (zu viele Requests?)
- Check: Browser Console für Fehler
- Solution: Refresh Page, Retry Query

**2. "Tool Results sind leer"**
- Possible Cause: Keine Experiences matching query
- Solution: Vereinfache Query, entferne Filter
- Example: "Zeig mir UFO Sichtungen in Antarktis" → Wahrscheinlich 0 Results

**3. "Visualisierung lädt nicht"**
- Possible Cause: Daten haben nicht das richtige Format
- Check: Browser Console für Errors
- Solution: Export Data as JSON, check structure

**4. "Service Worker nicht aktiv"**
- Check: DevTools → Application → Service Workers
- Solution: Unregister + Reload Page
- Solution: Hard Refresh (Cmd+Shift+R / Ctrl+Shift+R)

**5. "Share Link funktioniert nicht"**
- Check: Link expired?
- Check: Correct URL (inkl. token)?
- Check: User has permission (ownership)?
- Solution: Generate new link

**6. "Message Queue synced nicht"**
- Check: Online Status (🟢 in Navbar?)
- Check: localStorage (DevTools → Application → Local Storage)
- Solution: Click "Sync now" manually
- Solution: Refresh Page → Auto-Sync on load

---

## Feedback & Support

### How to Give Feedback

**Bug Reports**:
1. Navigiere zu GitHub Issues: `https://github.com/yourorg/xpshare/issues`
2. Klick "New Issue" → "Bug Report"
3. Fülle Template aus:
   - Steps to Reproduce
   - Expected Behavior
   - Actual Behavior
   - Screenshots (falls vorhanden)
   - Browser/OS Info

**Feature Requests**:
1. GitHub Issues → "Feature Request"
2. Beschreibe:
   - Problem/Use Case
   - Proposed Solution
   - Alternatives

**In-App Feedback**:
- Message Rating (👍👎) → Geht direkt in DB
- Export Chat → Teile problematische Conversation mit Team

---

## Conclusion

**Du hast jetzt eine vollständige Anleitung für XPCHAT!**

### Was du gelernt hast:
- ✅ 5 Search Tools (Advanced, Attributes, Semantic, FullText, Geo)
- ✅ 5 Analytics Tools (RankUsers, AnalyzeCategory, Compare, Temporal, Correlation)
- ✅ 2 Pattern Tools (FindConnections, DetectPatterns)
- ✅ 4 Advanced Features (Insights, Predictions, Follow-Ups, Export)
- ✅ 6 Visualizations (Map, Timeline, Network, Heatmap, BarChart, Dashboard)
- ✅ 17 UX Features (Citations, Memory, Actions, Abort, Attachments, Errors, Banner, RichContent, Sessions, Shortcuts, Accessibility, Branching, Sharing, Tracking, Library, Threading, Offline)

### Next Steps:
1. **Test alle Features** anhand der Test Scenarios
2. **Report Bugs** wenn etwas nicht funktioniert
3. **Gib Feedback** was gut/schlecht ist
4. **Nutze XPCHAT produktiv** für echte Research!

**Viel Erfolg beim Testen! 🚀**

---

**END OF USER TEST GUIDE**
