'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { MapPin, Search } from 'lucide-react'

interface LocationQuestionProps {
  value?: string
  onChange: (value: string) => void
  currentValue?: string
}

export const LocationQuestion = ({ value, onChange, currentValue }: LocationQuestionProps) => {
  const [location, setLocation] = useState('')
  const [precision, setPrecision] = useState<'exact' | 'city' | 'region' | 'country' | 'unknown'>('city')

  useEffect(() => {
    if (currentValue) {
      setLocation(currentValue)
    }
  }, [currentValue])

  useEffect(() => {
    if (precision === 'unknown') {
      onChange('Unbekannter Ort')
    } else {
      onChange(location)
    }
  }, [location, precision])

  const commonLocations = [
    'Zürich, Schweiz',
    'Berlin, Deutschland',
    'Wien, Österreich',
    'München, Deutschland',
    'Hamburg, Deutschland',
    'Bern, Schweiz',
  ]

  return (
    <div className="space-y-6">
      {/* Existing Value Display */}
      {currentValue && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-blue-50 border border-blue-200 rounded-lg"
        >
          <div className="text-sm text-blue-700 mb-1">Unsere Vermutung:</div>
          <div className="text-lg font-medium text-blue-900">{currentValue}</div>
        </motion.div>
      )}

      {/* Precision Selection */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Wie genau kannst du den Ort angeben?</label>
        <div className="grid grid-cols-2 gap-3">
          {[
            { value: 'exact', label: 'Genauer Ort' },
            { value: 'city', label: 'Stadt' },
            { value: 'region', label: 'Region' },
            { value: 'country', label: 'Land' },
            { value: 'unknown', label: 'Unbekannt' },
          ].map((option) => (
            <motion.button
              key={option.value}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setPrecision(option.value as any)}
              className={`px-4 py-3 rounded-lg border-2 transition-all ${
                precision === option.value
                  ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
              }`}
            >
              {option.label}
            </motion.button>
          ))}
        </div>
      </div>

      {precision !== 'unknown' && (
        <>
          {/* Common Locations */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Häufige Orte:</label>
            <div className="flex flex-wrap gap-2">
              {commonLocations.map((loc) => (
                <motion.button
                  key={loc}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setLocation(loc)}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:border-blue-400 hover:bg-blue-50 transition-colors"
                >
                  {loc}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Location Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Ort eingeben
            </label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder={
                  precision === 'exact'
                    ? 'z.B. Bahnhofstrasse 1, Zürich'
                    : precision === 'city'
                    ? 'z.B. Zürich'
                    : precision === 'region'
                    ? 'z.B. Kanton Zürich'
                    : 'z.B. Schweiz'
                }
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Helper Text */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-gray-500"
          >
            {precision === 'exact' && 'Gib die genaue Adresse oder GPS-Koordinaten an'}
            {precision === 'city' && 'Gib den Namen der Stadt an'}
            {precision === 'region' && 'Gib die Region oder den Kanton an'}
            {precision === 'country' && 'Gib das Land an'}
          </motion.div>
        </>
      )}

      {/* Preview */}
      {value && value !== 'Unbekannter Ort' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-green-50 border border-green-200 rounded-lg"
        >
          <div className="text-sm text-green-700 mb-1">Deine Antwort:</div>
          <div className="text-lg font-medium text-green-900">{value}</div>
        </motion.div>
      )}
    </div>
  )
}
