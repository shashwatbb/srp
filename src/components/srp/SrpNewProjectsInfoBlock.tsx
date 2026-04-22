import buildingImg from '../../assets/new-projects-info-building.png'

const POINTS = [
  'Fresh inventory with newer amenities',
  'More choices in upcoming communities',
  'A chance to get in earlier on growing areas',
] as const

/** Contextual guidance when the New projects filter is on — not a listing card */
export function SrpNewProjectsInfoBlock() {
  return (
    <section
      className="rounded-2xl border border-[#E6E9EF] bg-[#F4F5F8] px-3.5 py-3 sm:px-4 sm:py-3.5"
      aria-labelledby="srp-new-projects-info-heading"
    >
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="min-w-0 flex-1">
          <h2
            id="srp-new-projects-info-heading"
            className="text-[13px] font-semibold leading-tight tracking-tight text-[#3D4552]"
          >
            Why explore new projects
          </h2>
          <ul className="mt-2 space-y-1 text-[11px] leading-snug text-[#5C6470] sm:text-[11.5px]">
            {POINTS.map((line) => (
              <li key={line} className="flex gap-2">
                <span
                  className="mt-[0.42em] h-1 w-1 shrink-0 rounded-full bg-[#B4BCC8]"
                  aria-hidden
                />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>
        <div
          className="pointer-events-none flex h-[76px] w-[68px] shrink-0 items-end justify-center sm:h-[84px] sm:w-[76px]"
          aria-hidden
        >
          <img
            src={buildingImg}
            alt=""
            width={152}
            height={180}
            className="max-h-[76px] w-auto max-w-full object-contain object-bottom select-none sm:max-h-[84px]"
            draggable={false}
          />
        </div>
      </div>
    </section>
  )
}
