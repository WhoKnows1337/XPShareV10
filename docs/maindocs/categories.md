# XPShare Kategorie-System v4.0

**Version:** 4.0
**Datum:** 2025-10-15
**Status:** ✅ FINALE VERSION - READY FOR IMPLEMENTATION

---

## 🎯 Übersicht

Das XPShare Kategorie-System nutzt eine **7-Kategorien-Struktur** mit je 6 Unterkategorien:

- **7 Hauptkategorien** (breite Themenbereiche)
- **42 Unterkategorien** (spezifische Phänomene)
- **Dynamische Attribute** (strukturierte Details)
- **Freie Tags** (User-generiert)

### Warum 7 Kategorien?

✅ **Psychologisch optimal** - Menschen können 7±2 Kategorien gut überblicken
✅ **Klar unterscheidbar** - Minimale Überlappung
✅ **User-Sprache** - So wie Menschen ihre Erlebnisse beschreiben
✅ **Vollständige Abdeckung** - Alle paranormalen/außergewöhnlichen Phänomene erfasst
✅ **Skalierbar** - Attributes für Details, keine 100 Unterkategorien nötig

---

## 🌳 KATEGORIEN-TREE

```
🌲 XPSHARE KATEGORIEN
│
├─📂 1. INNERE ERFAHRUNGEN 💭
│  │  slug: inner-experiences
│  │  color: from-purple-500 to-pink-500
│  │
│  ├─ 1.1 Träume & Klarträume (dreams)
│  ├─ 1.2 Nahtoderfahrungen (nde)
│  ├─ 1.3 Außerkörperliche Erfahrungen (obe)
│  ├─ 1.4 Meditation & Trance (meditation-trance)
│  ├─ 1.5 Psychedelische Erfahrungen (psychedelics)
│  └─ 1.6 Schlafparalyse (sleep-paralysis)
│
├─📂 2. PSI & ESP 👁️
│  │  slug: psi-esp
│  │  color: from-violet-500 to-purple-600
│  │
│  ├─ 2.1 Hellsehen / Drittes Auge (clairvoyance-third-eye)
│  ├─ 2.2 Telepathie & Empathie (telepathy-empathy)
│  ├─ 2.3 Präkognition / Vorahnungen (precognition)
│  ├─ 2.4 Remote Viewing (remote-viewing)
│  ├─ 2.5 Hellhören / Auditive Phänomene (clairaudience)
│  └─ 2.6 Psychokinese / Telekinese (psychokinesis)
│
├─📂 3. HIMMELS- & UMWELTPHÄNOMENE 🛸
│  │  slug: sky-environment
│  │  color: from-blue-500 to-cyan-500
│  │
│  ├─ 3.1 UFO / UAP Sichtungen (ufo-uap)
│  ├─ 3.2 Außergewöhnliche Aurora (aurora)
│  ├─ 3.3 Meteore & Feuerbälle (meteors)
│  ├─ 3.4 Kugelblitz (ball-lightning)
│  ├─ 3.5 Sprites / Atmosphärische Blitze (atmospheric-phenomena)
│  └─ 3.6 Unerklärliche Himmelslichter (unexplained-lights)
│
├─📂 4. KONTAKTE & ENTITÄTEN 👽
│  │  slug: contacts-entities
│  │  color: from-gray-700 to-gray-900
│  │
│  ├─ 4.1 Geister & Verstorbene (ghosts-spirits)
│  ├─ 4.2 Schattenwesen / Shadow People (shadow-beings)
│  ├─ 4.3 Alien-Begegnungen (alien-contact)
│  ├─ 4.4 Abduktionen / Entführungen (abductions)
│  ├─ 4.5 Naturwesen - Feen, Elfen (nature-beings)
│  └─ 4.6 Kryptiden - Bigfoot, etc. (cryptids)
│
├─📂 5. SPUK & ALLTAGSANOMALIEN ⚡
│  │  slug: hauntings-anomalies
│  │  color: from-slate-600 to-zinc-700
│  │
│  ├─ 5.1 Poltergeist-Aktivität (poltergeist)
│  ├─ 5.2 Elektronik-Störungen (electronic-anomalies)
│  ├─ 5.3 Unerklärliche Geräusche (unexplained-sounds)
│  ├─ 5.4 Temperatur-Anomalien (temperature-anomalies)
│  ├─ 5.5 Gerüche ohne Quelle (phantom-smells)
│  └─ 5.6 Spuren & Physische Manifestationen (physical-traces)
│
├─📂 6. ZEIT & REALITÄT ⏰
│  │  slug: time-reality
│  │  color: from-indigo-600 to-purple-700
│  │
│  ├─ 6.1 Missing Time / Fehlende Zeit (missing-time)
│  ├─ 6.2 Synchronizität (synchronicity)
│  ├─ 6.3 Déjà-vu (intensiv) (dejavu)
│  ├─ 6.4 Reality Glitches / Matrix-Momente (reality-glitches)
│  ├─ 6.5 Mandela-Effekt (mandela-effect)
│  └─ 6.6 Zeitschleifen (time-loops)
│
└─📂 7. KÖRPER & HEILUNG ✨
   │  slug: body-healing
   │  color: from-rose-500 to-pink-600
   │
   ├─ 7.1 Spontanheilungen (spontaneous-healing)
   ├─ 7.2 Krebs-Remissionen (cancer-remission)
   ├─ 7.3 Energetische Heilung (energy-healing)
   ├─ 7.4 Unerklärliche Symptome (unexplained-symptoms)
   ├─ 7.5 Stigmata & Körperliche Zeichen (stigmata)
   └─ 7.6 Kundalini-Syndrome (kundalini-symptoms)
```

