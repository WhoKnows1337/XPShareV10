# XPShare Complete Attribute Definitions

**Version:** 1.0
**Date:** 2025-10-14
**Status:** Ready for Implementation

---

## Overview

This document defines ALL attributes for the XPShare system across all 48 subcategories.

**Total Attributes:** ~80
**Generic Attributes:** 8 (for all categories)
**Category-Specific:** ~72 (distributed across categories)

---

## GENERIC ATTRIBUTES (All Categories)

These attributes apply to **ALL** categories and experiences.

```typescript
const GENERIC_ATTRIBUTES = [
  {
    key: 'intensity',
    display_name: 'Intensity',
    display_name_de: 'Intensität',
    display_name_fr: 'Intensité',
    display_name_es: 'Intensidad',
    category_slug: null, // All categories
    data_type: 'enum',
    allowed_values: ['mild', 'moderate', 'strong', 'overwhelming'],
    description: 'Overall intensity of the experience',
    is_searchable: true,
    is_filterable: true,
    sort_order: 1
  },
  {
    key: 'duration',
    display_name: 'Duration',
    display_name_de: 'Dauer',
    display_name_fr: 'Durée',
    display_name_es: 'Duración',
    category_slug: null,
    data_type: 'text',
    allowed_values: null,
    description: 'How long the experience lasted (free text)',
    is_searchable: true,
    is_filterable: false,
    sort_order: 2
  },
  {
    key: 'time_of_day',
    display_name: 'Time of Day',
    display_name_de: 'Tageszeit',
    display_name_fr: 'Heure de la journée',
    display_name_es: 'Hora del día',
    category_slug: null,
    data_type: 'enum',
    allowed_values: ['morning', 'afternoon', 'evening', 'night', 'dawn', 'dusk'],
    description: 'Time of day when experience occurred',
    is_searchable: true,
    is_filterable: true,
    sort_order: 3
  },
  {
    key: 'witnesses',
    display_name: 'Witnesses',
    display_name_de: 'Zeugen',
    display_name_fr: 'Témoins',
    display_name_es: 'Testigos',
    category_slug: null,
    data_type: 'enum',
    allowed_values: ['alone', 'with_1_2', 'with_3_5', 'more_than_5'],
    description: 'Number of witnesses present',
    is_searchable: true,
    is_filterable: true,
    sort_order: 4
  },
  {
    key: 'emotional_state',
    display_name: 'Emotional State',
    display_name_de: 'Emotionaler Zustand',
    display_name_fr: 'État émotionnel',
    display_name_es: 'Estado emocional',
    category_slug: null,
    data_type: 'enum',
    allowed_values: ['peaceful', 'fearful', 'joyful', 'confused', 'awe', 'terror', 'calm', 'excited'],
    description: 'Emotional state during experience',
    is_searchable: true,
    is_filterable: true,
    sort_order: 5
  },
  {
    key: 'visibility',
    display_name: 'Visibility Conditions',
    display_name_de: 'Sichtverhältnisse',
    display_name_fr: 'Conditions de visibilité',
    display_name_es: 'Condiciones de visibilidad',
    category_slug: null,
    data_type: 'enum',
    allowed_values: ['clear', 'foggy', 'rainy', 'dark', 'bright', 'cloudy'],
    description: 'Weather/visibility conditions',
    is_searchable: true,
    is_filterable: true,
    sort_order: 6
  },
  {
    key: 'afterwards_feeling',
    display_name: 'Feeling Afterwards',
    display_name_de: 'Gefühl danach',
    display_name_fr: 'Sentiment après',
    display_name_es: 'Sentimiento después',
    category_slug: null,
    data_type: 'enum',
    allowed_values: ['energized', 'drained', 'peaceful', 'confused', 'changed', 'normal', 'disturbed'],
    description: 'How you felt after the experience',
    is_searchable: true,
    is_filterable: true,
    sort_order: 7
  },
  {
    key: 'repeatability',
    display_name: 'Has it happened before/after?',
    display_name_de: 'Schon früher/später passiert?',
    display_name_fr: 'Déjà arrivé avant/après?',
    display_name_es: '¿Ha ocurrido antes/después?',
    category_slug: null,
    data_type: 'enum',
    allowed_values: ['first_time', 'recurring', 'happened_again', 'ongoing'],
    description: 'Whether this was an isolated or recurring experience',
    is_searchable: true,
    is_filterable: true,
    sort_order: 8
  }
]
```

---

## 1. 🛸 AUSSERIRDISCH & HIMMEL (extraterrestrial-sky)

### 1.1 UFO/UAP Sichtungen (ufo-uap)

