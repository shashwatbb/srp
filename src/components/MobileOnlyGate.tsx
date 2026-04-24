import type { ReactNode } from 'react'
import mobileOnlyMascot from '../assets/mobile-only-mascot.png'

/** Full-viewport shell for the app on supported (mobile) viewports only. */
export function MobileAppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh min-h-[100dvh] w-full bg-[#F6F8FB]">
      <div className="mx-auto min-h-dvh min-h-[100dvh] w-full max-w-[430px] shadow-[0_0_0_1px_rgba(0,0,0,0.04)]">
        {children}
      </div>
    </div>
  )
}

/**
 * Shown on viewports ≥768px. Deliberate product state — not an error page.
 */
export function MobileOnlyMessage() {
  return (
    <div
      className="relative flex min-h-dvh min-h-[100dvh] w-full items-center justify-center overflow-x-hidden px-10 py-24 sm:px-12"
      style={{
        backgroundColor: '#f4f4f5',
        backgroundImage: [
          'linear-gradient(rgba(15, 23, 42, 0.038) 1px, transparent 1px)',
          'linear-gradient(90deg, rgba(15, 23, 42, 0.038) 1px, transparent 1px)',
        ].join(', '),
        backgroundSize: '40px 40px',
        backgroundPosition: 'center top',
      }}
    >
      <main className="mobile-only-reveal flex w-full max-w-sm flex-col items-center text-center">
        <img
          src={mobileOnlyMascot}
          alt=""
          width={140}
          height={140}
          className="mb-6 h-[140px] w-[140px] max-h-[140px] max-w-[140px] shrink-0 object-contain select-none"
          draggable={false}
          decoding="async"
          fetchPriority="high"
          aria-hidden
        />
        <p className="text-balance text-2xl font-medium leading-snug tracking-[-0.02em] text-slate-800 sm:text-[1.625rem]">
          Only for mobile, bruh x
        </p>
        <p className="mt-5 text-[15px] font-medium leading-snug tracking-tight text-slate-600">
          Shortcut: Command + Option + i
        </p>
      </main>
    </div>
  )
}