---

## 📋 DETAILLIERTE KATEGORIEN

### 1. 💭 INNERE ERFAHRUNGEN

**Slug:** `inner-experiences`
**Farbe:** `from-purple-500 to-pink-500`
**Beschreibung:** Erlebnisse im Bewusstsein während Schlaf, Meditation, Trance oder veränderter Zustände.

#### 1.1 Träume & Klarträume
- **Slug:** `dreams`
- **Beispiele:**
  - "Ich hatte einen intensiven Traum..."
  - "Ich war mir bewusst, dass ich träume..."
  - "Wiederkehrende Traummuster"
- **Attributes:**
  - `lucidity` (klar, halb-klar, unklar)
  - `vividness` (intensity 1-10)
  - `control_level` (voll, partial, keine)
  - `dream_emotion` (peaceful, fearful, joyful, neutral)
  - `recurring` (yes/no)

#### 1.2 Nahtoderfahrungen (NDE)
- **Slug:** `nde`
- **Beispiele:**
  - "Ich war klinisch tot und sah..."
  - "Tunnel, Licht, verstorbene Verwandte..."
  - "Jenseits-Begegnungen"
- **Attributes:**
  - `trigger` (cardiac_arrest, accident, surgery, drowning)
  - `features` (tunnel, light, beings, life_review, boundary, choice)
  - `aftereffects` (spiritual_change, fearlessness, psychic_abilities)
  - `duration` (seconds, minutes, unknown)

#### 1.3 Außerkörperliche Erfahrungen (OBE)
- **Slug:** `obe`
- **Beispiele:**
  - "Ich schwebte über meinem Körper..."
  - "Astralreise, ich war woanders..."
  - "Bewusstsein außerhalb des Körpers"
- **Attributes:**
  - `trigger` (spontaneous, meditation, sleep, trauma)
  - `distance` (same_room, nearby, far_away)
  - `duration` (seconds, minutes, hours)
  - `control` (full, partial, none)
  - `verification` (details_verified, unverified)

#### 1.4 Meditation & Trance
- **Slug:** `meditation-trance`
- **Beispiele:**
  - "Während tiefer Meditation erlebte ich..."
  - "Ich war in Trance und..."
  - "Transzendentale Zustände, Samadhi"
- **Attributes:**
  - `practice_type` (vipassana, zen, transcendental, kundalini, shamanic)
  - `depth` (light, medium, deep, transcendent)
  - `duration` (minutes, hours)
  - `consciousness_type` (empty_mind, cosmic_consciousness, unity)

#### 1.5 Psychedelische Erfahrungen
- **Slug:** `psychedelics`
- **Beispiele:**
  - "Auf Ayahuasca/DMT/LSD sah ich..."
  - "Die Realität löste sich auf..."
  - "Begegnung mit Entitäten"
- **Attributes:**
  - `substance` (dmt, lsd, psilocybin, ayahuasca, mescaline, 5-meo-dmt, other)
  - `dosage` (microdose, low, medium, high, heroic)
  - `intensity` (mild, moderate, strong, overwhelming)
  - `entity_contact` (yes/no)
  - `breakthrough` (yes/no)

#### 1.6 Schlafparalyse
- **Slug:** `sleep-paralysis`
- **Beispiele:**
  - "Ich konnte mich nicht bewegen..."
  - "Eine Präsenz war im Raum..."
  - "Dämonische Erscheinung während Lähmung"
- **Attributes:**
  - `entity_presence` (yes/no)
  - `entity_type` (shadow, demon, alien, old_hag, other)
  - `fear_level` (mild, moderate, severe, terror)
  - `duration` (seconds, minutes)
  - `frequency` (first_time, occasional, frequent)

---

### 2. 👁️ PSI & ESP

**Slug:** `psi-esp`
**Farbe:** `from-violet-500 to-purple-600`
**Beschreibung:** Übersinnliche mentale Fähigkeiten und Extrasensorische Wahrnehmung.

