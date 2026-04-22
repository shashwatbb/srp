import hotspotStarImg from '../../assets/hotspot-star.png'
import newProjectsTrendImg from '../../assets/new-projects-trend.png'

type CuteIconProps = {
  /** When false, icon is slightly muted (filter off) */
  active?: boolean
  className?: string
}

/** Golden circle + white star — uses the product hotspot asset */
export function HotspotSparkIcon({ active = true, className }: CuteIconProps) {
  return (
    <span
      className={[
        'inline-flex h-[18px] w-[18px] shrink-0 items-center justify-center',
        active ? '' : 'opacity-[0.72]',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      aria-hidden
    >
      <img
        src={hotspotStarImg}
        alt=""
        width={18}
        height={18}
        className="h-[18px] w-[18px] select-none object-contain"
        draggable={false}
      />
    </span>
  )
}

/** Green circle + trending-up arrow — New projects filter */
export function NewProjectsCuteIcon({ active = true, className }: CuteIconProps) {
  return (
    <span
      className={[
        'inline-flex h-[18px] w-[18px] shrink-0 items-center justify-center',
        active ? '' : 'opacity-[0.72]',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      aria-hidden
    >
      <img
        src={newProjectsTrendImg}
        alt=""
        width={18}
        height={18}
        className="h-[18px] w-[18px] select-none object-contain"
        draggable={false}
      />
    </span>
  )
}
