'use client'

import { useRef } from 'react'
import Image from 'next/image'
import { motion, useScroll, useTransform, useSpring } from 'framer-motion'
import { cn } from '@/lib/utils'

interface HeroImageProps {
  src?: string
  alt: string
  blurDataURL?: string
  priority?: boolean
  /** Parallax intensity (0-1) */
  parallaxIntensity?: number
  /** Enable Ken Burns effect */
  kenBurns?: boolean
  /** Aspect ratio: '16:9' | '21:9' | '4:3' | 'square' */
  aspectRatio?: '16:9' | '21:9' | '4:3' | 'square'
  /** Category for placeholder gradient */
  category?: string
  className?: string
  children?: React.ReactNode // For floating elements like CategoryPill
}

const aspectRatioClasses = {
  '16:9': 'aspect-video',
  '21:9': 'aspect-[21/9]',
  '4:3': 'aspect-[4/3]',
  square: 'aspect-square',
}

export function HeroImage({
  src,
  alt,
  blurDataURL,
  priority = true,
  parallaxIntensity = 0.3,
  kenBurns = true,
  aspectRatio = '16:9',
  category = 'other',
  className,
  children,
}: HeroImageProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  // Parallax scroll effect
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  })

  // Calculate parallax movement
  const parallaxY = useTransform(
    scrollYProgress,
    [0, 1],
    [0, parallaxIntensity * 200]
  )
  const smoothY = useSpring(parallaxY, { stiffness: 100, damping: 30 })

  // Scale effect on scroll (subtle zoom out)
  const scale = useTransform(scrollYProgress, [0, 1], [1.1, 1])
  const smoothScale = useSpring(scale, { stiffness: 100, damping: 30 })

  // Opacity fade on scroll
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0.3])

  // If no src, show placeholder
  if (!src) {
    return (
      <div className={cn('relative', className)}>
        <HeroImagePlaceholder category={category} />
        {children && (
          <div className="absolute inset-0 flex items-end justify-center pb-6 px-4">
            {children}
          </div>
        )}
      </div>
    )
  }

  return (
    <motion.div
      ref={containerRef}
      className={cn(
        'relative w-full overflow-hidden bg-space-deep',
        aspectRatioClasses[aspectRatio],
        className
      )}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Main Image with Parallax */}
      <motion.div
        className="absolute inset-0"
        style={{
          y: smoothY,
          scale: smoothScale,
        }}
      >
        <motion.div
          className={cn('relative w-full h-full', kenBurns && 'animate-hero-ken-burns')}
          style={{ opacity }}
        >
          <Image
            src={src}
            alt={alt}
            fill
            priority={priority}
            placeholder={blurDataURL ? 'blur' : 'empty'}
            blurDataURL={blurDataURL}
            className="object-cover"
            sizes="100vw"
          />
        </motion.div>
      </motion.div>

      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-space-deep via-transparent to-transparent opacity-90" />
      <div className="absolute inset-0 bg-gradient-to-b from-space-deep/50 via-transparent to-transparent" />

      {/* Vignette Effect */}
      <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(0,0,0,0.5)]" />

      {/* Children (floating elements like CategoryPill) */}
      {children && (
        <div className="absolute inset-0 flex items-end justify-center pb-6 px-4">
          {children}
        </div>
      )}
    </motion.div>
  )
}

/**
 * Placeholder version for when there's no hero image
 */
export function HeroImagePlaceholder({
  category,
  className,
}: {
  category: string
  className?: string
}) {
  const categoryGradients: Record<string, string> = {
    ufo: 'from-blue-900 via-indigo-900 to-purple-900',
    paranormal: 'from-purple-900 via-violet-900 to-fuchsia-900',
    dreams: 'from-indigo-900 via-blue-900 to-cyan-900',
    psychedelic: 'from-pink-900 via-purple-900 to-indigo-900',
    spiritual: 'from-amber-900 via-orange-900 to-yellow-900',
    synchronicity: 'from-teal-900 via-cyan-900 to-blue-900',
    nde: 'from-slate-900 via-gray-800 to-zinc-900',
    other: 'from-gray-900 via-slate-900 to-zinc-900',
  }

  const gradient = categoryGradients[category] || categoryGradients.other

  return (
    <div
      className={cn(
        'relative w-full aspect-[21/9] md:aspect-video overflow-hidden',
        className
      )}
    >
      {/* Animated Gradient Background */}
      <motion.div
        className={cn(
          'absolute inset-0 bg-gradient-to-br',
          gradient,
          'animate-gradient-shift'
        )}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      />

      {/* Noise Texture Overlay */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.5'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Stars Effect */}
      <div className="absolute inset-0">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0.2, 0.8, 0.2],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-space-deep via-transparent to-transparent opacity-90" />
    </div>
  )
}

export default HeroImage
