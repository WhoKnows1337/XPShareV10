'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Sparkles, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function SuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const experienceId = searchParams.get('id')
  const [showConfetti, setShowConfetti] = useState(true)

  useEffect(() => {
    // Clear draft from localStorage
    localStorage.removeItem('experience_draft')

    // Hide confetti after animation
    const timer = setTimeout(() => setShowConfetti(false), 3000)
    return () => clearTimeout(timer)
  }, [])

  if (!experienceId) {
    router.push('/feed')
    return null
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Confetti Effect (simple CSS animation) */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              className="absolute animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                top: `-${Math.random() * 20}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 2}s`,
              }}
            >
              <Sparkles
                className="h-6 w-6"
                style={{
                  color: `hsl(${Math.random() * 360}, 70%, 60%)`,
                }}
              />
            </div>
          ))}
        </div>
      )}

      <div className="min-h-[60vh] flex items-center justify-center">
        <Card className="max-w-2xl w-full">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <CheckCircle2 className="h-20 w-20 text-green-500" />
            </div>
            <CardTitle className="text-3xl font-bold">
              Experience Shared Successfully! 🎉
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-center">
            <p className="text-lg text-muted-foreground">
              Thank you for sharing your extraordinary experience with the community.
              Your story is now part of the collective tapestry of human experiences.
            </p>

            <div className="space-y-3 pt-4">
              <Link href={`/experiences/${experienceId}`}>
                <Button size="lg" className="w-full">
                  View Your Experience
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>

              <Link href="/feed">
                <Button variant="outline" size="lg" className="w-full">
                  Explore Other Experiences
                </Button>
              </Link>

              <Link href="/submit">
                <Button variant="ghost" size="lg" className="w-full">
                  Share Another Experience
                </Button>
              </Link>
            </div>

            <div className="pt-6 border-t">
              <p className="text-sm text-muted-foreground">
                Your experience will be visible to the community and may help others
                discover patterns and connections.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <style jsx>{`
        @keyframes confetti {
          from {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          to {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        :global(.animate-confetti) {
          animation: confetti linear forwards;
        }
      `}</style>
    </div>
  )
}
