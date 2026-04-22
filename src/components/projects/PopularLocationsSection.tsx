import { getTrendingForCity } from '../../data/trendingLocationsMock'

function ArrowUp({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="10"
      height="10"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 19V5M5 12l7-7 7 7" />
    </svg>
  )
}

function ArrowDown({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="10"
      height="10"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 5v14M19 12l-7 7-7-7" />
    </svg>
  )
}

function LocationPinAvatar() {
  return (
    <div
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F2F4F7]"
      aria-hidden
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#6A6A6A"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 21s7-4.35 7-10a7 7 0 10-14 0c0 5.65 7 10 7 10z" />
        <circle cx="12" cy="11" r="2.2" fill="#6A6A6A" stroke="none" />
      </svg>
    </div>
  )
}

function PopularLocationsSkeleton() {
  return (
    <div
      className="-mx-1 flex gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      style={{ WebkitOverflowScrolling: 'touch' }}
      aria-busy
      aria-label="Loading popular locations"
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="flex min-w-[200px] shrink-0 gap-3 rounded-xl border border-[#EBEBEB] bg-[#F7F7F7] p-3"
        >
          <div className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-gray-200" />
          <div className="flex min-w-0 flex-1 flex-col justify-center gap-1.5 py-0.5">
            <div className="h-3.5 w-[72%] animate-pulse rounded-md bg-gray-200" />
            <div className="h-3 w-[45%] animate-pulse rounded-md bg-gray-100" />
            <div className="h-3 w-[38%] animate-pulse rounded-md bg-gray-100" />
          </div>
        </div>
      ))}
    </div>
  )
}

type PopularLocationsSectionProps = {
  city: string
  loading: boolean
}

export function PopularLocationsSection({
  city,
  loading,
}: PopularLocationsSectionProps) {
  const items = getTrendingForCity(city)

  return (
    <section className="mt-6">
      <div className="mb-3 px-4">
        <h2 className="text-sm font-semibold leading-[1.125rem] tracking-normal text-[#222222]">
          Popular locations
        </h2>
      </div>

      {loading ? (
        <PopularLocationsSkeleton />
      ) : (
        <div
          className="-mx-1 flex gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          style={{ WebkitOverflowScrolling: 'touch' }}
          role="list"
          aria-label="Popular areas"
        >
          {items.map((loc) => {
            const up = loc.changePercent >= 0
            const pct = `${loc.changePercent > 0 ? '+' : ''}${loc.changePercent.toFixed(1)}%`
            return (
              <div
                key={`${city}-${loc.id}`}
                role="listitem"
                className="flex min-w-[200px] shrink-0 gap-3 rounded-xl border border-[#DDDDDD] bg-white p-3 shadow-[0_1px_2px_rgba(0,0,0,0.08)]"
              >
                <LocationPinAvatar />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold leading-[1.125rem] text-[#222222]">
                    {loc.name}
                  </p>
                  <p className="mt-0.5 text-xs font-normal leading-4 text-[#6A6A6A]">
                    {loc.propertyCount.toLocaleString('en-IN')} projects
                  </p>
                  <p
                    className={[
                      'mt-1 inline-flex items-center gap-0.5 text-xs font-medium tabular-nums leading-4',
                      up ? 'text-[#038026]' : 'text-[#C13515]',
                    ].join(' ')}
                  >
                    {up ? (
                      <ArrowUp className="text-[#038026]" />
                    ) : (
                      <ArrowDown className="text-[#C13515]" />
                    )}
                    {pct}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
