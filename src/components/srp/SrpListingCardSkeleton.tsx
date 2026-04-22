import type { ReactNode } from 'react'

function ShimmerOverlay({ delayMs = 0 }: { delayMs?: number }) {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]"
      aria-hidden
    >
      <div
        className="srp-skeleton-shimmer absolute inset-y-0 left-0 w-2/3 bg-gradient-to-r from-transparent via-white/65 to-transparent opacity-90"
        style={{
          willChange: 'transform',
          animationDelay: delayMs ? `${delayMs}ms` : undefined,
        }}
      />
    </div>
  )
}

function SkeletonBlock({
  className,
  children,
  shimmerDelayMs = 0,
}: {
  className?: string
  children?: ReactNode
  shimmerDelayMs?: number
}) {
  return (
    <div
      className={['relative overflow-hidden bg-[#E8E8E8]', className].filter(Boolean).join(' ')}
    >
      {children}
      <ShimmerOverlay delayMs={shimmerDelayMs} />
    </div>
  )
}

type SrpListingCardSkeletonProps = {
  /** Stagger shimmer phase slightly per card */
  staggerIndex?: number
}

/** Lightweight placeholder — mirrors card layout without busy overlay chips */
export function SrpListingCardSkeleton({ staggerIndex = 0 }: SrpListingCardSkeletonProps) {
  const d = Math.min(staggerIndex * 60, 280)
  return (
    <article
      className="overflow-hidden rounded-2xl border border-[#DDDDDD] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.06)]"
      aria-hidden
    >
      <div className="flex gap-1.5 p-1.5">
        <SkeletonBlock className="relative min-w-0 flex-1 aspect-[4/3] rounded-xl" shimmerDelayMs={d} />
        <SkeletonBlock className="relative w-[30%] shrink-0 aspect-[3/4] rounded-xl" shimmerDelayMs={d} />
      </div>

      <div className="space-y-2 px-3 pb-3 pt-1">
        <SkeletonBlock className="h-3 w-[32%] rounded-md" shimmerDelayMs={d} />
        <SkeletonBlock className="h-4 w-[58%] max-w-[200px] rounded-md" shimmerDelayMs={d} />
        <SkeletonBlock className="h-5 w-24 rounded-md" shimmerDelayMs={d} />
        <SkeletonBlock className="h-3.5 w-[90%] max-w-[280px] rounded-md" shimmerDelayMs={d} />

        <div className="my-2.5 h-px bg-[#EBEBEB]" />

        <div className="flex items-center gap-2">
          <SkeletonBlock className="h-10 w-10 shrink-0 rounded-full" shimmerDelayMs={d} />
          <div className="min-w-0 flex-1 space-y-2">
            <SkeletonBlock className="h-3.5 w-[45%] max-w-[120px] rounded-md" shimmerDelayMs={d} />
            <SkeletonBlock className="h-3 w-20 rounded-md" shimmerDelayMs={d} />
          </div>
          <div className="flex shrink-0 gap-1.5">
            <SkeletonBlock className="h-10 w-[4.5rem] rounded-lg" shimmerDelayMs={d} />
            <SkeletonBlock className="h-10 w-10 rounded-lg" shimmerDelayMs={d} />
            <SkeletonBlock className="h-10 w-10 rounded-lg" shimmerDelayMs={d} />
          </div>
        </div>
      </div>
    </article>
  )
}
