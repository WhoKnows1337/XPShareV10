'use client'

/**
 * Similarity Score Badge Component (Optimized v2)
 *
 * Displays a compact similarity score badge next to the profile avatar
 * Only shown when viewing OTHER users' profiles (not own profile)
 * Click opens detailed modal with shared categories and experiences
 *
 * Features:
 * - Gradient background based on similarity score
 * - Pulse animation to draw attention
 * - Optimized API endpoint (direct lookup)
 * - Client-side caching (sessionStorage)
 * - Only visible if similarity >= 30%
 */

import React, { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Loader2, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { SimilarityDetailsModal } from './similarity-details-modal'

interface SimilarityScoreBadgeProps {
  /**
   * The user whose profile is being viewed
   */
  profileUserId: string

  /**
   * The current authenticated user ID
   */
  currentUserId: string
}

interface SimilarityData {
  user1_id: string
  user2_id: string
  similarity_score: number
  shared_categories: string[]
  shared_category_count: number
  same_location: boolean
}

function getScoreColor(score: number): string {
  if (score >= 0.8) return 'bg-gradient-to-r from-purple-600 to-pink-600'
  if (score >= 0.6) return 'bg-gradient-to-r from-blue-600 to-cyan-600'
  if (score >= 0.4) return 'bg-gradient-to-r from-green-600 to-teal-600'
  return 'bg-gradient-to-r from-yellow-600 to-orange-600'
}

// Cache key generator
function getCacheKey(user1: string, user2: string): string {
  return `similarity_${user1}_${user2}`
}

// Cache TTL: 5 minutes
const CACHE_TTL = 5 * 60 * 1000

export function SimilarityScoreBadge({
  profileUserId,
  currentUserId,
}: SimilarityScoreBadgeProps) {
  const [similarity, setSimilarity] = useState<SimilarityData | null>(null)
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    async function fetchSimilarity() {
      // Check cache first
      const cacheKey = getCacheKey(currentUserId, profileUserId)
      try {
        const cached = sessionStorage.getItem(cacheKey)
        if (cached) {
          const { data, timestamp } = JSON.parse(cached)
          if (Date.now() - timestamp < CACHE_TTL) {
            setSimilarity(data)
            setLoading(false)
            return
          }
        }
      } catch (e) {
        // Ignore cache errors
      }

      // Fetch from optimized API
      try {
        const response = await fetch(
          `/api/users/similarity?user1=${currentUserId}&user2=${profileUserId}`
        )

        if (!response.ok) {
          if (response.status === 404) {
            // No similarity data found
            setSimilarity(null)
          } else {
            console.error('Failed to fetch similarity data')
          }
          setLoading(false)
          return
        }

        const result = await response.json()

        if (result.similarity) {
          setSimilarity(result.similarity)

          // Cache the result
          try {
            sessionStorage.setItem(
              cacheKey,
              JSON.stringify({
                data: result.similarity,
                timestamp: Date.now(),
              })
            )
          } catch (e) {
            // Ignore storage errors
          }
        }
      } catch (error) {
        console.error('Error fetching similarity:', error)
      } finally {
        setLoading(false)
      }
    }

    if (currentUserId && profileUserId && currentUserId !== profileUserId) {
      fetchSimilarity()
    } else {
      setLoading(false)
    }
  }, [currentUserId, profileUserId])

  // Don't render if loading
  if (loading) {
    return (
      <Badge variant="outline" className="gap-1">
        <Loader2 className="h-3 w-3 animate-spin" />
        <span className="text-xs">Checking match...</span>
      </Badge>
    )
  }

  // Don't render if no similarity data or score too low
  if (!similarity || similarity.similarity_score < 0.3) {
    return null
  }

  const percentage = Math.round(similarity.similarity_score * 100)
  const colorClass = getScoreColor(similarity.similarity_score)

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Badge
            className={`${colorClass} text-white cursor-pointer hover:shadow-lg transition-shadow gap-1.5 px-3 py-1.5`}
            onClick={() => setModalOpen(true)}
          >
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: 'loop',
              }}
            >
              <Sparkles className="h-3.5 w-3.5" />
            </motion.div>
            <span className="font-bold text-sm">{percentage}% Match</span>
          </Badge>
        </motion.div>
      </AnimatePresence>

      {/* Details Modal */}
      <SimilarityDetailsModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        similarity={similarity}
        profileUserId={profileUserId}
        currentUserId={currentUserId}
      />
    </>
  )
}
