# XPChat v3 - UX Scenarios & User Journeys

**Status:** Planning Phase
**Created:** 2025-10-26

> **Design System Context:** Die User Journeys werden mit modernen Chat UI Patterns umgesetzt (ChatGPT/Claude-Style). Siehe [17-DESIGN-SYSTEM-2025.md](./17-DESIGN-SYSTEM-2025.md) für Onboarding Flow, Message Bubbles, Animations, und Error States.

---

## 🎭 User Personas

### Persona 1: Der Experiencer (60% der User)

**Name:** Sarah, 32, Marketing Manager
**Motivation:** Hatte ein außergewöhnliches Erlebnis, sucht Validation
**Tech-Level:** Medium
**Erwartung:** "Bin ich allein damit?"

### Persona 2: Der Explorer (25% der User)

**Name:** Michael, 45, Software Developer
**Motivation:** Neugierig auf Phänomene, sucht Patterns
**Tech-Level:** High
**Erwartung:** "Zeig mir die Daten!"

### Persona 3: Der Researcher (10% der User)

**Name:** Dr. Anna, 38, Psychologin
**Motivation:** Forschung, sucht Evidenz
**Tech-Level:** High
**Erwartung:** "Ich brauche statistische Signifikanz"

### Persona 4: Der Casual Browser (5% der User)

**Name:** Tom, 24, Student
**Motivation:** Unterhaltung, Inspiration
**Tech-Level:** Medium
**Erwartung:** "Zeig mir was Krasses!"

---

## 🚀 Journey 1: First-Time Experiencer (Sarah)

### Ausgangssituation

Sarah hatte gestern Nacht ein UFO-Erlebnis über dem Englischen Garten in München. Sie googled "UFO München" und landet auf XPShare.

### User Journey

#### Step 1: Landing (0-10 Sekunden)

```
┌────────────────────────────────────────┐
│  ✨ Entdecke das Außergewöhnliche     │
│                                        │
│  [Input: Was möchtest du entdecken?]  │
│                                        │
│  🛸 UFO  👻 Ghost  🌙 Dreams  💫 NDE  │
└────────────────────────────────────────┘

Sarah's Gedanke: "Okay, das sieht vertrauenswürdig aus"
```

**Aktion:** Sarah tippt "UFO gestern Nacht Englischer Garten München"

#### Step 2: First Response (10-15 Sekunden)

```
AI antwortet:

"Interessant! Ich habe 12 ähnliche UFO-Sichtungen
im Englischen Garten gefunden - 8 davon in den
letzten 3 Monaten.

🗺️ [Zeigt interaktive Karte mit 12 Punkten]

📊 Auffällige Muster:
- Meistens zwischen 22-24 Uhr (wie bei dir?)
- Oft bei klarem Himmel
- 9 von 12 beschreiben 'helles weißes Licht'

💬 Möchtest du:
→ Dein Erlebnis eintragen & mit anderen matchen
→ Die 9 Licht-Sichtungen genauer ansehen
→ Benachrichtigung bei neuen Sichtungen"
```

**Sarah's Reaktion:** 😲 "Wow, ich bin nicht verrückt!"

#### Step 3: Engagement (nächste 5 Minuten)

**Aktion:** Sarah klickt "Die 9 Licht-Sichtungen ansehen"

```
AI zeigt:

[Liste mit 9 Experience Cards]

Erlebnis #1: "Helles Licht über dem Eisbach"
📅 2024-02-15, 23:45 Uhr
"Ein intensiv weißes Licht, das sich schnell bewegte..."
[87% ähnlich zu deiner Beschreibung]

Erlebnis #2: "Leuchtende Kugel beim Monopteros"
📅 2024-03-03, 22:30 Uhr
...
```

**Sarah klickt** auf Erlebnis #1 und liest die Details.

#### Step 4: Conversion (innerhalb 10 Minuten)

**Aktion:** Sarah klickt "Dein Erlebnis eintragen"

```
→ Leitet zu /submit
→ Category: UFO (pre-selected)
→ Location: Englischer Garten, München (pre-filled)
→ AI schlägt ähnliche Tags vor: #licht #schnell #nacht
```

**Ergebnis:**
- ✅ Sarah wird Contributor
- ✅ Fühlt sich verstanden
- ✅ Wird wiederkommen (Notifications)

---

## 🔍 Journey 2: Pattern Explorer (Michael)

### Ausgangssituation

Michael ist fasziniert von Mustern. Er will wissen, ob es Korrelationen zwischen UFO-Sichtungen und Mond-Phasen gibt.

### User Journey

#### Step 1: Complex Query (0 Sekunden)

