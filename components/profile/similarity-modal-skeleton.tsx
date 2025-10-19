/**
 * Similarity Modal Skeleton Loader
 *
 * Fancy skeleton loader for the similarity details modal
 * Shown while shared experiences are loading
 */

import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { motion } from 'framer-motion'

export function SimilarityModalSkeleton() {
  return (
    <div className="space-y-6 py-8">
      {/* Score Skeleton */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <Skeleton className="h-10 w-20 mb-2" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
          <Skeleton className="h-3 w-full" />
        </CardContent>
      </Card>

      {/* Categories Skeleton */}
      <Card>
        <CardContent className="pt-6">
          <Skeleton className="h-5 w-48 mb-3" />
          <div className="flex flex-wrap gap-2">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.1 }}
              >
                <Skeleton className="h-8 w-24" />
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Experiences Skeleton */}
      <Card>
        <CardContent className="pt-6">
          <Skeleton className="h-5 w-40 mb-3" />
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="p-3 rounded-md bg-muted/50"
              >
                <Skeleton className="h-5 w-3/4 mb-2" />
                <div className="flex gap-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Actions Skeleton */}
      <div className="flex flex-col gap-3">
        <Skeleton className="h-11 w-full" />
        <Skeleton className="h-11 w-full" />
      </div>
    </div>
  )
}
