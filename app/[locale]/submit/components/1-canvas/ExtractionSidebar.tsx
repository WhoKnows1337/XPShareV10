'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useSubmitStore } from '@/lib/stores/submitStore'
import { ExtractionField } from './ExtractionField'
import { MapPin, Calendar, Tag, Folder, Sparkles, Database } from 'lucide-react'

// Map attribute keys to German display names
const getAttributeDisplayName = (key: string): string => {
  const displayNames: Record<string, string> = {
    // Generic
    intensity: 'Intensität',
    duration: 'Dauer',
    time_of_day: 'Tageszeit',
    witnesses: 'Zeugen',
    emotional_state: 'Emotionaler Zustand',
    visibility: 'Sichtbarkeit',
    afterwards_feeling: 'Gefühl danach',
    repeatability: 'Wiederholbarkeit',
    // UFO/UAP
    shape: 'Form',
    surface: 'Oberfläche',
    light_color: 'Lichtfarbe',
    light_pattern: 'Lichtmuster',
    movement: 'Bewegung',
    sound: 'Geräusch',
    size: 'Größe',
    altitude: 'Höhe',
    disappearance: 'Verschwinden',
    // Entities
    entity_type: 'Wesenart',
    entity_appearance: 'Erscheinung',
    entity_form: 'Form des Wesens',
    entity_behavior: 'Verhalten',
    entity_features: 'Merkmale',
    communication_type: 'Kommunikationsart',
    physical_contact: 'Körperkontakt',
    entity_clothing: 'Kleidung',
    entity_count: 'Anzahl',
    // Dreams/NDE/OBE
    lucidity: 'Klarheit',
    dream_type: 'Traumart',
    nde_trigger: 'NTE-Auslöser',
    nde_features: 'NTE-Merkmale',
    obe_trigger: 'AKE-Auslöser',
    psi_type: 'PSI-Art',
    accuracy: 'Genauigkeit',
    target_awareness: 'Zielbewusstsein',
    // Healing/Health
    condition_type: 'Art der Erkrankung',
    healing_speed: 'Heilungsgeschwindigkeit',
    healing_method: 'Heilungsmethode',
    medical_verification: 'Ärztliche Bestätigung',
    // Time/Space
    time_lost: 'Verlorene Zeit',
    time_gained: 'Gewonnene Zeit',
    sync_type: 'Synchronizitätsart',
    glitch_type: 'Glitch-Art',
    reality_shift_type: 'Reality-Shift-Art',
    // Nature/Sky
    phenomenon_color: 'Phänomen-Farbe',
    phenomenon_duration: 'Phänomen-Dauer',
    cloud_type: 'Wolkenart',
    energy_field_type: 'Energiefeld-Art',
    // Shadow Beings
    shadow_form: 'Schattenform',
    shadow_behavior: 'Schattenverhalten',
    shadow_location: 'Schattenort',
    // Other
    manifestation_type: 'Manifestationsart',
    object_behavior: 'Objektverhalten',
    poltergeist_type: 'Poltergeist-Art',
  }

  return displayNames[key] || key
}

const sidebarVariants = {
  hidden: { opacity: 0, x: 20, width: 0 },
  visible: {
    opacity: 1,
    x: 0,
    width: 'auto',
    transition: {
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1],
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
}

const fieldVariants = {
  hidden: { opacity: 0, scale: 0.9, y: 10 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 200,
      damping: 20,
    },
  },
}

export const ExtractionSidebar = () => {
  const { charCount, extractedData, isExtracting, updateExtractedField } =
    useSubmitStore()

  const showSidebar = charCount > 50

  return (
    <AnimatePresence>
      {showSidebar && (
        <motion.div
          variants={sidebarVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          className="fixed right-0 top-20 w-80 bg-white/95 backdrop-blur-lg p-6 rounded-l-2xl shadow-2xl border-l border-gray-200 max-h-[calc(100vh-6rem)] overflow-y-auto"
        >
          {isExtracting ? (
            <div className="flex items-center gap-3 text-gray-600">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
              >
                <Sparkles className="w-5 h-5" />
              </motion.div>
              <span className="text-sm font-medium">Extrahiere...</span>
            </div>
          ) : (
            <motion.div
              variants={{
                visible: {
                  transition: {
                    staggerChildren: 0.1,
                  },
                },
              }}
              className="space-y-4"
            >
              <motion.div variants={fieldVariants}>
                <ExtractionField
                  icon={<Folder className="w-4 h-4" />}
                  label="Kategorie"
                  field="category"
                  value={extractedData.category.value}
                  confidence={extractedData.category.confidence}
                  isEdited={extractedData.category.isManuallyEdited}
                  onEdit={(value) => updateExtractedField('category', value)}
                />
              </motion.div>

              <motion.div variants={fieldVariants}>
                <ExtractionField
                  icon={<Sparkles className="w-4 h-4" />}
                  label="Titel"
                  field="title"
                  value={extractedData.title.value}
                  confidence={extractedData.title.confidence}
                  isEdited={extractedData.title.isManuallyEdited}
                  onEdit={(value) => updateExtractedField('title', value)}
                />
              </motion.div>

              <motion.div variants={fieldVariants}>
                <ExtractionField
                  icon={<MapPin className="w-4 h-4" />}
                  label="Ort"
                  field="location"
                  value={extractedData.location.value}
                  confidence={extractedData.location.confidence}
                  isEdited={extractedData.location.isManuallyEdited}
                  onEdit={(value) => updateExtractedField('location', value)}
                />
              </motion.div>

              <motion.div variants={fieldVariants}>
                <ExtractionField
                  icon={<Calendar className="w-4 h-4" />}
                  label="Zeit"
                  field="date"
                  value={extractedData.date.value}
                  confidence={extractedData.date.confidence}
                  isEdited={extractedData.date.isManuallyEdited}
                  onEdit={(value) => updateExtractedField('date', value)}
                />
              </motion.div>

              <motion.div variants={fieldVariants}>
                <ExtractionField
                  icon={<Tag className="w-4 h-4" />}
                  label="Tags"
                  field="tags"
                  value={Array.isArray(extractedData.tags.value) ? extractedData.tags.value.join(', ') : ''}
                  confidence={extractedData.tags.confidence}
                  isEdited={extractedData.tags.isManuallyEdited}
                  onEdit={(value) =>
                    updateExtractedField(
                      'tags',
                      value.split(',').map((t: string) => t.trim())
                    )
                  }
                />
              </motion.div>

              {/* Attributes Section */}
              {Object.keys(extractedData.attributes).length > 0 && (
                <>
                  <motion.div
                    variants={fieldVariants}
                    className="pt-4 border-t border-gray-200"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="w-4 h-4 text-indigo-500" />
                      <span className="text-sm font-semibold text-gray-700">
                        Details
                      </span>
                    </div>
                  </motion.div>

                  {Object.entries(extractedData.attributes).map(([key, field]) => (
                    <motion.div key={key} variants={fieldVariants}>
                      <ExtractionField
                        icon={<Database className="w-4 h-4" />}
                        label={getAttributeDisplayName(key)}
                        field={`attribute_${key}`}
                        value={field.value}
                        confidence={field.confidence}
                        isEdited={field.isManuallyEdited}
                        onEdit={(value) => {
                          // Update the specific attribute in the store
                          const updatedAttributes = {
                            ...extractedData.attributes,
                            [key]: {
                              ...field,
                              value,
                              isManuallyEdited: true,
                            },
                          }
                          updateExtractedField('attributes', updatedAttributes)
                        }}
                      />
                    </motion.div>
                  ))}
                </>
              )}
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