#### 2.1 Hellsehen / Drittes Auge
- **Slug:** `clairvoyance-third-eye`
- **Beispiele:**
  - "Ich sah Auren/Energien um Menschen..."
  - "Mein drittes Auge öffnete sich..."
  - "Chakren sichtbar"
- **Attributes:**
  - `vision_type` (aura, energy, chakra, spirits, future, past)
  - `clarity` (vague, clear, crystal_clear)
  - `trigger` (spontaneous, meditation, practice, trauma)
  - `control` (no_control, some_control, full_control)

#### 2.2 Telepathie & Empathie
- **Slug:** `telepathy-empathy`
- **Beispiele:**
  - "Ich wusste was die Person denkt..."
  - "Ich spürte ihre Emotionen physisch..."
  - "Gedankenübertragung"
- **Attributes:**
  - `connection_type` (thoughts, emotions, intentions, images)
  - `distance` (touch, same_room, nearby, far_away)
  - `accuracy` (verified, unverified, partial)
  - `bidirectional` (yes/no)
  - `relationship` (family, friend, stranger, twin)

#### 2.3 Präkognition / Vorahnungen
- **Slug:** `precognition`
- **Beispiele:**
  - "Ich träumte es und es traf ein..."
  - "Ich wusste vorher, dass X passiert..."
  - "Prophetische Visionen"
- **Attributes:**
  - `timeframe` (hours, days, weeks, months, years)
  - `accuracy` (exact, approximate, symbolic)
  - `medium` (dream, vision, feeling, knowing)
  - `verified` (yes/no)
  - `significance` (minor, major, life_changing)

#### 2.4 Remote Viewing
- **Slug:** `remote-viewing`
- **Beispiele:**
  - "Ich sah einen Ort, an dem ich nie war..."
  - "Ich beschrieb Details über Distanz..."
  - "Fernwahrnehmung mit Protokoll"
- **Attributes:**
  - `distance` (same_city, another_country, unknown)
  - `target_type` (location, person, object, event)
  - `accuracy` (verified_high, verified_partial, unverified)
  - `protocol_used` (crv, srv, informal, spontaneous)
  - `feedback` (received, pending, none)

#### 2.5 Hellhören / Auditive Phänomene
- **Slug:** `clairaudience`
- **Beispiele:**
  - "Ich hörte Stimmen, die mir sagten..."
  - "Eine Botschaft kam klar an..."
  - "Innere Stimme mit Guidance"
- **Attributes:**
  - `voice_type` (male, female, child, multiple, non_human)
  - `clarity` (clear, muffled, telepathic)
  - `language` (known_language, unknown, wordless_meaning)
  - `message_content` (warning, guidance, information, comfort)
  - `source` (deceased, spirit_guide, higher_self, unknown)

#### 2.6 Psychokinese / Telekinese
- **Slug:** `psychokinesis`
- **Beispiele:**
  - "Objekte bewegten sich durch meinen Willen..."
  - "Ich beeinflusste Materie mit Gedanken..."
  - "Löffel biegen, Gegenstände bewegen"
- **Attributes:**
  - `object_type` (light, small_object, large_object, electronic)
  - `effect` (movement, bending, breaking, levitation)
  - `distance` (touch, nearby, across_room)
  - `control_level` (accidental, partial, full)
  - `witnesses` (alone, 1-2, 3-5, many)

---

### 3. 🛸 HIMMELS- & UMWELTPHÄNOMENE

**Slug:** `sky-environment`
**Farbe:** `from-blue-500 to-cyan-500`
**Beschreibung:** Phänomene am Himmel und in der Atmosphäre, die unerklärbar oder außergewöhnlich sind.

#### 3.1 UFO / UAP Sichtungen
- **Slug:** `ufo-uap`
- **Beispiele:**
  - "Ich sah ein metallisches Objekt am Himmel..."
  - "Es bewegte sich unmöglich schnell..."
  - "Unidentifiziertes Flugobjekt"
- **Attributes:**
  - `shape` (triangle, disc, orb, cigar, cylinder, sphere, other)
  - `surface` (metallic, glowing, matte, translucent, reflective)
  - `light_color` (red, blue, white, green, orange, yellow, multicolor)
  - `light_pattern` (steady, pulsating, flashing, rotating)
  - `movement` (hovering, fast, erratic, smooth, zigzag, ascending)
  - `sound` (silent, humming, buzzing, roaring, whistling, other)
  - `size` (tiny, small, medium, large, huge)
  - `altitude` (ground_level, low, medium, high, very_high)

#### 3.2 Außergewöhnliche Aurora / Polarlichter
- **Slug:** `aurora`
- **Beispiele:**
  - "Aurora in Deutschland/ungewöhnlichem Ort..."
  - "Die Farben waren surreal..."
  - "Polarlichter mit anomalen Mustern"
