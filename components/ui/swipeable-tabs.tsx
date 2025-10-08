'use client'

import { useState, useRef, useEffect, ReactNode } from 'react'
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion'
import { cn } from '@/lib/utils'

interface SwipeableTab {
  id: string
  label: string
  icon?: ReactNode
  content: ReactNode
}

interface SwipeableTabsProps {
  tabs: SwipeableTab[]
  activeTab: string
  onTabChange: (tabId: string) => void
  className?: string
}

export function SwipeableTabs({
  tabs,
  activeTab,
  onTabChange,
  className,
}: SwipeableTabsProps) {
  const [activeIndex, setActiveIndex] = useState(
    tabs.findIndex((tab) => tab.id === activeTab)
  )
  const containerRef = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const [containerWidth, setContainerWidth] = useState(0)

  // Update container width on mount and resize
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth)
      }
    }

    updateWidth()
    window.addEventListener('resize', updateWidth)
    return () => window.removeEventListener('resize', updateWidth)
  }, [])

  // Sync activeTab prop changes
  useEffect(() => {
    const newIndex = tabs.findIndex((tab) => tab.id === activeTab)
    if (newIndex !== -1 && newIndex !== activeIndex) {
      setActiveIndex(newIndex)
      x.set(-newIndex * containerWidth)
    }
  }, [activeTab, tabs, activeIndex, containerWidth, x])

  // Transform for drag constraints
  const xInput = [-containerWidth * (tabs.length - 1), 0]
  const xOutput = [0, containerWidth * (tabs.length - 1)]
  const dragX = useTransform(x, xInput, xOutput)

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const offset = info.offset.x
    const velocity = info.velocity.x

    let newIndex = activeIndex

    // Determine swipe direction based on offset and velocity
    if (Math.abs(offset) > containerWidth * 0.2 || Math.abs(velocity) > 500) {
      if (offset > 0 && activeIndex > 0) {
        // Swiped right - go to previous tab
        newIndex = activeIndex - 1
      } else if (offset < 0 && activeIndex < tabs.length - 1) {
        // Swiped left - go to next tab
        newIndex = activeIndex + 1
      }
    }

    setActiveIndex(newIndex)
    onTabChange(tabs[newIndex].id)
    x.set(-newIndex * containerWidth)
  }

  return (
    <div className={cn('w-full overflow-hidden', className)}>
      {/* Tab Headers */}
      <div className="flex border-b mb-4">
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveIndex(index)
              onTabChange(tab.id)
              x.set(-index * containerWidth)
            }}
            className={cn(
              'flex-1 py-3 px-4 text-sm font-medium transition-colors relative',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              activeIndex === index
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <div className="flex items-center justify-center gap-2">
              {tab.icon}
              <span>{tab.label}</span>
            </div>
            {activeIndex === index && (
              <motion.div
                layoutId="active-tab-indicator"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                initial={false}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Swipeable Content */}
      <div ref={containerRef} className="relative overflow-hidden touch-pan-y">
        <motion.div
          drag="x"
          dragConstraints={{
            left: -containerWidth * (tabs.length - 1),
            right: 0,
          }}
          dragElastic={0.1}
          onDragEnd={handleDragEnd}
          style={{ x }}
          className="flex"
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 30,
          }}
        >
          {tabs.map((tab) => (
            <div
              key={tab.id}
              className="w-full flex-shrink-0"
              style={{ width: containerWidth || '100%' }}
            >
              {tab.content}
            </div>
          ))}
        </motion.div>
      </div>

      {/* Swipe Indicator Dots */}
      <div className="flex justify-center gap-2 mt-4">
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveIndex(index)
              onTabChange(tab.id)
              x.set(-index * containerWidth)
            }}
            className={cn(
              'w-2 h-2 rounded-full transition-all',
              activeIndex === index
                ? 'bg-primary w-6'
                : 'bg-muted-foreground/30'
            )}
            aria-label={`Go to ${tab.label}`}
          />
        ))}
      </div>
    </div>
  )
}
