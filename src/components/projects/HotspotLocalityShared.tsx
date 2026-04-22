export type HotspotLocalityStripItem = {
  id: string
  title: string
  imageUrl: string
  line1: string
  line2: string
  badge: { kind: 'qual'; label: string } | null
}

export const HOTSPOT_LOCALITY_TILE_H = 'min-h-[292px]'

/** Curated Gurgaon localities — editorial copy only; no fabricated YoY stats */
export const HOTSPOT_LOCALITY_STRIP: HotspotLocalityStripItem[] = [
  {
    id: 'ymal-dex',
    title: 'Dwarka Expressway',
    imageUrl:
      'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=720&h=480&q=80',
    line1: 'Heavy new supply on a fast-growing stretch',
    line2: 'Connectivity-led demand and brisk price traction',
    badge: { kind: 'qual', label: 'Growing corridor' },
  },
  {
    id: 'ymal-gce',
    title: 'Golf Course Extension Road',
    imageUrl:
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=720&h=480&q=80',
    line1: 'Premium belt with strong daily-life and retail',
    line2: 'Office hubs nearby and a mature premium catchment',
    badge: { kind: 'qual', label: 'Premium hotspot' },
  },
  {
    id: 'ymal-sohna',
    title: 'Sohna Road',
    imageUrl:
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=720&h=480&q=80',
    line1: 'Broad project mix with steady buyer traction',
    line2: 'Metro access and apartment price lifts worth watching',
    badge: { kind: 'qual', label: 'High demand' },
  },
  {
    id: 'ymal-spr',
    title: 'Southern Peripheral Road',
    imageUrl:
      'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?auto=format&fit=crop&w=720&h=480&q=80',
    line1: 'Dense new launches on an emerging premium stretch',
    line2: 'Better links and residential momentum building',
    badge: { kind: 'qual', label: 'Growing corridor' },
  },
]

function PillTickIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="11"
      height="11"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <path
        d="M20 6L9 17l-5-5"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function HotspotLocalityCard({
  item,
  onViewProjects,
}: {
  item: HotspotLocalityStripItem
  onViewProjects: () => void
}) {
  return (
    <div
      className={[
        'flex w-[200px] shrink-0 flex-col overflow-hidden rounded-xl border border-[#D0D7E0] bg-[#F4F6FA] shadow-[0_1px_3px_rgba(0,0,0,0.05)]',
        HOTSPOT_LOCALITY_TILE_H,
      ].join(' ')}
    >
      <div className="relative h-[92px] w-full shrink-0 bg-[#E2E8F0]">
        <img
          src={item.imageUrl}
          alt=""
          className="h-full w-full object-cover"
          width={400}
          height={240}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
        />
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#F4F6FA]/90 via-transparent to-transparent"
          aria-hidden
        />
      </div>

      <div className="flex min-h-0 flex-1 flex-col px-3 pb-3 pt-2.5">
        <h4 className="text-[13px] font-semibold leading-tight tracking-tight text-[#1F2937]">
          {item.title}
        </h4>

        <ul className="mt-2.5 list-none space-y-2.5">
          <li className="flex gap-2.5">
            <span
              className="mt-[0.42em] h-1.5 w-1.5 shrink-0 rounded-full bg-[#5B22DE]"
              aria-hidden
            />
            <span className="min-w-0 flex-1 text-[11px] font-normal leading-[1.45] text-[#4B5563]">
              {item.line1}
            </span>
          </li>
          <li className="flex gap-2.5">
            <span
              className="mt-[0.42em] h-1.5 w-1.5 shrink-0 rounded-full border border-[#94A3B8] bg-white"
              aria-hidden
            />
            <span className="min-w-0 flex-1 text-[11px] font-normal leading-[1.45] text-[#64748B]">
              {item.line2}
            </span>
          </li>
        </ul>

        {item.badge ? (
          <span className="mt-3 inline-flex w-fit items-center gap-1 rounded-full border border-[#C5CED9] bg-white px-2 py-1 text-[9px] font-medium tracking-tight text-[#374151] shadow-[0_1px_0_rgba(0,0,0,0.04)]">
            <PillTickIcon className="shrink-0 text-[#0F766E]" />
            {item.badge.label}
          </span>
        ) : null}

        <button
          type="button"
          onClick={onViewProjects}
          className="mt-auto w-full rounded-lg bg-[#5B22DE] py-2 text-center text-[11px] font-semibold text-white shadow-[0_1px_3px_rgba(91,34,222,0.28)] transition-colors active:bg-[#4C1BB8]"
        >
          View Projects
        </button>
      </div>
    </div>
  )
}

export function HotspotLocalityCardSkeleton({ index }: { index: number }) {
  const delay = index * 70
  return (
    <div
      aria-hidden
      className={[
        'flex w-[200px] shrink-0 flex-col overflow-hidden rounded-xl border border-[#DDE2EA] bg-[#EEF1F5]',
        HOTSPOT_LOCALITY_TILE_H,
      ].join(' ')}
    >
      <div
        className="relative h-[92px] w-full shrink-0 overflow-hidden bg-[#D8DEE6]"
        style={{ animationDelay: `${delay}ms` }}
      >
        <div className="srp-skeleton-shimmer absolute inset-y-0 left-0 w-full bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-80" />
      </div>
      <div className="flex flex-1 flex-col p-3">
        <div
          className="relative h-3.5 w-[78%] overflow-hidden rounded-md bg-[#D8DEE6]"
          style={{ animationDelay: `${delay}ms` }}
        >
          <div className="srp-skeleton-shimmer absolute inset-y-0 left-0 w-full bg-gradient-to-r from-transparent via-white/45 to-transparent opacity-80" />
        </div>
        <div className="mt-3 space-y-2.5">
          <div className="flex gap-2">
            <div
              className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#C5CCD6]"
              style={{ animationDelay: `${delay}ms` }}
            />
            <div
              className="relative h-2.5 flex-1 overflow-hidden rounded bg-[#D8DEE6]"
              style={{ animationDelay: `${delay}ms` }}
            >
              <div className="srp-skeleton-shimmer absolute inset-y-0 left-0 w-full bg-gradient-to-r from-transparent via-white/45 to-transparent opacity-80" />
            </div>
          </div>
          <div className="flex gap-2">
            <div
              className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#C5CCD6]"
              style={{ animationDelay: `${delay}ms` }}
            />
            <div
              className="relative h-2.5 w-[92%] overflow-hidden rounded bg-[#D8DEE6]"
              style={{ animationDelay: `${delay}ms` }}
            >
              <div className="srp-skeleton-shimmer absolute inset-y-0 left-0 w-full bg-gradient-to-r from-transparent via-white/45 to-transparent opacity-80" />
            </div>
          </div>
        </div>
        <div
          className="relative mt-3 h-6 w-24 overflow-hidden rounded-full bg-[#D8DEE6]"
          style={{ animationDelay: `${delay}ms` }}
        >
          <div className="srp-skeleton-shimmer absolute inset-y-0 left-0 w-full bg-gradient-to-r from-transparent via-white/45 to-transparent opacity-80" />
        </div>
        <div
          className="relative mt-auto h-9 w-full overflow-hidden rounded-lg bg-[#D8DEE6]"
          style={{ animationDelay: `${delay}ms` }}
        >
          <div className="srp-skeleton-shimmer absolute inset-y-0 left-0 w-full bg-gradient-to-r from-transparent via-white/45 to-transparent opacity-80" />
        </div>
      </div>
    </div>
  )
}