- **Attributes:**
  - `location` (unusual_latitude, unexpected_location)
  - `colors` (green, red, purple, blue, white, multicolor)
  - `intensity` (faint, moderate, bright, spectacular)
  - `duration` (minutes, hours)
  - `unusual_patterns` (spiral, pillar, corona, pulsating)

#### 3.3 Meteore & Feuerbälle
- **Slug:** `meteors`
- **Beispiele:**
  - "Ein riesiger Feuerball am Himmel..."
  - "Extrem heller Meteor, der sich teilte..."
  - "Bolide mit Explosion"
- **Attributes:**
  - `brightness` (bright, very_bright, brighter_than_moon, daylight)
  - `color` (white, blue, green, red, orange, multicolor)
  - `trajectory` (horizontal, descending, ascending, erratic)
  - `fragmentation` (single, split, multiple_pieces)
  - `sound` (none, delayed_boom, sonic_boom, crackling)
  - `duration` (seconds, persistent_trail)

#### 3.4 Kugelblitz
- **Slug:** `ball-lightning`
- **Beispiele:**
  - "Eine leuchtende Kugel schwebte..."
  - "Ball Lightning im Haus..."
  - "Plasmakugel mit Bewegung"
- **Attributes:**
  - `size` (golf_ball, basketball, beach_ball, larger)
  - `color` (white, blue, yellow, orange, red)
  - `behavior` (stationary, floating, moving, bouncing)
  - `duration` (seconds, minutes)
  - `damage` (none, burn_marks, explosion, electronic_damage)
  - `indoor` (yes/no)

#### 3.5 Sprites / Atmosphärische Blitze
- **Slug:** `atmospheric-phenomena`
- **Beispiele:**
  - "Rote Blitze über Gewitterwolken..."
  - "Leuchtende Phänomene in Stratosphäre..."
  - "Blue Jets, Elves"
- **Attributes:**
  - `type` (sprite, elve, blue_jet, gigantic_jet)
  - `color` (red, blue, white, purple)
  - `altitude` (stratosphere, mesosphere, thermosphere)
  - `duration` (milliseconds, seconds)
  - `storm_present` (yes/no)

#### 3.6 Unerklärliche Himmelslichter
- **Slug:** `unexplained-lights`
- **Beispiele:**
  - "Lichter, die keine Erklärung haben..."
  - "Orbs, Formationen am Nachthimmel..."
  - "Mysteriöse Lichter über Stadt"
- **Attributes:**
  - `formation_type` (single, pair, triangle, line, cluster, grid)
  - `color` (white, red, orange, blue, multicolor, changing)
  - `movement` (stationary, slow, fast, erratic, intelligent)
  - `duration` (seconds, minutes, hours)
  - `pattern` (random, synchronized, responsive)

---

### 4. 👽 KONTAKTE & ENTITÄTEN

**Slug:** `contacts-entities`
**Farbe:** `from-gray-700 to-gray-900`
**Beschreibung:** Begegnungen mit intelligenten Wesen, die nicht in unsere bekannte Realität passen.

#### 4.1 Geister & Verstorbene
- **Slug:** `ghosts-spirits`
- **Beispiele:**
  - "Ich sah den Geist meiner Oma..."
  - "Eine durchsichtige Person stand da..."
  - "Verstorbener Verwandter erschien"
- **Attributes:**
  - `entity_appearance` (solid, transparent, shadow, mist, glowing, orb)
  - `relationship` (family, friend, stranger, historical_figure)
  - `communication` (none, visual, auditory, telepathic, physical)
  - `emotion` (peaceful, sad, angry, confused, loving, warning)
  - `recognition` (recognized, unknown)

#### 4.2 Schattenwesen / Shadow People
- **Slug:** `shadow-beings`
- **Beispiele:**
  - "Eine schwarze Gestalt ohne Gesicht..."
  - "Schattenmenschen in meinem Zimmer..."
  - "Dark entities, Hat Man"
- **Attributes:**
  - `shape` (humanoid, tall, short, hooded, hat_man, amorphous)
  - `size` (child_size, adult_size, very_tall, variable)
  - `behavior` (watching, approaching, fleeing, threatening, neutral)
  - `fear_level` (none, mild, moderate, severe, paralyzing)
  - `paralysis` (yes/no)
  - `frequency` (once, occasional, recurring)

#### 4.3 Alien-Begegnungen / Nicht-menschliche Intelligenz
- **Slug:** `alien-contact`
- **Beispiele:**
  - "Ich traf ein außerirdisches Wesen..."
  - "Große Augen, graue Haut..."
  - "Grey, Nordic, Reptilian, Mantis"
- **Attributes:**
  - `entity_type` (grey, nordic, reptilian, mantis, hybrid, other)
  - `appearance` (humanoid, non_humanoid, robotic, ethereal)
  - `communication_method` (telepathic, verbal, gestures, device)
  - `intent` (benevolent, neutral, malevolent, curious, scientific)
  - `location` (outdoor, indoor, craft, medical_room)

