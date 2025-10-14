-- =====================================================================
-- SEED: Attribute Schema
-- Based on category.md lines 196-238
-- ~50 attributes for UFO/UAP, Entities, NDE, and Generic categories
-- =====================================================================

-- =====================================================================
-- UFO/UAP ATTRIBUTES
-- =====================================================================

INSERT INTO attribute_schema (key, display_name, display_name_de, display_name_fr, display_name_es, category_slug, data_type, allowed_values, description, is_searchable, is_filterable, sort_order) VALUES
('shape', 'Shape', 'Form', 'Forme', 'Forma', 'ufo-uap', 'enum', '["triangle", "disc", "orb", "cigar", "cylinder", "sphere", "rectangle", "chevron", "boomerang", "other"]', 'Object shape/form', true, true, 1),
('surface', 'Surface', 'Oberfläche', 'Surface', 'Superficie', 'ufo-uap', 'enum', '["metallic", "glowing", "matte", "translucent", "reflective", "dark", "luminous", "pulsating"]', 'Surface appearance', true, true, 2),
('light_color', 'Light Color', 'Lichtfarbe', 'Couleur de lumière', 'Color de luz', 'ufo-uap', 'enum', '["red", "blue", "white", "green", "orange", "yellow", "multicolor", "no_light"]', 'Color of lights', true, true, 3),
('light_pattern', 'Light Pattern', 'Licht-Muster', 'Motif lumineux', 'Patrón de luz', 'ufo-uap', 'enum', '["steady", "pulsating", "flashing", "rotating", "strobing", "dimming", "none"]', 'Pattern of lights', true, true, 4),
('movement', 'Movement', 'Bewegung', 'Mouvement', 'Movimiento', 'ufo-uap', 'enum', '["hovering", "fast", "erratic", "smooth", "zigzag", "ascending", "descending", "stationary", "instant_disappearance"]', 'Movement pattern', true, true, 5),
('sound', 'Sound', 'Geräusch', 'Son', 'Sonido', 'ufo-uap', 'enum', '["silent", "humming", "buzzing", "roaring", "whistling", "crackling", "metallic", "high_frequency", "other"]', 'Sound emitted', true, true, 6),
('size', 'Size', 'Größe', 'Taille', 'Tamaño', 'ufo-uap', 'enum', '["tiny", "small", "medium", "large", "huge", "unknown"]', 'Estimated size', true, true, 7),
('altitude', 'Altitude', 'Höhe', 'Altitude', 'Altitud', 'ufo-uap', 'enum', '["ground_level", "low", "medium", "high", "very_high"]', 'Height above ground', true, true, 8),
('speed', 'Speed', 'Geschwindigkeit', 'Vitesse', 'Velocidad', 'ufo-uap', 'enum', '["stationary", "slow", "moderate", "fast", "extreme", "instant"]', 'Speed of movement', true, true, 9),
('distance', 'Distance', 'Entfernung', 'Distance', 'Distancia', 'ufo-uap', 'enum', '["very_close", "close", "medium", "far", "very_far"]', 'Distance from observer', true, true, 10);

-- =====================================================================
-- GHOST/ENTITY ATTRIBUTES
-- =====================================================================

INSERT INTO attribute_schema (key, display_name, display_name_de, display_name_fr, display_name_es, category_slug, data_type, allowed_values, description, is_searchable, is_filterable, sort_order) VALUES
('entity_type', 'Entity Type', 'Art des Wesens', 'Type d''entité', 'Tipo de entidad', 'ghosts', 'enum', '["human", "shadow", "animal", "child", "elderly", "hooded_figure", "unknown"]', 'Type of entity seen', true, true, 11),
('entity_appearance', 'Appearance', 'Erscheinung', 'Apparence', 'Apariencia', 'ghosts', 'enum', '["solid", "transparent", "shadow", "mist", "glowing", "orb", "partial"]', 'How entity appeared', true, true, 12),
('entity_behavior', 'Behavior', 'Verhalten', 'Comportement', 'Comportamiento', 'ghosts', 'enum', '["benign", "aggressive", "playful", "sad", "angry", "confused", "observing", "neutral"]', 'Entity behavior', true, true, 13),
('interaction', 'Interaction', 'Interaktion', 'Interaction', 'Interacción', 'ghosts', 'enum', '["none", "visual", "auditory", "physical", "communication", "touch", "temperature_change"]', 'Type of interaction', true, true, 14);

