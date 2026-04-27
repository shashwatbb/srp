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
  FILTER_ADDED_ON_OPTIONS,
  FILTER_LAUNCHER_OPTIONS,
  FILTER_SITE_FEATURE_OPTIONS,
  FILTER_PROPERTY_AGE_OPTIONS,
  FILTER_PROPERTY_TYPE_OPTIONS,
  FILTER_PURCHASE_TYPE_OPTIONS,
  type FilterCategoryId,
  type SrpAddedOnWindowId,
  type SrpLauncherWindowId,
} from '../../data/srpFiltersMock'
import type { SrpListing } from '../../data/srpMock'

export type SrpConstructionStatusId =
  (typeof FILTER_CONSTRUCTION_OPTIONS)[number]['id']

/** Budget slider / defaults: ₹10L (floor) … ₹5Cr (ceiling). Values in crore. */
export const SRP_BUDGET_MIN_CR = 0.1
export const SRP_BUDGET_MAX_CR = 5

/** Ascending snap stops: 10L steps under ₹1Cr, then ₹0.5Cr steps to ₹5Cr. */
export const SRP_BUDGET_SNAP_STEPS_CR: readonly number[] = [
  0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5,
]

/** Photos vs video vs both — empty string means no filter. */
export type SrpMediaPreference = '' | 'photos' | 'videos' | 'both'

/** Possession within N years — empty means no Launched filter. */
export type SrpLauncherWindow = '' | SrpLauncherWindowId

/** How recently the listing was added — empty means no Added on filter. */
export type SrpAddedOn = '' | SrpAddedOnWindowId

export type SrpAppliedFilters = {
  useHotspot: boolean
  upcomingOnly: boolean
  hotspotAreaIds: string[]
  budgetMinCr: number
  budgetMaxCr: number
  bhk: string[]
  propertyTypes: string[]
  construction: SrpConstructionStatusId[]
  listedBy: string[]
  amenities: string[]
  areaSqFtMin: number
  areaSqFtMax: number
  purchaseTypes: string[]
  propertyAges: string[]
  developers: string[]
  furnishing: string[]
  facing: string[]
  mediaPreference: SrpMediaPreference
  reraOnly: boolean
  launcherWindow: SrpLauncherWindow
  verifiedOnly: boolean
  /** Corner lot / corner unit (amenity `corner_property`). */
  siteCorner: boolean
  /** Enclosed plot with boundary wall (amenity `boundary_wall`). */
  siteBoundaryWall: boolean
  addedOn: SrpAddedOn
}

export function createDefaultSrpAppliedFilters(): SrpAppliedFilters {
  return {
    useHotspot: false,
    upcomingOnly: false,
    hotspotAreaIds: [...ALL_HOTSPOT_AREA_IDS],
    budgetMinCr: SRP_BUDGET_MIN_CR,
    budgetMaxCr: SRP_BUDGET_MAX_CR,
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
    mediaPreference: '',
    reraOnly: false,
    launcherWindow: '',
    verifiedOnly: false,
    siteCorner: false,
    siteBoundaryWall: false,
    addedOn: '',
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
  a: SrpConstructionStatusId[],
  b: SrpConstructionStatusId[],
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
    a.mediaPreference === b.mediaPreference &&
    a.reraOnly === b.reraOnly &&
    a.launcherWindow === b.launcherWindow &&
    a.verifiedOnly === b.verifiedOnly &&
    a.siteCorner === b.siteCorner &&
    a.siteBoundaryWall === b.siteBoundaryWall &&
    a.addedOn === b.addedOn
  )
}

function bhkKeyFromConfiguration(cfg: string): string {
  if (/studio/i.test(cfg)) return 'studio'
  if (/\b1\s*RK\b/i.test(cfg) || /\b1RK\b/i.test(cfg)) return '1rk'
  const m = cfg.match(/(\d+(?:\.\d+)?)\s*BHK/i)
  if (!m) return ''
  const n = parseFloat(m[1]!)
  if (Number.isNaN(n)) return ''
  if (n >= 4) return '4+'
  /* No .5 BHK filter buckets — map fractional configs to the lower whole BHK. */
  return String(Math.floor(n))
}