#### 4.4 Abduktionen / Entführungen
- **Slug:** `abductions`
- **Beispiele:**
  - "Ich wurde in ein Schiff gebracht..."
  - "Missing Time + Erinnerungen an Untersuchung..."
  - "Alien abduction experience"
- **Attributes:**
  - `duration` (minutes, hours, missing_time)
  - `procedures` (examination, implant, samples, communication, none)
  - `missing_time` (yes/no + duration)
  - `scars` (yes/no + location)
  - `witnesses` (alone, others_present, others_abducted)
  - `recollection` (immediate, regression, spontaneous, dreams)

#### 4.5 Naturwesen (Feen, Elfen, etc.)
- **Slug:** `nature-beings`
- **Beispiele:**
  - "Ich sah ein kleines leuchtendes Wesen..."
  - "Im Wald war etwas Magisches..."
  - "Fairy, Elemental, Nature Spirit"
- **Attributes:**
  - `being_type` (fairy, elf, gnome, dryad, elemental, light_being)
  - `size` (tiny, small, human_size, variable)
  - `appearance` (luminous, solid, ethereal, translucent)
  - `location` (forest, garden, water, mountain, indoors)
  - `interaction` (observed, communication, touch, gift, warning)

#### 4.6 Kryptiden (Bigfoot, etc.)
- **Slug:** `cryptids`
- **Beispiele:**
  - "Ich sah eine große, behaarte Kreatur..."
  - "Unerklärliches Tier, das nicht existieren sollte..."
  - "Bigfoot, Mothman, Dogman"
- **Attributes:**
  - `creature_type` (bigfoot, dogman, mothman, chupacabra, sea_creature, flying, other)
  - `size` (human_size, larger_than_human, massive)
  - `behavior` (fleeing, observing, aggressive, curious)
  - `evidence` (visual_only, sounds, tracks, photos, physical_evidence)
  - `location` (forest, swamp, lake, mountain, rural, urban)

---

### 5. ⚡ SPUK & ALLTAGSANOMALIEN

**Slug:** `hauntings-anomalies`
**Farbe:** `from-slate-600 to-zinc-700`
**Beschreibung:** Unerklärliche Phänomene im Alltag und in Gebäuden.

#### 5.1 Poltergeist-Aktivität
- **Slug:** `poltergeist`
- **Beispiele:**
  - "Objekte flogen durch die Luft..."
  - "Dinge fielen ohne Grund vom Regal..."
  - "Gegenstände bewegen sich von selbst"
- **Attributes:**
  - `object_type` (small, large, multiple, furniture, electronics)
  - `force` (gentle, moderate, violent, thrown)
  - `frequency` (once, occasional, frequent, constant)
  - `pattern` (random, targeted, escalating, cyclical)
  - `witnesses` (alone, family, multiple_people)
  - `trigger` (emotional_state, person_present, time_of_day, unknown)

#### 5.2 Elektronik-Störungen / EM-Phänomene
- **Slug:** `electronic-anomalies`
- **Beispiele:**
  - "Mein Handy/Computer spinnt immer wenn..."
  - "Lichter flackern, Geräte gehen aus..."
  - "Street Light Interference (SLI)"
- **Attributes:**
  - `device_type` (lights, phone, computer, tv, radio, appliances, multiple)
  - `effect` (flickering, turn_off, turn_on, malfunction, interference)
  - `pattern` (random, triggered_by_person, triggered_by_emotion, location_based)
  - `trigger` (presence, emotion, thought, unknown)
  - `duration` (momentary, minutes, prolonged)
  - `frequency` (rare, occasional, frequent)

#### 5.3 Unerklärliche Geräusche
- **Slug:** `unexplained-sounds`
- **Beispiele:**
  - "Schritte, Klopfen, niemand da..."
  - "Stimmen aus leeren Räumen..."
  - "Phantom footsteps, knocking, voices"
- **Attributes:**
  - `sound_type` (footsteps, knocking, voices, music, scratching, breathing, banging)
  - `volume` (faint, moderate, loud, deafening)
  - `pattern` (random, rhythmic, responsive, intelligent)
  - `location` (specific_room, hallway, walls, ceiling, everywhere)
  - `time_of_day` (any_time, night_only, specific_hour)

#### 5.4 Temperatur-Anomalien
- **Slug:** `temperature-anomalies`
- **Beispiele:**
  - "Plötzliche Kälte, eisiger Hauch..."
  - "Warme Stellen ohne Quelle..."
  - "Cold spots, heat waves"
- **Attributes:**
  - `temperature_change` (sudden_cold, gradual_cold, sudden_heat, gradual_heat)
  - `intensity` (mild, noticeable, extreme)
  - `location` (specific_spot, room, moving, person_specific)
  - `duration` (seconds, minutes, persistent)
  - `witnesses` (alone, multiple)

