function SendIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#5B22DE"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
    </svg>
  )
}

function ChevronPurple() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M9 18l6-6-6-6"
        stroke="#5B22DE"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

type ExploreNearbyRowProps = {
  onExplore: () => void
}

export function ExploreNearbyRow({ onExplore }: ExploreNearbyRowProps) {
  return (
    <div className="mt-6 px-4 pb-8 pt-1">
      <button
        type="button"
        onClick={onExplore}
        className="flex w-full items-center gap-3 rounded-2xl border border-[#EEEEEE] bg-white px-4 py-3.5 text-left shadow-[0_1px_3px_rgba(0,0,0,0.06)] active:bg-[#FAFAFA]"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#5B22DE]/8">
          <SendIcon />
        </span>
        <span className="min-w-0 flex-1 text-sm font-medium leading-5 text-[#222222]">
          Explore nearby properties
        </span>
        <ChevronPurple />
      </button>
    </div>
  )
}