```typescript
const UFO_UAP_ATTRIBUTES = [
  {
    key: 'shape',
    display_name: 'Shape',
    display_name_de: 'Form',
    display_name_fr: 'Forme',
    display_name_es: 'Forma',
    category_slug: 'ufo-uap',
    data_type: 'enum',
    allowed_values: ['triangle', 'disc', 'orb', 'cigar', 'cylinder', 'sphere', 'rectangle', 'chevron', 'other'],
    description: 'Shape of the observed object',
    is_searchable: true,
    is_filterable: true,
    sort_order: 10
  },
  {
    key: 'surface',
    display_name: 'Surface',
    display_name_de: 'Oberfläche',
    display_name_fr: 'Surface',
    display_name_es: 'Superficie',
    category_slug: 'ufo-uap',
    data_type: 'enum',
    allowed_values: ['metallic', 'glowing', 'matte', 'translucent', 'reflective', 'dark', 'bright'],
    description: 'Surface appearance of the object',
    is_searchable: true,
    is_filterable: true,
    sort_order: 11
  },
  {
    key: 'light_color',
    display_name: 'Light Color',
    display_name_de: 'Lichtfarbe',
    display_name_fr: 'Couleur de lumière',
    display_name_es: 'Color de luz',
    category_slug: 'ufo-uap',
    data_type: 'enum',
    allowed_values: ['red', 'blue', 'white', 'green', 'orange', 'yellow', 'purple', 'multicolor', 'none'],
    description: 'Color of lights on the object',
    is_searchable: true,
    is_filterable: true,
    sort_order: 12
  },
  {
    key: 'light_pattern',
    display_name: 'Light Pattern',
    display_name_de: 'Licht-Muster',
    display_name_fr: 'Motif de lumière',
    display_name_es: 'Patrón de luz',
    category_slug: 'ufo-uap',
    data_type: 'enum',
    allowed_values: ['steady', 'pulsating', 'flashing', 'rotating', 'strobing', 'none'],
    description: 'Pattern of lights',
    is_searchable: true,
    is_filterable: true,
    sort_order: 13
  },
  {
    key: 'movement',
    display_name: 'Movement',
    display_name_de: 'Bewegung',
    display_name_fr: 'Mouvement',
    display_name_es: 'Movimiento',
    category_slug: 'ufo-uap',
    data_type: 'enum',
    allowed_values: ['hovering', 'fast', 'erratic', 'smooth', 'zigzag', 'ascending', 'descending', 'stationary'],
    description: 'Movement pattern of the object',
    is_searchable: true,
    is_filterable: true,
    sort_order: 14
  },
  {
    key: 'sound',
    display_name: 'Sound',
    display_name_de: 'Geräusch',
    display_name_fr: 'Son',
    display_name_es: 'Sonido',
    category_slug: 'ufo-uap',
    data_type: 'enum',
    allowed_values: ['silent', 'humming', 'buzzing', 'roaring', 'whistling', 'pulsing', 'other'],
    description: 'Sound produced by the object',
    is_searchable: true,
    is_filterable: true,
    sort_order: 15
  },
  {
    key: 'size',
    display_name: 'Size',
    display_name_de: 'Größe',
    display_name_fr: 'Taille',
    display_name_es: 'Tamaño',
    category_slug: 'ufo-uap',
    data_type: 'enum',
    allowed_values: ['tiny', 'small', 'medium', 'large', 'huge', 'unclear'],
    description: 'Estimated size of the object',
    is_searchable: true,
    is_filterable: true,
    sort_order: 16
  },
  {
    key: 'altitude',
    display_name: 'Altitude',
    display_name_de: 'Höhe',
    display_name_fr: 'Altitude',
    display_name_es: 'Altitud',
    category_slug: 'ufo-uap',
    data_type: 'enum',
    allowed_values: ['ground_level', 'low', 'medium', 'high', 'very_high', 'space'],
    description: 'Approximate altitude of the object',
    is_searchable: true,
    is_filterable: true,
    sort_order: 17
  },
  {
    key: 'disappearance',
    display_name: 'How it disappeared',
    display_name_de: 'Wie verschwunden',
    display_name_fr: 'Comment disparu',
    display_name_es: 'Cómo desapareció',
    category_slug: 'ufo-uap',
    data_type: 'enum',
    allowed_values: ['instant', 'gradual', 'flew_away', 'faded', 'blinked_out', 'still_visible'],
    description: 'How the object disappeared',
    is_searchable: true,
    is_filterable: true,
    sort_order: 18
  }
]
```

### 1.2 Alien Contact (alien-contact)

```typescript
const ALIEN_CONTACT_ATTRIBUTES = [
  {
    key: 'entity_type',
    display_name: 'Entity Type',
    display_name_de: 'Wesenart',
    display_name_fr: 'Type d\'entité',
    display_name_es: 'Tipo de entidad',
    category_slug: 'alien-contact',
    data_type: 'enum',
    allowed_values: ['grey', 'reptilian', 'nordic', 'mantis', 'humanoid', 'robotic', 'light_being', 'other'],
    description: 'Type of alien entity encountered',
    is_searchable: true,
    is_filterable: true,
    sort_order: 20
  },
  {
    key: 'communication_type',
    display_name: 'Communication Type',
    display_name_de: 'Kommunikationsart',
    display_name_fr: 'Type de communication',
    display_name_es: 'Tipo de comunicación',
    category_slug: 'alien-contact',
    data_type: 'enum',
    allowed_values: ['telepathic', 'verbal', 'gestures', 'none', 'symbols', 'emotional'],
    description: 'How communication occurred',
    is_searchable: true,
    is_filterable: true,
    sort_order: 21
  },
  {
    key: 'interaction_nature',
    display_name: 'Interaction Nature',
    display_name_de: 'Art der Interaktion',
    display_name_fr: 'Nature de l\'interaction',
    display_name_es: 'Naturaleza de la interacción',
    category_slug: 'alien-contact',
    data_type: 'enum',
    allowed_values: ['benevolent', 'neutral', 'hostile', 'curious', 'indifferent', 'frightening'],
    description: 'Nature of the interaction',
    is_searchable: true,
    is_filterable: true,
    sort_order: 22
  },
  {
    key: 'physical_effects',
    display_name: 'Physical Effects',
    display_name_de: 'Körperliche Auswirkungen',
    display_name_fr: 'Effets physiques',
    display_name_es: 'Efectos físicos',
    category_slug: 'alien-contact',
    data_type: 'enum',
    allowed_values: ['none', 'paralysis', 'marks', 'pain', 'healing', 'weakness', 'energized'],
    description: 'Physical effects experienced',
    is_searchable: true,
    is_filterable: true,
    sort_order: 23
  },
  {
    key: 'memory_quality',
    display_name: 'Memory Quality',
    display_name_de: 'Erinnerungsqualität',
    display_name_fr: 'Qualité de mémoire',
    display_name_es: 'Calidad de memoria',
    category_slug: 'alien-contact',
    data_type: 'enum',
    allowed_values: ['clear', 'fragmented', 'suppressed', 'recovered', 'unclear'],
    description: 'Quality of memory about the encounter',
    is_searchable: true,
    is_filterable: true,
    sort_order: 24
  }
]
```

