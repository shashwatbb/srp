import { getPopularHomesForTrending } from '../../data/popularHomesMock'

const CARD_SHELL =
  'w-[min(240px,78vw)] shrink-0 overflow-hidden rounded-[16px] border border-[#DDDDDD] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.08)]'

function HeartOutline() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="white"
      strokeWidth="1.8"
      className="drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)]"
      aria-hidden
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  )
}

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

function PopularHomesSkeleton() {
  return (
    <div
      className="-mx-1 flex gap-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      style={{ WebkitOverflowScrolling: 'touch' }}
      aria-busy
      aria-label="Loading popular projects"
    >
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className={`${CARD_SHELL} border-gray-100 bg-[#FAFBFC]`}
        >
          <div className="aspect-[4/3] animate-pulse bg-gray-200" />
          <div className="space-y-2 p-3">
            <div className="h-3.5 w-3/4 animate-pulse rounded bg-gray-200" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-gray-100" />
          </div>
        </div>
      ))}
    </div>
  )
}

type PopularHomesSectionProps = {
  city: string
  trendingId: string | null
  loading: boolean
  onSeeAll?: () => void
}

export function PopularHomesSection({
  city,
  trendingId,
  loading,
  onSeeAll,
}: PopularHomesSectionProps) {
  const homes =
    trendingId != null ? getPopularHomesForTrending(trendingId) : []

  return (
    <section className="mt-6">
      <div className="mb-3 flex items-center justify-between gap-3 px-4">
        <h2 className="min-w-0 truncate text-sm font-semibold leading-[1.125rem] tracking-normal text-[#222222]">
          Popular projects
        </h2>
        {onSeeAll ? (
          <button
            type="button"
            onClick={onSeeAll}
            className="shrink-0 text-sm font-medium leading-[1.125rem] text-[#222222] underline decoration-[#222222] underline-offset-2 active:opacity-70"
          >
            See all
          </button>
        ) : null}
      </div>

      {loading || trendingId == null ? (
        <PopularHomesSkeleton />
      ) : (
        <div
          className="-mx-1 flex gap-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {homes.map((home) => (
            <article
              key={`${city}-${trendingId}-${home.id}`}
              className={`flex flex-col ${CARD_SHELL}`}
            >
              <div className="relative aspect-[4/3] bg-gray-100">
                <img
                  src={home.imageUrl}
                  alt=""
                  className="h-full w-full object-cover"
                  width={480}
                  height={360}
                  loading="lazy"
                  decoding="async"
                />
                {home.rera ? (
                  <span className="absolute left-2.5 top-2.5 rounded-full border border-[#DDDDDD] bg-white/95 px-2 py-0.5 text-[11px] font-semibold leading-[15px] text-[#222222] shadow-sm backdrop-blur-[2px]">
                    RERA
                  </span>
                ) : null}
                <button
                  type="button"
                  className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/20 backdrop-blur-[2px] active:bg-black/30"
                  aria-label="Save"
                >
                  <HeartOutline />
                </button>
              </div>
              <div className="flex flex-1 flex-col px-4 pb-4 pt-3">
                <h3 className="line-clamp-2 text-base font-semibold leading-5 text-[#222222]">
                  {home.title}
                </h3>
                <p className="mt-2 flex flex-wrap items-center gap-x-1.5 text-sm font-normal leading-5 text-[#6A6A6A]">
                  <span>{home.priceLabel}</span>
                  <span className="text-[#B0B0B0]" aria-hidden>
                    ·
                  </span>
                  <span className="inline-flex items-center gap-0.5 font-medium text-[#222222]">
                    <span className="text-[#222222]" aria-hidden>
                      ★
                    </span>
                    {home.rating.toFixed(1)}
                  </span>
                </p>
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
                Projects in this area
              </span>
            </div>
          </button>
        </div>
      )}
    </section>
  )
}
