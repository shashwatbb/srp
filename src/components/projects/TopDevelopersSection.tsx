import type { TopDeveloper } from '../../data/topDevelopersMock'
import { TOP_DEVELOPERS } from '../../data/topDevelopersMock'
import { DeveloperAvatar } from './DeveloperAvatar'

function StarIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="#5B22DE"
      aria-hidden
    >
      <path d="M12 2l2.9 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14l-5-4.87 7.1-1.01L12 2z" />
    </svg>
  )
}

function TopDevelopersSkeleton() {
  return (
    <div
      className="-mx-1 flex gap-3 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      style={{ WebkitOverflowScrolling: 'touch' }}
      aria-busy
      aria-label="Loading developers"
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="flex min-w-[156px] shrink-0 gap-2.5 rounded-2xl border border-[#EBEBEB] bg-[#F7F7F7] p-3"
        >
          <div className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-gray-200" />
          <div className="flex min-w-0 flex-1 flex-col justify-center gap-2 py-0.5">
            <div className="h-3.5 w-[70%] animate-pulse rounded-md bg-gray-200" />
            <div className="h-3 w-[45%] animate-pulse rounded-md bg-gray-100" />
          </div>
        </div>
      ))}
    </div>
  )
}

type TopDevelopersSectionProps = {
  city: string
  loading: boolean
  developers?: TopDeveloper[]
}

export function TopDevelopersSection({
  city,
  loading,
  developers = TOP_DEVELOPERS,
}: TopDevelopersSectionProps) {
  return (
    <section className="mt-6 pt-0">
      <div className="mb-3 flex items-center gap-2 px-4">
        <StarIcon className="shrink-0" />
        <h2 className="text-sm font-semibold leading-[1.125rem] tracking-normal text-[#222222]">
          Top developers
        </h2>
      </div>

      {loading ? (
        <TopDevelopersSkeleton />
      ) : (
        <div
          className="-mx-1 flex gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {developers.map((dev) => (
            <button
              key={`${city}-${dev.id}`}
              type="button"
              className="flex min-w-[156px] shrink-0 gap-2.5 rounded-2xl border border-[#EEEEEE] bg-white p-3 text-left shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition-shadow active:bg-[#FAFAFA]"
            >
              <DeveloperAvatar picsumId={dev.picsumId} name={dev.name} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold leading-[1.125rem] text-[#222222]">
                  {dev.name}
                </p>
                <p className="mt-0.5 text-xs font-normal leading-4 text-[#6A6A6A]">
                  {dev.projectCount} projects
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </section>
  )
}