/** Matches `FILTER_PROPERTY_TYPE_OPTIONS` ids. */
function propertyTypeFromConfiguration(cfg: string): string {
  const s = cfg.toLowerCase()
  if (
    /independent\s+builder\s+floor/i.test(cfg) ||
    (/\bbuilder\s+floor\b/i.test(cfg) && /independent/i.test(cfg))
  ) {
    return 'independent_builder_floor'
  }
  if (/\bindependent\s+house\b/i.test(cfg)) return 'independent_house'
  if (/penthouse/i.test(cfg)) return 'penthouse'
  if (/duplex/i.test(cfg)) return 'duplex'
  if (/villa/i.test(cfg)) return 'villa'
  if (/\bplot\b|residential\s+land|land\s+parcel/i.test(s)) return 'plot'
  /* Studio / RK / flat / apartment-style configs */
  if (
    /apartment|apartments|\bflat\b|studio|\brk\b/i.test(cfg)
  ) {
    return 'apartments'
  }
  return 'apartments'
}

function listedByKey(role: string): string {
  const r = role.toLowerCase()
  if (r.includes('featured')) return 'featured_agent'
  if (r.includes('developer')) return 'developer'
  if (r.includes('owner')) return 'owner'
  if (r.includes('agent') || r.includes('dealer')) return 'agent'
  return 'owner'
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
  if (!f.upcomingOnly && f.construction.length > 0) n += 1
  if (f.listedBy.length) n += 1
  if (f.amenities.length) n += 1
  /* Built-up, purchase type, age, furnishing, facing: exploration-only in this mock. */
  if (f.developers.length) n += 1
  if (f.mediaPreference !== '') n += 1
  if (f.reraOnly) n += 1
  if (f.launcherWindow !== '') n += 1
  if (f.verifiedOnly) n += 1
  if (f.siteCorner) n += 1
  if (f.siteBoundaryWall) n += 1
  if (f.addedOn !== '') n += 1
  return n
}

/**
 * How many selections are active for a given full-screen filter category
 * (for the left-rail label, e.g. "BHK (2)").
 */
export function getSrpCategorySelectionCount(
  f: SrpAppliedFilters,
  categoryId: FilterCategoryId,
): number {
  switch (categoryId) {
    case 'budget': {
      let n = 0
      if (f.budgetMinCr > DEF.budgetMinCr + 0.01) n += 1
      if (f.budgetMaxCr < DEF.budgetMaxCr - 0.01) n += 1
      return n
    }
    case 'bhk':
      return f.bhk.length
    case 'propertyType':
      return f.propertyTypes.length
    case 'construction':
      return f.upcomingOnly ? 0 : f.construction.length
    case 'listedBy':
      return f.listedBy.length
    case 'amenities':
      return f.amenities.length
    case 'area': {
      let n = 0
      if (f.areaSqFtMin > DEF.areaSqFtMin) n += 1
      if (f.areaSqFtMax < DEF.areaSqFtMax) n += 1
      return n
    }
    case 'purchaseType':
      return f.purchaseTypes.length
    case 'propertyAge':
      return f.propertyAges.length
    case 'developer':
      return f.developers.length
    case 'furnishing':
      return f.furnishing.length
    case 'facing':
      return f.facing.length
    case 'photos':
      return f.mediaPreference !== '' ? 1 : 0
    case 'rera':
      return f.reraOnly ? 1 : 0
    case 'launched':
      return f.launcherWindow !== '' ? 1 : 0
    case 'verified':
      return f.verifiedOnly ? 1 : 0
    case 'site':
      return (f.siteCorner ? 1 : 0) + (f.siteBoundaryWall ? 1 : 0)
    case 'addedOn':
      return f.addedOn !== '' ? 1 : 0
    default:
      return 0
  }
}

