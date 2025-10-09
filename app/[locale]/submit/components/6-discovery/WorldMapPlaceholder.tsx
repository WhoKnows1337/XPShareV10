'use client'

import { motion } from 'framer-motion'
import type { MapData } from '@/lib/stores/submitStore'
import { MapPin } from 'lucide-react'

interface WorldMapPlaceholderProps {
  mapData: MapData
}

export const WorldMapPlaceholder = ({ mapData }: WorldMapPlaceholderProps) => {
  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
      {/* Placeholder Map */}
      <div className="relative h-96 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
        {/* Decorative Dots */}
        {mapData.dots.slice(0, 10).map((dot, index) => (
          <motion.div
            key={index}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              delay: index * 0.05,
              type: 'spring',
              stiffness: 400,
            }}
            className="absolute"
            style={{
              left: `${Math.random() * 90 + 5}%`,
              top: `${Math.random() * 80 + 10}%`,
            }}
          >
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.7, 1, 0.7],
              }}
              transition={{
                repeat: Infinity,
                duration: 2,
                delay: index * 0.1,
              }}
              className="relative"
            >
              <div className="w-4 h-4 bg-purple-500 rounded-full" />
              <div className="absolute inset-0 w-4 h-4 bg-purple-500 rounded-full animate-ping" />
            </motion.div>
          </motion.div>
        ))}

        {/* Placeholder Text */}
        <div className="text-center z-10">
          <MapPin className="w-16 h-16 text-purple-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            Interaktive Weltkarte
          </h3>
          <p className="text-gray-600">
            Mapbox Integration coming soon...
          </p>
          <p className="text-sm text-gray-500 mt-2">
            {mapData.dots.length} Erfahrungen auf der Karte
          </p>
        </div>
      </div>

      {/* Map Info */}
      <div className="p-6 bg-gray-50">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-purple-600">{mapData.dots.length}</p>
            <p className="text-sm text-gray-600">Orte</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-blue-600">
              {mapData.dots.reduce((sum, dot) => sum + dot.count, 0)}
            </p>
            <p className="text-sm text-gray-600">Erfahrungen</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-600">
              {new Set(mapData.dots.map(d => Math.floor(d.lat / 10))).size}
            </p>
            <p className="text-sm text-gray-600">Regionen</p>
          </div>
        </div>
      </div>
    </div>
  )
}
