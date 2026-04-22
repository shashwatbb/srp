import type { RecentSearch } from '../../data/homeMock'

function ChevronDownSmall() {
  return (
    <svg
      width="14"
      height="14"
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

function SearchBtnIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="white"
      strokeWidth="2.2"
      strokeLinecap="round"
      aria-hidden
    >
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-4.3-4.3" />
    </svg>
  )
}

function ClockIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#9CA3AF"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  )
}

function MiniSearchIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#9CA3AF"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden
    >
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-4.3-4.3" />
    </svg>
  )
}

export function SearchSection({
  city,
  recent,
  onOpenProjectSearch,
}: {
  city: string
  recent: RecentSearch[]
  /** When set, tapping the search field or button opens project search (Projects page) */
  onOpenProjectSearch?: () => void
}) {
  const activateSearch = () => {
    onOpenProjectSearch?.()
  }

  return (
    <section className="px-4 pb-2">
      <div className="rounded-[18px] bg-white p-4 shadow-[0_4px_24px_rgba(0,0,0,0.07)]">
        <button
          type="button"
          className="mb-3 flex items-center gap-1 text-left text-[15px] text-gray-600 active:opacity-80"
        >
          <span>Searching in </span>
          <span className="font-bold text-gray-900">{city}</span>
          <ChevronDownSmall />
        </button>

        <div className="relative mb-5">
          <input
            type="search"
            readOnly
            placeholder="Search city, locality, landmark..."
            onClick={activateSearch}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') activateSearch()
            }}
            className={[
              'h-[52px] w-full rounded-2xl border border-[#E8EBF0] bg-white pl-4 pr-[58px] text-[15px] font-normal text-gray-900 placeholder:text-[#A8B0BC] outline-none',
              onOpenProjectSearch ? 'cursor-pointer' : '',
            ].join(' ')}
          />
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              activateSearch()
            }}
            className="absolute right-1.5 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-xl bg-[#5B22DE] active:bg-[#4C1BB8]"
            aria-label="Search"
          >
            <SearchBtnIcon />
          </button>
        </div>

        <div className="mb-1 flex items-center gap-2 text-[13px] font-medium text-[#8B95A5]">
          <ClockIcon />
          <span>Recent searches</span>
        </div>

        <div
          className="-mx-1 flex gap-3 overflow-x-auto pb-1 pt-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {recent.map((item) => (
            <button
              key={item.id}
              type="button"
              className="flex min-w-[220px] shrink-0 gap-3 rounded-2xl border border-[#EEF1F4] bg-white p-3 text-left shadow-[0_1px_4px_rgba(0,0,0,0.03)] active:bg-[#FAFBFC]"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#F5F7FA]">
                <MiniSearchIcon />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-semibold leading-snug text-gray-900">
                  {item.title}
                </p>
                <p className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[12px] leading-snug">
                  <span className="font-semibold text-[#E91E8C]">
                    {item.newLabel}
                  </span>
                  <span className="text-[#8B95A5]">{item.locality}</span>
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}

export function ExploreLocalityLink() {
  return (
    <p className="px-4 py-4 text-center text-[14px] text-gray-600">
      Not sure about locality?{' '}
      <button
        type="button"
        className="font-bold text-gray-900 underline decoration-gray-900 underline-offset-2"
      >
        Explore options &gt;
      </button>
    </p>
  )
}