#### 5.5 Gerüche ohne Quelle
- **Slug:** `phantom-smells`
- **Beispiele:**
  - "Plötzlicher Blumen-/Verbrannt-Geruch..."
  - "Parfüm der verstorbenen Oma..."
  - "Phantom smells, olfactory phenomena"
- **Attributes:**
  - `smell_type` (flowers, perfume, smoke, sulfur, decay, food, cologne)
  - `intensity` (faint, strong, overwhelming)
  - `duration` (seconds, minutes, lingering)
  - `trigger` (thought_of_person, location, time, emotion)
  - `association` (deceased_person, memory, warning, unknown)

#### 5.6 Spuren & Physische Manifestationen
- **Slug:** `physical-traces`
- **Beispiele:**
  - "Abdrücke, Kratzer, Verbrennungen..."
  - "Gegenstände erscheinen/verschwinden..."
  - "Physical marks, apports, disappearances"
- **Attributes:**
  - `trace_type` (marks, scratches, burns, footprints, handprints, writing)
  - `appearance` (appeared, disappeared, moved, transformed)
  - `location` (body, walls, floor, objects)
  - `persistence` (temporary, days, permanent)
  - `pattern` (random, symbolic, intelligent, message)
  - `documented` (photos, video, physical_evidence, witness_only)

---

### 6. ⏰ ZEIT & REALITÄT

**Slug:** `time-reality`
**Farbe:** `from-indigo-600 to-purple-700`
**Beschreibung:** Anomalien in Zeit, Raum und der Wahrnehmung von Realität.

#### 6.1 Missing Time / Fehlende Zeit
- **Slug:** `missing-time`
- **Beispiele:**
  - "Ich verlor 3 Stunden ohne Erklärung..."
  - "Es war plötzlich viel später..."
  - "Time loss, unaccounted hours"
- **Attributes:**
  - `duration_lost` (minutes, hours, days)
  - `trigger` (ufo_sighting, entity_encounter, spontaneous, driving)
  - `memory_gaps` (complete_blank, vague_memory, recovered_later)
  - `context` (alone, with_others, traveling, stationary)
  - `witnesses` (alone, others_affected, others_normal)
  - `physical_effects` (exhaustion, marks, nausea, disorientation)

#### 6.2 Synchronizität
- **Slug:** `synchronicity`
- **Beispiele:**
  - "Bedeutungsvolle Zufälle häufen sich..."
  - "Die Zahl 11:11 überall..."
  - "Meaningful coincidences, patterns"
- **Attributes:**
  - `sync_type` (numbers, names, events, thoughts_and_events, dreams_and_reality)
  - `frequency` (rare, occasional, frequent, constant)
  - `pattern` (specific_number, person, symbol, theme)
  - `meaning` (guidance, confirmation, warning, unknown)
  - `recurrence` (one_time, ongoing, cyclical)

#### 6.3 Déjà-vu (intensiv)
- **Slug:** `dejavu`
- **Beispiele:**
  - "Ich hatte das EXAKT schon erlebt..."
  - "Minutenlanges, perfektes Déjà-vu..."
  - "Intense, prolonged déjà-vu"
- **Attributes:**
  - `duration` (seconds, minutes, extended)
  - `intensity` (vague, strong, overwhelming, perfect_match)
  - `accuracy` (general_feeling, specific_details, exact_prediction)
  - `trigger` (spontaneous, stress, location, person)
  - `frequency` (rare, occasional, frequent)

#### 6.4 Reality Glitches / Matrix-Momente
- **Slug:** `reality-glitches`
- **Beispiele:**
  - "Die Realität glitchte kurz..."
  - "Ich sah denselben Menschen doppelt..."
  - "Matrix moments, simulation glitches"
- **Attributes:**
  - `glitch_type` (duplicate_person, object_shift, scene_repeat, environment_change)
  - `duration` (instant, seconds, minutes)
  - `witnesses` (alone, multiple_saw, others_didnt_notice)
  - `repetition` (once, few_times, multiple_times)
  - `reality_shift` (minor, significant, reality_changed)

#### 6.5 Mandela-Effekt
- **Slug:** `mandela-effect`
- **Beispiele:**
  - "Ich erinnere es anders als alle anderen..."
  - "Geschichte hat sich geändert..."
  - "Collective false memory, reality shift"
- **Attributes:**
  - `memory_topic` (brand_name, movie_quote, geography, history, spelling)
  - `number_affected` (just_me, few_people, many_people, widespread)
  - `confidence` (certain, very_certain, absolutely_certain)
  - `evidence` (residue_found, personal_proof, shared_memory, none)

#### 6.6 Zeitschleifen
- **Slug:** `time-loops`
- **Beispiele:**
  - "Derselbe Moment wiederholte sich..."
  - "Ich war in einer Zeitschleife..."
  - "Time loop, repeating events"