-- =====================================================================
-- NDE (NEAR-DEATH EXPERIENCE) ATTRIBUTES
-- =====================================================================

INSERT INTO attribute_schema (key, display_name, display_name_de, display_name_fr, display_name_es, category_slug, data_type, allowed_values, description, is_searchable, is_filterable, sort_order) VALUES
('nde_trigger', 'Trigger', 'Auslöser', 'Déclencheur', 'Desencadenante', 'nde', 'enum', '["cardiac_arrest", "accident", "surgery", "drowning", "illness", "childbirth", "other"]', 'What triggered NDE', true, true, 15),
('nde_features', 'Features', 'Merkmale', 'Caractéristiques', 'Características', 'nde', 'enum', '["tunnel", "light", "beings", "life_review", "boundary", "choice", "deceased_relatives", "peace"]', 'Features experienced', true, true, 16),
('nde_aftereffects', 'Aftereffects', 'Nachwirkungen', 'Effets secondaires', 'Efectos posteriores', 'nde', 'enum', '["spiritual_change", "fearlessness", "psychic_abilities", "personality_change", "enhanced_intuition"]', 'Long-term effects', true, true, 17);

-- =====================================================================
-- OBE (OUT-OF-BODY EXPERIENCE) ATTRIBUTES
-- =====================================================================

INSERT INTO attribute_schema (key, display_name, display_name_de, display_name_fr, display_name_es, category_slug, data_type, allowed_values, description, is_searchable, is_filterable, sort_order) VALUES
('obe_trigger', 'Trigger', 'Auslöser', 'Déclencheur', 'Desencadenante', 'obe', 'enum', '["spontaneous", "meditation", "sleep_paralysis", "trauma", "intentional", "lucid_dream"]', 'What triggered OBE', true, true, 18),
('obe_perception', 'Perception', 'Wahrnehmung', 'Perception', 'Percepción', 'obe', 'enum', '["visual", "360_vision", "through_walls", "distant_viewing", "symbolic"]', 'Type of perception', true, true, 19),
('obe_verification', 'Verification', 'Verifizierung', 'Vérification', 'Verificación', 'obe', 'enum', '["verified", "partially_verified", "unverified", "unable_to_verify"]', 'Could experience be verified', true, true, 20);

-- =====================================================================
-- PSYCHIC/PSI ATTRIBUTES
-- =====================================================================

INSERT INTO attribute_schema (key, display_name, display_name_de, display_name_fr, display_name_es, category_slug, data_type, allowed_values, description, is_searchable, is_filterable, sort_order) VALUES
('psi_type', 'PSI Type', 'PSI-Art', 'Type PSI', 'Tipo PSI', 'telepathy', 'enum', '["telepathy", "precognition", "clairvoyance", "remote_viewing", "psychokinesis", "healing"]', 'Type of psychic experience', true, true, 21),
('psi_accuracy', 'Accuracy', 'Genauigkeit', 'Précision', 'Precisión', 'telepathy', 'enum', '["exact", "mostly_accurate", "partially_accurate", "symbolic", "unclear"]', 'Accuracy of perception', true, true, 22),
('psi_verification', 'Verification', 'Verifizierung', 'Vérification', 'Verificación', 'telepathy', 'enum', '["verified", "partially_verified", "unverified", "unable_to_verify"]', 'Was it verified', true, true, 23);

-- =====================================================================
-- SYNCHRONICITY ATTRIBUTES
-- =====================================================================

INSERT INTO attribute_schema (key, display_name, display_name_de, display_name_fr, display_name_es, category_slug, data_type, allowed_values, description, is_searchable, is_filterable, sort_order) VALUES
('sync_type', 'Type', 'Art', 'Type', 'Tipo', 'synchronicity', 'enum', '["number", "symbol", "person", "location", "event", "dream", "thought"]', 'Type of synchronicity', true, true, 24),
('sync_frequency', 'Frequency', 'Häufigkeit', 'Fréquence', 'Frecuencia', 'synchronicity', 'enum', '["once", "few_times", "repeated", "ongoing"]', 'How often occurred', true, true, 25),
('sync_significance', 'Significance', 'Bedeutung', 'Signification', 'Significado', 'synchronicity', 'enum', '["minor", "moderate", "major", "life_changing"]', 'Level of significance', true, true, 26);

