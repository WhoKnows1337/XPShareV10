'use client'

import { useRouter, usePathname } from 'next/navigation'
import { getLocaleFromPathname } from '@/lib/utils/locale'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle, Home, Eye, Share2 } from 'lucide-react'
import { motion } from 'framer-motion'
import confetti from 'canvas-confetti'
import { useEffect } from 'react'

export default function Submit3SuccessPage() {
  const router = useRouter()
  const pathname = usePathname()
  const locale = getLocaleFromPathname(pathname)

  useEffect(() => {
    // Confetti animation on success
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    })
  }, [])

  return (
    <div className="max-w-2xl mx-auto min-h-[60vh] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full space-y-8"
      >
        <Card className="border-2 border-green-200 shadow-lg">
          <CardContent className="pt-12 pb-8">
            <div className="text-center space-y-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              >
                <CheckCircle className="h-24 w-24 text-green-500 mx-auto" />
              </motion.div>

              <div>
                <h1 className="text-4xl font-bold mb-3">
                  Experience Published! 🎉
                </h1>
                <p className="text-lg text-muted-foreground">
                  Your story is now live and can be discovered by others
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button
                  variant="default"
                  size="lg"
                  onClick={() => router.push(`/${locale}/feed`)}
                  className="flex-1"
                >
                  <Eye className="mr-2 h-4 w-4" />
                  View Your Experience
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="flex-1"
                  disabled
                >
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </Button>
              </div>

              <div className="pt-6 border-t">
                <p className="text-sm text-muted-foreground mb-3">
                  What's next?
                </p>
                <div className="flex gap-2 justify-center">
                  <Button variant="ghost" onClick={() => router.push(`/${locale}/`)}>
                    <Home className="mr-2 h-4 w-4" />
                    Go Home
                  </Button>
                  <Button variant="ghost" onClick={() => router.push(`/${locale}/submit3/compose`)}>
                    + Share Another Experience
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
