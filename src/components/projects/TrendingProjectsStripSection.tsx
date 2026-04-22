import { getTrendingStripForCity } from '../../data/projectSearchTrendingStripMock'

function BuildingIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#5B22DE"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M3 21h18M5 21V7l8-4v18M19 21V11l-6-2" />
      <path d="M9 9v.01M9 12v.01M9 15v.01M9 18v.01" />
    </svg>
  )
}

type TrendingProjectsStripSectionProps = {
  city: string
  onPickProject?: (query: string) => void
}

export function TrendingProjectsStripSection({
  city,
  onPickProject,
}: TrendingProjectsStripSectionProps) {
  const items = getTrendingStripForCity(city)

  return (
    <section className="mt-6">
      <div className="mb-3 flex items-center gap-2 px-4">
        <BuildingIcon className="shrink-0" />
        <h2 className="text-sm font-semibold leading-[1.125rem] text-[#222222]">Trending projects</h2>
      </div>

      <div
        className="-mx-1 flex gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {items.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => onPickProject?.(p.name)}
            className="flex min-w-[188px] max-w-[220px] shrink-0 flex-col rounded-2xl border border-[#EEEEEE] bg-white p-3.5 text-left shadow-[0_1px_3px_rgba(0,0,0,0.06)] active:bg-[#FAFAFA]"
          >
            <span className="line-clamp-1 text-sm font-semibold leading-5 text-[#222222]">{p.name}</span>
            <span className="mt-1 line-clamp-1 text-xs font-normal leading-4 text-[#6A6A6A]">{p.location}</span>
            <span className="mt-2 text-sm font-semibold leading-5 text-[#222222]">{p.pricePerSqft}</span>
          </button>
        ))}
      </div>
    </section>
  )
}
