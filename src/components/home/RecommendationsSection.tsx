import type { Recommendation } from '../../data/homeMock'

export function RecommendationsSection({
  city,
  items,
}: {
  city: string
  items: Recommendation[]
}) {
  return (
    <section className="px-4 pb-28 pt-2">
      <div className="mb-1 flex items-start justify-between gap-3">
        <h2 className="text-[20px] font-bold leading-tight tracking-tight text-gray-900">
          Recommendations for you
        </h2>
        <button
          type="button"
          className="shrink-0 pt-0.5 text-[14px] font-semibold text-[#5B22DE]"
        >
          See All
        </button>
      </div>
      <p className="mb-4 text-[13px] leading-relaxed text-[#8B95A5]">
        Personalised property suggestions in {city}
      </p>

      <div
        className="-mx-1 flex gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {items.map((item) => (
          <article
            key={item.id}
            className="relative w-[200px] shrink-0 overflow-hidden rounded-2xl bg-[#EEF1F4] shadow-[0_4px_16px_rgba(0,0,0,0.06)]"
          >
            <div className="relative aspect-[3/4] w-full">
              <img
                src={item.image}
                alt=""
                className="h-full w-full object-cover"
                loading="lazy"
              />
              {item.showProgressBar ? (
                <div className="absolute left-3 right-3 top-3 h-0.5 rounded-full bg-white/90" />
              ) : null}
              {!item.imageOnly ? (
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/35 to-transparent px-3 pb-3 pt-12">
                  <p className="text-[15px] font-bold text-white">{item.name}</p>
                  <p className="mt-0.5 truncate text-[12px] text-white/90">
                    {item.location}
                  </p>
                  <p className="mt-1 text-[13px] font-bold text-white">
                    {item.price}
                  </p>
                </div>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