- **Attributes:**
  - `loop_duration` (seconds, minutes, hours, day)
  - `repetitions` (2-3, several, many, lost_count)
  - `awareness` (realized_immediately, gradual, only_after)
  - `variations` (identical, slight_changes, increasing_awareness)
  - `exit_method` (spontaneous, action_taken, unknown)

---

### 7. ✨ KÖRPER & HEILUNG

**Slug:** `body-healing`
**Farbe:** `from-rose-500 to-pink-600`
**Beschreibung:** Unerklärliche körperliche Heilungen und Phänomene am eigenen Körper.

#### 7.1 Spontanheilungen
- **Slug:** `spontaneous-healing`
- **Beispiele:**
  - "Meine Krankheit verschwand über Nacht..."
  - "Ärzte konnten es nicht erklären..."
  - "Unexplained recovery, miracle healing"
- **Attributes:**
  - `condition` (injury, chronic_illness, acute_illness, disability)
  - `timeframe` (instant, overnight, days, weeks)
  - `verified` (medical_records, doctor_confirmed, personal_only)
  - `trigger` (prayer, meditation, energy_work, spontaneous, unknown)
  - `medical_records` (before_after, tests, imaging, documentation)

#### 7.2 Krebs-Remissionen
- **Slug:** `cancer-remission`
- **Beispiele:**
  - "Mein Krebs ist weg, ohne Behandlung..."
  - "Tumoren verschwanden unerklärlich..."
  - "Unexplained cancer remission"
- **Attributes:**
  - `cancer_type` (specific type or general)
  - `stage` (early, advanced, terminal)
  - `treatment` (none, minimal, alternative_only, standard_plus_alternative)
  - `timeframe` (rapid, gradual, unexpected)
  - `verified` (biopsy, imaging, blood_tests, doctor_confirmed)

#### 7.3 Energetische Heilung
- **Slug:** `energy-healing`
- **Beispiele:**
  - "Nach Reiki/Handauflegen war der Schmerz weg..."
  - "Ich spürte heilende Energie..."
  - "Healing through Reiki, Qi Gong, Pranic Healing"
- **Attributes:**
  - `method` (reiki, qi_gong, pranic_healing, therapeutic_touch, hands_on, distance)
  - `healer_present` (professional, friend, self, none)
  - `sensation` (heat, tingling, vibration, light, none)
  - `outcome` (complete_healing, improved, temporary_relief, no_change)
  - `condition_treated` (pain, illness, emotional, energy_blockage)

#### 7.4 Unerklärliche Symptome
- **Slug:** `unexplained-symptoms`
- **Beispiele:**
  - "Symptome ohne medizinische Ursache..."
  - "Ärzte finden nichts..."
  - "Phantom pains, unexplained illness"
- **Attributes:**
  - `symptom_type` (pain, fatigue, sensation, movement, sensory, multiple)
  - `duration` (acute, chronic, intermittent)
  - `tests_done` (blood, imaging, specialists, extensive, none)
  - `pattern` (random, triggered, cyclical, constant)
  - `theories` (psychological, spiritual, environmental, unknown)

#### 7.5 Stigmata & Körperliche Zeichen
- **Slug:** `stigmata`
- **Beispiele:**
  - "Wunden/Zeichen erschienen ohne Verletzung..."
  - "Religiöse/mystische Körperzeichen..."
  - "Spontaneous wounds, marks, symbols"
- **Attributes:**
  - `mark_type` (wounds, scars, symbols, writing, burn_marks, bruises)
  - `location` (hands, feet, side, forehead, back, other)
  - `appearance_trigger` (prayer, vision, spontaneous, sleep, meditation)
  - `persistence` (hours, days, weeks, permanent, cyclic)
  - `pain` (none, mild, severe)
  - `meaning` (religious, symbolic, warning, unknown)

#### 7.6 Kundalini-Syndrome
- **Slug:** `kundalini-symptoms`
- **Beispiele:**
  - "Energie schoss meine Wirbelsäule hoch..."
  - "Intensive körperliche Reaktionen bei Erwachen..."
  - "Kundalini awakening, energy rising"
- **Attributes:**
  - `symptom_type` (heat, pressure, movement, vibration, pain, bliss, multiple)
  - `intensity` (mild, moderate, intense, overwhelming)
  - `trigger` (yoga, meditation, spontaneous, trauma, sexual)
  - `duration` (minutes, hours, days, ongoing)
  - `location` (spine, head, chakras, full_body)
  - `practice` (yoga, meditation, tantra, breathwork, none)

---

## 📊 QUICK REFERENCE

