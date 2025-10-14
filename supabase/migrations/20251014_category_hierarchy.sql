-- ═════════════════════════════════════════════════════════════════════
-- KATEGORIE HIERARCHIE MIGRATION (category.md v3.1)
-- 8 Hauptkategorien + 48 Unterkategorien
-- ═════════════════════════════════════════════════════════════════════

-- Zuerst: Alle bestehenden inaktiv setzen (nicht löschen wegen Foreign Keys)
UPDATE question_categories SET is_active = false WHERE is_active = true;

-- ═════════════════════════════════════════════════════════════════════
-- 1. 🧠 BEWUSSTSEIN & INNERES (consciousness-inner)
-- ═════════════════════════════════════════════════════════════════════

INSERT INTO question_categories (slug, name, description, emoji, color, level, sort_order, is_active)
VALUES (
  'consciousness-inner',
  'Bewusstsein & Inneres',
  'Innere Erlebnisse, die das Bewusstsein verändern',
  '🧠',
  'from-purple-500 to-pink-500',
  0,
  1,
  true
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  emoji = EXCLUDED.emoji,
  color = EXCLUDED.color,
  level = EXCLUDED.level,
  sort_order = EXCLUDED.sort_order,
  is_active = true;

-- Unterkategorien für Bewusstsein & Inneres
INSERT INTO question_categories (slug, name, description, emoji, parent_category_id, level, sort_order, is_active)
VALUES
  ('dreams', 'Träume & Luzide Träume', 'Nachtträume, Klarträume, wiederkehrende Traummuster', '🌙',
   (SELECT id FROM question_categories WHERE slug = 'consciousness-inner'), 1, 1, true),
  ('nde', 'Nahtoderfahrungen', 'Near-Death Experiences, Tunnel-Erlebnisse, Jenseits-Begegnungen', '💀',
   (SELECT id FROM question_categories WHERE slug = 'consciousness-inner'), 1, 2, true),
  ('obe', 'Außerkörperliche Erfahrungen', 'Out-of-Body Experiences, Astralreisen', '✨',
   (SELECT id FROM question_categories WHERE slug = 'consciousness-inner'), 1, 3, true),
  ('psychedelics', 'Psychedelische Erfahrungen', 'DMT, LSD, Psilocybin, Ayahuasca, Mescalin Trips', '🍄',
   (SELECT id FROM question_categories WHERE slug = 'consciousness-inner'), 1, 4, true),
  ('meditation', 'Meditation & Tiefe Zustände', 'Transzendentale Zustände, Samadhi, Tiefenmeditation', '🧘',
   (SELECT id FROM question_categories WHERE slug = 'consciousness-inner'), 1, 5, true),
  ('insights', 'Eingebungen & Intuitionen', 'Plötzliche Erkenntnisse, spontane Ideen, inneres Wissen', '💡',
   (SELECT id FROM question_categories WHERE slug = 'consciousness-inner'), 1, 6, true)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  emoji = EXCLUDED.emoji,
  parent_category_id = EXCLUDED.parent_category_id,
  level = EXCLUDED.level,
  sort_order = EXCLUDED.sort_order,
  is_active = true;

-- ═════════════════════════════════════════════════════════════════════
-- 2. 🛸 AUSSERIRDISCH & HIMMEL (extraterrestrial-sky)
-- ═════════════════════════════════════════════════════════════════════

INSERT INTO question_categories (slug, name, description, emoji, color, level, sort_order, is_active)
VALUES (
  'extraterrestrial-sky',
  'Außerirdisch & Himmel',
  'Phänomene aus dem Weltall und am Himmel',
  '🛸',
  'from-blue-500 to-cyan-500',
  0,
  2,
  true
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  emoji = EXCLUDED.emoji,
  color = EXCLUDED.color,
  level = EXCLUDED.level,
  sort_order = EXCLUDED.sort_order,
  is_active = true;

INSERT INTO question_categories (slug, name, description, emoji, parent_category_id, level, sort_order, is_active)
VALUES
  ('ufo-uap', 'UFO/UAP Sichtungen', 'Unidentifizierte Flugobjekte, UAP', '🛸',
   (SELECT id FROM question_categories WHERE slug = 'extraterrestrial-sky'), 1, 1, true),
  ('alien-contact', 'Alien-Begegnungen', 'Kontakt mit Außerirdischen, Entführungen, Kommunikation', '👽',
   (SELECT id FROM question_categories WHERE slug = 'extraterrestrial-sky'), 1, 2, true),
  ('sky-lights', 'Unerklärliche Himmelslichter', 'Mysteriöse Lichter am Himmel, Orbs, Lichtformationen', '💫',
   (SELECT id FROM question_categories WHERE slug = 'extraterrestrial-sky'), 1, 3, true),
  ('meteors', 'Meteore & Feuerbälle', 'Sternschnuppen, Feuerbälle, außergewöhnliche Meteor-Sichtungen', '☄️',
   (SELECT id FROM question_categories WHERE slug = 'extraterrestrial-sky'), 1, 4, true),
  ('aurora', 'Außergewöhnliche Auroras', 'Polarlichter an ungewöhnlichen Orten', '🌌',
   (SELECT id FROM question_categories WHERE slug = 'extraterrestrial-sky'), 1, 5, true),
  ('atmospheric', 'Atmosphärische Anomalien', 'Anomale Wolken, Himmelsformationen', '☁️',
   (SELECT id FROM question_categories WHERE slug = 'extraterrestrial-sky'), 1, 6, true)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  emoji = EXCLUDED.emoji,
  parent_category_id = EXCLUDED.parent_category_id,
  level = EXCLUDED.level,
  sort_order = EXCLUDED.sort_order,
  is_active = true;

-- ═════════════════════════════════════════════════════════════════════
-- 3. 👻 WESEN & ERSCHEINUNGEN (entities-apparitions)
-- ═════════════════════════════════════════════════════════════════════

INSERT INTO question_categories (slug, name, description, emoji, color, level, sort_order, is_active)
VALUES (
  'entities-apparitions',
  'Wesen & Erscheinungen',
  'Begegnungen mit Wesen, die nicht in unsere bekannte Realität passen',
  '👻',
  'from-gray-700 to-gray-900',
  0,
  3,
  true
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  emoji = EXCLUDED.emoji,
  color = EXCLUDED.color,
  level = EXCLUDED.level,
  sort_order = EXCLUDED.sort_order,
  is_active = true;

INSERT INTO question_categories (slug, name, description, emoji, parent_category_id, level, sort_order, is_active)
VALUES
  ('ghosts', 'Geister & Gespenster', 'Geistererscheinungen, verstorbene Seelen, Spuk', '👻',
   (SELECT id FROM question_categories WHERE slug = 'entities-apparitions'), 1, 1, true),
  ('shadow-beings', 'Schattenwesen', 'Schattenmenschen, dunkle Figuren, Shadow People', '🌑',
   (SELECT id FROM question_categories WHERE slug = 'entities-apparitions'), 1, 2, true),
  ('apparitions', 'Erscheinungen & Manifestationen', 'Visuelle Erscheinungen, Materialisationen', '💨',
   (SELECT id FROM question_categories WHERE slug = 'entities-apparitions'), 1, 3, true),
  ('cryptids', 'Kryptiden', 'Bigfoot, Nessie, Mothman, unerforschte Kreaturen', '🦎',
   (SELECT id FROM question_categories WHERE slug = 'entities-apparitions'), 1, 4, true),
  ('poltergeist', 'Poltergeist-Aktivität', 'Bewegte Objekte, Klopfgeräusche, physische Manifestationen', '📦',
   (SELECT id FROM question_categories WHERE slug = 'entities-apparitions'), 1, 5, true),
  ('interdimensional', 'Interdimensionale Wesen', 'Wesen aus anderen Dimensionen oder Realitäten', '🌀',
   (SELECT id FROM question_categories WHERE slug = 'entities-apparitions'), 1, 6, true)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  emoji = EXCLUDED.emoji,
  parent_category_id = EXCLUDED.parent_category_id,
  level = EXCLUDED.level,
  sort_order = EXCLUDED.sort_order,
  is_active = true;

-- ═════════════════════════════════════════════════════════════════════
-- 4. 🔮 PSI & ÜBERSINNLICH (psi-extrasensory)
-- ═════════════════════════════════════════════════════════════════════

INSERT INTO question_categories (slug, name, description, emoji, color, level, sort_order, is_active)
VALUES (
  'psi-extrasensory',
  'PSI & Übersinnlich',
  'Übersinnliche mentale Fähigkeiten und ESP',
  '🔮',
  'from-violet-500 to-purple-600',
  0,
  4,
  true
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  emoji = EXCLUDED.emoji,
  color = EXCLUDED.color,
  level = EXCLUDED.level,
  sort_order = EXCLUDED.sort_order,
  is_active = true;

INSERT INTO question_categories (slug, name, description, emoji, parent_category_id, level, sort_order, is_active)
VALUES
  ('telepathy', 'Gedankenübertragung', 'Telepathische Kommunikation, Gedankenlesen', '🧠',
   (SELECT id FROM question_categories WHERE slug = 'psi-extrasensory'), 1, 1, true),
  ('remote-viewing', 'Fernwahrnehmung', 'Remote Viewing, Hellsehen über Distanz', '👁️',
   (SELECT id FROM question_categories WHERE slug = 'psi-extrasensory'), 1, 2, true),
  ('precognition', 'Vorahnungen & Präkognition', 'Zukunftsvisionen, prophetische Träume', '🔮',
   (SELECT id FROM question_categories WHERE slug = 'psi-extrasensory'), 1, 3, true),
  ('clairvoyance', 'Hellsehen', 'Übersinnliches Sehen, Visionen, Zweites Gesicht', '🌟',
   (SELECT id FROM question_categories WHERE slug = 'psi-extrasensory'), 1, 4, true),
  ('telekinesis', 'Psychokinese', 'Bewegung von Objekten durch Gedankenkraft, Telekinese', '🌀',
   (SELECT id FROM question_categories WHERE slug = 'psi-extrasensory'), 1, 5, true),
  ('intuition', 'Übersinnliche Intuition', 'Bauchgefühl mit übersinnlicher Qualität', '💭',
   (SELECT id FROM question_categories WHERE slug = 'psi-extrasensory'), 1, 6, true)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  emoji = EXCLUDED.emoji,
  parent_category_id = EXCLUDED.parent_category_id,
  level = EXCLUDED.level,
  sort_order = EXCLUDED.sort_order,
  is_active = true;

-- ═════════════════════════════════════════════════════════════════════
-- 5. 🌍 NATUR & ERDE (nature-earth)
-- ═════════════════════════════════════════════════════════════════════

INSERT INTO question_categories (slug, name, description, emoji, color, level, sort_order, is_active)
VALUES (
  'nature-earth',
  'Natur & Erde',
  'Natürliche Phänomene mit unerklärbaren Aspekten',
  '🌍',
  'from-green-600 to-emerald-700',
  0,
  5,
  true
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  emoji = EXCLUDED.emoji,
  color = EXCLUDED.color,
  level = EXCLUDED.level,
  sort_order = EXCLUDED.sort_order,
  is_active = true;

INSERT INTO question_categories (slug, name, description, emoji, parent_category_id, level, sort_order, is_active)
VALUES
  ('earthquakes', 'Erdbeben & Vorahnungen', 'Erdbeben, seismische Aktivität, Vorahnungen vor Beben', '🌋',
   (SELECT id FROM question_categories WHERE slug = 'nature-earth'), 1, 1, true),
  ('weather', 'Extreme Wetterphänomene', 'Anomale Stürme, unerklärliche Wetterlagen', '⛈️',
   (SELECT id FROM question_categories WHERE slug = 'nature-earth'), 1, 2, true),
  ('geological', 'Geologische Anomalien', 'Unerklärliche geologische Formationen, Erdverschiebungen', '🏔️',
   (SELECT id FROM question_categories WHERE slug = 'nature-earth'), 1, 3, true),
  ('animal-behavior', 'Anomales Tierverhalten', 'Massensterben, unerklärliches Verhalten', '🐦',
   (SELECT id FROM question_categories WHERE slug = 'nature-earth'), 1, 4, true),
  ('environmental', 'Umweltanomalien', 'Unerklärliche Umweltphänomene, anomale Wasserstände', '🌊',
   (SELECT id FROM question_categories WHERE slug = 'nature-earth'), 1, 5, true)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  emoji = EXCLUDED.emoji,
  parent_category_id = EXCLUDED.parent_category_id,
  level = EXCLUDED.level,
  sort_order = EXCLUDED.sort_order,
  is_active = true;

-- ═════════════════════════════════════════════════════════════════════
-- 6. 💫 GESUNDHEIT & HEILUNG (health-healing)
-- ═════════════════════════════════════════════════════════════════════

INSERT INTO question_categories (slug, name, description, emoji, color, level, sort_order, is_active)
VALUES (
  'health-healing',
  'Gesundheit & Heilung',
  'Unerklärliche Heilungen und körperliche Anomalien',
  '💫',
  'from-rose-500 to-pink-600',
  0,
  6,
  true
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  emoji = EXCLUDED.emoji,
  color = EXCLUDED.color,
  level = EXCLUDED.level,
  sort_order = EXCLUDED.sort_order,
  is_active = true;

INSERT INTO question_categories (slug, name, description, emoji, parent_category_id, level, sort_order, is_active)
VALUES
  ('spontaneous-healing', 'Spontanheilungen', 'Plötzliche, unerklärliche Heilungen ohne medizinische Erklärung', '✨',
   (SELECT id FROM question_categories WHERE slug = 'health-healing'), 1, 1, true),
  ('cancer-remission', 'Krebsremission', 'Unerklärliche Krebsheilungen, Remissionen gegen alle Prognosen', '🎗️',
   (SELECT id FROM question_categories WHERE slug = 'health-healing'), 1, 2, true),
  ('autoimmune', 'Autoimmunerkrankungen', 'Unerklärliche Symptome oder Heilungen bei Autoimmunerkrankungen', '🔬',
   (SELECT id FROM question_categories WHERE slug = 'health-healing'), 1, 3, true),
  ('energy-healing', 'Energetische Heilung', 'Heilung durch Energie, Reiki, Handauflegen, Bioenergie', '🙌',
   (SELECT id FROM question_categories WHERE slug = 'health-healing'), 1, 4, true),
  ('miraculous-recovery', 'Wunderheilungen', 'Medizinische Wunder, Heilungen die Ärzte verblüffen', '🌟',
   (SELECT id FROM question_categories WHERE slug = 'health-healing'), 1, 5, true),
  ('unexplained-symptoms', 'Unerklärliche Symptome', 'Körperliche Symptome ohne medizinische Ursache', '🤔',
   (SELECT id FROM question_categories WHERE slug = 'health-healing'), 1, 6, true)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  emoji = EXCLUDED.emoji,
  parent_category_id = EXCLUDED.parent_category_id,
  level = EXCLUDED.level,
  sort_order = EXCLUDED.sort_order,
  is_active = true;

-- ═════════════════════════════════════════════════════════════════════
-- 7. 🕉️ SPIRITUELLE PRAXIS (spiritual-practice)
-- ═════════════════════════════════════════════════════════════════════

INSERT INTO question_categories (slug, name, description, emoji, color, level, sort_order, is_active)
VALUES (
  'spiritual-practice',
  'Spirituelle Praxis',
  'Erfahrungen durch spirituelle Praktiken und Methoden',
  '🕉️',
  'from-amber-500 to-orange-600',
  0,
  7,
  true
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  emoji = EXCLUDED.emoji,
  color = EXCLUDED.color,
  level = EXCLUDED.level,
  sort_order = EXCLUDED.sort_order,
  is_active = true;

INSERT INTO question_categories (slug, name, description, emoji, parent_category_id, level, sort_order, is_active)
VALUES
  ('yoga', 'Yoga-Erfahrungen', 'Kundalini-Erwachen, Yoga-induzierte Zustände, Chakra-Aktivierung', '🧘‍♀️',
   (SELECT id FROM question_categories WHERE slug = 'spiritual-practice'), 1, 1, true),
  ('meditation-practice', 'Meditationspraxis', 'Erfahrungen während oder durch regelmäßige Meditation', '🕉️',
   (SELECT id FROM question_categories WHERE slug = 'spiritual-practice'), 1, 2, true),
  ('shamanism', 'Schamanische Reisen', 'Schamanische Praktiken, Trommel-Reisen, Pflanzenmedizin-Zeremonien', '🪶',
   (SELECT id FROM question_categories WHERE slug = 'spiritual-practice'), 1, 3, true),
  ('energy-work', 'Energiearbeit', 'Reiki, Qi Gong, Pranic Healing, Bioenergetik', '⚡',
   (SELECT id FROM question_categories WHERE slug = 'spiritual-practice'), 1, 4, true),
  ('rituals', 'Rituale & Zeremonien', 'Magische Rituale, religiöse Zeremonien, Manifestations-Praktiken', '🕯️',
   (SELECT id FROM question_categories WHERE slug = 'spiritual-practice'), 1, 5, true),
  ('channeling', 'Channeling', 'Durchgabe von Botschaften, Geistführer, mediales Channeling', '📡',
   (SELECT id FROM question_categories WHERE slug = 'spiritual-practice'), 1, 6, true)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  emoji = EXCLUDED.emoji,
  parent_category_id = EXCLUDED.parent_category_id,
  level = EXCLUDED.level,
  sort_order = EXCLUDED.sort_order,
  is_active = true;

-- ═════════════════════════════════════════════════════════════════════
-- 8. ⏰ ZEIT-RAUM & SYNCHRONIZITÄT (time-space-sync)
-- ═════════════════════════════════════════════════════════════════════

INSERT INTO question_categories (slug, name, description, emoji, color, level, sort_order, is_active)
VALUES (
  'time-space-sync',
  'Zeit-Raum & Synchronizität',
  'Anomalien in Zeit, Raum und Kausalität',
  '⏰',
  'from-indigo-600 to-purple-700',
  0,
  8,
  true
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  emoji = EXCLUDED.emoji,
  color = EXCLUDED.color,
  level = EXCLUDED.level,
  sort_order = EXCLUDED.sort_order,
  is_active = true;

INSERT INTO question_categories (slug, name, description, emoji, parent_category_id, level, sort_order, is_active)
VALUES
  ('missing-time', 'Fehlende Zeit', 'Missing Time, verlorene Stunden, unerklärliche Zeitsprünge', '⏱️',
   (SELECT id FROM question_categories WHERE slug = 'time-space-sync'), 1, 1, true),
  ('time-loops', 'Zeitschleifen & Déjà-vu', 'Intensive Déjà-vu-Erlebnisse, Zeitschleifen, Wiederholungen', '🔄',
   (SELECT id FROM question_categories WHERE slug = 'time-space-sync'), 1, 2, true),
  ('synchronicity', 'Synchronizität', 'Bedeutungsvolle Zufälle, akausale Zusammenhänge, Muster', '🎲',
   (SELECT id FROM question_categories WHERE slug = 'time-space-sync'), 1, 3, true),
  ('reality-glitches', 'Realitäts-Glitches', 'Matrix-Momente, Glitches in der Realität, Anomalien', '👀',
   (SELECT id FROM question_categories WHERE slug = 'time-space-sync'), 1, 4, true),
  ('dimensional-shift', 'Dimensionsverschiebungen', 'Erlebnisse in anderen Dimensionen oder Parallelrealitäten', '🌈',
   (SELECT id FROM question_categories WHERE slug = 'time-space-sync'), 1, 5, true),
  ('mandela-effect', 'Mandela-Effekt', 'Kollektiv falsche Erinnerungen, Reality Shifts', '🧩',
   (SELECT id FROM question_categories WHERE slug = 'time-space-sync'), 1, 6, true)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  emoji = EXCLUDED.emoji,
  parent_category_id = EXCLUDED.parent_category_id,
  level = EXCLUDED.level,
  sort_order = EXCLUDED.sort_order,
  is_active = true;

-- ═════════════════════════════════════════════════════════════════════
-- FINALE ANPASSUNGEN
-- ═════════════════════════════════════════════════════════════════════

-- Update experiences table: Map old categories to new hierarchy
UPDATE experiences
SET category = 'ufo-uap'
WHERE category IN ('sky-phenomena', 'ufo', 'uap');

UPDATE experiences
SET category = 'ghosts'
WHERE category IN ('paranormal', 'ghost');

UPDATE experiences
SET category = 'dreams'
WHERE category IN ('consciousness', 'dream');

-- Indexes für Performance
CREATE INDEX IF NOT EXISTS idx_categories_level ON question_categories(level);
CREATE INDEX IF NOT EXISTS idx_categories_parent_active ON question_categories(parent_category_id, is_active);