```
Michael tippt:
"Gibt es eine Korrelation zwischen UFO-Sichtungen und Vollmond?"
```

#### Step 2: AI Analysis (15 Sekunden)

```
AI denkt (Extended Thinking sichtbar):

🧠 Verstehe die Frage...
   → Temporal Pattern Recognition benötigt
   → Benötige UFO-Daten + Mond-Phasen-Daten

🔍 Suche relevante Daten...
   [unifiedSearch: UFO, mode: explore, limit: 100]

📊 Analysiere Patterns...
   [discoverPatterns: temporal, cross-reference moon data]

📈 Berechne Korrelation...
```

```
AI antwortet:

"Spannende Frage! Ich habe 234 UFO-Sichtungen analysiert.

📊 FINDING: Ja, es gibt eine signifikante Korrelation!

[Timeline Chart zeigt Spikes bei Vollmond]

Statistik:
• Bei Vollmond (±3 Tage): 2.3x mehr Sichtungen
• p-Wert: 0.018 (statistisch signifikant!)
• Konfidenz: 87%

🤔 Mögliche Erklärungen:
1. Mehr Menschen sind nachts draußen
2. Bessere Sichtbarkeit bei hellem Himmel
3. Reporting Bias (Vollmond = aufmerksamere Observer)

📥 Möchtest du:
→ Rohdaten als CSV exportieren (für eigene Analyse)
→ Andere temporale Patterns erkunden
→ Vergleich mit anderen Kategorien (Dreams, NDE)"
```

**Michael's Reaktion:** 🤯 "Genau was ich wollte!"

#### Step 3: Deep Dive (nächste 20 Minuten)

**Aktion:** Michael klickt "Andere temporale Patterns erkunden"

```
AI zeigt:

🕐 Tageszeit-Analyse:
[Timeline: 78% zwischen 20-02 Uhr, Peak 23 Uhr]

📅 Saisonal:
[Timeline: Sommer > Winter, Juli Peak]

🌍 Geographic + Temporal Combo:
[Map mit Time-Slider: Bayern Sommer-Cluster]
```

**Michael exploriert 30 Minuten lang verschiedene Patterns**

#### Step 4: Sharing (später am Tag)

**Aktion:** Michael postet auf Reddit:

> "Check out XPShare - their AI found a statistically significant
> correlation between UFO sightings and full moon phases! (p=0.018)
> Finally a platform that does real data science on paranormal stuff 🛸"

**Ergebnis:**
- ✅ 50 neue User von Reddit
- ✅ Michael wird Power User
- ✅ Word-of-mouth Marketing

---

## 📚 Journey 3: Academic Researcher (Dr. Anna)

### Ausgangssituation

Dr. Anna forscht über Nahtoderfahrungen. Sie sucht eine Datenquelle für ihre Studie.

### User Journey

#### Step 1: Research Query

```
Dr. Anna: "Finde alle Nahtoderfahrungen mit Licht-Beschreibungen"
```

#### Step 2: Academic Response

```
AI antwortet:

"Ich habe 89 Nahtoderfahrungen (NDE) gefunden.
78 davon (87.6%) erwähnen 'Licht' in der Beschreibung.

🔬 RESEARCH INSIGHTS:

Häufigste Licht-Beschreibungen:
• "helles weißes Licht" - 64 (72%)
• "warmes/goldenes Licht" - 23 (26%)
• "Tunnel mit Licht am Ende" - 41 (46%)

📊 Cross-References:
• 73% berichten auch von verstorbenen Angehörigen
• 58% berichten von Lebensrückblick
• 42% erwähnen außerkörperliche Erfahrung

📥 Daten-Export:
→ CSV mit allen 89 NDEs (anonymisiert)
→ JSON mit strukturierten Daten
→ Literatur-Citations (APA Format)

⚠️ Research Notes:
• Self-reported data (keine Verifizierung)
• Sampling Bias möglich (online Community)
• Zeitraum: 2020-2024
• Geografische Verteilung: 67% Europa, 23% USA, 10% Rest"
```

**Dr. Anna's Reaktion:** 💼 "Perfekt für meine Studie!"

#### Step 3: Data Export

**Aktion:** Dr. Anna exportiert CSV

```
Received:
nde_experiences_2020-2024.csv

Columns:
- id (anonymized)
- date_occurred
- age_category (ranges, not exact)
- location_region (country-level only)
- description_text
- tags
- verification_status
```

#### Step 4: Citation

**Aktion:** Dr. Anna's Paper (6 Monate später)

> "Data was collected from XPShare (xpshare.com), an open platform
> for extraordinary experiences, between January 2020 and March 2024.
> N=89 self-reported near-death experiences were analyzed..."

