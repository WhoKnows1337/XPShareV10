'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Clock } from 'lucide-react'

interface DateQuestionProps {
  value?: string
  onChange: (value: string) => void
  currentValue?: string
}

export const DateQuestion = ({ value, onChange, currentValue }: DateQuestionProps) => {
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [timeframe, setTimeframe] = useState<'exact' | 'approximate' | 'unknown'>('exact')

  useEffect(() => {
    if (currentValue) {
      // Try to parse existing value
      setDate(currentValue)
    }
  }, [currentValue])

  useEffect(() => {
    // Combine date, time, and timeframe into a single value
    if (timeframe === 'unknown') {
      onChange('Unbekannt')
    } else if (timeframe === 'approximate') {
      onChange(date ? `Etwa ${date}` : '')
    } else {
      const combined = time ? `${date} ${time}` : date
      onChange(combined)
    }
  }, [date, time, timeframe])

  const quickOptions = [
    { label: 'Heute', value: new Date().toISOString().split('T')[0] },
    { label: 'Gestern', value: new Date(Date.now() - 86400000).toISOString().split('T')[0] },
    { label: 'Diese Woche', value: 'Diese Woche' },
    { label: 'Letzten Monat', value: 'Letzten Monat' },
    { label: 'Dieses Jahr', value: new Date().getFullYear().toString() },
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

      {/* Timeframe Selection */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Wie genau weißt du das Datum?</label>
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: 'exact', label: 'Genau' },
            { value: 'approximate', label: 'Ungefähr' },
            { value: 'unknown', label: 'Unbekannt' },
          ].map((option) => (
            <motion.button
              key={option.value}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setTimeframe(option.value as any)}
              className={`px-4 py-3 rounded-lg border-2 transition-all ${
                timeframe === option.value
                  ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
              }`}
            >
              {option.label}
            </motion.button>
          ))}
        </div>
      </div>

      {timeframe !== 'unknown' && (
        <>
          {/* Quick Options */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Schnellauswahl:</label>
            <div className="flex flex-wrap gap-2">
              {quickOptions.map((option) => (
                <motion.button
                  key={option.label}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setDate(option.value)}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:border-blue-400 hover:bg-blue-50 transition-colors"
                >
                  {option.label}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Date Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Datum
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Time Input (only for exact) */}
          {timeframe === 'exact' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2"
            >
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Uhrzeit (optional)
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </motion.div>
          )}
        </>
      )}

      {/* Preview */}
      {value && (
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
