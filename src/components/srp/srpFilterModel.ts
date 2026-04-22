import {
  ALL_HOTSPOT_AREA_IDS,
  isFullHotspotAreaSelection,
} from '../../data/srpAreasMock'
import type { SrpListing } from '../../data/srpMock'

export type SrpAppliedFilters = {
  useHotspot: boolean
  upcomingOnly: boolean
  hotspotAreaIds: string[]
  budgetMinCr: number
  budgetMaxCr: number
  bhk: string[]
  propertyTypes: string[]
  construction: ('ready' | 'under_construction')[]
  listedBy: string[]
  amenities: string[]
  areaSqFtMin: number
  areaSqFtMax: number
  purchaseTypes: string[]
  propertyAges: string[]
  developers: string[]
  furnishing: string[]
  facing: string[]
  minImageCount: number
  reraOnly: boolean
}

export function createDefaultSrpAppliedFilters(): SrpAppliedFilters {
  return {
    useHotspot: false,
    upcomingOnly: false,
    hotspotAreaIds: [...ALL_HOTSPOT_AREA_IDS],
    budgetMinCr: 0,
    budgetMaxCr: 30,
    bhk: [],
    propertyTypes: [],
    construction: [],
    listedBy: [],
    amenities: [],
    areaSqFtMin: 0,
    areaSqFtMax: 12000,
    purchaseTypes: [],
    propertyAges: [],
    developers: [],
    furnishing: [],
    facing: [],
    minImageCount: 0,
    reraOnly: false,
  }
}

const DEF = createDefaultSrpAppliedFilters()

export function cloneSrpAppliedFilters(f: SrpAppliedFilters): SrpAppliedFilters {
  return {
    ...f,
    hotspotAreaIds: [...f.hotspotAreaIds],
    bhk: [...f.bhk],
    propertyTypes: [...f.propertyTypes],
    construction: [...f.construction],
    listedBy: [...f.listedBy],
    amenities: [...f.amenities],
    purchaseTypes: [...f.purchaseTypes],
    propertyAges: [...f.propertyAges],
    developers: [...f.developers],
    furnishing: [...f.furnishing],
    facing: [...f.facing],
  }
}

function sameSortedStrings(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false
  const sa = [...a].sort()
  const sb = [...b].sort()
  return sa.every((v, i) => v === sb[i])
}

function sameSortedConstruction(
  a: ('ready' | 'under_construction')[],
  b: ('ready' | 'under_construction')[],
): boolean {
  if (a.length !== b.length) return false
  const sa = [...a].sort()
  const sb = [...b].sort()
  return sa.every((v, i) => v === sb[i])
}

export function areSrpAppliedFiltersEqual(
  a: SrpAppliedFilters,
  b: SrpAppliedFilters,
): boolean {
  return (
    a.useHotspot === b.useHotspot &&
    a.upcomingOnly === b.upcomingOnly &&
    sameSortedStrings(a.hotspotAreaIds, b.hotspotAreaIds) &&
    a.budgetMinCr === b.budgetMinCr &&
    a.budgetMaxCr === b.budgetMaxCr &&
    sameSortedStrings(a.bhk, b.bhk) &&
    sameSortedStrings(a.propertyTypes, b.propertyTypes) &&
    sameSortedConstruction(a.construction, b.construction) &&
    sameSortedStrings(a.listedBy, b.listedBy) &&
    sameSortedStrings(a.amenities, b.amenities) &&
    a.areaSqFtMin === b.areaSqFtMin &&
    a.areaSqFtMax === b.areaSqFtMax &&
    sameSortedStrings(a.purchaseTypes, b.purchaseTypes) &&
    sameSortedStrings(a.propertyAges, b.propertyAges) &&
    sameSortedStrings(a.developers, b.developers) &&
    sameSortedStrings(a.furnishing, b.furnishing) &&
    sameSortedStrings(a.facing, b.facing) &&
    a.minImageCount === b.minImageCount &&
    a.reraOnly === b.reraOnly
  )
}