function startOfLocalDayMs(nowMs: number): number {
  const d = new Date(nowMs)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

/** `listedAtMs` vs filter window (`FILTER_ADDED_ON_OPTIONS` ids). */
export function listingMatchesAddedOnFilter(
  listedAtMs: number,
  window: SrpAddedOnWindowId,
): boolean {
  const now = Date.now()
  if (listedAtMs > now) return false

  switch (window) {
    case 'yesterday': {
      const startToday = startOfLocalDayMs(now)
      const startYesterday = startToday - 86400000
      return listedAtMs >= startYesterday && listedAtMs < startToday
    }
    case 'last_3_days':
      return now - listedAtMs <= 3 * 86400000
    case 'last_week':
      return now - listedAtMs <= 7 * 86400000
    case 'last_month':
      return now - listedAtMs <= 30 * 86400000
    default:
      return true
  }
}

export function applySrpFilters(
  listings: SrpListing[],
  f: SrpAppliedFilters,
): SrpListing[] {
  const areaSet = new Set(f.hotspotAreaIds)
  /** Quick pill “New projects” = any non-ready; sheet Status uses `construction`. */
  const constructionRow = f.upcomingOnly ? [] : f.construction

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

    if (f.upcomingOnly && l.possessionStatus === 'ready') return false

    if (constructionRow.length > 0) {
      if (!constructionRow.includes(l.possessionStatus)) return false
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

    if (f.amenities.length > 0) {
      const set = new Set(l.amenityIds)
      for (const a of f.amenities) {
        if (!set.has(a)) return false
      }
    }

    if (f.siteCorner || f.siteBoundaryWall) {
      const am = new Set(l.amenityIds)
      if (f.siteCorner && !am.has('corner_property')) return false
      if (f.siteBoundaryWall && !am.has('boundary_wall')) return false
    }

    if (f.reraOnly && !l.rera) return false

    if (f.verifiedOnly && !l.verified) return false

    if (f.launcherWindow !== '') {
      const maxYears =
        f.launcherWindow === 'within_1y'
          ? 1
          : f.launcherWindow === 'within_3y'
            ? 3
            : 10
      if (l.yearsToPossession > maxYears + 1e-9) return false
    }

    if (f.mediaPreference === 'photos') {
      if (l.imageCount < 1) return false
    } else if (f.mediaPreference === 'videos') {
      if (!l.hasVideo) return false
    } else if (f.mediaPreference === 'both') {
      if (!l.hasVideo || l.imageCount < 20) return false
    }

    if (f.developers.length > 0) {
      const name = l.projectName.toLowerCase()
      const hit = f.developers.some((d) => name.includes(d.toLowerCase()))
      if (!hit) return false
    }

    if (f.addedOn !== '') {
      if (!listingMatchesAddedOnFilter(l.listedAtMs, f.addedOn)) return false
    }

    return true
  })
}

const BHK_LABEL = Object.fromEntries(
  FILTER_BHK_OPTIONS.map((o) => [o.id, o.label]),
) as Record<string, string>

/** Valid BHK filter chip ids (persisted state is filtered to this set). */
export const ALLOWED_BHK_FILTER_IDS = new Set<string>(
  FILTER_BHK_OPTIONS.map((o) => o.id),
)
const PROPERTY_TYPE_LABEL = Object.fromEntries(
  FILTER_PROPERTY_TYPE_OPTIONS.map((o) => [o.id, o.label]),
) as Record<string, string>

export const ALLOWED_PROPERTY_TYPE_IDS = new Set<string>(
  FILTER_PROPERTY_TYPE_OPTIONS.map((o) => o.id),
)

/** Older sessions used PascalCase ids from an earlier option list. */
const LEGACY_PROPERTY_TYPE_ID: Record<string, string> = {
  Apartment: 'apartments',
  Villa: 'villa',
  Duplex: 'duplex',
  Studio: 'apartments',
}

export function normalizePropertyTypeFilterId(id: string): string | null {
  const next = LEGACY_PROPERTY_TYPE_ID[id] ?? id
  return ALLOWED_PROPERTY_TYPE_IDS.has(next) ? next : null
}
const CONSTRUCTION_LABEL = Object.fromEntries(
  FILTER_CONSTRUCTION_OPTIONS.map((o) => [o.id, o.label]),
) as Record<string, string>
const LISTED_LABEL = Object.fromEntries(
  FILTER_LISTED_BY_OPTIONS.map((o) => [o.id, o.label]),
) as Record<string, string>

export const ALLOWED_LISTED_BY_IDS = new Set<string>(
  FILTER_LISTED_BY_OPTIONS.map((o) => o.id),
)

const LEGACY_LISTED_BY_ID: Record<string, string> = {
  dealer: 'agent',
}

