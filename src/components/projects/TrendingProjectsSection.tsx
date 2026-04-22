import { getTrendingProjectsForCity } from '../../data/trendingProjectsMock'

/** Vertical cards — rounded, soft shadow, brand CTA (distinct from New launches row). */
const CARD_SHELL =
  'w-[min(276px,84vw)] shrink-0 overflow-hidden rounded-[22px] border border-[#E6E6E6] bg-white shadow-[0_4px_20px_rgba(0,0,0,0.06)]'

function ChevronRight({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
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

function TrendingProjectsSkeleton() {
  return (
    <div
      className="-mx-1 flex gap-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      style={{ WebkitOverflowScrolling: 'touch' }}
      aria-busy
      aria-label="Loading trending projects"
    >
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className={`${CARD_SHELL} border-[#F0F0F0] bg-[#FAFAFA]`}
        >
          <div className="aspect-[5/4] animate-pulse bg-[#EBEBEB]" />
          <div className="space-y-2.5 p-4">
            <div className="h-2.5 w-20 animate-pulse rounded-full bg-[#F0E8FF]" />
            <div className="h-4 w-[90%] animate-pulse rounded-lg bg-[#E8E8E8]" />
            <div className="h-3 w-2/3 animate-pulse rounded bg-[#EFEFEF]" />
            <div className="h-5 w-1/2 animate-pulse rounded-lg bg-[#E8E8E8]" />
            <div className="h-3 w-full animate-pulse rounded bg-[#EFEFEF]" />
            <div className="mt-2 h-12 animate-pulse rounded-2xl bg-[#DDD6FE]" />
          </div>
        </div>
      ))}
    </div>
  )
}

type TrendingProjectsSectionProps = {
  city: string
  loading: boolean
  onSeeAll?: () => void
  onView?: (id: string) => void
}

export function TrendingProjectsSection({
  city,
  loading,
  onSeeAll,
  onView,
}: TrendingProjectsSectionProps) {
  const items = getTrendingProjectsForCity(city)

  return (
    <section className="mt-6 border-t border-[#EBEBEB] pt-6">
      <div className="mb-3 flex items-center justify-between gap-3 px-4">
        <h2 className="min-w-0 truncate text-sm font-semibold leading-[1.125rem] tracking-normal text-[#222222]">
          Trending projects
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
        <TrendingProjectsSkeleton />
      ) : (
        <div
          className="-mx-1 flex gap-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {items.map((project) => (
            <article
              key={project.id}
              className={`flex flex-col ${CARD_SHELL}`}
            >
              <div className="relative aspect-[5/4] bg-[#F0F0F0]">
                <img
                  src={project.imageUrl}
                  alt=""
                  className="h-full w-full object-cover"
                  width={552}
                  height={442}
                  loading="lazy"
                  decoding="async"
                  referrerPolicy="no-referrer"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-black/10" />
                <div className="absolute left-3 top-3 flex max-w-[calc(100%-1.5rem)] flex-col gap-1">
                  <span className="w-fit rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#5B22DE] shadow-sm ring-1 ring-black/[0.06] backdrop-blur-sm">
                    Trending
                  </span>
                  <span className="w-fit max-w-full truncate rounded-full bg-black/45 px-2.5 py-1 text-[11px] font-medium leading-4 text-white backdrop-blur-sm">
                    {project.momentumLabel}
                  </span>
                </div>
              </div>

              <div className="flex flex-1 flex-col gap-2 p-4 pt-3">
                <h3 className="line-clamp-2 text-[15px] font-semibold leading-snug tracking-tight text-[#222222]">
                  {project.name}
                </h3>
                <p className="text-xs font-normal leading-4 text-[#6A6A6A]">
                  <span className="font-medium text-[#222222]">
                    {project.developer}
                  </span>
                  <span className="text-[#C4C4C4]" aria-hidden>
                    {' · '}
                  </span>
                  {project.configuration}
                </p>
                <p className="text-base font-semibold leading-6 tracking-tight text-[#222222]">
                  {project.priceLabel}
                </p>
                <p className="flex items-start gap-1.5 text-xs font-normal leading-4 text-[#6A6A6A]">
                  <MapPin className="mt-0.5 shrink-0 text-[#B0B0B0]" />
                  <span className="min-w-0 line-clamp-2">{project.location}</span>
                </p>

                <button
                  type="button"
                  onClick={() => onView?.(project.id)}
                  className="mt-2 w-full rounded-2xl bg-[#5B22DE] py-3.5 text-center text-sm font-semibold leading-5 text-white shadow-[0_2px_12px_rgba(91,34,222,0.35)] active:bg-[#4C1BB8] active:shadow-[0_1px_8px_rgba(91,34,222,0.25)]"
                >
                  View project
                </button>
              </div>
            </article>
          ))}

          <button
            type="button"
            onClick={onSeeAll}
            className={`flex min-h-0 flex-col text-left ${CARD_SHELL} border-2 border-dashed border-[#DDD5F0] bg-gradient-to-b from-[#FAF8FF] to-[#F3ECFF] shadow-none active:bg-[#F0E8FF]`}
          >
            <div className="relative flex aspect-[5/4] items-center justify-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-[0_4px_16px_rgba(91,34,222,0.15)] ring-1 ring-[#5B22DE]/10">
                <ChevronRight className="text-[#5B22DE]" />
              </div>
            </div>
            <div className="flex flex-1 flex-col justify-center p-4 pt-2">
              <span className="text-[15px] font-semibold leading-snug text-[#222222]">
                See all
              </span>
              <span className="mt-1 text-xs font-normal leading-4 text-[#6A6A6A]">
                Trending projects in {city}
              </span>
            </div>
          </button>
        </div>
      )}
    </section>
  )
}
