export type Hotspot = {
  id: string
  title: string
  subtitle: string
  yoyPercent: number
  /** true = green up badge, false = red down */
  positive: boolean
}

/** Curated hotspots for the Project search discovery row */
export const HOTSPOTS_BY_CITY: Record<string, Hotspot[]> = {
  Mumbai: [
    {
      id: 'm1',
      title: 'Bandra West',
      subtitle: 'Premium sea-facing belt',
      yoyPercent: 18.4,
      positive: true,
    },
    {
      id: 'm2',
      title: 'Powai',
      subtitle: 'Lake & startup corridor',
      yoyPercent: 4.2,
      positive: false,
    },
  ],
}

const DEFAULT: Hotspot[] = [
  {
    id: 'd1',
    title: 'New Gurgaon',
    subtitle: 'Rapid growth',
    yoyPercent: 26.7,
    positive: true,
  },
  {
    id: 'd2',
    title: 'Southern Periphery',
    subtitle: 'Rising commercial corridor',
    yoyPercent: 6.7,
    positive: false,
  },
  {
    id: 'd3',
    title: 'Golf Course Ext.',
    subtitle: 'Luxury launches cluster',
    yoyPercent: 14.1,
    positive: true,
  },
]

export function getHotspotsForCity(city: string): Hotspot[] {
  return HOTSPOTS_BY_CITY[city] ?? DEFAULT
}
