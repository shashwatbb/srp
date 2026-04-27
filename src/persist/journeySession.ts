import {
  ALLOWED_BHK_FILTER_IDS,
  cloneSrpAppliedFilters,
  createDefaultSrpAppliedFilters,
  normalizeAmenityFilterId,
  normalizeListedByFilterId,
  normalizePropertyTypeFilterId,
  normalizePropertyAgeFilterId,
  normalizePurchaseTypeFilterId,
  SRP_BUDGET_MAX_CR,
  SRP_BUDGET_MIN_CR,
  type SrpAppliedFilters,
  type SrpMediaPreference,
} from '../components/srp/srpFilterModel'

function clampBudgetCr(n: number): number {
  return Math.min(SRP_BUDGET_MAX_CR, Math.max(SRP_BUDGET_MIN_CR, n))
}

const JOURNEY_KEY = 'srp-app-journey-v1'

export type Screen = 'home' | 'projects' | 'srp'

export type StoredAppJourney = {
  v: 1
  screen: Screen
  flowCity: string
  srpQuery: string
  homeCategoryId: string
  projectsSearchKey: number
  projectsSearchSeed: string
}

function isScreen(x: unknown): x is Screen {
  return x === 'home' || x === 'projects' || x === 'srp'
}

export function readStoredAppJourney(): StoredAppJourney | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = sessionStorage.getItem(JOURNEY_KEY)
    if (!raw) return null
    const o = JSON.parse(raw) as Partial<StoredAppJourney>
    if (o.v !== 1 || !isScreen(o.screen)) return null
    return {
      v: 1,
      screen: o.screen,
      flowCity: typeof o.flowCity === 'string' ? o.flowCity : 'Gurgaon',
      srpQuery: typeof o.srpQuery === 'string' ? o.srpQuery : '',
      homeCategoryId: typeof o.homeCategoryId === 'string' ? o.homeCategoryId : 'buy',
      projectsSearchKey:
        typeof o.projectsSearchKey === 'number' && Number.isFinite(o.projectsSearchKey)
          ? o.projectsSearchKey
          : 0,
      projectsSearchSeed:
        typeof o.projectsSearchSeed === 'string' ? o.projectsSearchSeed : '',
    }
  } catch {
    return null
  }
}

export function writeStoredAppJourney(data: StoredAppJourney): void {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.setItem(JOURNEY_KEY, JSON.stringify(data))
  } catch {
    /* quota / private mode */
  }
}

function filtersStorageKey(city: string, searchQuery: string): string {
  return `srp-applied-filters-v1:${encodeURIComponent(city)}:${encodeURIComponent(searchQuery)}`
}

