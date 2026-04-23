import {
  startTransition,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import {
  ALL_HOTSPOT_AREA_IDS,
  HOTSPOT_AREA_OPTIONS,
  isFullHotspotAreaSelection,
} from '../../data/srpAreasMock'
import { getSrpListingsForCity, type SrpListing } from '../../data/srpMock'
import { SrpAreaPickerSheet } from './SrpAreaPickerSheet'
import {
  SRP_FILTER_SHEET_TRANSITION_MS,
  SrpFiltersSheet,
} from './SrpFiltersSheet'
import { HotspotSparkIcon, NewProjectsCuteIcon } from './SrpFilterCuteIcons'
import { SrpNewProjectsInfoBlock } from './SrpNewProjectsInfoBlock'
import { SrpListingCard } from './SrpListingCard'
import { SrpListingCardSkeleton } from './SrpListingCardSkeleton'
import {
  SrpYouMayAlsoLikeCard,
  YMAL_PROPERTY_SCROLL_PREVIEW,
  type SrpYouMayAlsoLikeTab,
} from './SrpYouMayAlsoLikeCard'
import {
  readStoredAppliedFilters,
  writeStoredAppliedFilters,
} from '../../persist/journeySession'
import {
  applySrpFilters,
  areSrpAppliedFiltersEqual,
  countActiveSrpFilterDimensions,
  createDefaultSrpAppliedFilters,
  getAppliedFilterChips,
  type AppliedFilterChip,
  type SrpAppliedFilters,
} from './srpFilterModel'
import { gentleHaptic } from '../../lib/gentleHaptic'

/** Must match `SRP_FILTER_SHEET_TRANSITION_MS` so un-zoom and sheet unmount stay in phase. */
const SRP_CHROME_ZOOM_MS = SRP_FILTER_SHEET_TRANSITION_MS
const SRP_CHROME_SCALE = 0.91

type SrpPageProps = {
  city: string
  initialQuery?: string
  onBack: () => void
  onOpenProjectSearch: (currentQuery: string) => void
}

const FILTERS: { id: string; label: string }[] = [
  { id: 'f', label: 'Filters' },
  { id: 'b', label: 'Budget' },
  { id: 'bhk', label: 'BHK type' },
  { id: 'bua', label: 'Built up area' },
  { id: 'cs', label: 'Construction status' },
]
const FILTER_MAIN = FILTERS[0]!
const FILTER_SHEET_SHORTCUTS = FILTERS.slice(1)

const INITIAL_VISIBLE = 10
const VIEW_MORE_STEP = 10

/** Brief skeleton when opening SRP from search (first paint) */
const INITIAL_SRP_LOAD_MS = 480

/** Skeleton rows when filters yield zero results while loading */
const EMPTY_LIST_SKELETON_COUNT = 3

/** Base simulated delay after filter taps (ms); a little jitter is added per refresh */
const LIST_REFRESH_MS_MIN = 560
const LIST_REFRESH_MS_JITTER = 180
/** Slightly shorter, after filter sheet closes — feels like a light reload */
const LIST_REFRESH_POST_SHEET_MS_MIN = 400
const LIST_REFRESH_POST_SHEET_JITTER = 100

function mergeAppliedChipOrder(
  prevFilters: SrpAppliedFilters,
  nextFilters: SrpAppliedFilters,
  order: string[],
): string[] {
  const prevChips = getAppliedFilterChips(prevFilters)
  const nextChips = getAppliedFilterChips(nextFilters)
  const prevLabel = new Map(prevChips.map((c) => [c.id, c.label]))
  const changed = nextChips.filter((c) => prevLabel.get(c.id) !== c.label)
  const changedFront = [...changed].reverse().map((c) => c.id)
  const nextIdSet = new Set(nextChips.map((c) => c.id))

  const rest = order.filter(
    (id) => nextIdSet.has(id) && !changedFront.includes(id),
  )
  const out = [...changedFront, ...rest]
  for (const c of nextChips) {
    if (!out.includes(c.id)) out.push(c.id)
  }
  return out
}

/** Mild elevation on filter chips */
const FILTER_PILL_SHADOW = 'shadow-[0_1px_3px_rgba(0,0,0,0.07)]'

/** Rounded controls — 12px corners (not pill / not `rounded-full`) */
const FILTER_PILL_RADIUS = 'rounded-[12px]'

/** Applied filter chips + active filter pill — lavender fill, primary purple label */
const FILTER_PILL_ACTIVE_PURPLE =
  'border-[#5B22DE] bg-[#F3ECFF] text-[#5B22DE]'
const APPLIED_FILTER_CHIP_ACTIVE = FILTER_PILL_ACTIVE_PURPLE

function BackIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#222222"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M15 18l-6-6 6-6" />
    </svg>
  )
}