-- =====================================================================
-- GENERIC ATTRIBUTES (ALL CATEGORIES)
-- =====================================================================

INSERT INTO attribute_schema (key, display_name, display_name_de, display_name_fr, display_name_es, category_slug, data_type, allowed_values, description, is_searchable, is_filterable, sort_order) VALUES
('intensity', 'Intensity', 'Intensität', 'Intensité', 'Intensidad', NULL, 'enum', '["mild", "moderate", "strong", "overwhelming", "extreme"]', 'Intensity of experience', true, true, 100),
('emotional_state', 'Emotional State', 'Emotionaler Zustand', 'État émotionnel', 'Estado emocional', NULL, 'enum', '["peaceful", "fearful", "joyful", "confused", "awe", "terror", "euphoria", "calm", "anxious"]', 'Emotional state during experience', true, true, 101),
('witnesses', 'Witnesses', 'Zeugen', 'Témoins', 'Testigos', NULL, 'enum', '["alone", "with_1-2", "with_3-5", "more_than_5", "unknown"]', 'Number of witnesses', true, true, 102),
('time_of_day', 'Time of Day', 'Tageszeit', 'Moment de la journée', 'Hora del día', NULL, 'enum', '["morning", "afternoon", "evening", "night", "dawn", "dusk"]', 'Time of day', true, true, 103),
('weather', 'Weather', 'Wetter', 'Météo', 'Clima', NULL, 'enum', '["clear", "cloudy", "rainy", "stormy", "foggy", "snowy", "unknown"]', 'Weather conditions', true, true, 104),
('physical_effects', 'Physical Effects', 'Körperliche Effekte', 'Effets physiques', 'Efectos físicos', NULL, 'enum', '["none", "headache", "nausea", "tingling", "paralysis", "time_distortion", "energy_drain", "energy_boost"]', 'Physical effects experienced', true, true, 105),
('electromagnetic', 'EM Effects', 'EM-Effekte', 'Effets EM', 'Efectos EM', NULL, 'enum', '["none", "lights_flickering", "electronics_failed", "compass_anomaly", "car_stopped", "static", "radio_interference"]', 'Electromagnetic effects', true, true, 106),
('aftereffects', 'Aftereffects', 'Nachwirkungen', 'Effets secondaires', 'Efectos posteriores', NULL, 'enum', '["none", "fatigue", "insomnia", "enhanced_intuition", "missing_time", "skin_irritation", "personality_change"]', 'Aftereffects', true, true, 107);

-- =====================================================================
-- DREAM/LUCID DREAM ATTRIBUTES
-- =====================================================================

INSERT INTO attribute_schema (key, display_name, display_name_de, display_name_fr, display_name_es, category_slug, data_type, allowed_values, description, is_searchable, is_filterable, sort_order) VALUES
('dream_type', 'Dream Type', 'Traumtyp', 'Type de rêve', 'Tipo de sueño', 'dreams', 'enum', '["lucid", "prophetic", "recurring", "nightmare", "vivid", "symbolic"]', 'Type of dream', true, true, 27),
('dream_control', 'Control Level', 'Kontrolle', 'Niveau de contrôle', 'Nivel de control', 'dreams', 'enum', '["none", "partial", "full", "variable"]', 'Level of control in dream', true, true, 28),
('dream_clarity', 'Clarity', 'Klarheit', 'Clarté', 'Claridad', 'dreams', 'enum', '["vague", "normal", "vivid", "hyper_real"]', 'Clarity of dream', true, true, 29);

-- =====================================================================
-- MEDITATION/SPIRITUAL PRACTICE ATTRIBUTES
-- =====================================================================