function bhkKeyFromConfiguration(cfg: string): string {
  if (/studio/i.test(cfg)) return 'studio'
  const m = cfg.match(/(\d+(?:\.\d+)?)\s*BHK/i)
  if (!m) return ''
  const n = parseFloat(m[1]!)
  if (Number.isNaN(n)) return ''
  if (n >= 4) return '4+'
  if (n === 1.5) return '1.5'
  if (n === 2.5) return '2.5'
  if (n === 3.5) return '3.5'
  return String(Math.floor(n))
}

function propertyTypeFromConfiguration(cfg: string): string {
  if (/villa/i.test(cfg)) return 'Villa'
  if (/duplex/i.test(cfg)) return 'Duplex'
  if (/studio/i.test(cfg)) return 'Studio'
  return 'Apartment'
}

function listedByKey(role: string): string {
  const r = role.toLowerCase()
  if (r.includes('dealer')) return 'dealer'
  if (r.includes('owner')) return 'owner'
  return 'other'
}

/** How many filter dimensions differ from defaults (for chip badge). */
export function countActiveSrpFilterDimensions(f: SrpAppliedFilters): number {
  let n = 0
  if (f.useHotspot) n += 1
  if (f.upcomingOnly) n += 1
  if (
    f.useHotspot &&
    f.hotspotAreaIds.length > 0 &&
    !isFullHotspotAreaSelection(new Set(f.hotspotAreaIds))
  ) {
    n += 1
  }
  if (f.budgetMinCr > DEF.budgetMinCr + 0.01) n += 1
  if (f.budgetMaxCr < DEF.budgetMaxCr - 0.01) n += 1
  if (f.bhk.length) n += 1
  if (f.propertyTypes.length) n += 1
  if (!f.upcomingOnly && f.construction.length === 1) n += 1
  if (f.listedBy.length) n += 1
  if (f.amenities.length) n += 1
  /* Built-up, purchase type, age, furnishing, facing: exploration-only in this mock. */
  if (f.developers.length) n += 1
  if (f.minImageCount > 0) n += 1
  if (f.reraOnly) n += 1
  return n
}

export function applySrpFilters(
  listings: SrpListing[],
  f: SrpAppliedFilters,
): SrpListing[] {
  const areaSet = new Set(f.hotspotAreaIds)
  /** Feed “New projects” uses `upcomingOnly`; ignore conflicting construction row */
  const constructionRow =
    f.upcomingOnly ? [] : f.construction

  return listings.filter((l) => {
    if (f.useHotspot) {
      if (!l.hotspot) return false
      if (areaSet.size === 0) return false
      if (
        !isFullHotspotAreaSelection(areaSet) &&
        !areaSet.has(l.areaId)
      ) {
        return false
      }
    }

    if (f.upcomingOnly && !l.upcoming) return false

    if (constructionRow.length === 1) {
      const c = constructionRow[0]
      if (c === 'ready' && l.upcoming) return false
      if (c === 'under_construction' && !l.upcoming) return false
    }

    if (l.priceCr < f.budgetMinCr || l.priceCr > f.budgetMaxCr) return false

    if (f.bhk.length > 0) {
      const key = bhkKeyFromConfiguration(l.configuration)
      if (!key || !f.bhk.includes(key)) return false
    }

    if (f.propertyTypes.length > 0) {
      const pt = propertyTypeFromConfiguration(l.configuration)
      if (!f.propertyTypes.includes(pt)) return false
    }

    if (f.listedBy.length > 0) {
      const lb = listedByKey(l.owner.role)
      if (!f.listedBy.includes(lb)) return false
    }

    for (const a of f.amenities) {
      if (a === 'verified' && !l.verified) return false
      if (a === 'rera' && !l.rera) return false
    }

    if (f.reraOnly && !l.rera) return false

    if (f.minImageCount > 0 && l.imageCount < f.minImageCount) return false

    if (f.developers.length > 0) {
      const name = l.projectName.toLowerCase()
      const hit = f.developers.some((d) => name.includes(d.toLowerCase()))
      if (!hit) return false
    }

    return true
  })
}
