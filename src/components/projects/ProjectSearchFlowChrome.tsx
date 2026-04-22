import type { ReactNode } from 'react'

/** Very soft purple — full Project/SRP search header (toolbar + search row) */
export const projectSearchFlowHeaderBgClass =
  'bg-gradient-to-b from-[#F4F2FA] via-[#F0ECF8] to-[#E8E2F4]'

/** Padding wrapper for the search row only (background comes from parent header) */
export const projectSearchSoftPurpleBandClass = 'relative px-4 pb-3 pt-2'

function BackIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M15 18l-6-6 6-6" />
    </svg>
  )
}

function MapPinIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 21s7-4.35 7-10a7 7 0 10-14 0c0 5.65 7 10 7 10z" />
      <circle cx="12" cy="11" r="2.5" fill="currentColor" stroke="none" />
    </svg>
  )
}

function ChevronRightSmall() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#6A6A6A"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M9 18l6-6-6-6" />
    </svg>
  )
}

type ProjectSearchFlowChromeProps = {
  onBack: () => void
  locationLabel: string
  onLocationClick?: () => void
  /** Search row + overlays (e.g. suggestions) */
  children: ReactNode
}

/**
 * Common chrome: one very soft purple background for back + city + search.
 */
export function ProjectSearchFlowChrome({
  onBack,
  locationLabel,
  onLocationClick,
  children,
}: ProjectSearchFlowChromeProps) {
  return (
    <header
      className={['relative z-20', projectSearchFlowHeaderBgClass].join(' ')}
      style={{
        paddingTop: 'max(10px, env(safe-area-inset-top, 0px))',
      }}
    >
      <div className="flex items-center justify-between gap-2 px-2 pb-1.5 pt-1">
        <div className="flex min-w-0 items-center text-[#222222]">
          <button
            type="button"
            onClick={onBack}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full active:bg-black/[0.05]"
            aria-label="Back"
          >
            <BackIcon />
          </button>
          <h1 className="ml-2 shrink-0 text-lg font-semibold leading-6 tracking-normal text-[#222222]">
            Project
          </h1>
        </div>

        <button
          type="button"
          onClick={onLocationClick}
          className="flex max-w-[48%] shrink-0 items-center gap-1 rounded-xl py-2 pl-2 pr-1 text-[#5B22DE] active:bg-black/[0.04]"
        >
          <MapPinIcon />
          <span className="truncate text-sm font-medium leading-[1.125rem] text-[#222222]">
            {locationLabel}
          </span>
          <ChevronRightSmall />
        </button>
      </div>

      <div className={projectSearchSoftPurpleBandClass}>{children}</div>
    </header>
  )
}
