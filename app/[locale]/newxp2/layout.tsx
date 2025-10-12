import { ReactNode } from 'react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Neue Experience | XP Share',
  description: 'Teile deine außergewöhnliche Experience',
}

export default function NewXP2Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a1a] via-[#1a0a2e] to-[#0a0a1a] text-white overflow-x-hidden">
      {/* Fullscreen container */}
      <div className="relative w-full min-h-screen">
        {children}
      </div>
    </div>
  )
}
