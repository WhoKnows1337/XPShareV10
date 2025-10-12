'use client'

import { usePathname } from 'next/navigation'
import { Navbar } from './navbar'

export function ConditionalNavbar() {
  const pathname = usePathname()

  // Hide navbar on fullscreen routes
  const fullscreenRoutes = ['/newxp2', '/newxp2/success']
  const isFullscreen = fullscreenRoutes.some(route => pathname?.includes(route))

  if (isFullscreen) {
    return null
  }

  return <Navbar />
}