| # | Kategorie | Emoji | Slug | Subs | Farbe |
|---|-----------|-------|------|------|-------|
| 1 | Innere Erfahrungen | 💭 | inner-experiences | 6 | purple-pink |
| 2 | Psi & ESP | 👁️ | psi-esp | 6 | violet-purple |
| 3 | Himmels- & Umweltphänomene | 🛸 | sky-environment | 6 | blue-cyan |
| 4 | Kontakte & Entitäten | 👽 | contacts-entities | 6 | gray-dark |
| 5 | Spuk & Alltagsanomalien | ⚡ | hauntings-anomalies | 6 | slate-zinc |
| 6 | Zeit & Realität | ⏰ | time-reality | 6 | indigo-purple |
| 7 | Körper & Heilung | ✨ | body-healing | 6 | rose-pink |

**GESAMT: 7 Hauptkategorien + 42 Unterkategorien = 49 Kategorien**

---

## 🎯 USER-BEISPIELE ZUORDNUNG

```
✅ Traum                    → 1.1 Träume & Klarträume
✅ Nahtoderfahrung          → 1.2 NDE
✅ Psychedelische           → 1.5 Psychedelische Erfahrungen
✅ Meditation               → 1.4 Meditation & Trance
✅ Yoga (Kundalini)         → 7.6 Kundalini-Syndrome
✅ UFO Sichtungen           → 3.1 UFO/UAP
✅ Meteor                   → 3.3 Meteore & Feuerbälle
✅ Aurora                   → 3.2 Außergewöhnliche Aurora
✅ Remote Viewing           → 2.4 Remote Viewing
✅ Geist gesehen            → 4.1 Geister & Verstorbene
✅ Stimmen hören (ESP)      → 2.5 Hellhören
✅ Stimmen hören (Spuk)     → 5.3 Unerklärliche Geräusche
✅ 3tes Auge                → 2.1 Hellsehen / Drittes Auge
✅ Energien sehen           → 2.1 Hellsehen (Auren)
✅ Dinge fallen             → 5.1 Poltergeist
✅ Krebs                    → 7.2 Krebs-Remissionen
✅ Gesundheit allgemein     → 7.1, 7.3, 7.4
```

---

## 🚀 IMPLEMENTIERUNG

### Database Schema

```sql
CREATE TABLE question_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  name_en text,
  name_de text,
  name_fr text,
  name_es text,
  description text,
  description_en text,
  description_de text,
  emoji text,
  color text,                    -- Tailwind gradient
  parent_category_id uuid REFERENCES question_categories(id),
  level integer DEFAULT 0,       -- 0 = Main, 1 = Sub
  sort_order int NOT NULL DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

### Attribute System

Siehe `docs/category.md` v3.1 für Details zum Attribute System.

**Grundprinzip:**
- Kategorien = grobe Einteilung
- Attributes = strukturierte Details (Form, Farbe, Intensität, etc.)
- Tags = freie User-Klassifikation

---

## 💡 DESIGN-PRINZIPIEN

### ✅ WAS FUNKTIONIERT

1. **User-Perspektive zuerst**
   - Benennungen nach User-Sprache, nicht Wissenschaft
   - "Träume" nicht "Oneirische Phänomene"
   - "UFO" nicht "Unidentifizierte Aeriale Phänomenologie"

2. **Progressive Disclosure**
   - Start mit 7 Hauptkategorien (übersichtlich)
   - 42 Unterkategorien für Spezifität
   - Attributes für Details
   - Tags für Nuancen

3. **Klare Abgrenzung**
   - Minimale Überlappung zwischen Kategorien
   - Wenn unklar: Primäre Kategorie + Tags für Sekundäre

4. **Skalierbar**
   - Keine 100 Unterkategorien nötig
   - Attributes > mehr Kategorien
   - Neue Unterkategorien nur bei Bedarf

### ❌ WAS VERMIEDEN WIRD

1. **Keine Akademische Sprache**
   - User sollen sich sofort verstanden fühlen
   - Alltagssprache > Fachbegriffe

2. **Keine Meta-Kategorie nötig**
   - "Meta" verwirrt User
   - Querschnitts-Daten via Questions erfassen
   - Attributes für Zeugen, Dokumentation, etc.

3. **Keine Überlappenden Kategorien**
   - Nicht: "Consciousness" UND "Spiritual Practice"
   - Stattdessen: Klare Trennung nach Kontext

4. **Keine "Sonstiges"-Inflation**
   - Nur als letzte Option
   - Meistens besser: Tags statt neue Kategorie

---

## 📝 NÄCHSTE SCHRITTE

1. **Migration erstellen** für 7+42 Kategorien
2. **Attribute Schema** pro Kategorie definieren
3. **Questions** mit Attribute Mappings erstellen
4. **AI Prompts** für neue Kategorien anpassen
5. **Frontend** Category Picker updaten
6. **Testing** mit realen User-Geschichten

---

**Autor:** Tom + Claude
**Version:** 4.0 - Complete 7-Category System
**Status:** ✅ READY FOR IMPLEMENTATION
**Datum:** 2025-10-15
