'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { CheckCircle, UserCheck, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'

interface Witness {
  id: string
  user_id: string
  username: string
  display_name?: string
  avatar_url?: string
  status: 'pending' | 'verified' | 'declined'
  verified_at?: string
  notes?: string
}

interface WitnessVerificationBannerProps {
  experienceId: string
  witnesses: Witness[]
  isAuthor: boolean
  onNewWitnessVerified?: () => void
}

export function WitnessVerificationBanner({
  experienceId,
  witnesses,
  isAuthor,
  onNewWitnessVerified
}: WitnessVerificationBannerProps) {
  const [showDetails, setShowDetails] = useState(false)

  const verifiedWitnesses = witnesses.filter(w => w.status === 'verified')
  const pendingWitnesses = witnesses.filter(w => w.status === 'pending')

  // Only show if there are verified witnesses
  if (verifiedWitnesses.length === 0) {
    return null
  }

  const firstWitness = verifiedWitnesses[0]
  const additionalCount = verifiedWitnesses.length - 1

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, height: 0 }}
        animate={{ opacity: 1, y: 0, height: 'auto' }}
        exit={{ opacity: 0, y: -20, height: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <Card className="border-green-500/50 bg-green-500/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              {/* Icon */}
              <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                <UserCheck className="w-6 h-6 text-green-600" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                {/* Aha-Moment Message */}
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-5 h-5 text-green-600" />
                  <h3 className="font-bold text-green-700">
                    {isAuthor
                      ? 'DEIN FREUND HAT DEIN ERLEBNIS BESTÄTIGT!'
                      : 'DIESES ERLEBNIS WURDE VON ZEUGEN BESTÄTIGT!'}
                  </h3>
                </div>

                {/* First Witness */}
                <div className="flex items-center gap-3 mb-2">
                  <Link href={`/profile/${firstWitness.username}`} className="flex items-center gap-2 hover:opacity-80">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={firstWitness.avatar_url} />
                      <AvatarFallback>
                        {firstWitness.display_name?.[0] || firstWitness.username[0]}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-semibold">
                      @{firstWitness.username}
                    </span>
                  </Link>
                  <Badge variant="default" className="bg-green-600">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Verifiziert
                  </Badge>
                  {firstWitness.verified_at && (
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(firstWitness.verified_at), 'dd. MMMM yyyy', { locale: de })}
                    </span>
                  )}
                </div>

                {/* Additional Witnesses */}
                {additionalCount > 0 && (
                  <p className="text-sm text-muted-foreground mb-2">
                    + {additionalCount} weitere{additionalCount === 1 ? 'r' : ''} Zeuge{additionalCount === 1 ? '' : 'n'} {additionalCount === 1 ? 'hat' : 'haben'} bestätigt
                  </p>
                )}

                {/* Witness Notes */}
                {firstWitness.notes && !showDetails && (
                  <p className="text-sm italic text-muted-foreground line-clamp-2">
                    "{firstWitness.notes}"
                  </p>
                )}

                {/* Toggle Details */}
                {verifiedWitnesses.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowDetails(!showDetails)}
                    className="mt-2 h-8"
                  >
                    {showDetails ? 'Weniger anzeigen' : `Alle ${verifiedWitnesses.length} Zeugen anzeigen`}
                  </Button>
                )}

                {/* All Witnesses Details */}
                <AnimatePresence>
                  {showDetails && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 space-y-3 pt-3 border-t"
                    >
                      {verifiedWitnesses.map((witness) => (
                        <div key={witness.id} className="flex items-start gap-3">
                          <Link href={`/profile/${witness.username}`} className="flex items-center gap-2 hover:opacity-80">
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={witness.avatar_url} />
                              <AvatarFallback>
                                {witness.display_name?.[0] || witness.username[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold">@{witness.username}</p>
                              {witness.verified_at && (
                                <p className="text-xs text-muted-foreground">
                                  {format(new Date(witness.verified_at), 'dd. MMM yyyy', { locale: de })}
                                </p>
                              )}
                            </div>
                          </Link>
                          {witness.notes && (
                            <p className="text-sm italic text-muted-foreground flex-1">
                              "{witness.notes}"
                            </p>
                          )}
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Verification Badge */}
              <div className="flex-shrink-0">
                <Badge variant="outline" className="border-green-600 text-green-700 bg-green-50">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  {verifiedWitnesses.length === 1 ? '1 Zeuge' : `${verifiedWitnesses.length} Zeugen`}
                </Badge>
              </div>
            </div>

            {/* Credibility Boost Message */}
            <div className="mt-3 pt-3 border-t text-sm">
              <p className="text-green-700 font-medium">
                ✓ Glaubwürdigkeit erhöht: Dieses Erlebnis wurde von {verifiedWitnesses.length} Person{verifiedWitnesses.length === 1 ? '' : 'en'} bestätigt
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  )
}
