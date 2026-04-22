import { getNewLaunchesForCity } from '../../data/newLaunchesMock'

/** Slightly wider than popular homes row cards */
const CARD_SHELL =
  'w-[min(272px,84vw)] shrink-0 overflow-hidden rounded-[16px] border border-[#DDDDDD] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.08)]'

function ChevronRightLarge() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#222222"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M9 18l6-6-6-6" />
    </svg>
  )
}

function MapPin({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}

function NewLaunchesSkeleton() {
  return (
    <div
      className="-mx-1 flex gap-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      style={{ WebkitOverflowScrolling: 'touch' }}
      aria-busy
      aria-label="Loading new launches"
    >
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className={`${CARD_SHELL} border-gray-100 bg-[#FAFBFC]`}
        >
          <div className="aspect-[4/3] animate-pulse bg-gray-200" />
          <div className="space-y-2 p-3.5">
            <div className="h-4 w-4/5 animate-pulse rounded bg-gray-200" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-gray-100" />
            <div className="h-3.5 w-2/3 animate-pulse rounded bg-gray-200" />
            <div className="h-3 w-full animate-pulse rounded bg-gray-100" />
            <div className="mt-3 flex gap-2">
              <div className="h-9 flex-1 animate-pulse rounded-lg bg-gray-200" />
              <div className="h-9 flex-1 animate-pulse rounded-lg bg-gray-100" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

type NewLaunchesSectionProps = {
  city: string
  loading: boolean
  onSeeAll?: () => void
  onView?: (id: string) => void
  onContact?: (id: string) => void
}

export function NewLaunchesSection({
  city,
  loading,
  onSeeAll,
  onView,
  onContact,
}: NewLaunchesSectionProps) {
  const items = getNewLaunchesForCity(city)

  return (
    <section className="mt-6 border-t border-[#EBEBEB] pt-6">
      <div className="mb-3 flex items-center justify-between gap-3 px-4">
        <h2 className="min-w-0 truncate text-sm font-semibold leading-[1.125rem] tracking-normal text-[#222222]">
          New launches
        </h2>
        <button
          type="button"
          onClick={onSeeAll}
          className="shrink-0 text-sm font-medium leading-[1.125rem] text-[#222222] underline decoration-[#222222] underline-offset-2 active:opacity-70"
        >
          See all
        </button>
      </div>

      {loading ? (
        <NewLaunchesSkeleton />
      ) : (
        <div
          className="-mx-1 flex gap-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {items.map((launch) => (
            <article
              key={launch.id}
              className={`flex flex-col ${CARD_SHELL}`}
            >
              <div className="relative aspect-[4/3] bg-gray-100">
                <img
                  src={launch.imageUrl}
                  alt=""
                  className="h-full w-full object-cover"
                  width={720}
                  height={540}
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div className="flex flex-1 flex-col gap-2 px-4 pb-4 pt-3">
                <h3 className="line-clamp-2 text-base font-semibold leading-5 text-[#222222]">
                  {launch.name}
                </h3>
                <p className="text-sm font-normal leading-5 text-[#6A6A6A]">
                  {launch.bhkOptions}
                </p>
                <p className="text-sm font-semibold leading-5 text-[#222222]">
                  {launch.priceLabel}
                </p>
                <p className="flex items-start gap-1.5 text-sm font-normal leading-5 text-[#6A6A6A]">
                  <MapPin className="mt-0.5 shrink-0 text-[#B0B0B0]" />
                  <span className="min-w-0">{launch.location}</span>
                </p>
                <div className="mt-1 flex gap-2">
                  <button
                    type="button"
                    onClick={() => onView?.(launch.id)}
                    className="min-h-9 flex-1 rounded-lg bg-[#5B22DE] px-3 py-2 text-center text-sm font-semibold leading-5 text-white active:bg-[#4C1BB8]"
                  >
                    View
                  </button>
                  <button
                    type="button"
                    onClick={() => onContact?.(launch.id)}
                    className="min-h-9 flex-1 rounded-lg border border-[#222222] bg-white px-3 py-2 text-center text-sm font-semibold leading-5 text-[#222222] active:bg-[#F7F7F7]"
                  >
                    Contact
                  </button>
                </div>
              </div>
            </article>
          ))}

          <button
            type="button"
            onClick={onSeeAll}
            className={`flex flex-col text-left ${CARD_SHELL} border-[#DDDDDD] bg-[#F7F7F7] active:bg-[#EBEBEB]`}
          >
            <div className="relative flex aspect-[4/3] items-center justify-center bg-[#EBEBEB]">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,0.08)] ring-1 ring-[#DDDDDD]">
                <ChevronRightLarge />
              </div>
            </div>
            <div className="flex flex-1 flex-col justify-center px-4 pb-4 pt-3">
              <span className="text-sm font-semibold leading-[1.125rem] text-[#222222]">
                See all
              </span>
              <span className="mt-1 text-xs font-normal leading-4 text-[#6A6A6A]">
                New launches in {city}
              </span>
            </div>
          </button>
        </div>
      )}
    </section>
  )
}
