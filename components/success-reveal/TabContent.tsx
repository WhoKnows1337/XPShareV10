'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { ReactNode } from 'react'

interface TabContentProps {
  activeTab: string
  tabId: string
  children: ReactNode
}

export function TabContent({ activeTab, tabId, children }: TabContentProps) {
  const isActive = activeTab === tabId

  return (
    <AnimatePresence mode="wait">
      {isActive && (
        <motion.div
          key={tabId}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="rounded-b-xl border border-t-0 border-white/10 bg-gradient-to-b from-white/5 to-transparent p-6 backdrop-blur-sm"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
