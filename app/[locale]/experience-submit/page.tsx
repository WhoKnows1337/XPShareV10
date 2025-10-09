'use client'

import { Canvas } from './components/1-canvas/Canvas'
import { QuestionFlow } from './components/2-questions/QuestionFlow'
import { useExperienceSubmitStore } from '@/lib/stores/experienceSubmitStore'

export default function ExperienceSubmitPage() {
  const { currentStep } = useExperienceSubmitStore()

  return (
    <div className="min-h-screen">
      {currentStep === 1 && <Canvas />}
      {currentStep === 2 && <QuestionFlow />}
      {/* TODO: Add Screen 3-6 */}
      {currentStep === 3 && (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Screen 3: Media Upload</h1>
            <p className="text-gray-600">Coming soon...</p>
          </div>
        </div>
      )}
    </div>
  )
}
