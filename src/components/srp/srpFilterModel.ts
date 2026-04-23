import {
  ALL_HOTSPOT_AREA_IDS,
  isFullHotspotAreaSelection,
} from '../../data/srpAreasMock'
import {
  FILTER_AMENITIES_LONG,
  FILTER_BHK_OPTIONS,
  FILTER_CONSTRUCTION_OPTIONS,
  FILTER_FACING_OPTIONS,
  FILTER_FURNISHING_OPTIONS,
  FILTER_LISTED_BY_OPTIONS,
  FILTER_PHOTOS_OPTIONS,
  FILTER_PROPERTY_AGE_OPTIONS,
  FILTER_PROPERTY_TYPE_OPTIONS,
  FILTER_PURCHASE_TYPE_OPTIONS,
} from '../../data/srpFiltersMock'
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
    budgetMinCr: 0.05,
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

const BHK_LABEL = Object.fromEntries(
  FILTER_BHK_OPTIONS.map((o) => [o.id, o.label]),
) as Record<string, string>
const PROPERTY_TYPE_LABEL = Object.fromEntries(
  FILTER_PROPERTY_TYPE_OPTIONS.map((o) => [o.id, o.label]),
) as Record<string, string>
const CONSTRUCTION_LABEL = Object.fromEntries(
  FILTER_CONSTRUCTION_OPTIONS.map((o) => [o.id, o.label]),
) as Record<string, string>
const LISTED_LABEL = Object.fromEntries(
  FILTER_LISTED_BY_OPTIONS.map((o) => [o.id, o.label]),
) as Record<string, string>
const AMENITY_LABEL = Object.fromEntries(
  FILTER_AMENITIES_LONG.map((o) => [o.id, o.label]),
) as Record<string, string>
const PURCHASE_LABEL = Object.fromEntries(
  FILTER_PURCHASE_TYPE_OPTIONS.map((o) => [o.id, o.label]),
) as Record<string, string>
const AGE_LABEL = Object.fromEntries(
  FILTER_PROPERTY_AGE_OPTIONS.map((o) => [o.id, o.label]),
) as Record<string, string>
const FURNISH_LABEL = Object.fromEntries(
  FILTER_FURNISHING_OPTIONS.map((o) => [o.id, o.label]),
) as Record<string, string>
const FACING_LABEL = Object.fromEntries(
  FILTER_FACING_OPTIONS.map((o) => [o.id, o.label]),
) as Record<string, string>

function fmtCr(n: number): string {
  return n.toFixed(2).replace(/\.?0+$/, '')
}

function joinOptionLabels(
  ids: string[],
  lookup: Record<string, string>,
  maxShown = 2,
): string {
  const labels = ids.map((id) => lookup[id] ?? id)
  const shown = labels.slice(0, maxShown)
  const more = labels.length - shown.length
  let s = shown.join(', ')
  if (more > 0) s += ` +${more}`
  return s
}

export type AppliedFilterChip = {
  id: string
  label: string
  clear: (f: SrpAppliedFilters) => SrpAppliedFilters
}

