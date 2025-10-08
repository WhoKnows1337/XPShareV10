'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Sparkles,
  Search,
  Trophy,
  Lock,
  ArrowRight,
  X,
  CheckCircle2,
} from 'lucide-react'

interface OnboardingTutorialProps {
  onComplete: () => void
  onSkip: () => void
}

const TUTORIAL_STEPS = [
  {
    title: 'Beschreibe deine Erfahrung',
    description: 'Erzähle uns, was du erlebt hast',
    icon: Sparkles,
    color: 'text-purple-500',
    content: (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Schreibe einfach drauf los - unsere AI hilft dir automatisch mit:
        </p>
        <ul className="space-y-2 text-sm">
          <li className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
            <span>
              <strong>Kategorisierung:</strong> UFO, Paranormal, Träume, etc.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
            <span>
              <strong>Ort-Extraktion:</strong> Wo ist es passiert?
            </span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
            <span>
              <strong>Zeit-Extraktion:</strong> Wann war das?
            </span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
            <span>
              <strong>Tag-Vorschläge:</strong> Relevante Hashtags
            </span>
          </li>
        </ul>
        <div className="mt-4 p-3 bg-muted rounded-lg">
          <p className="text-xs text-muted-foreground italic">
            💡 Tipp: Je mehr Details, desto besser können wir Patterns finden!
          </p>
        </div>
      </div>
    ),
  },
  {
    title: 'Finde ähnliche Patterns',
    description: 'Entdecke Verbindungen zu anderen Erfahrungen',
    icon: Search,
    color: 'text-blue-500',
    content: (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Nach deiner Eingabe zeigen wir dir automatisch:
        </p>
        <div className="grid grid-cols-1 gap-3">
          <div className="p-3 rounded-lg border">
            <div className="flex items-center gap-2 mb-1">
              <Search className="h-4 w-4 text-blue-500" />
              <strong className="text-sm">Ähnliche Berichte</strong>
            </div>
            <p className="text-xs text-muted-foreground">
              Wer hat das gleiche erlebt? (KI-Match)
            </p>
          </div>
          <div className="p-3 rounded-lg border">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="h-4 w-4 text-purple-500" />
              <strong className="text-sm">Externe Ereignisse</strong>
            </div>
            <p className="text-xs text-muted-foreground">
              Solar-Stürme, Erdbeben, Mondphasen
            </p>
          </div>
          <div className="p-3 rounded-lg border">
            <div className="flex items-center gap-2 mb-1">
              <Trophy className="h-4 w-4 text-yellow-500" />
              <strong className="text-sm">Geografische Cluster</strong>
            </div>
            <p className="text-xs text-muted-foreground">
              Hotspots auf der Karte
            </p>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: 'Badges & XP sammeln',
    description: 'Level up durch Aktivität',
    icon: Trophy,
    color: 'text-yellow-500',
    content: (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Sammle XP und schalte Badges frei:
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg border text-center">
            <div className="text-2xl mb-1">✨</div>
            <strong className="text-xs">First Experience</strong>
            <p className="text-xs text-muted-foreground mt-1">+10 XP</p>
          </div>
          <div className="p-3 rounded-lg border text-center">
            <div className="text-2xl mb-1">🎯</div>
            <strong className="text-xs">Pattern Hunter</strong>
            <p className="text-xs text-muted-foreground mt-1">+30 XP</p>
          </div>
          <div className="p-3 rounded-lg border text-center">
            <div className="text-2xl mb-1">🌊</div>
            <strong className="text-xs">Wave Creator</strong>
            <p className="text-xs text-muted-foreground mt-1">+100 XP</p>
          </div>
          <div className="p-3 rounded-lg border text-center">
            <div className="text-2xl mb-1">🔥</div>
            <strong className="text-xs">Week Warrior</strong>
            <p className="text-xs text-muted-foreground mt-1">+25 XP</p>
          </div>
        </div>
        <div className="mt-4 p-3 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg border border-purple-500/20">
          <p className="text-xs text-center font-semibold">
            🏆 Erreiche Level 5 für erweiterte Features!
          </p>
        </div>
      </div>
    ),
  },
  {
    title: 'Datenschutz & Privatsphäre',
    description: 'Du hast die volle Kontrolle',
    icon: Lock,
    color: 'text-green-500',
    content: (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Wähle, wie deine Erfahrung geteilt wird:
        </p>
        <div className="space-y-2">
          <div className="p-3 rounded-lg border">
            <div className="flex items-center justify-between mb-1">
              <strong className="text-sm">🌍 Öffentlich</strong>
              <Badge variant="secondary" className="text-xs">
                Standard
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Jeder kann es sehen, mit deinem Namen
            </p>
          </div>
          <div className="p-3 rounded-lg border">
            <strong className="text-sm block mb-1">👤 Anonym</strong>
            <p className="text-xs text-muted-foreground">
              Jeder kann es sehen, OHNE deinen Namen
            </p>
          </div>
          <div className="p-3 rounded-lg border">
            <strong className="text-sm block mb-1">🔒 Privat</strong>
            <p className="text-xs text-muted-foreground">
              Nur du kannst es sehen
            </p>
          </div>
        </div>
        <div className="mt-4 p-3 bg-muted rounded-lg">
          <p className="text-xs text-muted-foreground">
            💡 Du kannst auch die Standort-Genauigkeit anpassen (Exakt, Ungefähr, Land, Verbergen)
          </p>
        </div>
      </div>
    ),
  },
]

export function OnboardingTutorial({ onComplete, onSkip }: OnboardingTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0)

  const handleNext = () => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      onComplete()
    }
  }

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const step = TUTORIAL_STEPS[currentStep]
  const Icon = step.icon

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-2xl"
        >
          <Card className="border-2 border-primary/20 shadow-2xl">
            <CardHeader className="relative">
              <button
                onClick={onSkip}
                className="absolute right-4 top-4 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Skip tutorial"
              >
                <X className="h-5 w-5" />
              </button>
              <div className="flex items-center gap-3 mb-2">
                <div
                  className={`h-12 w-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center ${step.color}`}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="secondary" className="text-xs">
                      {currentStep + 1}/{TUTORIAL_STEPS.length}
                    </Badge>
                  </div>
                  <CardTitle className="text-2xl">{step.title}</CardTitle>
                </div>
              </div>
              <CardDescription>{step.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {step.content}

              {/* Progress Dots */}
              <div className="flex items-center justify-center gap-2 pt-4">
                {TUTORIAL_STEPS.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentStep(index)}
                    className={`h-2 rounded-full transition-all ${
                      index === currentStep
                        ? 'w-8 bg-primary'
                        : index < currentStep
                        ? 'w-2 bg-primary/50'
                        : 'w-2 bg-muted'
                    }`}
                    aria-label={`Go to step ${index + 1}`}
                  />
                ))}
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between pt-4 border-t">
                <Button
                  variant="ghost"
                  onClick={handlePrev}
                  disabled={currentStep === 0}
                >
                  Zurück
                </Button>
                <Button onClick={handleNext} size="lg">
                  {currentStep < TUTORIAL_STEPS.length - 1 ? (
                    <>
                      Weiter
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  ) : (
                    <>
                      Los geht's!
                      <Sparkles className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>

              <div className="text-center">
                <button
                  onClick={onSkip}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Tutorial überspringen
                </button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