/** Merge persisted JSON over defaults; invalid → null */
export function hydrateAppliedFiltersJson(json: string): SrpAppliedFilters | null {
  try {
    const o = JSON.parse(json) as Partial<SrpAppliedFilters>
    if (!o || typeof o !== 'object') return null
    const d = createDefaultSrpAppliedFilters()
    let budgetMinCr =
      typeof o.budgetMinCr === 'number' ? clampBudgetCr(o.budgetMinCr) : d.budgetMinCr
    let budgetMaxCr =
      typeof o.budgetMaxCr === 'number' ? clampBudgetCr(o.budgetMaxCr) : d.budgetMaxCr
    if (budgetMinCr > budgetMaxCr) {
      budgetMinCr = d.budgetMinCr
      budgetMaxCr = d.budgetMaxCr
    }

    const oLegacy = o as Partial<SrpAppliedFilters> & { minImageCount?: number }
    let mediaPreference: SrpMediaPreference = d.mediaPreference
    if (
      o.mediaPreference === 'photos' ||
      o.mediaPreference === 'videos' ||
      o.mediaPreference === 'both' ||
      o.mediaPreference === ''
    ) {
      mediaPreference = o.mediaPreference
    } else if (typeof oLegacy.minImageCount === 'number' && oLegacy.minImageCount > 0) {
      mediaPreference = 'photos'
    }

    const merged: SrpAppliedFilters = {
      ...d,
      ...o,
      hotspotAreaIds: Array.isArray(o.hotspotAreaIds)
        ? o.hotspotAreaIds.filter((x): x is string => typeof x === 'string')
        : d.hotspotAreaIds,
      bhk: Array.isArray(o.bhk)
        ? o.bhk.filter(
            (x): x is string =>
              typeof x === 'string' && ALLOWED_BHK_FILTER_IDS.has(x),
          )
        : d.bhk,
      propertyTypes: Array.isArray(o.propertyTypes)
        ? o.propertyTypes
            .filter((x): x is string => typeof x === 'string')
            .map((x) => normalizePropertyTypeFilterId(x))
            .filter((x): x is string => x !== null)
        : d.propertyTypes,
      construction: Array.isArray(o.construction)
        ? [
            ...new Set(
              o.construction.filter(
                (c): c is 'new_launch' | 'ready' | 'under_construction' =>
                  c === 'new_launch' ||
                  c === 'ready' ||
                  c === 'under_construction',
              ),
            ),
          ]
        : d.construction,
      listedBy: Array.isArray(o.listedBy)
        ? o.listedBy
            .filter((x): x is string => typeof x === 'string')
            .map((x) => normalizeListedByFilterId(x))
            .filter((x): x is string => x !== null)
        : d.listedBy,
      amenities: Array.isArray(o.amenities)
        ? o.amenities
            .filter((x): x is string => typeof x === 'string')
            .map((x) => normalizeAmenityFilterId(x))
            .filter((x): x is string => x !== null)
        : d.amenities,
      purchaseTypes: Array.isArray(o.purchaseTypes)
        ? o.purchaseTypes
            .filter((x): x is string => typeof x === 'string')
            .map((x) => normalizePurchaseTypeFilterId(x))
            .filter((x): x is string => x !== null)
        : d.purchaseTypes,
      propertyAges: Array.isArray(o.propertyAges)
        ? (() => {
            const next = o.propertyAges
              .filter((x): x is string => typeof x === 'string')
              .map((x) => normalizePropertyAgeFilterId(x))
              .filter((x): x is string => x !== null)
            return next.length <= 1 ? next : [next[0]!]
          })()
        : d.propertyAges,
      developers: Array.isArray(o.developers)
        ? o.developers.filter((x): x is string => typeof x === 'string')
        : d.developers,
      furnishing: Array.isArray(o.furnishing)
        ? o.furnishing.filter((x): x is string => typeof x === 'string')
        : d.furnishing,
      facing: Array.isArray(o.facing)
        ? o.facing.filter((x): x is string => typeof x === 'string')
        : d.facing,
      budgetMinCr,
      budgetMaxCr,
      areaSqFtMin: typeof o.areaSqFtMin === 'number' ? o.areaSqFtMin : d.areaSqFtMin,
      areaSqFtMax: typeof o.areaSqFtMax === 'number' ? o.areaSqFtMax : d.areaSqFtMax,
      mediaPreference,
      useHotspot: typeof o.useHotspot === 'boolean' ? o.useHotspot : d.useHotspot,
      upcomingOnly: typeof o.upcomingOnly === 'boolean' ? o.upcomingOnly : d.upcomingOnly,
      reraOnly: typeof o.reraOnly === 'boolean' ? o.reraOnly : d.reraOnly,
      verifiedOnly:
        typeof o.verifiedOnly === 'boolean' ? o.verifiedOnly : d.verifiedOnly,
      siteCorner:
        typeof o.siteCorner === 'boolean' ? o.siteCorner : d.siteCorner,
      siteBoundaryWall:
        typeof o.siteBoundaryWall === 'boolean'
          ? o.siteBoundaryWall
          : d.siteBoundaryWall,
      addedOn:
        o.addedOn === 'yesterday' ||
        o.addedOn === 'last_3_days' ||
        o.addedOn === 'last_week' ||
        o.addedOn === 'last_month'
          ? o.addedOn
          : o.addedOn === ''
            ? ''
            : d.addedOn,
      launcherWindow:
        o.launcherWindow === 'within_1y' ||
        o.launcherWindow === 'within_3y' ||
        o.launcherWindow === 'within_10y'
          ? o.launcherWindow
          : o.launcherWindow === ''
            ? ''
            : d.launcherWindow,
    }
    return cloneSrpAppliedFilters(merged)
  } catch {
    return null
  }
}

export function readStoredAppliedFilters(
  city: string,
  searchQuery: string,
): SrpAppliedFilters | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = sessionStorage.getItem(filtersStorageKey(city, searchQuery))
    if (!raw) return null
    return hydrateAppliedFiltersJson(raw)
  } catch {
    return null
  }
}

export function writeStoredAppliedFilters(
  city: string,
  searchQuery: string,
  filters: SrpAppliedFilters,
): void {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.setItem(
      filtersStorageKey(city, searchQuery),
      JSON.stringify(filters),
    )
  } catch {
    /* ignore */
  }
}
