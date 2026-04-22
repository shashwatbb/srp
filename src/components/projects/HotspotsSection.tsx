import { getHotspotsForCity } from '../../data/hotspotsMock'

function FlameIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <path
        d="M12 2c0 0 4 5 4 9a4 4 0 01-8 0c0-1.5.5-3 1.5-4.5-.5 2-1.5 4.5-.5 6.5 2.5 0 4.5-2 4.5-4.5 0-4-2-7-2-7z"
        fill="#FB923C"
        stroke="#EA580C"
        strokeWidth="0.75"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ArrowUpTiny({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="10"
      height="10"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M12 4L4 14h5v6h6v-6h5L12 4z" />
    </svg>
  )
}

function ArrowDownTiny({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="10"
      height="10"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M12 20l8-10h-5V4h-6v6H4l8 10z" />
    </svg>
  )
}

type HotspotsSectionProps = {
  city: string
}

export function HotspotsSection({ city }: HotspotsSectionProps) {
  const items = getHotspotsForCity(city)

  return (
    <section className="mt-1">
      <div className="mb-3 flex items-center gap-2 px-4">
        <FlameIcon className="shrink-0" />
        <h2 className="text-sm font-semibold leading-[1.125rem] text-[#222222]">Hotspots</h2>
      </div>

      <div
        className="-mx-1 flex gap-3 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {items.map((h) => (
          <article
            key={h.id}
            className="flex min-w-[168px] max-w-[200px] shrink-0 flex-col rounded-2xl border border-[#EEEEEE] bg-white p-3.5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
          >
            <h3 className="line-clamp-1 text-sm font-semibold leading-5 text-[#222222]">{h.title}</h3>
            <p className="mt-1 line-clamp-2 text-xs font-normal leading-4 text-[#6A6A6A]">{h.subtitle}</p>
            <div
              className={[
                'mt-2.5 inline-flex w-fit items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold leading-4',
                h.positive
                  ? 'bg-[#DCFCE7] text-[#166534]'
                  : 'bg-[#FEE2E2] text-[#B91C1C]',
              ].join(' ')}
            >
              {h.positive ? (
                <ArrowUpTiny className="shrink-0" />
              ) : (
                <ArrowDownTiny className="shrink-0" />
              )}
              <span>{h.yoyPercent}% YoY</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
