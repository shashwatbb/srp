import { useEffect, useRef, useState } from 'react'
import {
  HOTSPOT_LOCALITY_STRIP,
  HotspotLocalityCard,
  HotspotLocalityCardSkeleton,
} from '../projects/HotspotLocalityShared'
import type { SrpListing } from '../../data/srpMock'

export type SrpYouMayAlsoLikeTab = 'hotspots' | 'newProjects'

type SrpYouMayAlsoLikeCardProps = {
  /** Retained for callers; City Hotspots strip uses curated locality cards */
  hotspotListings: SrpListing[]
  upcomingListings: SrpListing[]
  /** SRP search text — drives “from your searched area” copy on New Projects cards */
  searchQuery?: string
  /** How many tiles before the trailing “View more” tile (New Projects tab) */
  previewCount?: number
  onViewAll: (tab: SrpYouMayAlsoLikeTab) => void
  onViewMore: () => void
}

/** Property tiles before “View more” — keep in sync with SrpPage YMAL disjoint logic */
export const YMAL_PROPERTY_SCROLL_PREVIEW = 4

const DEFAULT_PREVIEW = YMAL_PROPERTY_SCROLL_PREVIEW

/** Min height for strip tiles (locality cards are slightly taller with image) */
const STRIP_TILE_H = 'min-h-[256px]'

const TAB_STRIP_LOAD_MS = 420

function hashToRange(s: string, min: number, max: number): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return min + (h % (max - min + 1))
}

/** Distance-style line from search context — varied mins per listing; no hardcoded YoY */
function distanceFromSearchLine(listingId: string, searchQuery: string): string {
  const mins = hashToRange(listingId, 7, 21)
  const q = searchQuery.trim()
  if (q.length > 0) {
    const short = q.length > 26 ? `${q.slice(0, 24)}…` : q
    return `Approx. ${mins} mins from “${short}”`
  }
  return `Approx. ${mins} mins from your searched area`
}

function HorizontalPropertyCardSkeleton({ index }: { index: number }) {
  const delay = index * 70
  return (
    <div
      aria-hidden
      className={[
        'flex w-[164px] shrink-0 flex-col overflow-hidden rounded-xl border border-[#E8E8E8] bg-white',
        STRIP_TILE_H,
      ].join(' ')}
    >
      <div
        className="h-[118px] w-full shrink-0 animate-pulse rounded-t-[10px] bg-[#E6E6E6]"
        style={{ animationDelay: `${delay}ms` }}
      />
      <div className="flex flex-1 flex-col justify-between gap-2 p-3 pt-2.5">
        <div className="space-y-2">
          <div
            className="h-3.5 w-[88%] animate-pulse rounded-md bg-[#E6E6E6]"
            style={{ animationDelay: `${delay}ms` }}
          />
          <div
            className="h-3.5 w-[62%] animate-pulse rounded-md bg-[#E6E6E6]"
            style={{ animationDelay: `${delay}ms` }}
          />
          <div
            className="h-3 w-[72%] animate-pulse rounded-md bg-[#E6E6E6]"
            style={{ animationDelay: `${delay}ms` }}
          />
          <div
            className="h-2.5 w-[80%] animate-pulse rounded-md bg-[#E8E8E8]"
            style={{ animationDelay: `${delay}ms` }}
          />
        </div>
        <div
          className="h-3 w-14 animate-pulse rounded-md bg-[#E6E6E6]"
          style={{ animationDelay: `${delay}ms` }}
        />
      </div>
    </div>
  )
}

function HorizontalPropertyCard({
  listing,
  searchQuery,
}: {
  listing: SrpListing
  searchQuery: string
}) {
  const distanceLine = distanceFromSearchLine(listing.id, searchQuery)
  return (
    <button
      type="button"
      className={[
        'group flex w-[164px] shrink-0 flex-col overflow-hidden rounded-xl border border-[#E8E8E8] bg-white text-left shadow-[0_1px_4px_rgba(0,0,0,0.06)] transition-all duration-200 active:scale-[0.98] hover:border-[#D0D0D0] hover:shadow-md',
        STRIP_TILE_H,
      ].join(' ')}
    >
      <div className="relative h-[118px] w-full shrink-0 overflow-hidden bg-[#EBEBEB]">
        <img
          src={listing.imageMain}
          alt=""
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          width={328}
          height={246}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
        />
      </div>
      <div className="flex min-h-0 flex-1 flex-col p-3 pt-2.5">
        <p className="line-clamp-2 min-h-[2.5rem] text-[13px] font-semibold leading-[1.25] text-[#222222]">
          {listing.projectName}
        </p>
        <p className="mt-1 h-4 shrink-0 line-clamp-1 text-xs leading-4 text-[#6A6A6A]">
          {listing.locationLine}
        </p>
        <p className="mt-1 line-clamp-1 text-[10px] font-normal leading-tight text-[#8B9199]">
          {distanceLine}
        </p>
        <p className="mt-auto pt-2 text-xs font-semibold leading-4 text-[#5B22DE]">{listing.price}</p>
      </div>
    </button>
  )
}

