import type { SrpRecoItem } from '../../data/srpMock'

type SrpRecommendationCarouselProps = {
  items: SrpRecoItem[]
  queryHint: string
}

/** Horizontal recommendations aligned with search intent */
export function SrpRecommendationCarousel({
  items,
  queryHint,
}: SrpRecommendationCarouselProps) {
  return (
    <section
      className="rounded-xl border border-[#E8E8E8] bg-[#FAFAFA] py-4 pl-4 shadow-[0_1px_3px_rgba(0,0,0,0.05)]"
      aria-label="Recommended projects"
    >
      <div className="mb-3 flex items-baseline justify-between gap-2 pr-4">
        <h3 className="text-sm font-semibold leading-5 text-[#222222]">You may also like</h3>
        {queryHint ? (
          <span className="line-clamp-1 max-w-[58%] text-right text-xs font-normal leading-4 text-[#9CA3AF]">
            For “{queryHint}”
          </span>
        ) : null}
      </div>
      <div
        className="-mx-0 flex gap-3 overflow-x-auto pb-1.5 pr-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            className="group flex w-[164px] shrink-0 flex-col overflow-hidden rounded-xl border border-[#E8E8E8] bg-white text-left shadow-[0_1px_4px_rgba(0,0,0,0.06)] transition-all duration-200 active:scale-[0.98] hover:border-[#D0D0D0] hover:shadow-md"
          >
            <div className="relative aspect-[4/3] overflow-hidden bg-[#EBEBEB]">
              <img
                src={item.imageUrl}
                alt=""
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                width={328}
                height={246}
                loading="lazy"
                decoding="async"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="p-3">
              <p className="line-clamp-2 text-[13px] font-semibold leading-[1.25] text-[#222222]">
                {item.title}
              </p>
              <p className="mt-1 line-clamp-1 text-xs leading-4 text-[#6A6A6A]">{item.subtitle}</p>
              <p className="mt-1.5 text-xs font-semibold leading-4 text-[#5B22DE]">{item.priceHint}</p>
            </div>
          </button>
        ))}
      </div>
    </section>
  )
}