### 1.3-1.6 Sky Phenomena (sky-lights, meteors, aurora, atmospheric)

```typescript
const SKY_PHENOMENA_ATTRIBUTES = [
  {
    key: 'phenomenon_color',
    display_name: 'Color',
    display_name_de: 'Farbe',
    display_name_fr: 'Couleur',
    display_name_es: 'Color',
    category_slug: ['sky-lights', 'meteors', 'aurora', 'atmospheric'],
    data_type: 'enum',
    allowed_values: ['red', 'blue', 'green', 'white', 'orange', 'purple', 'yellow', 'multicolor'],
    description: 'Primary color of the phenomenon',
    is_searchable: true,
    is_filterable: true,
    sort_order: 30
  },
  {
    key: 'sky_location',
    display_name: 'Sky Location',
    display_name_de: 'Position am Himmel',
    display_name_fr: 'Position dans le ciel',
    display_name_es: 'Ubicación en el cielo',
    category_slug: ['sky-lights', 'meteors', 'aurora', 'atmospheric'],
    data_type: 'enum',
    allowed_values: ['horizon', 'low', 'medium', 'high', 'zenith', 'across_sky'],
    description: 'Location in the sky',
    is_searchable: true,
    is_filterable: true,
    sort_order: 31
  },
  {
    key: 'movement_type',
    display_name: 'Movement Type',
    display_name_de: 'Bewegungsart',
    display_name_fr: 'Type de mouvement',
    display_name_es: 'Tipo de movimiento',
    category_slug: ['sky-lights', 'meteors'],
    data_type: 'enum',
    allowed_values: ['stationary', 'linear', 'erratic', 'falling', 'rising', 'pulsating'],
    description: 'Type of movement observed',
    is_searchable: true,
    is_filterable: true,
    sort_order: 32
  }
]
```

---

## 2. 👻 WESEN & ERSCHEINUNGEN (entities-apparitions)

### 2.1 Ghosts (ghosts)

```typescript
const GHOST_ATTRIBUTES = [
  {
    key: 'entity_appearance',
    display_name: 'Appearance',
    display_name_de: 'Erscheinung',
    display_name_fr: 'Apparence',
    display_name_es: 'Apariencia',
    category_slug: 'ghosts',
    data_type: 'enum',
    allowed_values: ['solid', 'transparent', 'shadow', 'mist', 'glowing', 'partial', 'orb'],
    description: 'Physical appearance of the entity',
    is_searchable: true,
    is_filterable: true,
    sort_order: 40
  },
  {
    key: 'entity_form',
    display_name: 'Form',
    display_name_de: 'Form',
    display_name_fr: 'Forme',
    display_name_es: 'Forma',
    category_slug: 'ghosts',
    data_type: 'enum',
    allowed_values: ['human', 'child', 'elderly', 'animal', 'formless', 'unclear'],
    description: 'Form of the entity',
    is_searchable: true,
    is_filterable: true,
    sort_order: 41
  },
  {
    key: 'entity_behavior',
    display_name: 'Behavior',
    display_name_de: 'Verhalten',
    display_name_fr: 'Comportement',
    display_name_es: 'Comportamiento',
    category_slug: 'ghosts',
    data_type: 'enum',
    allowed_values: ['benign', 'aggressive', 'playful', 'sad', 'angry', 'confused', 'observing'],
    description: 'Behavior of the entity',
    is_searchable: true,
    is_filterable: true,
    sort_order: 42
  },
  {
    key: 'interaction_type',
    display_name: 'Interaction',
    display_name_de: 'Interaktion',
    display_name_fr: 'Interaction',
    display_name_es: 'Interacción',
    category_slug: 'ghosts',
    data_type: 'enum',
    allowed_values: ['none', 'visual_only', 'auditory', 'physical', 'communication', 'emotional'],
    description: 'Type of interaction',
    is_searchable: true,
    is_filterable: true,
    sort_order: 43
  },
  {
    key: 'location_type',
    display_name: 'Location Type',
    display_name_de: 'Ortsart',
    display_name_fr: 'Type de lieu',
    display_name_es: 'Tipo de ubicación',
    category_slug: 'ghosts',
    data_type: 'enum',
    allowed_values: ['home', 'cemetery', 'hospital', 'battlefield', 'road', 'forest', 'building', 'other'],
    description: 'Type of location where seen',
    is_searchable: true,
    is_filterable: true,
    sort_order: 44
  }
]
```

### 2.2 Shadow Beings (shadow-beings)

