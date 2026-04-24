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