/** Removable chips for the SRP filter strip (one row after the main Filters CTA). */
export function getAppliedFilterChips(f: SrpAppliedFilters): AppliedFilterChip[] {
  const chips: AppliedFilterChip[] = []

  if (f.useHotspot) {
    chips.push({
      id: 'hotspot',
      label: 'Hotspot',
      clear: (x) => {
        const n = cloneSrpAppliedFilters(x)
        n.useHotspot = false
        n.hotspotAreaIds = [...ALL_HOTSPOT_AREA_IDS]
        return n
      },
    })
  }

  if (
    f.useHotspot &&
    f.hotspotAreaIds.length > 0 &&
    !isFullHotspotAreaSelection(new Set(f.hotspotAreaIds))
  ) {
    chips.push({
      id: 'areas',
      label: `Areas (${f.hotspotAreaIds.length})`,
      clear: (x) => {
        const n = cloneSrpAppliedFilters(x)
        n.hotspotAreaIds = [...ALL_HOTSPOT_AREA_IDS]
        return n
      },
    })
  }

  if (f.upcomingOnly) {
    chips.push({
      id: 'upcoming',
      label: 'New projects',
      clear: (x) => {
        const n = cloneSrpAppliedFilters(x)
        n.upcomingOnly = false
        return n
      },
    })
  }

  const budgetLo = f.budgetMinCr > DEF.budgetMinCr + 0.01
  const budgetHi = f.budgetMaxCr < DEF.budgetMaxCr - 0.01
  if (budgetLo || budgetHi) {
    let label = 'Budget'
    if (budgetLo && budgetHi) {
      label = `₹${fmtCr(f.budgetMinCr)}–${fmtCr(f.budgetMaxCr)} Cr`
    } else if (budgetLo) {
      label = `Min ₹${fmtCr(f.budgetMinCr)} Cr`
    } else {
      label = `Max ₹${fmtCr(f.budgetMaxCr)} Cr`
    }
    chips.push({
      id: 'budget',
      label,
      clear: (x) => {
        const n = cloneSrpAppliedFilters(x)
        n.budgetMinCr = DEF.budgetMinCr
        n.budgetMaxCr = DEF.budgetMaxCr
        return n
      },
    })
  }

  if (f.bhk.length > 0) {
    chips.push({
      id: 'bhk',
      label: joinOptionLabels([...f.bhk].sort(), BHK_LABEL),
      clear: (x) => {
        const n = cloneSrpAppliedFilters(x)
        n.bhk = []
        return n
      },
    })
  }

  if (f.propertyTypes.length > 0) {
    chips.push({
      id: 'propertyTypes',
      label: joinOptionLabels(f.propertyTypes, PROPERTY_TYPE_LABEL),
      clear: (x) => {
        const n = cloneSrpAppliedFilters(x)
        n.propertyTypes = []
        return n
      },
    })
  }

  if (!f.upcomingOnly && f.construction.length > 0) {
    const label = joinOptionLabels([...f.construction].sort(), CONSTRUCTION_LABEL)
    chips.push({
      id: 'construction',
      label: label || 'Status',
      clear: (x) => {
        const n = cloneSrpAppliedFilters(x)
        n.construction = []
        return n
      },
    })
  }

  if (f.listedBy.length > 0) {
    chips.push({
      id: 'listedBy',
      label: joinOptionLabels(f.listedBy, LISTED_LABEL),
      clear: (x) => {
        const n = cloneSrpAppliedFilters(x)
        n.listedBy = []
        return n
      },
    })
  }

  if (f.amenities.length > 0) {
    chips.push({
      id: 'amenities',
      label:
        f.amenities.length === 1
          ? AMENITY_LABEL[f.amenities[0]!] ?? 'Amenities'
          : `Amenities (${f.amenities.length})`,
      clear: (x) => {
        const n = cloneSrpAppliedFilters(x)
        n.amenities = []
        return n
      },
    })
  }

  if (f.areaSqFtMin > DEF.areaSqFtMin || f.areaSqFtMax < DEF.areaSqFtMax) {
    chips.push({
      id: 'builtUp',
      label: `${f.areaSqFtMin.toLocaleString()}–${f.areaSqFtMax.toLocaleString()} sq.ft.`,
      clear: (x) => {
        const n = cloneSrpAppliedFilters(x)
        n.areaSqFtMin = DEF.areaSqFtMin
        n.areaSqFtMax = DEF.areaSqFtMax
        return n
      },
    })
  }

  if (f.purchaseTypes.length > 0) {
    chips.push({
      id: 'purchaseTypes',
      label: joinOptionLabels(f.purchaseTypes, PURCHASE_LABEL),
      clear: (x) => {
        const n = cloneSrpAppliedFilters(x)
        n.purchaseTypes = []
        return n
      },
    })
  }

  if (f.propertyAges.length > 0) {
    chips.push({
      id: 'propertyAges',
      label: joinOptionLabels(f.propertyAges, AGE_LABEL),
      clear: (x) => {
        const n = cloneSrpAppliedFilters(x)
        n.propertyAges = []
        return n
      },
    })
  }

  if (f.developers.length > 0) {
    const shown = f.developers.slice(0, 2).join(', ')
    const more = f.developers.length - 2
    chips.push({
      id: 'developers',
      label: more > 0 ? `${shown} +${more}` : shown,
      clear: (x) => {
        const n = cloneSrpAppliedFilters(x)
        n.developers = []
        return n
      },
    })
  }

  if (f.furnishing.length > 0) {
    chips.push({
      id: 'furnishing',
      label: joinOptionLabels(f.furnishing, FURNISH_LABEL),
      clear: (x) => {
        const n = cloneSrpAppliedFilters(x)
        n.furnishing = []
        return n
      },
    })
  }

  if (f.facing.length > 0) {
    chips.push({
      id: 'facing',
      label: joinOptionLabels(f.facing, FACING_LABEL),
      clear: (x) => {
        const n = cloneSrpAppliedFilters(x)
        n.facing = []
        return n
      },
    })
  }

  if (f.minImageCount > 0) {
    const opt = FILTER_PHOTOS_OPTIONS.find((o) => o.id === f.minImageCount)
    chips.push({
      id: 'photos',
      label: opt?.label ?? `${f.minImageCount}+ photos`,
      clear: (x) => {
        const n = cloneSrpAppliedFilters(x)
        n.minImageCount = DEF.minImageCount
        return n
      },
    })
  }

  if (f.reraOnly) {
    chips.push({
      id: 'reraOnly',
      label: 'RERA only',
      clear: (x) => {
        const n = cloneSrpAppliedFilters(x)
        n.reraOnly = false
        return n
      },
    })
  }

  return chips
}