```typescript
const SHADOW_BEING_ATTRIBUTES = [
  {
    key: 'shadow_form',
    display_name: 'Form',
    display_name_de: 'Form',
    display_name_fr: 'Forme',
    display_name_es: 'Forma',
    category_slug: 'shadow-beings',
    data_type: 'enum',
    allowed_values: ['humanoid', 'animal', 'amorphous', 'tall_figure', 'hat_man', 'hooded', 'small'],
    description: 'Form of the shadow being',
    is_searchable: true,
    is_filterable: true,
    sort_order: 50
  },
  {
    key: 'shadow_density',
    display_name: 'Density',
    display_name_de: 'Dichte',
    display_name_fr: 'Densité',
    display_name_es: 'Densidad',
    category_slug: 'shadow-beings',
    data_type: 'enum',
    allowed_values: ['very_dark', 'medium', 'faint', 'solid', 'transparent'],
    description: 'Darkness/density of the shadow',
    is_searchable: true,
    is_filterable: true,
    sort_order: 51
  },
  {
    key: 'shadow_behavior',
    display_name: 'Behavior',
    display_name_de: 'Verhalten',
    display_name_fr: 'Comportement',
    display_name_es: 'Comportamiento',
    category_slug: 'shadow-beings',
    data_type: 'enum',
    allowed_values: ['observing', 'fleeing', 'approaching', 'stationary', 'aggressive', 'neutral'],
    description: 'Behavior of the shadow being',
    is_searchable: true,
    is_filterable: true,
    sort_order: 52
  }
]
```

### 2.3-2.6 Other Entity Categories

```typescript
const OTHER_ENTITY_ATTRIBUTES = [
  {
    key: 'manifestation_type',
    display_name: 'Manifestation Type',
    display_name_de: 'Manifestationsart',
    display_name_fr: 'Type de manifestation',
    display_name_es: 'Tipo de manifestación',
    category_slug: ['apparitions', 'poltergeist', 'interdimensional'],
    data_type: 'enum',
    allowed_values: ['visual', 'auditory', 'physical', 'electromagnetic', 'temperature', 'smell', 'multiple'],
    description: 'How the entity manifested',
    is_searchable: true,
    is_filterable: true,
    sort_order: 60
  },
  {
    key: 'object_interaction',
    display_name: 'Object Interaction',
    display_name_de: 'Objekt-Interaktion',
    display_name_fr: 'Interaction d\'objet',
    display_name_es: 'Interacción de objetos',
    category_slug: 'poltergeist',
    data_type: 'enum',
    allowed_values: ['moving', 'breaking', 'appearing', 'disappearing', 'levitating', 'thrown'],
    description: 'How objects were affected',
    is_searchable: true,
    is_filterable: true,
    sort_order: 61
  }
]
```

---

## 3. 🧠 BEWUSSTSEIN & INNERES (consciousness-inner)

### 3.1 Dreams (dreams)

```typescript
const DREAM_ATTRIBUTES = [
  {
    key: 'lucidity',
    display_name: 'Lucidity Level',
    display_name_de: 'Klarheitsgrad',
    display_name_fr: 'Niveau de lucidité',
    display_name_es: 'Nivel de lucidez',
    category_slug: 'dreams',
    data_type: 'enum',
    allowed_values: ['not_lucid', 'semi_lucid', 'fully_lucid', 'unclear'],
    description: 'Level of lucidity in the dream',
    is_searchable: true,
    is_filterable: true,
    sort_order: 70
  },
  {
    key: 'dream_type',
    display_name: 'Dream Type',
    display_name_de: 'Traumart',
    display_name_fr: 'Type de rêve',
    display_name_es: 'Tipo de sueño',
    category_slug: 'dreams',
    data_type: 'enum',
    allowed_values: ['normal', 'lucid', 'nightmare', 'prophetic', 'recurring', 'shared', 'false_awakening'],
    description: 'Type of dream',
    is_searchable: true,
    is_filterable: true,
    sort_order: 71
  },
  {
    key: 'vividness',
    display_name: 'Vividness',
    display_name_de: 'Lebendigkeit',
    display_name_fr: 'Vivacité',
    display_name_es: 'Vivacidad',
    category_slug: 'dreams',
    data_type: 'enum',
    allowed_values: ['faint', 'normal', 'vivid', 'hyper_real'],
    description: 'Vividness of the dream',
    is_searchable: true,
    is_filterable: true,
    sort_order: 72
  },
  {
    key: 'control_level',
    display_name: 'Control Level',
    display_name_de: 'Kontrollgrad',
    display_name_fr: 'Niveau de contrôle',
    display_name_es: 'Nivel de control',
    category_slug: 'dreams',
    data_type: 'enum',
    allowed_values: ['none', 'limited', 'moderate', 'full'],
    description: 'Level of control over the dream',
    is_searchable: true,
    is_filterable: true,
    sort_order: 73
  }
]
```

### 3.2 NDE (nde)

