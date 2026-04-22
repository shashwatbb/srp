export type HotspotAreaOption = {
  id: string
  label: string
  /** Shorter text for inline chips next to City hotspots */
  chipLabel?: string
  /** Single-line picker hint — factual, not promotional */
  insight: string
}

/** Popular Gurgaon micro-markets when City hotspots filter is on */
export const HOTSPOT_AREA_OPTIONS: HotspotAreaOption[] = [
  {
    id: 'gce',
    label: 'Golf Course Extension',
    chipLabel: 'Golf Course Ext.',
    insight: 'Fast-growing corridor with premium new launches',
  },
  {
    id: 'cyber',
    label: 'Cyber City',
    chipLabel: 'Cyber City',
    insight: 'Office core with steady housing demand nearby',
  },
  {
    id: 'chub',
    label: 'DLF Cyber Hub',
    chipLabel: 'Cyber Hub',
    insight: 'Retail and dining hub with strong rental interest',
  },
  {
    id: 'gcr',
    label: 'Golf Course Road',
    chipLabel: 'Golf Course Rd',
    insight: 'Mature premium belt with limited fresh supply',
  },
  {
    id: 'dex',
    label: 'Dwarka Expressway',
    chipLabel: 'Dwarka Expy',
    insight: 'New connectivity spine with active project pipeline',
  },
  {
    id: 's28',
    label: 'Sector 28',
    chipLabel: 'Sector 28',
    insight: 'Dense urban pocket with quick NH-48 access',
  },
  {
    id: 's29',
    label: 'Sector 29',
    chipLabel: 'Sector 29',
    insight: 'F&B cluster with consistent buyer and lease flow',
  },
  {
    id: 's65',
    label: 'Sector 65',
    chipLabel: 'Sector 65',
    insight: 'Emerging mid-premium belt with several new towers',
  },
  {
    id: 'sohna',
    label: 'Sohna Road',
    chipLabel: 'Sohna Road',
    insight: 'South growth corridor with value-led new supply',
  },
]

export const ALL_HOTSPOT_AREA_IDS = HOTSPOT_AREA_OPTIONS.map((a) => a.id)

export function createDefaultAreaSelection(): Set<string> {
  return new Set(ALL_HOTSPOT_AREA_IDS)
}

export function isFullHotspotAreaSelection(selected: Set<string>): boolean {
  return (
    selected.size === ALL_HOTSPOT_AREA_IDS.length &&
    ALL_HOTSPOT_AREA_IDS.every((id) => selected.has(id))
  )
}
