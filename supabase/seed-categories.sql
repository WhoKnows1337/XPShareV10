-- =====================================================
-- SEED INITIAL CATEGORIES
-- Based on existing categories in the app
-- =====================================================

-- Insert initial categories (matching existing app categories)
INSERT INTO question_categories (slug, name, description, icon, sort_order, is_active)
VALUES
  ('ufo-sighting', 'UFO-Sichtungen', 'Beobachtungen von unidentifizierten Flugobjekten am Himmel', '🛸', 1, true),
  ('entity-encounter', 'Wesen-Begegnungen', 'Begegnungen mit unbekannten oder außergewöhnlichen Wesen', '👽', 2, true),
  ('paranormal-activity', 'Paranormale Aktivität', 'Unerklärliche Phänomene, Geister, Poltergeist-Aktivitäten', '👻', 3, true),
  ('time-anomaly', 'Zeit-Anomalien', 'Erlebnisse mit Zeitverzerrungen oder Missing Time', '⏰', 4, true),
  ('precognition', 'Vorahnungen', 'Träume oder Visionen, die später eintraten', '🔮', 5, true),
  ('telekinesis', 'Telekinese', 'Bewegung von Objekten ohne physischen Kontakt', '🌀', 6, true),
  ('telepathy', 'Telepathie', 'Gedankenübertragung oder Gedankenlesen', '🧠', 7, true),
  ('astral-projection', 'Astralreisen', 'Außerkörperliche Erfahrungen', '✨', 8, true),
  ('cryptid-encounter', 'Kryptiden-Begegnungen', 'Begegnungen mit unbekannten Lebewesen (Bigfoot, Nessie, etc.)', '🦎', 9, true),
  ('dimensional-shift', 'Dimensionsverschiebungen', 'Erlebnisse in anderen Realitäten oder Dimensionen', '🌌', 10, true),
  ('healing', 'Spontanheilungen', 'Unerklärliche medizinische Heilungen', '💫', 11, true),
  ('synchronicity', 'Synchronizität', 'Bedeutungsvolle Zufälle und Muster', '🎲', 12, true)
ON CONFLICT (slug) DO NOTHING;

-- Verify the seeded data
SELECT slug, name, icon, sort_order, is_active
FROM question_categories
ORDER BY sort_order;