```typescript
const NDE_ATTRIBUTES = [
  {
    key: 'nde_trigger',
    display_name: 'Trigger',
    display_name_de: 'Auslöser',
    display_name_fr: 'Déclencheur',
    display_name_es: 'Desencadenante',
    category_slug: 'nde',
    data_type: 'enum',
    allowed_values: ['cardiac_arrest', 'accident', 'surgery', 'drowning', 'illness', 'trauma', 'other'],
    description: 'What triggered the NDE',
    is_searchable: true,
    is_filterable: true,
    sort_order: 80
  },
  {
    key: 'nde_features',
    display_name: 'Features Experienced',
    display_name_de: 'Erlebte Merkmale',
    display_name_fr: 'Caractéristiques vécues',
    display_name_es: 'Características experimentadas',
    category_slug: 'nde',
    data_type: 'enum',
    allowed_values: ['tunnel', 'light', 'beings', 'life_review', 'boundary', 'choice', 'deceased_relatives', 'peace'],
    description: 'Classic NDE features experienced',
    is_searchable: true,
    is_filterable: true,
    sort_order: 81
  },
  {
    key: 'out_of_body',
    display_name: 'Out of Body Component',
    display_name_de: 'Außerkörperlicher Anteil',
    display_name_fr: 'Composante hors du corps',
    display_name_es: 'Componente fuera del cuerpo',
    category_slug: 'nde',
    data_type: 'enum',
    allowed_values: ['yes', 'no', 'unclear'],
    description: 'Whether an OBE component was present',
    is_searchable: true,
    is_filterable: true,
    sort_order: 82
  },
  {
    key: 'aftereffects',
    display_name: 'Aftereffects',
    display_name_de: 'Nachwirkungen',
    display_name_fr: 'Effets ultérieurs',
    display_name_es: 'Efectos posteriores',
    category_slug: 'nde',
    data_type: 'enum',
    allowed_values: ['spiritual_change', 'fearlessness', 'psychic_abilities', 'depression', 'life_changes', 'none'],
    description: 'Long-term effects after NDE',
    is_searchable: true,
    is_filterable: true,
    sort_order: 83
  }
]
```

### 3.3 OBE (obe)

```typescript
const OBE_ATTRIBUTES = [
  {
    key: 'obe_trigger',
    display_name: 'Trigger',
    display_name_de: 'Auslöser',
    display_name_fr: 'Déclencheur',
    display_name_es: 'Desencadenante',
    category_slug: 'obe',
    data_type: 'enum',
    allowed_values: ['spontaneous', 'meditation', 'sleep', 'trauma', 'induced', 'near_death'],
    description: 'What triggered the OBE',
    is_searchable: true,
    is_filterable: true,
    sort_order: 90
  },
  {
    key: 'obe_awareness',
    display_name: 'Awareness Level',
    display_name_de: 'Bewusstseinsgrad',
    display_name_fr: 'Niveau de conscience',
    display_name_es: 'Nivel de conciencia',
    category_slug: 'obe',
    data_type: 'enum',
    allowed_values: ['full', 'partial', 'dreamlike', 'crystal_clear'],
    description: 'Level of awareness during OBE',
    is_searchable: true,
    is_filterable: true,
    sort_order: 91
  },
  {
    key: 'obe_verification',
    display_name: 'Verification',
    display_name_de: 'Verifizierung',
    display_name_fr: 'Vérification',
    display_name_es: 'Verificación',
    category_slug: 'obe',
    data_type: 'enum',
    allowed_values: ['verified', 'unverified', 'partially_verified', 'unable_to_verify'],
    description: 'Whether observations were verified',
    is_searchable: true,
    is_filterable: true,
    sort_order: 92
  }
]
```

### 3.4-3.6 Other Consciousness Categories

```typescript
const CONSCIOUSNESS_ATTRIBUTES = [
  {
    key: 'substance_used',
    display_name: 'Substance',
    display_name_de: 'Substanz',
    display_name_fr: 'Substance',
    display_name_es: 'Sustancia',
    category_slug: 'psychedelics',
    data_type: 'enum',
    allowed_values: ['dmt', 'lsd', 'psilocybin', 'ayahuasca', 'mescaline', 'cannabis', 'other'],
    description: 'Substance involved',
    is_searchable: true,
    is_filterable: true,
    sort_order: 100
  },
  {
    key: 'meditation_type',
    display_name: 'Meditation Type',
    display_name_de: 'Meditationsart',
    display_name_fr: 'Type de méditation',
    display_name_es: 'Tipo de meditación',
    category_slug: 'meditation',
    data_type: 'enum',
    allowed_values: ['vipassana', 'transcendental', 'zen', 'guided', 'breathwork', 'other'],
    description: 'Type of meditation practice',
    is_searchable: true,
    is_filterable: true,
    sort_order: 101
  },
  {
    key: 'insight_type',
    display_name: 'Insight Type',
    display_name_de: 'Eingebungsart',
    display_name_fr: 'Type d\'intuition',
    display_name_es: 'Tipo de intuición',
    category_slug: 'insights',
    data_type: 'enum',
    allowed_values: ['sudden', 'gradual', 'dream', 'vision', 'voice', 'knowing'],
    description: 'How the insight came',
    is_searchable: true,
    is_filterable: true,
    sort_order: 102
  }
]
```

---

## 4. 🔮 PSI & ÜBERSINNLICH (psi-extrasensory)

### 4.1-4.6 PSI Attributes

