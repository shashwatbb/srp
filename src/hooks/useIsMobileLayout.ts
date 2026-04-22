import { useEffect, useState } from 'react'

/** Viewport width &lt; Tailwind `md` (768px): phone / small mobile layout. */
const QUERY = '(max-width: 767px)'

function getInitialMobile(): boolean {
  if (typeof window === 'undefined') return true
  return window.matchMedia(QUERY).matches
}

/**
 * True when the layout should show the mobile app (narrow viewport).
 * Updates on resize and when crossing the breakpoint.
 */
export function useIsMobileLayout(): boolean {
  const [isMobile, setIsMobile] = useState(getInitialMobile)

  useEffect(() => {
    const mq = window.matchMedia(QUERY)
    const sync = () => setIsMobile(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  return isMobile
}