function SearchIconPurple() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#5B22DE"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden
    >
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-4.3-4.3" />
    </svg>
  )
}

function SparkleIcon() {
  const gid = useId().replace(/:/g, '')
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <defs>
        <linearGradient
          id={`srp-sparkle-${gid}`}
          x1="4"
          y1="20"
          x2="20"
          y2="4"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#5B22DE" />
          <stop offset="0.55" stopColor="#A855F7" />
          <stop offset="1" stopColor="#7DD3FC" />
        </linearGradient>
      </defs>
      <path
        fill={`url(#srp-sparkle-${gid})`}
        d="M12 2l1.2 5.2a2 2 0 001.5 1.5L20 10l-5.3 1.3a2 2 0 00-1.5 1.5L12 18l-1.2-5.2a2 2 0 00-1.5-1.5L4 10l5.3-1.3a2 2 0 001.5-1.5L12 2z"
      />
    </svg>
  )
}

function ChevronDown({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  )
}

/** Filter icon for the main Filters pill (replaces chevron) */
function SrpFiltersPillIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M4 7h16M7 12h10M10 17h4" />
    </svg>
  )
}

function SrpBottomNav() {
  return (
    <nav
      className="fixed bottom-0 left-1/2 z-20 w-full max-w-[430px] -translate-x-1/2 border-t border-[#EBEBEB] bg-white px-2 pt-2 shadow-[0_-4px_24px_rgba(0,0,0,0.06)]"
      style={{
        paddingBottom: 'max(10px, env(safe-area-inset-bottom, 0px))',
      }}
    >
      <div className="flex items-center justify-between px-1">
        {[
          { id: 'home', label: 'Home', purple: false },
          { id: 'proj', label: 'Pre-owned', purple: true },
          { id: 'saved', label: 'Saved', purple: false },
          { id: 'prof', label: 'Profile', purple: false },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            className="flex min-w-0 flex-1 flex-col items-center gap-1 py-1 active:opacity-80"
          >
            <span
              className={
                t.purple ? 'text-[#5B22DE]' : 'text-[#9CA3AF]'
              }
            >
              {t.id === 'home' ? (
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <path d="M3 10.5L12 3l9 7.5" />
                  <path d="M5 10v11h14V10" />
                </svg>
              ) : t.id === 'proj' ? (
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  aria-hidden
                >
                  <path d="M3 21h18M5 21V7l8-4v18M19 21V11l-6-4" />
                </svg>
              ) : t.id === 'saved' ? (
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  aria-hidden
                >
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              ) : (
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  aria-hidden
                >
                  <circle cx="12" cy="8" r="4" />
                  <path d="M6 20v-1a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v1" />
                </svg>
              )}
            </span>
            <span
              className={[
                'max-w-full truncate text-[10px] font-medium',
                t.purple ? 'text-[#5B22DE]' : 'text-[#9CA3AF]',
              ].join(' ')}
            >
              {t.label}
            </span>
          </button>
        ))}
      </div>
    </nav>
  )
}