```typescript
const PSI_ATTRIBUTES = [
  {
    key: 'psi_type',
    display_name: 'PSI Type',
    display_name_de: 'PSI-Art',
    display_name_fr: 'Type PSI',
    display_name_es: 'Tipo PSI',
    category_slug: ['telepathy', 'remote-viewing', 'precognition', 'clairvoyance', 'telekinesis', 'intuition'],
    data_type: 'enum',
    allowed_values: ['spontaneous', 'intentional', 'experimental', 'recurring'],
    description: 'Type of PSI experience',
    is_searchable: true,
    is_filterable: true,
    sort_order: 110
  },
  {
    key: 'accuracy',
    display_name: 'Accuracy',
    display_name_de: 'Genauigkeit',
    display_name_fr: 'Précision',
    display_name_es: 'Precisión',
    category_slug: ['telepathy', 'remote-viewing', 'precognition', 'clairvoyance'],
    data_type: 'enum',
    allowed_values: ['fully_accurate', 'mostly_accurate', 'partially_accurate', 'symbolic', 'unclear'],
    description: 'Accuracy of the information',
    is_searchable: true,
    is_filterable: true,
    sort_order: 111
  },
  {
    key: 'verification',
    display_name: 'Verification',
    display_name_de: 'Verifizierung',
    display_name_fr: 'Vérification',
    display_name_es: 'Verificación',
    category_slug: ['telepathy', 'remote-viewing', 'precognition', 'clairvoyance'],
    data_type: 'enum',
    allowed_values: ['verified', 'partially_verified', 'unverified', 'unable_to_verify'],
    description: 'Whether the experience was verified',
    is_searchable: true,
    is_filterable: true,
    sort_order: 112
  },
  {
    key: 'target_distance',
    display_name: 'Target Distance',
    display_name_de: 'Zielentfernung',
    display_name_fr: 'Distance cible',
    display_name_es: 'Distancia objetivo',
    category_slug: ['telepathy', 'remote-viewing', 'clairvoyance'],
    data_type: 'enum',
    allowed_values: ['same_room', 'same_building', 'same_city', 'different_city', 'different_country', 'unknown'],
    description: 'Distance to target',
    is_searchable: true,
    is_filterable: true,
    sort_order: 113
  },
  {
    key: 'object_affected',
    display_name: 'Object Affected',
    display_name_de: 'Betroffenes Objekt',
    display_name_fr: 'Objet affecté',
    display_name_es: 'Objeto afectado',
    category_slug: 'telekinesis',
    data_type: 'enum',
    allowed_values: ['small_object', 'medium_object', 'large_object', 'electronic', 'organic', 'multiple'],
    description: 'Type of object affected',
    is_searchable: true,
    is_filterable: true,
    sort_order: 114
  },
  {
    key: 'precog_timeframe',
    display_name: 'Timeframe',
    display_name_de: 'Zeitrahmen',
    display_name_fr: 'Période',
    display_name_es: 'Marco temporal',
    category_slug: 'precognition',
    data_type: 'enum',
    allowed_values: ['minutes', 'hours', 'days', 'weeks', 'months', 'years', 'unclear'],
    description: 'How far in advance',
    is_searchable: true,
    is_filterable: true,
    sort_order: 115
  }
]
```

---

## 5. 🌍 NATUR & ERDE (nature-earth)

### 5.1-5.5 Nature Attributes

```typescript
const NATURE_ATTRIBUTES = [
  {
    key: 'earthquake_magnitude',
    display_name: 'Magnitude',
    display_name_de: 'Stärke',
    display_name_fr: 'Magnitude',
    display_name_es: 'Magnitud',
    category_slug: 'earthquakes',
    data_type: 'text',
    allowed_values: null,
    description: 'Earthquake magnitude if known',
    is_searchable: true,
    is_filterable: false,
    sort_order: 120
  },
  {
    key: 'premonition',
    display_name: 'Had Premonition',
    display_name_de: 'Vorahnung gehabt',
    display_name_fr: 'Eu prémonition',
    display_name_es: 'Tuvo premonición',
    category_slug: 'earthquakes',
    data_type: 'enum',
    allowed_values: ['yes', 'no', 'unclear'],
    description: 'Whether there was a premonition',
    is_searchable: true,
    is_filterable: true,
    sort_order: 121
  },
  {
    key: 'weather_type',
    display_name: 'Weather Type',
    display_name_de: 'Wetterart',
    display_name_fr: 'Type de météo',
    display_name_es: 'Tipo de clima',
    category_slug: 'weather',
    data_type: 'enum',
    allowed_values: ['storm', 'tornado', 'hurricane', 'lightning', 'hail', 'fog', 'other'],
    description: 'Type of weather phenomenon',
    is_searchable: true,
    is_filterable: true,
    sort_order: 122
  },
  {
    key: 'animal_type',
    display_name: 'Animal Type',
    display_name_de: 'Tierart',
    display_name_fr: 'Type d\'animal',
    display_name_es: 'Tipo de animal',
    category_slug: 'animal-behavior',
    data_type: 'enum',
    allowed_values: ['birds', 'fish', 'mammals', 'insects', 'reptiles', 'multiple', 'other'],
    description: 'Type of animals involved',
    is_searchable: true,
    is_filterable: true,
    sort_order: 123
  },
  {
    key: 'behavior_type',
    display_name: 'Behavior Type',
    display_name_de: 'Verhaltensart',
    display_name_fr: 'Type de comportement',
    display_name_es: 'Tipo de comportamiento',
    category_slug: 'animal-behavior',
    data_type: 'enum',
    allowed_values: ['mass_death', 'unusual_movement', 'unusual_sound', 'unusual_aggression', 'unusual_calm', 'other'],
    description: 'Type of unusual behavior',
    is_searchable: true,
    is_filterable: true,
    sort_order: 124
  }
]
```

---

## 6. 💫 GESUNDHEIT & HEILUNG (health-healing)