INSERT INTO attribute_schema (key, display_name, display_name_de, display_name_fr, display_name_es, category_slug, data_type, allowed_values, description, is_searchable, is_filterable, sort_order) VALUES
('practice_type', 'Practice Type', 'Praxisart', 'Type de pratique', 'Tipo de práctica', 'meditation-practice', 'enum', '["meditation", "yoga", "breathwork", "chanting", "prayer", "ritual", "shamanic"]', 'Type of practice', true, true, 30),
('practice_duration', 'Duration', 'Dauer', 'Durée', 'Duración', 'meditation-practice', 'enum', '["less_10min", "10_30min", "30_60min", "1_2hours", "more_2hours"]', 'Practice duration', true, true, 31),
('altered_state', 'Altered State', 'Veränderter Zustand', 'État altéré', 'Estado alterado', 'meditation-practice', 'enum', '["mild", "moderate", "deep", "transcendent", "unity_consciousness"]', 'Depth of altered state', true, true, 32);

-- =====================================================================
-- CRYPTID ATTRIBUTES
-- =====================================================================

INSERT INTO attribute_schema (key, display_name, display_name_de, display_name_fr, display_name_es, category_slug, data_type, allowed_values, description, is_searchable, is_filterable, sort_order) VALUES
('cryptid_type', 'Cryptid Type', 'Kryptid-Art', 'Type de cryptide', 'Tipo de criptido', 'cryptids', 'enum', '["bigfoot", "humanoid", "flying", "aquatic", "reptilian", "unknown"]', 'Type of cryptid', true, true, 33),
('cryptid_size', 'Size', 'Größe', 'Taille', 'Tamaño', 'cryptids', 'enum', '["small", "human_sized", "large", "very_large", "giant"]', 'Size of cryptid', true, true, 34),
('cryptid_behavior', 'Behavior', 'Verhalten', 'Comportement', 'Comportamiento', 'cryptids', 'enum', '["passive", "curious", "evasive", "aggressive", "threatening"]', 'Cryptid behavior', true, true, 35),
('evidence_type', 'Evidence', 'Beweise', 'Preuve', 'Evidencia', 'cryptids', 'enum', '["visual", "tracks", "sounds", "physical_traces", "photo", "video", "none"]', 'Type of evidence', true, true, 36);

-- =====================================================================
-- POLTERGEIST ATTRIBUTES
-- =====================================================================

INSERT INTO attribute_schema (key, display_name, display_name_de, display_name_fr, display_name_es, category_slug, data_type, allowed_values, description, is_searchable, is_filterable, sort_order) VALUES
('poltergeist_type', 'Activity Type', 'Aktivitätstyp', 'Type d''activité', 'Tipo de actividad', 'poltergeist', 'enum', '["objects_moving", "knocking", "lights", "temperature", "voices", "apparitions", "physical_touch"]', 'Type of poltergeist activity', true, true, 37),
('poltergeist_intensity', 'Intensity', 'Intensität', 'Intensité', 'Intensidad', 'poltergeist', 'enum', '["mild", "moderate", "violent", "extreme"]', 'Intensity of activity', true, true, 38),
('poltergeist_pattern', 'Pattern', 'Muster', 'Modèle', 'Patrón', 'poltergeist', 'enum', '["random", "focused_object", "focused_person', 'time_specific", "triggered"]', 'Pattern of occurrence', true, true, 39);

-- =====================================================================
-- TEXT ATTRIBUTES (NO ALLOWED VALUES)
-- =====================================================================

INSERT INTO attribute_schema (key, display_name, display_name_de, display_name_fr, display_name_es, category_slug, data_type, allowed_values, description, is_searchable, is_filterable, sort_order) VALUES
('duration', 'Duration', 'Dauer', 'Durée', 'Duración', NULL, 'text', NULL, 'Duration of experience (free text)', true, false, 200),
('location_description', 'Location Details', 'Ortsbeschreibung', 'Détails du lieu', 'Detalles del lugar', NULL, 'text', NULL, 'Detailed location description', true, false, 201);

-- =====================================================================
-- VERIFICATION
-- =====================================================================

-- Count attributes by category
SELECT
  COALESCE(category_slug, '(generic)') as category,
  COUNT(*) as attribute_count
FROM attribute_schema
GROUP BY category_slug
ORDER BY category_slug NULLS LAST;

-- Total count
SELECT COUNT(*) as total_attributes FROM attribute_schema;