/** New Projects tab: prefer listings whose hero/thumb differ from the first hotspot strip. */
function upcomingListingsDistinctFromHotspotHead(
  hotspotPool: SrpListing[],
  upcomingPool: SrpListing[],
  headCount: number,
): SrpListing[] {
  const head = hotspotPool.slice(0, headCount)
  const forbidIds = new Set(head.map((l) => l.id))
  const forbidMain = new Set(head.map((l) => l.imageMain))
  const forbidSec = new Set(head.map((l) => l.imageSecondary))

  const tier1 = upcomingPool.filter(
    (l) =>
      !forbidIds.has(l.id) &&
      !forbidMain.has(l.imageMain) &&
      !forbidSec.has(l.imageSecondary),
  )
  const tier2 = upcomingPool.filter((l) => !forbidIds.has(l.id))
  const tier3 = upcomingPool.filter(
    (l) => !forbidMain.has(l.imageMain) && !forbidSec.has(l.imageSecondary),
  )

  const out: SrpListing[] = []
  const seen = new Set<string>()
  for (const row of [...tier1, ...tier2, ...tier3, ...upcomingPool]) {
    if (seen.has(row.id)) continue
    seen.add(row.id)
    out.push(row)
  }
  return out.length ? out : upcomingPool
}

export function SrpPage({
  city,
  initialQuery = '',
  onBack,
  onOpenProjectSearch,
}: SrpPageProps) {
  const [query] = useState(initialQuery)
  const [appliedFilters, setAppliedFilters] = useState<SrpAppliedFilters>(() => {
    const stored = readStoredAppliedFilters(city, initialQuery)
    return stored ?? createDefaultSrpAppliedFilters()
  })
  const [filtersSheetOpen, setFiltersSheetOpen] = useState(false)
  const openFiltersSheet = useCallback(() => {
    gentleHaptic()
    setFiltersSheetOpen(true)
  }, [])
  /** Background zoom / radius — delayed to match sheet arm frame; off when sheet closes */
  const [filterChromeActive, setFilterChromeActive] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReducedMotion(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  useEffect(() => {
    if (!filtersSheetOpen) {
      setFilterChromeActive(false)
      return
    }
    if (reducedMotion) {
      setFilterChromeActive(true)
      return
    }
    let id1 = 0
    let id2 = 0
    /** Two frames: commit `scale(1)` + transition, then animate toward zoomed scale */
    id1 = requestAnimationFrame(() => {
      id2 = requestAnimationFrame(() => setFilterChromeActive(true))
    })
    return () => {
      cancelAnimationFrame(id1)
      cancelAnimationFrame(id2)
    }
  }, [filtersSheetOpen, reducedMotion])
  const [areaSheetOpen, setAreaSheetOpen] = useState(false)
  const [visibleLimit, setVisibleLimit] = useState(INITIAL_VISIBLE)
  const [listLoading, setListLoading] = useState(false)
  const [initialLoad, setInitialLoad] = useState(true)
  const listRefreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  /** After Apply: run light skeleton once the sheet has finished closing */
  const refreshListAfterFilterApplyRef = useRef(false)
  const appliedFiltersRef = useRef(appliedFilters)
  appliedFiltersRef.current = appliedFilters

  const [appliedChipOrder, setAppliedChipOrder] = useState<string[]>([])

  const showListSkeleton = listLoading || initialLoad

  const bumpListRefresh = useCallback(
    (kind: 'default' | 'postSheet' = 'default') => {
      setListLoading(true)
      if (listRefreshTimerRef.current) {
        clearTimeout(listRefreshTimerRef.current)
      }
      const base =
        kind === 'postSheet'
          ? LIST_REFRESH_POST_SHEET_MS_MIN
          : LIST_REFRESH_MS_MIN
      const jitter =
        kind === 'postSheet'
          ? LIST_REFRESH_POST_SHEET_JITTER
          : LIST_REFRESH_MS_JITTER
      const ms = base + Math.floor(Math.random() * jitter)
      listRefreshTimerRef.current = setTimeout(() => {
        setListLoading(false)
        listRefreshTimerRef.current = null
      }, ms)
    },
    [],
  )

  useEffect(() => {
    return () => {
      if (listRefreshTimerRef.current) {
        clearTimeout(listRefreshTimerRef.current)
      }
    }
  }, [])

  useEffect(() => {
    const t = window.setTimeout(() => setInitialLoad(false), INITIAL_SRP_LOAD_MS)
    return () => window.clearTimeout(t)
  }, [])

  const selectedAreaIds = useMemo(
    () => new Set(appliedFilters.hotspotAreaIds),
    [appliedFilters.hotspotAreaIds],
  )
  const filterHotspot = appliedFilters.useHotspot
  const filterUpcoming = appliedFilters.upcomingOnly
  const showNewProjectsGuidance =
    appliedFilters.upcomingOnly ||
    appliedFilters.construction.includes('new_launch')

  useEffect(() => {
    setVisibleLimit(INITIAL_VISIBLE)
  }, [appliedFilters, city])

  useEffect(() => {
    writeStoredAppliedFilters(city, initialQuery, appliedFilters)
  }, [appliedFilters, city, initialQuery])

  /** Prune chip order when dimensions disappear (strip toggles, chip X, etc.). New chips still render via `orderedAppliedFilterChips` tail. */
  useEffect(() => {
    const ids = new Set(getAppliedFilterChips(appliedFilters).map((c) => c.id))
    setAppliedChipOrder((o) => {
      const pruned = o.filter((id) => ids.has(id))
      if (pruned.length === o.length && pruned.every((id, i) => id === o[i])) return o
      return pruned
    })
  }, [appliedFilters])

  const listings = useMemo(() => getSrpListingsForCity(city), [city])

  const youMayAlsoLikeHotspots = useMemo(
    () => listings.filter((l) => l.hotspot),
    [listings],
  )
  const youMayAlsoLikeNewProjects = useMemo(() => {
    const upcomingPool = listings.filter(
      (l) => l.possessionStatus !== 'ready',
    )
    return upcomingListingsDistinctFromHotspotHead(
      youMayAlsoLikeHotspots,
      upcomingPool,
      YMAL_PROPERTY_SCROLL_PREVIEW,
    )
  }, [listings, youMayAlsoLikeHotspots])

  const filteredStrict = useMemo(
    () => applySrpFilters(listings, appliedFilters),
    [listings, appliedFilters],
  )

  /** With any non-default filters, never show an empty feed — fall back to full city list. */
  const filtered = useMemo(() => {
    if (filteredStrict.length > 0) return filteredStrict
    if (
      listings.length > 0 &&
      !areSrpAppliedFiltersEqual(
        appliedFilters,
        createDefaultSrpAppliedFilters(),
      )
    ) {
      return listings
    }
    return filteredStrict
  }, [filteredStrict, listings, appliedFilters])

  const filterDimCount = countActiveSrpFilterDimensions(appliedFilters)

  const appliedChipCount = useMemo(
    () => getAppliedFilterChips(appliedFilters).length,
    [appliedFilters],
  )

  const orderedAppliedFilterChips = useMemo((): AppliedFilterChip[] => {
    const chips = getAppliedFilterChips(appliedFilters)
    if (appliedChipOrder.length === 0) return chips
    const byId = new Map(chips.map((c) => [c.id, c]))
    const seen = new Set<string>()
    const out: AppliedFilterChip[] = []
    for (const id of appliedChipOrder) {
      const c = byId.get(id)
      if (c) {
        out.push(c)
        seen.add(id)
      }
    }
    for (const c of chips) {
      if (!seen.has(c.id)) out.push(c)
    }
    return out
  }, [appliedFilters, appliedChipOrder])

  const areasSubsetActive =
    filterHotspot &&
    selectedAreaIds.size > 0 &&
    !isFullHotspotAreaSelection(selectedAreaIds)

  const hotspotAreasEmpty = filterHotspot && selectedAreaIds.size === 0

  /** Purple pill + “Filters (n)” + Clear — any counted dimension, chip strip, or invalid hotspot selection */
  const filtersPillActive =
    filterDimCount > 0 || hotspotAreasEmpty || appliedChipCount > 0

  const filtersBadgeCount =
    filterDimCount > 0
      ? filterDimCount
      : appliedChipCount > 0
        ? appliedChipCount
        : hotspotAreasEmpty
          ? 1
          : 0

  const toggleHotspot = () => {
    startTransition(() => {
      setAppliedFilters((f) => {
        const next = !f.useHotspot
        return {
          ...f,
          useHotspot: next,
          hotspotAreaIds: next ? [...ALL_HOTSPOT_AREA_IDS] : f.hotspotAreaIds,
        }
      })
    })
    requestAnimationFrame(() => {
      bumpListRefresh()
    })
  }

  const toggleUpcoming = () => {
    bumpListRefresh()
    setAppliedFilters((f) => {
      const next = !f.upcomingOnly
      return {
        ...f,
        upcomingOnly: next,
        construction: next ? [] : f.construction,
      }
    })
  }

  const clearAll = () => {
    bumpListRefresh()
    setAppliedChipOrder([])
    setAppliedFilters(createDefaultSrpAppliedFilters())
    setAreaSheetOpen(false)
  }

  const handleFilterSheetApply = useCallback((next: SrpAppliedFilters) => {
    refreshListAfterFilterApplyRef.current = true
    const prev = appliedFiltersRef.current
    setAppliedChipOrder((order) => mergeAppliedChipOrder(prev, next, order))
    setAppliedFilters(next)
  }, [])

  const handleFiltersSheetClose = useCallback(() => {
    setFiltersSheetOpen(false)
    if (refreshListAfterFilterApplyRef.current) {
      refreshListAfterFilterApplyRef.current = false
      bumpListRefresh('postSheet')
    }
  }, [bumpListRefresh])

  const applyYouMayAlsoLikeViewAll = (tab: SrpYouMayAlsoLikeTab) => {
    bumpListRefresh()
    if (tab === 'hotspots') {
      startTransition(() => {
        setAppliedFilters((f) => ({
          ...f,
          useHotspot: true,
          upcomingOnly: false,
          construction: [],
          hotspotAreaIds: [...ALL_HOTSPOT_AREA_IDS],
        }))
      })
    } else {
      setAppliedFilters((f) => ({
        ...f,
        useHotspot: false,
        upcomingOnly: true,
        construction: [],
      }))
    }
  }

  const expandListFromYouMayAlsoLike = () => {
    bumpListRefresh()
    setVisibleLimit((n) => Math.min(n + VIEW_MORE_STEP, filtered.length))
  }

  const intent = query.trim()
  const q = query.trim()
  const showIdleCursor = !q

  const visibleList = filtered.slice(0, visibleLimit)

  const feedElements: ReactNode[] = []
  let cardIndex = 0
  for (const listing of visibleList) {
    if (cardIndex === 3 && filtered.length > 3 && !showListSkeleton) {
      feedElements.push(
        <SrpYouMayAlsoLikeCard
          key="you-may-also-like"
          hotspotListings={youMayAlsoLikeHotspots}
          upcomingListings={youMayAlsoLikeNewProjects}
          searchQuery={intent}
          onViewAll={applyYouMayAlsoLikeViewAll}
          onViewMore={expandListFromYouMayAlsoLike}
        />,
      )
    }
    feedElements.push(
      showListSkeleton ? (
        <SrpListingCardSkeleton key={`sk-${listing.id}`} staggerIndex={cardIndex} />
      ) : (
        <SrpListingCard key={listing.id} listing={listing} />
      ),
    )
    cardIndex += 1
  }

  const canViewMore = visibleLimit < filtered.length

  return (
    <div className="relative min-h-dvh w-full">
      {filtersSheetOpen ? (
        <div
          className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(180deg,#FFFFFF_0%,#FFFFFF_min(260px,32dvh),#F6F8FB_min(260px,32dvh),#F6F8FB_100%)]"
          aria-hidden
        />
      ) : null}
      <div
        className={[
          'projects-shell relative z-[1] flex min-h-dvh flex-col',
          filtersSheetOpen ? 'bg-transparent' : 'bg-[#F6F8FB]',
          'origin-top',
          filtersSheetOpen ? 'overflow-hidden rounded-2xl will-change-transform' : null,
          'motion-reduce:transition-none',
        ]
          .filter(Boolean)
          .join(' ')}
        style={
          filtersSheetOpen
            ? {
                transform: filterChromeActive
                  ? `translate3d(0,0,0) scale(${SRP_CHROME_SCALE})`
                  : 'translate3d(0,0,0) scale(1)',
                ...(reducedMotion
                  ? {}
                  : {
                      transitionProperty: 'transform',
                    transitionDuration: `${SRP_CHROME_ZOOM_MS}ms`,
                    transitionTimingFunction:
                      'cubic-bezier(0.25, 0.1, 0.25, 1)',
                    }),
              }
            : undefined
        }
      >
      <div className="shrink-0 bg-white">
        <header
          className="relative z-20 bg-white"
          style={{
            paddingTop: 'max(10px, env(safe-area-inset-top, 0px))',
          }}
        >
          <div className="flex items-center gap-2 px-3 pb-2 pt-1">
            <button
              type="button"
              onClick={onBack}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full active:bg-black/[0.05]"
              aria-label="Back"
            >
              <BackIcon />
            </button>
            <button
              type="button"
              onClick={() => onOpenProjectSearch(query)}
              className="flex min-h-[48px] min-w-0 flex-1 items-center gap-2 rounded-lg border border-[#E0E0E0] bg-white px-3 py-1 text-left shadow-[0_1px_2px_rgba(0,0,0,0.05)] active:bg-[#FAFAFA]"
              aria-label="Edit search on Project search"
            >
              <span className="shrink-0" aria-hidden>
                <SearchIconPurple />
              </span>
              {showIdleCursor ? (
                <span
                  className="h-[18px] w-0.5 shrink-0 animate-pulse rounded-full bg-[#5B22DE]"
                  aria-hidden
                />
              ) : null}
              <span
                className={[
                  'min-w-0 flex-1 truncate py-2 text-[15px] font-normal leading-5',
                  q ? 'text-[#222222]' : 'text-[#8A8A8A]',
                ].join(' ')}
              >
                {q || 'What are you looking for?'}
              </span>
              <div className="h-5 w-px shrink-0 bg-[#E8E8E8]" aria-hidden />
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                aria-hidden
              >
                <SparkleIcon />
              </span>
            </button>
          </div>
        </header>

        <div className="isolate bg-white shadow-[0_6px_16px_-4px_rgba(0,0,0,0.08)] [contain:layout]">
          <div
            className="flex gap-2 overflow-x-auto px-3 pb-2 pt-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            <div
              key={FILTER_MAIN.id}
              className={[
                `inline-flex shrink-0 items-stretch overflow-hidden border ${FILTER_PILL_RADIUS}`,
                FILTER_PILL_SHADOW,
                filtersPillActive
                  ? FILTER_PILL_ACTIVE_PURPLE
                  : 'border-[#DDDDDD] bg-white text-[#222222]',
              ].join(' ')}
            >
              <button
                type="button"
                onClick={openFiltersSheet}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium leading-4"
              >
                <span className="shrink-0" aria-hidden>
                  <SrpFiltersPillIcon />
                </span>
                <span className="whitespace-nowrap">
                  {filtersBadgeCount > 0
                    ? `Filters (${filtersBadgeCount})`
                    : FILTER_MAIN.label}
                </span>
              </button>
              {filtersPillActive ? (
                <>
                  <span
                    className="w-px shrink-0 self-stretch bg-[#C4B5E8]/80"
                    aria-hidden
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      clearAll()
                    }}
                    className="px-2.5 py-2 text-[11px] font-semibold leading-4 text-[#5B22DE] underline underline-offset-2 active:opacity-70"
                    aria-label="Clear all filters"
                  >
                    Clear
                  </button>
                </>
              ) : null}
            </div>

            {orderedAppliedFilterChips.map((chip) => (
              <div
                key={chip.id}
                className={[
                  `inline-flex max-w-[220px] shrink-0 items-center gap-0.5 border pl-2.5 pr-0.5 text-xs font-semibold leading-4 ${FILTER_PILL_RADIUS}`,
                  FILTER_PILL_SHADOW,
                  APPLIED_FILTER_CHIP_ACTIVE,
                ].join(' ')}
              >
                <span className="min-w-0 flex-1 truncate py-2 pl-0.5">
                  {chip.label}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setAppliedChipOrder((o) => o.filter((id) => id !== chip.id))
                    bumpListRefresh()
                    setAppliedFilters((f) => chip.clear(f))
                  }}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[15px] font-light leading-none text-[#5B22DE] active:bg-[#E8DEF9]"
                  aria-label={`Remove ${chip.label}`}
                >
                  ×
                </button>
              </div>
            ))}

            {FILTER_SHEET_SHORTCUTS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={openFiltersSheet}
                className={[
                  `inline-flex shrink-0 items-center gap-1 border px-3 py-2 text-xs font-medium leading-4 ${FILTER_PILL_RADIUS}`,
                  FILTER_PILL_SHADOW,
                  'border-[#DDDDDD] bg-white text-[#222222]',
                ].join(' ')}
              >
                {f.label}
                <ChevronDown className="text-[#6A6A6A]" />
              </button>
            ))}
          </div>

          <div
            className="flex flex-nowrap items-center gap-2 overflow-x-auto px-3 pb-3 pt-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            <div
              className={[
                'flex shrink-0 items-center will-change-[gap]',
                'transition-[gap] duration-300 ease-[cubic-bezier(0.33,1,0.68,1)]',
                filterHotspot ? 'gap-2' : 'gap-0',
              ].join(' ')}
            >
              <button
                type="button"
                onClick={toggleHotspot}
                className={[
                  `inline-flex shrink-0 items-center gap-1.5 border px-3 py-2 text-xs font-medium leading-4 transition-colors duration-200 ${FILTER_PILL_RADIUS}`,
                  FILTER_PILL_SHADOW,
                  filterHotspot
                    ? FILTER_PILL_ACTIVE_PURPLE
                    : 'border-[#DDDDDD] bg-white text-[#222222]',
                ].join(' ')}
              >
                <HotspotSparkIcon active={filterHotspot} />
                City hotspots
              </button>
              <div
                className={[
                  'shrink-0 overflow-hidden will-change-[width]',
                  'transition-[width] duration-300 ease-[cubic-bezier(0.33,1,0.68,1)]',
                  filterHotspot ? 'w-[132px]' : 'pointer-events-none w-0',
                ].join(' ')}
                aria-hidden={!filterHotspot}
              >
                <button
                  type="button"
                  onClick={() => setAreaSheetOpen(true)}
                  tabIndex={filterHotspot ? 0 : -1}
                  className={[
                    `inline-flex w-[132px] shrink-0 items-center justify-center gap-1 whitespace-nowrap border px-3 py-2 text-xs font-medium leading-4 transition-colors duration-200 ${FILTER_PILL_RADIUS}`,
                    FILTER_PILL_SHADOW,
                    areasSubsetActive
                      ? FILTER_PILL_ACTIVE_PURPLE
                      : selectedAreaIds.size === 0
                        ? 'border-[#FCA5A5] bg-white text-[#222222]'
                        : 'border-[#DDDDDD] bg-white text-[#222222]',
                  ].join(' ')}
                  aria-label="Choose hotspot areas"
                >
                  All areas
                  <ChevronDown
                    className={
                      areasSubsetActive
                        ? 'shrink-0 text-[#5B22DE]/70'
                        : 'shrink-0 text-[#6A6A6A]'
                    }
                  />
                </button>
              </div>
            </div>
            <button
              type="button"
              onClick={toggleUpcoming}
              className={[
                `inline-flex shrink-0 items-center gap-1.5 border px-3 py-2 text-xs font-medium leading-4 transition-colors ${FILTER_PILL_RADIUS}`,
                FILTER_PILL_SHADOW,
                filterUpcoming
                  ? FILTER_PILL_ACTIVE_PURPLE
                  : 'border-[#DDDDDD] bg-white text-[#222222]',
              ].join(' ')}
              aria-label="New projects in Gurgaon"
            >
              <NewProjectsCuteIcon active={filterUpcoming} />
              New projects in Gurgaon
            </button>
          </div>
        </div>
      </div>

      <main
        className="min-h-0 flex-1 overflow-y-auto bg-[#F6F8FB] px-3 pb-24 pt-3"
        style={{ WebkitOverflowScrolling: 'touch' }}
        aria-busy={showListSkeleton}
      >
        <div className="mb-3">
          <p
            className={[
              'text-xs font-normal leading-4 text-[#6A6A6A]',
              showListSkeleton ? 'animate-pulse' : '',
            ].join(' ')}
          >
            {showListSkeleton ? (
              <>
                <span className="font-medium text-[#222222]">Updating results</span>
                <span className="text-[#9CA3AF]">…</span>
              </>
            ) : intent ? (
              <>
                Showing{' '}
                <span className="font-medium text-[#222222]">{filtered.length}</span>{' '}
                results for{' '}
                <span className="font-medium text-[#222222]">{intent}</span>
                {' in '}
                <span className="font-medium text-[#222222]">{city}</span>
              </>
            ) : (
              <>
                Showing{' '}
                <span className="font-medium text-[#222222]">{filtered.length}</span>{' '}
                results in{' '}
                <span className="font-medium text-[#222222]">{city}</span>
              </>
            )}
          </p>
        </div>

        {filtered.length === 0 && !showListSkeleton ? (
          <div className="flex flex-col gap-4">
            {showNewProjectsGuidance ? <SrpNewProjectsInfoBlock /> : null}
            <div className="rounded-xl border border-[#E8E8E8] bg-[#FAFAFA] px-4 py-8 text-center shadow-sm">
              <p className="text-sm font-medium text-[#222222]">No listings match</p>
              <p className="mt-1 text-xs text-[#6A6A6A]">
                Try turning off City hotspots or New projects in Gurgaon, adjust All areas,
                or clear filters.
              </p>
              <button
                type="button"
                onClick={clearAll}
                className={`mt-4 border border-[#5B22DE] bg-white px-4 py-2 text-xs font-semibold text-[#5B22DE] active:bg-[#F3ECFF] ${FILTER_PILL_RADIUS}`}
              >
                Clear filters
              </button>
            </div>
          </div>
        ) : filtered.length === 0 && showListSkeleton ? (
          <div className="flex flex-col gap-4">
            {showNewProjectsGuidance ? <SrpNewProjectsInfoBlock /> : null}
            {Array.from({ length: EMPTY_LIST_SKELETON_COUNT }, (_, i) => (
              <SrpListingCardSkeleton key={i} staggerIndex={i} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {showNewProjectsGuidance ? <SrpNewProjectsInfoBlock /> : null}
            {feedElements}
            {canViewMore && !showListSkeleton ? (
              <div className="rounded-xl border border-[#E8E8E8] bg-[#FAFAFA] px-4 py-4 text-center shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
                <button
                  type="button"
                  onClick={() =>
                    setVisibleLimit((n) =>
                      Math.min(n + VIEW_MORE_STEP, filtered.length),
                    )
                  }
                  className="text-sm font-semibold text-[#5B22DE] transition-opacity active:opacity-70"
                >
                  View more
                </button>
                <p className="mt-1 text-[11px] text-[#9CA3AF]">
                  Showing {visibleList.length} of {filtered.length} listings
                </p>
              </div>
            ) : null}
          </div>
        )}
      </main>

      <SrpBottomNav />

      <SrpAreaPickerSheet
        open={areaSheetOpen}
        onClose={() => setAreaSheetOpen(false)}
        committedIds={selectedAreaIds}
        areas={HOTSPOT_AREA_OPTIONS}
        onApply={(next) => {
          setAppliedFilters((f) => ({
            ...f,
            hotspotAreaIds: [...next],
          }))
          bumpListRefresh()
          setAreaSheetOpen(false)
        }}
      />

      <SrpFiltersSheet
        open={filtersSheetOpen}
        onClose={handleFiltersSheetClose}
        onCloseMotionStart={() => setFilterChromeActive(false)}
        applied={appliedFilters}
        onApply={handleFilterSheetApply}
      />
      </div>
    </div>
  )
}