### 6.1-6.6 Healing Attributes

```typescript
const HEALING_ATTRIBUTES = [
  {
    key: 'condition_type',
    display_name: 'Condition Type',
    display_name_de: 'Krankheitsart',
    display_name_fr: 'Type de condition',
    display_name_es: 'Tipo de condición',
    category_slug: ['spontaneous-healing', 'cancer-remission', 'autoimmune', 'miraculous-recovery'],
    data_type: 'enum',
    allowed_values: ['cancer', 'autoimmune', 'injury', 'chronic_pain', 'infection', 'neurological', 'other'],
    description: 'Type of condition healed',
    is_searchable: true,
    is_filterable: true,
    sort_order: 130
  },
  {
    key: 'healing_speed',
    display_name: 'Healing Speed',
    display_name_de: 'Heilungsgeschwindigkeit',
    display_name_fr: 'Vitesse de guérison',
    display_name_es: 'Velocidad de curación',
    category_slug: ['spontaneous-healing', 'miraculous-recovery'],
    data_type: 'enum',
    allowed_values: ['instant', 'hours', 'days', 'weeks', 'months', 'gradual'],
    description: 'Speed of healing',
    is_searchable: true,
    is_filterable: true,
    sort_order: 131
  },
  {
    key: 'medical_documentation',
    display_name: 'Medical Documentation',
    display_name_de: 'Ärztliche Dokumentation',
    display_name_fr: 'Documentation médicale',
    display_name_es: 'Documentación médica',
    category_slug: ['spontaneous-healing', 'cancer-remission', 'autoimmune', 'miraculous-recovery'],
    data_type: 'enum',
    allowed_values: ['before_and_after', 'after_only', 'verbal_confirmation', 'none'],
    description: 'Level of medical documentation',
    is_searchable: true,
    is_filterable: true,
    sort_order: 132
  },
  {
    key: 'healing_method',
    display_name: 'Healing Method',
    display_name_de: 'Heilungsmethode',
    display_name_fr: 'Méthode de guérison',
    display_name_es: 'Método de curación',
    category_slug: 'energy-healing',
    data_type: 'enum',
    allowed_values: ['reiki', 'pranic', 'qigong', 'hands_on', 'distance', 'prayer', 'other'],
    description: 'Method of energy healing used',
    is_searchable: true,
    is_filterable: true,
    sort_order: 133
  },
  {
    key: 'practitioner_present',
    display_name: 'Practitioner Present',
    display_name_de: 'Praktiker anwesend',
    display_name_fr: 'Praticien présent',
    display_name_es: 'Practicante presente',
    category_slug: 'energy-healing',
    data_type: 'enum',
    allowed_values: ['yes', 'no', 'distance_healing'],
    description: 'Whether a practitioner was present',
    is_searchable: true,
    is_filterable: true,
    sort_order: 134
  }
]
```

---

## 7. 🕉️ SPIRITUELLE PRAXIS (spiritual-practice)

### 7.1-7.6 Spiritual Practice Attributes

```typescript
const SPIRITUAL_ATTRIBUTES = [
  {
    key: 'practice_type',
    display_name: 'Practice Type',
    display_name_de: 'Praxisart',
    display_name_fr: 'Type de pratique',
    display_name_es: 'Tipo de práctica',
    category_slug: ['yoga', 'meditation-practice', 'shamanism', 'energy-work', 'rituals', 'channeling'],
    data_type: 'enum',
    allowed_values: ['regular', 'first_time', 'intensive', 'retreat', 'ceremony', 'spontaneous'],
    description: 'Type of practice session',
    is_searchable: true,
    is_filterable: true,
    sort_order: 140
  },
  {
    key: 'experience_depth',
    display_name: 'Experience Depth',
    display_name_de: 'Erfahrungstiefe',
    display_name_fr: 'Profondeur d\'expérience',
    display_name_es: 'Profundidad de experiencia',
    category_slug: ['yoga', 'meditation-practice', 'shamanism'],
    data_type: 'enum',
    allowed_values: ['surface', 'moderate', 'deep', 'profound', 'breakthrough'],
    description: 'Depth of the experience',
    is_searchable: true,
    is_filterable: true,
    sort_order: 141
  },
  {
    key: 'guidance',
    display_name: 'Guidance',
    display_name_de: 'Anleitung',
    display_name_fr: 'Guidage',
    display_name_es: 'Guía',
    category_slug: ['yoga', 'meditation-practice', 'shamanism', 'energy-work', 'rituals'],
    data_type: 'enum',
    allowed_values: ['self_guided', 'teacher_present', 'group', 'audio_guided', 'none'],
    description: 'Type of guidance received',
    is_searchable: true,
    is_filterable: true,
    sort_order: 142
  },
  {
    key: 'channeled_source',
    display_name: 'Channeled Source',
    display_name_de: 'Gechannelte Quelle',
    display_name_fr: 'Source canalisée',
    display_name_es: 'Fuente canalizada',
    category_slug: 'channeling',
    data_type: 'enum',
    allowed_values: ['spirit_guide', 'deceased', 'higher_self', 'angel', 'alien', 'collective', 'unknown'],
    description: 'Source of channeled information',
    is_searchable: true,
    is_filterable: true,
    sort_order: 143
  }
]
```

---

## 8. ⏰ ZEIT-RAUM & SYNCHRONIZITÄT (time-space-sync)

### 8.1-8.6 Time-Space Attributes

