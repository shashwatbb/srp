function UserAvatar() {
  return (
    <div
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#F2F4F7]"
      aria-hidden
    >
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#6A6A6A"
        strokeWidth="1.8"
        strokeLinecap="round"
      >
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    </div>
  )
}

function ChevronDown({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  )
}

export function HomeHeader({ userName }: { userName: string }) {
  return (
    <header className="flex items-center justify-between px-4 pb-2 pt-[max(12px,env(safe-area-inset-top))]">
      <button
        type="button"
        className="flex min-w-0 items-center gap-2.5 rounded-lg active:bg-black/[0.03]"
      >
        <UserAvatar />
        <span className="flex items-center gap-0.5 text-[17px] font-bold tracking-tight text-gray-900">
          Hi {userName}!
          <ChevronDown className="text-gray-500" />
        </span>
      </button>

      <button
        type="button"
        className="flex shrink-0 items-center gap-2 rounded-2xl bg-[#F2F4F7] px-3.5 py-2.5 active:bg-[#EAEDF2]"
      >
        <span className="text-[13px] font-semibold text-gray-800">
          Post Property
        </span>
        <span className="rounded-full bg-[#F48FB1] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
          FREE
        </span>
      </button>
    </header>
  )
}