export function normalizeListedByFilterId(id: string): string | null {
  const next = LEGACY_LISTED_BY_ID[id] ?? id
  return ALLOWED_LISTED_BY_IDS.has(next) ? next : null
}
const AMENITY_LABEL = Object.fromEntries(
  FILTER_AMENITIES_LONG.map((o) => [o.id, o.label]),
) as Record<string, string>

export const ALLOWED_AMENITY_IDS = new Set<string>(
  FILTER_AMENITIES_LONG.map((o) => o.id),
)

/** Older amenity ids from a previous filter list — map or drop. */
const LEGACY_AMENITY_ID: Record<string, string | null> = {
  verified: null,
  rera: null,
  gym: 'gym_fitness',
  pool: 'swimming_pool',
  club: 'clubhouse',
  park: null,
  security: 'cctv_surveillance',
  power: 'power_backup',
  lift: null,
  parking: 'covered_parking',
  kids: null,
  jog: 'jogging_track',
}

export function normalizeAmenityFilterId(id: string): string | null {
  const mapped = LEGACY_AMENITY_ID[id]
  if (mapped === null) return null
  const next = mapped ?? id
  return ALLOWED_AMENITY_IDS.has(next) ? next : null
}
const PURCHASE_LABEL = Object.fromEntries(
  FILTER_PURCHASE_TYPE_OPTIONS.map((o) => [o.id, o.label]),
) as Record<string, string>

export const ALLOWED_PURCHASE_TYPE_IDS = new Set<string>(
  FILTER_PURCHASE_TYPE_OPTIONS.map((o) => o.id),
)

const LEGACY_PURCHASE_TYPE_ID: Record<string, string | null> = {
  new: 'new_booking',
  auction: null,
}

export function normalizePurchaseTypeFilterId(id: string): string | null {
  const mapped = LEGACY_PURCHASE_TYPE_ID[id]
  if (mapped === null) return null
  const next = mapped ?? id
  return ALLOWED_PURCHASE_TYPE_IDS.has(next) ? next : null
}
const AGE_LABEL = Object.fromEntries(
  FILTER_PROPERTY_AGE_OPTIONS.map((o) => [o.id, o.label]),
) as Record<string, string>

export const ALLOWED_PROPERTY_AGE_IDS = new Set<string>(
  FILTER_PROPERTY_AGE_OPTIONS.map((o) => o.id),
)

const LEGACY_PROPERTY_AGE_ID: Record<string, string> = {
  '0-1': 'under_1y',
  '1-3': 'age_3y',
  '3-5': 'age_5y',
  '5-10': 'over_5y',
  '10+': 'over_5y',
}

export function normalizePropertyAgeFilterId(id: string): string | null {
  const next = LEGACY_PROPERTY_AGE_ID[id] ?? id
  return ALLOWED_PROPERTY_AGE_IDS.has(next) ? next : null
}
const FURNISH_LABEL = Object.fromEntries(
  FILTER_FURNISHING_OPTIONS.map((o) => [o.id, o.label]),
) as Record<string, string>
const FACING_LABEL = Object.fromEntries(
  FILTER_FACING_OPTIONS.map((o) => [o.id, o.label]),
) as Record<string, string>
const MEDIA_LABEL = {
  photos: 'Show properties with images',
  videos: 'Videos',
  both: 'Both',
} as Record<string, string>

const LAUNCHER_LABEL = Object.fromEntries(
  FILTER_LAUNCHER_OPTIONS.map((o) => [o.id, o.label]),
) as Record<string, string>

const SITE_FEATURE_LABEL = Object.fromEntries(
  FILTER_SITE_FEATURE_OPTIONS.map((o) => [o.id, o.label]),
) as Record<string, string>

