'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';

export function AIAnalysisSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="grid grid-cols-1 lg:grid-cols-[70%,30%] gap-4"
    >
      {/* Left Column: Questions Skeleton (70%) */}
      <div className="space-y-4">
        {/* Required Questions Skeleton */}
        <div className="p-4 bg-glass-bg border border-glass-border rounded space-y-4">
          <Skeleton className="h-4 w-48" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Skeleton className="h-3 w-16" />
              <div className="grid grid-cols-2 gap-2">
                <Skeleton className="h-9 w-full" />
                <Skeleton className="h-9 w-full" />
              </div>
            </div>
            <div className="space-y-2">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-9 w-full" />
            </div>
          </div>

          <div className="space-y-2">
            <Skeleton className="h-3 w-16" />
            <div className="flex gap-2">
              <Skeleton className="h-7 w-20" />
              <Skeleton className="h-7 w-24" />
              <Skeleton className="h-7 w-20" />
              <Skeleton className="h-7 w-28" />
            </div>
          </div>
        </div>

        {/* Extra Questions Skeleton */}
        <div className="p-4 bg-glass-bg border border-glass-border rounded space-y-3">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-64" />
          <Skeleton className="h-8 w-32" />
        </div>

        {/* Navigation Buttons Skeleton */}
        <div className="flex items-center justify-between gap-4 pt-6">
          <Skeleton className="h-10 w-28" />
          <Skeleton className="h-10 w-28" />
        </div>
      </div>

      {/* Right Column: AI Analysis Sidebar Skeleton (30%) */}
      <div className="lg:sticky lg:top-4 lg:self-start">
        <div className="p-3 bg-glass-bg border border-glass-border rounded space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-glass-border">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-3" />
          </div>

          {/* Title */}
          <div className="space-y-1">
            <Skeleton className="h-2 w-12" />
            <Skeleton className="h-8 w-full" />
          </div>

          {/* Category */}
          <div className="space-y-1">
            <Skeleton className="h-2 w-16" />
            <Skeleton className="h-6 w-24" />
          </div>

          {/* Tags */}
          <div className="space-y-1">
            <Skeleton className="h-2 w-12" />
            <div className="flex flex-wrap gap-1">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-5 w-14" />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
