'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface SliderQuestionProps {
  value: number | undefined
  onChange: (value: number) => void
  sliderConfig: {
    min: number
    max: number
    step: number
    unit: string
  }
  currentValue?: number
}

export const SliderQuestion = ({ value, onChange, sliderConfig, currentValue }: SliderQuestionProps) => {
  const [internalValue, setInternalValue] = useState(value || currentValue || sliderConfig.min)

  useEffect(() => {
    if (value !== undefined) {
      setInternalValue(value)
    }
  }, [value])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Number(e.target.value)
    setInternalValue(newValue)
    onChange(newValue)
  }

  const { min, max, step, unit } = sliderConfig

  return (
    <div className="space-y-6">
      {/* Current AI Suggestion */}
      {currentValue !== undefined && (
        <div className="text-sm text-gray-600">
          <span className="font-medium">AI-Vorschlag:</span>{' '}
          <span className="text-blue-600">{currentValue}{unit}</span>
        </div>
      )}

      {/* Current Value Display */}
      <div className="text-center">
        <motion.div
          key={internalValue}
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          className="text-5xl font-bold text-gray-900"
        >
          {internalValue}
          <span className="text-3xl text-gray-500 ml-2">{unit}</span>
        </motion.div>
      </div>

      {/* Slider */}
      <div className="relative pt-4 pb-2">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={internalValue}
          onChange={handleChange}
          className="w-full h-3 bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200 rounded-full appearance-none cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-6
            [&::-webkit-slider-thumb]:h-6
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-gradient-to-br
            [&::-webkit-slider-thumb]:from-blue-500
            [&::-webkit-slider-thumb]:to-purple-600
            [&::-webkit-slider-thumb]:cursor-pointer
            [&::-webkit-slider-thumb]:shadow-lg
            [&::-webkit-slider-thumb]:hover:scale-110
            [&::-webkit-slider-thumb]:transition-transform
            [&::-moz-range-thumb]:w-6
            [&::-moz-range-thumb]:h-6
            [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:bg-gradient-to-br
            [&::-moz-range-thumb]:from-blue-500
            [&::-moz-range-thumb]:to-purple-600
            [&::-moz-range-thumb]:border-0
            [&::-moz-range-thumb]:cursor-pointer
            [&::-moz-range-thumb]:shadow-lg"
        />

        {/* Min/Max Labels */}
        <div className="flex justify-between text-sm text-gray-500 mt-2">
          <span>{min}{unit}</span>
          <span>{max}{unit}</span>
        </div>

        {/* Progress Fill */}
        <div
          className="absolute top-4 left-0 h-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full pointer-events-none"
          style={{
            width: `${((internalValue - min) / (max - min)) * 100}%`,
            transition: 'width 0.2s ease-out'
          }}
        />
      </div>
    </div>
  )
}
