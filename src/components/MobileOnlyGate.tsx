import type { ReactNode } from 'react'

export function MobileAppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-[#E4E7EC]">
      <div className="relative mx-auto min-h-dvh w-full max-w-[430px] bg-[#F6F8FB] shadow-[0_0_0_1px_rgba(0,0,0,0.04)] md:my-0 md:min-h-dvh md:shadow-[0_12px_48px_rgba(0,0,0,0.08)]">
        {children}
      </div>
    </div>
  )
}

/** Kept for API compatibility; app renders in a centered phone-width column on desktop too */
export function DesktopBlockedScreen() {
  return null
}
