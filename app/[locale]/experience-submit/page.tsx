'use client'

import { Canvas } from './components/1-canvas/Canvas'
import { QuestionFlow } from './components/2-questions/QuestionFlow'
import { MediaUpload } from './components/3-media/MediaUpload'
import { ReviewEnrich } from './components/4-review/ReviewEnrich'
import { PrivacyWitnesses } from './components/5-privacy/PrivacyWitnesses'
import { Discovery } from './components/6-discovery/Discovery'
import { useExperienceSubmitStore } from '@/lib/stores/experienceSubmitStore'

export default function ExperienceSubmitPage() {
  const { currentStep } = useExperienceSubmitStore()

  return (
    <div className="min-h-screen">
      {currentStep === 1 && <Canvas />}
      {currentStep === 2 && <QuestionFlow />}
      {currentStep === 3 && <MediaUpload />}
      {currentStep === 4 && <ReviewEnrich />}
      {currentStep === 5 && <PrivacyWitnesses />}
      {currentStep === 6 && <Discovery />}
    </div>
  )
}