const ADDED_ON_LABEL = Object.fromEntries(
  FILTER_ADDED_ON_OPTIONS.map((o) => [o.id, o.label]),
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

/**
 * Removable chips for the SRP filter strip (after the main Filters CTA).
 * Budget, BHK, built-up area, and construction status use shortcut pills instead.
 */
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

  if (f.mediaPreference !== '') {
    chips.push({
      id: 'photos',
      label: MEDIA_LABEL[f.mediaPreference] ?? 'Media',
      clear: (x) => {
        const n = cloneSrpAppliedFilters(x)
        n.mediaPreference = ''
        return n
      },
    })
  }

  if (f.reraOnly) {
    chips.push({
      id: 'reraOnly',
      label: 'RERA-registered only',
      clear: (x) => {
        const n = cloneSrpAppliedFilters(x)
        n.reraOnly = false
        return n
      },
    })
  }

  if (f.launcherWindow !== '') {
    chips.push({
      id: 'launcherWindow',
      label: LAUNCHER_LABEL[f.launcherWindow] ?? 'Launched',
      clear: (x) => {
        const n = cloneSrpAppliedFilters(x)
        n.launcherWindow = ''
        return n
      },
    })
  }

  if (f.verifiedOnly) {
    chips.push({
      id: 'verifiedOnly',
      label: 'Verified properties only',
      clear: (x) => {
        const n = cloneSrpAppliedFilters(x)
        n.verifiedOnly = false
        return n
      },
    })
  }

  if (f.siteCorner) {
    chips.push({
      id: 'siteCorner',
      label: SITE_FEATURE_LABEL.corner_property ?? 'Corner property',
      clear: (x) => {
        const n = cloneSrpAppliedFilters(x)
        n.siteCorner = false
        return n
      },
    })
  }

  if (f.siteBoundaryWall) {
    chips.push({
      id: 'siteBoundaryWall',
      label: SITE_FEATURE_LABEL.boundary_wall ?? 'Boundary wall',
      clear: (x) => {
        const n = cloneSrpAppliedFilters(x)
        n.siteBoundaryWall = false
        return n
      },
    })
  }

  if (f.addedOn !== '') {
    chips.push({
      id: 'addedOn',
      label: ADDED_ON_LABEL[f.addedOn] ?? 'Added on',
      clear: (x) => {
        const n = cloneSrpAppliedFilters(x)
        n.addedOn = ''
        return n
      },
    })
  }

  return chips
}

function fmtBudgetRangePart(cr: number): string {
  return cr < 1 ? `₹${Math.round(cr * 100)}L` : `₹${fmtCr(cr)}Cr`
}

/** Budget / BHK / built-up / status use the sheet shortcut row, not removable strip chips. */
export function isSrpBudgetShortcutActive(f: SrpAppliedFilters): boolean {
  return f.budgetMinCr > DEF.budgetMinCr + 0.01 || f.budgetMaxCr < DEF.budgetMaxCr - 0.01
}

export function getSrpBudgetShortcutCaption(f: SrpAppliedFilters): string {
  const budgetLo = f.budgetMinCr > DEF.budgetMinCr + 0.01
  const budgetHi = f.budgetMaxCr < DEF.budgetMaxCr - 0.01
  if (!budgetLo && !budgetHi) return 'Budget'
  if (budgetLo && budgetHi) {
    return `${fmtBudgetRangePart(f.budgetMinCr)} – ${fmtBudgetRangePart(f.budgetMaxCr)}`
  }
  if (budgetLo) return `Min ${fmtBudgetRangePart(f.budgetMinCr)}`
  return `Max ${fmtBudgetRangePart(f.budgetMaxCr)}`
}

export function isSrpBhkShortcutActive(f: SrpAppliedFilters): boolean {
  return f.bhk.length > 0
}

export function getSrpBhkShortcutCaption(f: SrpAppliedFilters): string {
  if (f.bhk.length === 0) return 'BHK'
  return joinOptionLabels([...f.bhk].sort(), BHK_LABEL)
}

export function isSrpAreaShortcutActive(f: SrpAppliedFilters): boolean {
  return f.areaSqFtMin > DEF.areaSqFtMin || f.areaSqFtMax < DEF.areaSqFtMax
}

export function getSrpAreaShortcutCaption(f: SrpAppliedFilters): string {
  if (!isSrpAreaShortcutActive(f)) return 'Area'
  return `${f.areaSqFtMin.toLocaleString()}–${f.areaSqFtMax.toLocaleString()} sq.ft.`
}

export function isSrpStatusShortcutActive(f: SrpAppliedFilters): boolean {
  return !f.upcomingOnly && f.construction.length > 0
}

export function getSrpStatusShortcutCaption(f: SrpAppliedFilters): string {
  if (f.upcomingOnly || f.construction.length === 0) return 'Status'
  const label = joinOptionLabels(
    [...f.construction].sort(),
    CONSTRUCTION_LABEL,
  )
  return label || 'Status'
}
