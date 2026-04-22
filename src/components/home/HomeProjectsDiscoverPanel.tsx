import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { developerAvatarUrl, PROJECTS_SEARCH_TOP_DEVELOPERS } from '../../data/topDevelopersMock'
import { getSrpListingsForCity } from '../../data/srpMock'
import { getTrendingProjectsForCity } from '../../data/trendingProjectsMock'
import {
  HOTSPOT_LOCALITY_STRIP,
  HotspotLocalityCard,
} from '../projects/HotspotLocalityShared'

type HomeProjectsDiscoverPanelProps = {
  city: string
  onOpenSrp: (ctx: { city: string; query?: string }) => void
}

const QUICK_FILTERS = [
  { id: 'price', label: 'Price' },
  { id: 'bhk', label: 'BHK' },
  { id: 'possession', label: 'Possession' },
  { id: 'developer', label: 'Developer' },
] as const

const BUDGET_BANDS = [
  { id: 'b1', label: 'Under 1 Cr', query: 'Projects under 1 Cr' },
  { id: 'b2', label: '1–2 Cr', query: 'Projects 1–2 Cr' },
  { id: 'b3', label: '2 Cr+', query: 'Projects 2 Cr and above' },
] as const

function HorizontalRow({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={[
        '-mx-1 flex gap-3 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={{ WebkitOverflowScrolling: 'touch' }}
    >
      {children}
    </div>
  )
}

function SectionFoot({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <div className="mt-3 px-1">
      <button
        type="button"
        onClick={onClick}
        className="text-xs font-semibold text-[#5B22DE] transition-opacity active:opacity-70"
      >
        {label}
      </button>
    </div>
  )
}

function ShimmerBlock({ className }: { className: string }) {
  return (
    <div className={['relative overflow-hidden rounded-xl bg-[#E8E4DF]', className].join(' ')}>
      <div className="srp-skeleton-shimmer absolute inset-y-0 left-0 w-2/3 bg-gradient-to-r from-transparent via-white/45 to-transparent opacity-90" />
    </div>
  )
}

function HomeProjectsDiscoverSkeleton() {
  return (
    <div className="rounded-t-[22px] bg-[#F8F5F1] px-3 pb-28 pt-3">
      <ShimmerBlock className="mb-5 h-[72px] w-full rounded-2xl" />
      <ShimmerBlock className="mb-6 h-[200px] w-full rounded-2xl" />
      <ShimmerBlock className="mb-6 h-[180px] w-full rounded-2xl" />
      <ShimmerBlock className="mb-6 h-[160px] w-full rounded-2xl" />
      <ShimmerBlock className="h-[140px] w-full rounded-2xl" />
    </div>
  )
}

function LandingProjectCard({
  name,
  locality,
  price,
  imageUrl,
  onView,
}: {
  name: string
  locality: string
  price: string
  imageUrl: string
  onView: () => void
}) {
  return (
    <button
      type="button"
      onClick={onView}
      className="flex w-[158px] shrink-0 flex-col overflow-hidden rounded-xl border border-[#E6E6E6] bg-white text-left shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-colors active:scale-[0.99] hover:border-[#D8D8D8]"
    >
      <div className="relative h-[100px] w-full shrink-0 bg-[#EEE]">
        <img
          src={imageUrl}
          alt=""
          className="h-full w-full object-cover"
          width={316}
          height={200}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
        />
      </div>
      <div className="flex flex-1 flex-col p-2.5">
        <p className="line-clamp-2 text-[12px] font-semibold leading-tight text-[#222222]">{name}</p>
        <p className="mt-1 line-clamp-1 text-[10px] leading-4 text-[#6A6A6A]">{locality}</p>
        <p className="mt-1.5 text-[11px] font-semibold text-[#5B22DE]">{price}</p>
        <span className="mt-2 text-[10px] font-semibold text-[#222222]">View project</span>
      </div>
    </button>
  )
}

/** Projects discovery feed — sits below home search / recent searches only */
export function HomeProjectsDiscoverPanel({
  city,
  onOpenSrp,
}: HomeProjectsDiscoverPanelProps) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const ms = 320 + Math.floor(Math.random() * 160)
    const t = window.setTimeout(() => setReady(true), ms)
    return () => window.clearTimeout(t)
  }, [])

  const listings = useMemo(() => getSrpListingsForCity(city), [city])
  const newProjects = useMemo(() => listings.filter((l) => l.upcoming).slice(0, 8), [listings])
  const readyMove = useMemo(
    () => listings.filter((l) => !l.upcoming).slice(0, 8),
    [listings],
  )
  const trending = useMemo(() => getTrendingProjectsForCity(city), [city])

  if (!ready) {
    return <HomeProjectsDiscoverSkeleton />
  }

  const open = (query: string) => onOpenSrp({ city, query })

  return (
    <div className="rounded-t-[22px] bg-[#F8F5F1] px-3 pb-28 pt-2">
      <section className="mb-6 rounded-2xl bg-white/55 px-3 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]">
        <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-[#9CA3AF]">
          Quick filters
        </p>
        <HorizontalRow>
          {QUICK_FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => open(`${f.label} projects in ${city}`)}
              className="shrink-0 rounded-full border border-[#E5E1DC] bg-white px-3 py-1.5 text-xs font-medium text-[#374151] shadow-sm active:bg-[#F6F4F1]"
            >
              {f.label}
            </button>
          ))}
        </HorizontalRow>
      </section>

      <section className="mb-6">
        <div className="mb-3 px-1">
          <h2 className="text-[15px] font-semibold leading-tight text-[#1F2937]">City hotspots</h2>
        </div>
        <HorizontalRow className="items-stretch">
          {HOTSPOT_LOCALITY_STRIP.map((item) => (
            <HotspotLocalityCard
              key={item.id}
              item={item}
              onViewProjects={() => open(`${item.title} projects`)}
            />
          ))}
        </HorizontalRow>
        <SectionFoot label="View all hotspots" onClick={() => open('City hotspots')} />
      </section>

      <section className="mb-6 rounded-2xl bg-white/45 px-2 py-4">
        <h2 className="mb-3 px-2 text-[15px] font-semibold leading-tight text-[#1F2937]">
          New projects
        </h2>
        <HorizontalRow>
          {newProjects.map((l) => (
            <LandingProjectCard
              key={l.id}
              name={l.projectName}
              locality={l.locationLine}
              price={l.price}
              imageUrl={l.imageMain}
              onView={() => open(l.projectName)}
            />
          ))}
        </HorizontalRow>
        <SectionFoot label="View all new projects" onClick={() => open('New projects')} />
      </section>

      <section className="mb-6">
        <h2 className="mb-1 px-1 text-[15px] font-semibold leading-tight text-[#1F2937]">
          Trending in your city
        </h2>
        <p className="mb-3 px-1 text-[11px] leading-4 text-[#6B7280]">
          Strong clicks and shortlist activity this week
        </p>
        <HorizontalRow>
          {trending.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => open(p.name)}
              className="flex w-[168px] shrink-0 flex-col overflow-hidden rounded-xl border border-[#E8E4E0] bg-white text-left shadow-sm active:scale-[0.99]"
            >
              <div className="relative h-[96px] w-full shrink-0 bg-[#EEE]">
                <img
                  src={p.imageUrl}
                  alt=""
                  className="h-full w-full object-cover"
                  width={336}
                  height={192}
                  loading="lazy"
                  decoding="async"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="p-2.5">
                <p className="line-clamp-2 text-[12px] font-semibold leading-tight text-[#222222]">
                  {p.name}
                </p>
                <p className="mt-1 line-clamp-1 text-[10px] text-[#6A6A6A]">{p.location}</p>
                <p className="mt-1 text-[11px] font-semibold text-[#222222]">{p.priceLabel}</p>
                <p className="mt-1 text-[9px] font-medium text-[#9CA3AF]">{p.momentumLabel}</p>
              </div>
            </button>
          ))}
        </HorizontalRow>
        <SectionFoot label="View all trending" onClick={() => open('Trending projects')} />
      </section>

      <section className="mb-6 rounded-2xl bg-white/45 px-2 py-4">
        <h2 className="mb-1 px-2 text-[15px] font-semibold leading-tight text-[#1F2937]">
          Ready or near possession
        </h2>
        <p className="mb-3 px-2 text-[11px] leading-4 text-[#6B7280]">
          Options closer to move-in timelines
        </p>
        <HorizontalRow>
          {readyMove.map((l) => (
            <LandingProjectCard
              key={l.id}
              name={l.projectName}
              locality={l.locationLine}
              price={l.price}
              imageUrl={l.imageMain}
              onView={() => open(`${l.projectName} ready possession`)}
            />
          ))}
        </HorizontalRow>
        <SectionFoot label="View all ready homes" onClick={() => open('Ready to move projects')} />
      </section>

      <section className="mb-6">
        <h2 className="mb-3 px-1 text-[15px] font-semibold leading-tight text-[#1F2937]">
          Browse by budget
        </h2>
        <HorizontalRow>
          {BUDGET_BANDS.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => open(b.query)}
              className="flex min-w-[132px] shrink-0 flex-col rounded-xl border border-[#E5E1DC] bg-white px-4 py-3 text-left shadow-sm active:bg-[#FAFAFA]"
            >
              <span className="text-xs font-semibold text-[#222222]">{b.label}</span>
              <span className="mt-1 text-[10px] font-normal text-[#6B7280]">Explore in {city}</span>
            </button>
          ))}
        </HorizontalRow>
      </section>

      <section className="mb-4 rounded-2xl bg-white/55 px-2 py-4">
        <h2 className="mb-3 px-2 text-[15px] font-semibold leading-tight text-[#1F2937]">
          Developer spotlight
        </h2>
        <HorizontalRow>
          {PROJECTS_SEARCH_TOP_DEVELOPERS.map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => open(`Developer: ${d.name}`)}
              className="flex w-[100px] shrink-0 flex-col items-center gap-2 rounded-xl border border-transparent py-2 text-center active:opacity-80"
            >
              <img
                src={developerAvatarUrl(d.picsumId, 96)}
                alt=""
                width={48}
                height={48}
                className="h-12 w-12 rounded-full border border-[#E8E4E0] object-cover shadow-sm"
                loading="lazy"
                decoding="async"
                referrerPolicy="no-referrer"
              />
              <span className="line-clamp-2 px-0.5 text-[10px] font-semibold leading-tight text-[#374151]">
                {d.name}
              </span>
            </button>
          ))}
        </HorizontalRow>
        <SectionFoot label="View all developers" onClick={() => open('Top developers')} />
      </section>
    </div>
  )
}