/** Segmented control styled like reference: pill rail, thick black active ring, calm type */
function YouMayAlsoLikeTabs({
  active,
  onChange,
  tabIds,
}: {
  active: SrpYouMayAlsoLikeTab
  onChange: (tab: SrpYouMayAlsoLikeTab) => void
  tabIds: { id: SrpYouMayAlsoLikeTab; label: string }[]
}) {
  return (
    <div
      role="tablist"
      aria-label="Recommendation type"
      className="flex w-full items-stretch rounded-full border border-[#D8D8D8] bg-white p-[3px] shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
    >
      {tabIds.map((t, i) => {
        const isActive = active === t.id
        return (
          <div key={t.id} className="contents">
            {i > 0 ? (
              <div
                className="my-1.5 w-px shrink-0 self-stretch bg-[#E5E5E5]"
                aria-hidden
              />
            ) : null}
            <button
              type="button"
              role="tab"
              id={`srp-ymal-tab-${t.id}`}
              aria-selected={isActive}
              tabIndex={0}
              onClick={() => onChange(t.id)}
              className={[
                'min-w-0 flex-1 rounded-full px-2 py-2.5 text-center text-[13px] leading-tight tracking-tight transition-[border-color,background-color,font-weight] duration-150',
                isActive
                  ? 'border-2 border-[#111111] bg-[#F4F4F4] font-semibold text-[#111111]'
                  : 'border-2 border-transparent font-normal text-[#111111]',
              ].join(' ')}
            >
              {t.label}
            </button>
          </div>
        )
      })}
    </div>
  )
}

/**
 * Single “You may also like” card with segmented tabs + horizontal reco strip + View all.
 * Replaces the old inline filter band between listings.
 */
export function SrpYouMayAlsoLikeCard({
  hotspotListings: _hotspotListings,
  upcomingListings,
  searchQuery = '',
  previewCount = DEFAULT_PREVIEW,
  onViewAll,
  onViewMore,
}: SrpYouMayAlsoLikeCardProps) {
  void _hotspotListings

  const [tab, setTab] = useState<SrpYouMayAlsoLikeTab>('hotspots')
  const [stripLoading, setStripLoading] = useState(false)
  const stripTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (stripTimerRef.current) window.clearTimeout(stripTimerRef.current)
    }
  }, [])

  const handleTabChange = (next: SrpYouMayAlsoLikeTab) => {
    if (next === tab) return
    setTab(next)
    setStripLoading(true)
    if (stripTimerRef.current) window.clearTimeout(stripTimerRef.current)
    stripTimerRef.current = window.setTimeout(() => {
      setStripLoading(false)
      stripTimerRef.current = null
    }, TAB_STRIP_LOAD_MS)
  }

  const newProjectSlice = upcomingListings.slice(0, previewCount)
  const hotspotStripCount = Math.min(HOTSPOT_LOCALITY_STRIP.length, previewCount)

  const viewAllLabel =
    tab === 'hotspots' ? 'View all City Hotspots' : 'View all New Projects'

  const tabDefs = [
    { id: 'hotspots' as const, label: 'City Hotspots' },
    { id: 'newProjects' as const, label: 'New Projects' },
  ]

  const skeletonCount = tab === 'hotspots' ? hotspotStripCount : previewCount

  return (
    <section
      className="rounded-xl border border-[#E8E8E8] bg-[#FAFAFA] p-4 shadow-[0_1px_3px_rgba(0,0,0,0.05)]"
      aria-label="You may also like"
    >
      <h3 className="text-sm font-semibold leading-5 text-[#222222]">You may also like</h3>

      <div className="mt-3">
        <YouMayAlsoLikeTabs active={tab} onChange={handleTabChange} tabIds={tabDefs} />
      </div>

      <div
        className="mt-4 -mx-4 flex items-stretch gap-3 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ WebkitOverflowScrolling: 'touch' }}
        aria-busy={stripLoading}
      >
        {stripLoading
          ? tab === 'hotspots'
            ? Array.from({ length: skeletonCount }, (_, i) => (
                <HotspotLocalityCardSkeleton key={`ymal-loc-sk-${i}`} index={i} />
              ))
            : Array.from({ length: skeletonCount }, (_, i) => (
                <HorizontalPropertyCardSkeleton key={`ymal-sk-${tab}-${i}`} index={i} />
              ))
          : tab === 'hotspots'
            ? HOTSPOT_LOCALITY_STRIP.slice(0, hotspotStripCount).map((item) => (
                <HotspotLocalityCard
                  key={item.id}
                  item={item}
                  onViewProjects={() => onViewAll('hotspots')}
                />
              ))
            : newProjectSlice.map((listing) => (
                <HorizontalPropertyCard
                  key={`${tab}-${listing.id}`}
                  listing={listing}
                  searchQuery={searchQuery}
                />
              ))}
        <button
          type="button"
          onClick={onViewMore}
          className="flex min-h-[256px] w-[120px] shrink-0 flex-col items-center justify-center gap-1.5 self-stretch rounded-xl border border-dashed border-[#D0D0D0] bg-white/80 px-2 py-3 text-center transition-colors active:scale-[0.98] hover:border-[#BDBDBD] hover:bg-white"
        >
          <span className="text-xs font-semibold leading-4 text-[#222222]">View more</span>
          <span className="text-[10px] leading-3 text-[#9CA3AF]">In this list</span>
        </button>
      </div>

      <button
        type="button"
        onClick={() => onViewAll(tab)}
        aria-label={viewAllLabel}
        className="mt-4 w-full rounded-lg bg-[#5B22DE] py-3.5 text-center text-[15px] font-semibold leading-5 text-white shadow-[0_1px_3px_rgba(91,34,222,0.35)] transition-colors active:bg-[#4C1BB8]"
      >
        View All
      </button>
    </section>
  )
}
