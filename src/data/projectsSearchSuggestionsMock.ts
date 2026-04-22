/** Mock catalog for Projects page inline search suggestions (as-you-type). */

export type ProjectSearchMatch = {
  id: string
  /** Full phrase shown in SRP when user picks this row */
  fullText: string
  category: 'City' | 'Project' | 'Locality' | 'Developer' | 'District'
  /** Shown on second line after category */
  metaLocation: string
}

/** Trending “Search for …” targets when query is short or no catalog hit */
const SHORTCUT_SEEDS = [
  'Kilim Apartments in Phase 4',
  'The Aralias in Sector 42',
  'DLF Camellias, Golf Course Road',
  'M3M Urbana in Sector 67',
  'Sobha City in Sector 108',
]

const CATALOG: ProjectSearchMatch[] = [
  {
    id: 'm1',
    fullText: '2BHK in Sector 65 with a balcony',
    category: 'Locality',
    metaLocation: 'Gurgaon',
  },
  {
    id: 'm2',
    fullText: '2BHK in Bangalore near metro',
    category: 'City',
    metaLocation: 'Bangalore',
  },
  {
    id: 'm3',
    fullText: '3BHK new launch in Golf Course Ext.',
    category: 'Locality',
    metaLocation: 'Gurgaon',
  },
  {
    id: 'm4',
    fullText: 'Builder floors in Sector 57',
    category: 'Locality',
    metaLocation: 'Gurgaon',
  },
  {
    id: 'm5',
    fullText: 'DLF Phase 4 under-construction towers',
    category: 'Project',
    metaLocation: 'Gurgaon',
  },
  {
    id: 'm6',
    fullText: 'M3M projects with club amenities',
    category: 'Developer',
    metaLocation: 'Gurgaon',
  },
  {
    id: 'm7',
    fullText: 'South Delhi premium 4BHK',
    category: 'District',
    metaLocation: 'Delhi',
  },
  {
    id: 'm8',
    fullText: 'RERA-approved projects in Noida',
    category: 'City',
    metaLocation: 'Noida',
  },
]

function norm(s: string) {
  return s.trim().toLowerCase()
}

export function pickShortcutTarget(query: string, city: string): string {
  const q = norm(query)
  if (!q) return SHORTCUT_SEEDS[0]
  const byQuery = SHORTCUT_SEEDS.find((s) => norm(s).includes(q))
  if (byQuery) return byQuery
  const catalogHit = CATALOG.find(
    (c) =>
      norm(c.fullText).includes(q) ||
      norm(c.metaLocation).includes(q),
  )
  if (catalogHit) return catalogHit.fullText
  return `${query.trim()} in ${city}`
}

export function filterProjectSearchMatches(
  query: string,
  _city: string,
  limit = 6,
): ProjectSearchMatch[] {
  const q = norm(query)
  if (!q) return []

  const scored = CATALOG.filter((row) => {
    const hay = `${row.fullText} ${row.category} ${row.metaLocation}`.toLowerCase()
    return hay.includes(q)
  })

  const sortKey = (row: ProjectSearchMatch) => {
    const t = row.fullText.toLowerCase()
    const i = t.indexOf(q)
    return i < 0 ? 999 : i
  }
  scored.sort((a, b) => sortKey(a) - sortKey(b))

  return scored.slice(0, limit)
}