**Ergebnis:**
- ✅ Akademische Credibility
- ✅ Citations in Papers
- ✅ Mehr Forscher nutzen Platform

---

## 🎮 Journey 4: Casual Browser (Tom)

### Ausgangssituation

Tom findet XPShare über TikTok. Er will nur "coole Stories" lesen.

### User Journey

#### Step 1: Entertainment Query

```
Tom: "Zeig mir die krassesten UFO-Geschichten"
```

#### Step 2: Engaging Response

```
AI antwortet:

"Hier sind die TOP 5 außergewöhnlichsten UFO-Sichtungen:

🥇 #1: "Riesiges Dreieck über Autobahn A8"
👁️ 847 Views • ⭐ 94% Glaubwürdigkeit
"Es war 3 Uhr morgens, ich fuhr nach München als plötzlich..."
[READ MORE →]

🥈 #2: "Entführung bei Wanderung im Schwarzwald"
👁️ 1.2k Views • ⭐ 76% Glaubwürdigkeit
"Missing time: 4 Stunden fehlen in meiner Erinnerung..."
[READ MORE →]

🥉 #3: "UFO-Flotte über dem Bodensee (mit Video)"
👁️ 2.3k Views • ⭐ 88% Glaubwürdigkeit • 📹 VIDEO
"Wir waren 12 Zeugen, alle haben dasselbe gesehen..."
[READ MORE →]

💬 Community sagt:
"#1 ist crazy, aber #3 hat Video-Beweis!"
"Ich war auch am Bodensee, kann #3 bestätigen!"
```

**Tom's Reaktion:** 😱 "Wow, geil!"

#### Step 3: Viral Sharing

**Aktion:** Tom teilt #3 auf TikTok

> "Bro check this out - 12 people saw UFO fleet over lake,
> there's even video 🛸
> Link in bio #UFO #Paranormal"

**Video geht viral: 234k Views**

**Ergebnis:**
- ✅ 1,200 neue User von TikTok
- ✅ Tom wird Regular User
- ✅ Organic Growth

---

## 🎯 Success Metrics per Persona

### Experiencer (Sarah)

**Success = Becomes Contributor**

Metrics:
- Time to first match: < 30s
- Conversion rate to submission: >30%
- Return rate (7d): >50%

### Explorer (Michael)

**Success = Deep Engagement**

Metrics:
- Session time: >15 min
- Patterns explored: >3
- Shares findings: >10%

### Researcher (Dr. Anna)

**Success = Data Export & Citation**

Metrics:
- Export rate: >5%
- Return for new data: Monthly
- Academic citations: 1+ per year

### Casual Browser (Tom)

**Success = Shares Content**

Metrics:
- Viral share rate: >2%
- Brings new users: >10 each
- Return rate: >20%

---

## 🔄 Multi-Turn Conversation Scenarios

### Scenario: Refinement

```
User: "UFO Sichtungen in Deutschland"
AI: [Shows 234 results, map]

User: "Nur Bayern"
AI: [Filters to 89 Bayern results]

User: "Nur 2024"
AI: [Filters to 34 results]

User: "Zeig auf Zeitlinie"
AI: [Shows timeline chart]

User: "Was ist der Peak-Monat?"
AI: "Juli 2024 mit 12 Sichtungen. Möglicherweise wegen..."
```

### Scenario: Exploration

```
User: "Gibt es Muster bei luziden Träumen?"
AI: [Shows patterns, timeline]

User: "Interessant! Was ist mit Meditation?"
AI: [Searches meditation experiences]

User: "Gibt es Überschneidungen?"
AI: "Ja! 38% der Luzid-Träumer praktizieren auch Meditation.
     2.3x höhere Rate als bei Nicht-Meditierenden."

User: "Zeig mir die Überschneidungen"
AI: [Shows Venn diagram, network graph]
```

---

## 💡 UX Principles

### 1. Instant Gratification

- Erste Antwort in < 5s
- Keine Ladebildschirme
- Progressive Loading (Teilergebnisse sofort)

### 2. Conversational, nicht Transactional

- Keine Suchmasken mit 10 Filtern
- Natürliche Sprache
- Follow-ups sind erwartet

### 3. Discovery, nicht Search

- AI schlägt Patterns vor
- "Möchtest du auch..." Prompts
- Serendipity moments

### 4. Visual First

- Maps, Charts, Graphs
- Nicht nur Text-Listen
- Rich Media (wenn vorhanden)

### 5. Trust & Transparency

- Confidence Scores sichtbar
- Quellen verlinkt
- Statistik transparent (p-values, N)

---

**Ready to build these experiences? → See TODO.md** 🎨