```typescript
const TIME_SPACE_ATTRIBUTES = [
  {
    key: 'time_lost',
    display_name: 'Time Lost',
    display_name_de: 'Verlorene Zeit',
    display_name_fr: 'Temps perdu',
    display_name_es: 'Tiempo perdido',
    category_slug: 'missing-time',
    data_type: 'enum',
    allowed_values: ['minutes', 'hours', 'days', 'unclear'],
    description: 'Amount of time lost',
    is_searchable: true,
    is_filterable: true,
    sort_order: 150
  },
  {
    key: 'memory_recovery',
    display_name: 'Memory Recovery',
    display_name_de: 'Erinnerungswiederherstellung',
    display_name_fr: 'Récupération de mémoire',
    display_name_es: 'Recuperación de memoria',
    category_slug: 'missing-time',
    data_type: 'enum',
    allowed_values: ['none', 'partial', 'full', 'fragments', 'hypnosis'],
    description: 'Whether memories were recovered',
    is_searchable: true,
    is_filterable: true,
    sort_order: 151
  },
  {
    key: 'dejavu_frequency',
    display_name: 'Déjà-vu Frequency',
    display_name_de: 'Déjà-vu Häufigkeit',
    display_name_fr: 'Fréquence du déjà-vu',
    display_name_es: 'Frecuencia de déjà-vu',
    category_slug: 'time-loops',
    data_type: 'enum',
    allowed_values: ['once', 'multiple', 'ongoing', 'resolved'],
    description: 'Frequency of déjà-vu',
    is_searchable: true,
    is_filterable: true,
    sort_order: 152
  },
  {
    key: 'sync_type',
    display_name: 'Synchronicity Type',
    display_name_de: 'Synchronizitätsart',
    display_name_fr: 'Type de synchronicité',
    display_name_es: 'Tipo de sincronicidad',
    category_slug: 'synchronicity',
    data_type: 'enum',
    allowed_values: ['number', 'name', 'event', 'thought', 'person', 'object', 'multiple'],
    description: 'Type of synchronicity',
    is_searchable: true,
    is_filterable: true,
    sort_order: 153
  },
  {
    key: 'glitch_type',
    display_name: 'Glitch Type',
    display_name_de: 'Glitch-Art',
    display_name_fr: 'Type de bug',
    display_name_es: 'Tipo de fallo',
    category_slug: 'reality-glitches',
    data_type: 'enum',
    allowed_values: ['object_disappear', 'object_appear', 'person_disappear', 'location_change', 'duplicate', 'other'],
    description: 'Type of reality glitch',
    is_searchable: true,
    is_filterable: true,
    sort_order: 154
  },
  {
    key: 'witnesses_glitch',
    display_name: 'Witnesses to Glitch',
    display_name_de: 'Zeugen des Glitches',
    display_name_fr: 'Témoins du bug',
    display_name_es: 'Testigos del fallo',
    category_slug: 'reality-glitches',
    data_type: 'enum',
    allowed_values: ['none', 'one', 'multiple', 'confirmed'],
    description: 'Number of witnesses',
    is_searchable: true,
    is_filterable: true,
    sort_order: 155
  },
  {
    key: 'mandela_topic',
    display_name: 'Mandela Effect Topic',
    display_name_de: 'Mandela-Effekt Thema',
    display_name_fr: 'Sujet effet Mandela',
    display_name_es: 'Tema efecto Mandela',
    category_slug: 'mandela-effect',
    data_type: 'enum',
    allowed_values: ['movie_quote', 'brand_logo', 'geography', 'history', 'anatomy', 'pop_culture', 'other'],
    description: 'Topic of Mandela Effect',
    is_searchable: true,
    is_filterable: true,
    sort_order: 156
  }
]
```

---

## Summary Statistics

```yaml
Total Attributes: ~85

Generic (all categories): 8
  - intensity, duration, time_of_day, witnesses, emotional_state,
    visibility, afterwards_feeling, repeatability

Category-Specific: ~77

  UFO/UAP: 9
  Alien Contact: 5
  Sky Phenomena: 3 (shared across 4 subcategories)

  Ghosts: 5
  Shadow Beings: 3
  Other Entities: 2 (shared across 3 subcategories)

  Dreams: 4
  NDE: 4
  OBE: 3
  Consciousness: 3 (shared across 3 subcategories)

  PSI: 6 (shared across 6 subcategories)

  Nature: 5 (shared across 5 subcategories)

  Healing: 5 (shared across 6 subcategories)

  Spiritual Practice: 4 (shared across 6 subcategories)

  Time-Space: 7 (shared across 6 subcategories)
```

---

## Implementation Notes

1. **Multi-Category Attributes:**
   - Some attributes apply to multiple subcategories (e.g., `psi_type` for all PSI categories)
   - Store once in `attribute_schema` with array of category_slugs

2. **Canonical Values:**
   - All `allowed_values` are in lowercase English
   - UI displays translated versions
   - AI semantic matching maps to canonical

3. **Searchability:**
   - All enum attributes: `is_searchable: true`, `is_filterable: true`
   - Text attributes: `is_searchable: true`, `is_filterable: false`

4. **Sort Order:**
   - Generic attributes: 1-10
   - Category-specific: 10+

5. **Extension:**
   - Easy to add new attributes without migration
   - Easy to add new allowed_values to enums

---

**Next Steps:**
1. Create migration for `attribute_schema` table
2. Create seed script with these definitions
3. Create API endpoints for extraction
4. Update UI components
