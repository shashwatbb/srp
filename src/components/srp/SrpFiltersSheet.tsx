import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from 'react'
import { createPortal } from 'react-dom'
import {
  ALL_HOTSPOT_AREA_IDS,
  HOTSPOT_AREA_OPTIONS,
} from '../../data/srpAreasMock'
import {
  FILTER_AMENITIES_LONG,
  FILTER_BHK_OPTIONS,
  FILTER_CATEGORY_IDS,
  FILTER_CATEGORY_LABELS,
  FILTER_CONSTRUCTION_OPTIONS,
  FILTER_DEVELOPER_OPTIONS,
  FILTER_FACING_OPTIONS,
  FILTER_FURNISHING_OPTIONS,
  FILTER_LISTED_BY_OPTIONS,
  FILTER_PHOTOS_OPTIONS,
  FILTER_PROPERTY_AGE_OPTIONS,
  FILTER_PROPERTY_TYPE_OPTIONS,
  FILTER_PURCHASE_TYPE_OPTIONS,
  type FilterCategoryId,
} from '../../data/srpFiltersMock'
import {
  areSrpAppliedFiltersEqual,
  cloneSrpAppliedFilters,
  countActiveSrpFilterDimensions,
  createDefaultSrpAppliedFilters,
  type SrpAppliedFilters,
} from './srpFilterModel'

type SrpFiltersSheetProps = {
  open: boolean
  onClose: () => void
  applied: SrpAppliedFilters
  onApply: (next: SrpAppliedFilters) => void
  /** Fires synchronously when close slide starts — use to sync background zoom with sheet */
  onCloseMotionStart?: () => void
}

/** Sheet + SRP chrome: one duration so zoom isn’t cut off when sheet unmounts */
export const SRP_FILTER_SHEET_TRANSITION_MS = 520
const SHEET_TRANSITION_MS = SRP_FILTER_SHEET_TRANSITION_MS

const FS = {
  accent: '#5B22DE',
  border: '#E0E0E0',
  text: '#212121',
  muted: '#878787',
  applyBg: '#E8E8E8',
  applyText: '#454545',
}

function CloseIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke={FS.muted}
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  )
}

function PanelSectionLabel({ categoryId }: { categoryId: FilterCategoryId }) {
  return (
    <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#878787]">
      {FILTER_CATEGORY_LABELS[categoryId].toUpperCase()}
    </p>
  )
}

/** Radio-style row: circle + label (reference right column). */
function FilterOptionRow({
  selected,
  label,
  onClick,
}: {
  selected: boolean
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 border-b border-[#F0F0F0] bg-white py-4 pl-1 pr-2 text-left last:border-b-0 active:bg-white"
    >
      <span
        className={[
          'flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full border-2 bg-white transition-colors',
          selected ? 'border-[#5B22DE]' : 'border-[#CFCFCF]',
        ].join(' ')}
        aria-hidden
      >
        {selected ? (
          <span className="h-[11px] w-[11px] rounded-full bg-[#5B22DE]" />
        ) : null}
      </span>
      <span
        className={[
          'min-w-0 flex-1 text-[15px] leading-snug',
          selected ? 'font-medium text-[#212121]' : 'font-normal text-[#454545]',
        ].join(' ')}
      >
        {label}
      </span>
    </button>
  )
}

function toggleInArray<T extends string>(arr: T[], id: T): T[] {
  const has = arr.includes(id)
  if (has) return arr.filter((x) => x !== id)
  return [...arr, id]
}

function DualCrSliders({
  minCr,
  maxCr,
  onChange,
}: {
  minCr: number
  maxCr: number
  onChange: (min: number, max: number) => void
}) {
  const lo = 0
  const hi = 30
  const gap = 0.25

  const setMin = (v: number) => {
    const next = Math.min(v, maxCr - gap)
    onChange(Math.max(lo, next), maxCr)
  }
  const setMax = (v: number) => {
    const next = Math.max(v, minCr + gap)
    onChange(minCr, Math.min(hi, next))
  }

  return (
    <div className="space-y-8">
      <div>
        <div className="mb-2 flex justify-between text-[11px] font-medium uppercase tracking-wide text-[#9CA3AF]">
          <span>Min</span>
          <span className="tabular-nums text-[#111827]">₹ {minCr.toFixed(2)} Cr</span>
        </div>
        <input
          type="range"
          min={lo}
          max={hi}
          step={0.05}
          value={minCr}
          onChange={(e) => setMin(parseFloat(e.target.value))}
          className="srp-fs-range h-3 w-full"
          aria-label="Minimum budget in crores"
        />
      </div>
      <div>
        <div className="mb-2 flex justify-between text-[11px] font-medium uppercase tracking-wide text-[#9CA3AF]">
          <span>Max</span>
          <span className="tabular-nums text-[#111827]">₹ {maxCr.toFixed(2)} Cr</span>
        </div>
        <input
          type="range"
          min={lo}
          max={hi}
          step={0.05}
          value={maxCr}
          onChange={(e) => setMax(parseFloat(e.target.value))}
          className="srp-fs-range h-3 w-full"
          aria-label="Maximum budget in crores"
        />
      </div>
      <div className="flex gap-3">
        <label className="flex flex-1 flex-col gap-2">
          <span className="text-[11px] font-medium uppercase tracking-wide text-[#9CA3AF]">
            Min (₹ Cr)
          </span>
          <input
            type="number"
            min={lo}
            max={hi}
            step={0.05}
            value={minCr}
            onChange={(e) => setMin(parseFloat(e.target.value) || lo)}
            className="rounded-lg border border-[#E0E0E0] bg-white px-3 py-2.5 text-[15px] font-medium text-[#212121] outline-none focus:border-[#5B22DE]"
          />
        </label>
        <label className="flex flex-1 flex-col gap-2">
          <span className="text-[11px] font-medium uppercase tracking-wide text-[#9CA3AF]">
            Max (₹ Cr)
          </span>
          <input
            type="number"
            min={lo}
            max={hi}
            step={0.05}
            value={maxCr}
            onChange={(e) => setMax(parseFloat(e.target.value) || hi)}
            className="rounded-lg border border-[#E0E0E0] bg-white px-3 py-2.5 text-[15px] font-medium text-[#212121] outline-none focus:border-[#5B22DE]"
          />
        </label>
      </div>
    </div>
  )
}

function DualSqftSliders({
  minSq,
  maxSq,
  onChange,
}: {
  minSq: number
  maxSq: number
  onChange: (min: number, max: number) => void
}) {
  const lo = 0
  const hi = 12000
  const gap = 50

  const setMin = (v: number) => {
    const next = Math.min(v, maxSq - gap)
    onChange(Math.max(lo, Math.round(next / 50) * 50), maxSq)
  }
  const setMax = (v: number) => {
    const next = Math.max(v, minSq + gap)
    onChange(minSq, Math.min(hi, Math.round(next / 50) * 50))
  }

  return (
    <div className="space-y-8">
      <div>
        <div className="mb-2 flex justify-between text-[11px] font-medium uppercase tracking-wide text-[#9CA3AF]">
          <span>Min</span>
          <span className="tabular-nums text-[#111827]">
            {minSq.toLocaleString()} sq.ft.
          </span>
        </div>
        <input
          type="range"
          min={lo}
          max={hi}
          step={50}
          value={minSq}
          onChange={(e) => setMin(parseInt(e.target.value, 10))}
          className="srp-fs-range h-3 w-full"
          aria-label="Minimum built-up area"
        />
      </div>
      <div>
        <div className="mb-2 flex justify-between text-[11px] font-medium uppercase tracking-wide text-[#9CA3AF]">
          <span>Max</span>
          <span className="tabular-nums text-[#111827]">
            {maxSq.toLocaleString()} sq.ft.
          </span>
        </div>
        <input
          type="range"
          min={lo}
          max={hi}
          step={50}
          value={maxSq}
          onChange={(e) => setMax(parseInt(e.target.value, 10))}
          className="srp-fs-range h-3 w-full"
          aria-label="Maximum built-up area"
        />
      </div>
      <div className="flex gap-3">
        <label className="flex flex-1 flex-col gap-2">
          <span className="text-[11px] font-medium uppercase tracking-wide text-[#9CA3AF]">
            Min (sq.ft.)
          </span>
          <input
            type="number"
            min={lo}
            max={hi}
            step={50}
            value={minSq}
            onChange={(e) => setMin(parseInt(e.target.value, 10) || lo)}
            className="rounded-lg border border-[#E0E0E0] bg-white px-3 py-2.5 text-[15px] font-medium text-[#212121] outline-none focus:border-[#5B22DE]"
          />
        </label>
        <label className="flex flex-1 flex-col gap-2">
          <span className="text-[11px] font-medium uppercase tracking-wide text-[#9CA3AF]">
            Max (sq.ft.)
          </span>
          <input
            type="number"
            min={lo}
            max={hi}
            step={50}
            value={maxSq}
            onChange={(e) => setMax(parseInt(e.target.value, 10) || hi)}
            className="rounded-lg border border-[#E0E0E0] bg-white px-3 py-2.5 text-[15px] font-medium text-[#212121] outline-none focus:border-[#5B22DE]"
          />
        </label>
      </div>
    </div>
  )
}

function ExpandableOptionList({
  items,
  selected,
  onToggle,
  initial = 5,
}: {
  items: { id: string; label: string }[]
  selected: string[]
  onToggle: (id: string) => void
  initial?: number
}) {
  const [more, setMore] = useState(false)
  const slice = more ? items : items.slice(0, initial)
  return (
    <div>
      <div className="overflow-hidden rounded-xl border border-[#E8E8E8] bg-white">
        {slice.map((it) => (
          <FilterOptionRow
            key={it.id}
            label={it.label}
            selected={selected.includes(it.id)}
            onClick={() => onToggle(it.id)}
          />
        ))}
      </div>
      {items.length > initial ? (
        <button
          type="button"
          onClick={() => setMore((v) => !v)}
          className="mt-4 px-1 text-[13px] font-semibold text-[#5B22DE] active:opacity-70"
        >
          {more ? 'Show less' : 'Show more'}
        </button>
      ) : null}
    </div>
  )
}

function CategoryNav({
  active,
  onSelect,
}: {
  active: FilterCategoryId
  onSelect: (id: FilterCategoryId) => void
}) {
  return (
    <nav
      className="srp-filter-scroll flex h-full min-h-0 w-[38%] min-w-[118px] max-w-[158px] shrink-0 flex-col overflow-y-auto overscroll-y-contain border-r border-[#E8E8E8] bg-white py-1"
      style={{ WebkitOverflowScrolling: 'touch' }}
      aria-label="Filter categories"
    >
      {FILTER_CATEGORY_IDS.map((id) => {
        const isActive = id === active
        return (
          <button
            key={id}
            type="button"
            onClick={() => onSelect(id)}
            className={[
              'flex w-full items-stretch bg-white text-left text-[12px] leading-snug transition-[background] duration-200',
              isActive
                ? 'font-medium text-[#2d1f4e] [background-image:linear-gradient(90deg,#f3ecff_0%,#faf7ff_42%,#ffffff_100%)]'
                : 'font-normal text-[#212121] active:bg-[#FCFCFC]',
            ].join(' ')}
          >
            {isActive ? (
              <span
                className="w-[5px] shrink-0 self-stretch rounded-r-[10px] bg-[#5B22DE]"
                aria-hidden
              />
            ) : null}
            <span
              className={[
                'min-w-0 flex-1 py-3.5 pr-3 text-left',
                isActive ? 'pl-2' : 'pl-3',
              ].join(' ')}
            >
              {FILTER_CATEGORY_LABELS[id]}
            </span>
          </button>
        )
      })}
    </nav>
  )
}

function RightPanel({
  active,
  draft,
  setDraft,
}: {
  active: FilterCategoryId
  draft: SrpAppliedFilters
  setDraft: Dispatch<SetStateAction<SrpAppliedFilters>>
}) {
  const listWrap =
    'mt-2 overflow-hidden rounded-xl border border-[#E8E8E8] bg-white'

  if (active === 'budget') {
    return (
      <div className="px-4 pb-24 pt-5">
        <PanelSectionLabel categoryId="budget" />
        <div className="mt-2">
          <DualCrSliders
            minCr={draft.budgetMinCr}
            maxCr={draft.budgetMaxCr}
            onChange={(budgetMinCr, budgetMaxCr) =>
              setDraft((d) => ({ ...d, budgetMinCr, budgetMaxCr }))
            }
          />
        </div>
      </div>
    )
  }

  if (active === 'bhk') {
    return (
      <div className="px-4 pb-24 pt-5">
        <PanelSectionLabel categoryId="bhk" />
        <div className={listWrap}>
          {FILTER_BHK_OPTIONS.map((o) => (
            <FilterOptionRow
              key={o.id}
              label={o.label}
              selected={draft.bhk.includes(o.id)}
              onClick={() =>
                setDraft((d) => ({
                  ...d,
                  bhk: toggleInArray(d.bhk, o.id),
                }))
              }
            />
          ))}
        </div>
      </div>
    )
  }

  if (active === 'propertyType') {
    return (
      <div className="px-4 pb-24 pt-5">
        <PanelSectionLabel categoryId="propertyType" />
        <div className={listWrap}>
          {FILTER_PROPERTY_TYPE_OPTIONS.map((o) => (
            <FilterOptionRow
              key={o.id}
              label={o.label}
              selected={draft.propertyTypes.includes(o.id)}
              onClick={() =>
                setDraft((d) => ({
                  ...d,
                  propertyTypes: toggleInArray(d.propertyTypes, o.id),
                }))
              }
            />
          ))}
        </div>
      </div>
    )
  }

  if (active === 'construction') {
    return (
      <div className="px-4 pb-24 pt-5">
        <PanelSectionLabel categoryId="construction" />
        <div className={listWrap}>
          {FILTER_CONSTRUCTION_OPTIONS.map((o) => (
            <FilterOptionRow
              key={o.id}
              label={o.label}
              selected={draft.construction.includes(o.id)}
              onClick={() =>
                setDraft((d) => ({
                  ...d,
                  construction: toggleInArray(d.construction, o.id),
                }))
              }
            />
          ))}
        </div>
      </div>
    )
  }

  if (active === 'listedBy') {
    return (
      <div className="px-4 pb-24 pt-5">
        <PanelSectionLabel categoryId="listedBy" />
        <div className={listWrap}>
          {FILTER_LISTED_BY_OPTIONS.map((o) => (
            <FilterOptionRow
              key={o.id}
              label={o.label}
              selected={draft.listedBy.includes(o.id)}
              onClick={() =>
                setDraft((d) => ({
                  ...d,
                  listedBy: toggleInArray(d.listedBy, o.id),
                }))
              }
            />
          ))}
        </div>
      </div>
    )
  }

  if (active === 'amenities') {
    return (
      <div className="px-4 pb-24 pt-5">
        <PanelSectionLabel categoryId="amenities" />
        <div className="mt-2">
          <ExpandableOptionList
            items={[...FILTER_AMENITIES_LONG]}
            selected={draft.amenities}
            onToggle={(id) =>
              setDraft((d) => ({
                ...d,
                amenities: toggleInArray(d.amenities, id),
              }))
            }
            initial={5}
          />
        </div>
      </div>
    )
  }

  if (active === 'area') {
    return (
      <div className="px-4 pb-24 pt-5">
        <PanelSectionLabel categoryId="area" />
        <div className="mt-2">
          <DualSqftSliders
            minSq={draft.areaSqFtMin}
            maxSq={draft.areaSqFtMax}
            onChange={(areaSqFtMin, areaSqFtMax) =>
              setDraft((d) => ({ ...d, areaSqFtMin, areaSqFtMax }))
            }
          />
        </div>
        <p className="mb-1 mt-10 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#878787]">
          City hotspots
        </p>
        <div className={listWrap}>
          <FilterOptionRow
            label="Entire city"
            selected={!draft.useHotspot}
            onClick={() =>
              setDraft((d) => ({ ...d, useHotspot: false }))
            }
          />
          <FilterOptionRow
            label="City hotspots only"
            selected={draft.useHotspot}
            onClick={() =>
              setDraft((d) => {
                const next = true
                return {
                  ...d,
                  useHotspot: next,
                  hotspotAreaIds:
                    d.hotspotAreaIds.length === 0
                      ? [...ALL_HOTSPOT_AREA_IDS]
                      : d.hotspotAreaIds,
                }
              })
            }
          />
        </div>
        {draft.useHotspot ? (
          <div className="mt-6">
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#878787]">
              Micro-markets
            </p>
            <div className={listWrap}>
              {HOTSPOT_AREA_OPTIONS.map((a) => (
                <FilterOptionRow
                  key={a.id}
                  label={a.chipLabel ?? a.label}
                  selected={draft.hotspotAreaIds.includes(a.id)}
                  onClick={() =>
                    setDraft((d) => ({
                      ...d,
                      hotspotAreaIds: toggleInArray(
                        [...d.hotspotAreaIds],
                        a.id,
                      ),
                    }))
                  }
                />
              ))}
            </div>
          </div>
        ) : null}
      </div>
    )
  }

  if (active === 'purchaseType') {
    return (
      <div className="px-4 pb-24 pt-5">
        <PanelSectionLabel categoryId="purchaseType" />
        <div className={listWrap}>
          {FILTER_PURCHASE_TYPE_OPTIONS.map((o) => (
            <FilterOptionRow
              key={o.id}
              label={o.label}
              selected={draft.purchaseTypes.includes(o.id)}
              onClick={() =>
                setDraft((d) => ({
                  ...d,
                  purchaseTypes: toggleInArray(d.purchaseTypes, o.id),
                }))
              }
            />
          ))}
        </div>
      </div>
    )
  }

  if (active === 'propertyAge') {
    return (
      <div className="px-4 pb-24 pt-5">
        <PanelSectionLabel categoryId="propertyAge" />
        <div className="mt-2">
          <ExpandableOptionList
            items={[...FILTER_PROPERTY_AGE_OPTIONS]}
            selected={draft.propertyAges}
            onToggle={(id) =>
              setDraft((d) => ({
                ...d,
                propertyAges: toggleInArray(d.propertyAges, id),
              }))
            }
            initial={5}
          />
        </div>
      </div>
    )
  }

  if (active === 'developer') {
    return (
      <div className="px-4 pb-24 pt-5">
        <PanelSectionLabel categoryId="developer" />
        <div className="mt-2">
          <ExpandableOptionList
            items={FILTER_DEVELOPER_OPTIONS.map((d) => ({
              id: d,
              label: d,
            }))}
            selected={draft.developers}
            onToggle={(id) =>
              setDraft((d) => ({
                ...d,
                developers: toggleInArray(d.developers, id),
              }))
            }
            initial={5}
          />
        </div>
      </div>
    )
  }

  if (active === 'furnishing') {
    return (
      <div className="px-4 pb-24 pt-5">
        <PanelSectionLabel categoryId="furnishing" />
        <div className={listWrap}>
          {FILTER_FURNISHING_OPTIONS.map((o) => (
            <FilterOptionRow
              key={o.id}
              label={o.label}
              selected={draft.furnishing.includes(o.id)}
              onClick={() =>
                setDraft((d) => ({
                  ...d,
                  furnishing: toggleInArray(d.furnishing, o.id),
                }))
              }
            />
          ))}
        </div>
      </div>
    )
  }

  if (active === 'facing') {
    return (
      <div className="px-4 pb-24 pt-5">
        <PanelSectionLabel categoryId="facing" />
        <div className="mt-2">
          <ExpandableOptionList
            items={[...FILTER_FACING_OPTIONS]}
            selected={draft.facing}
            onToggle={(id) =>
              setDraft((d) => ({
                ...d,
                facing: toggleInArray(d.facing, id),
              }))
            }
            initial={5}
          />
        </div>
      </div>
    )
  }

  if (active === 'photos') {
    return (
      <div className="px-4 pb-24 pt-5">
        <PanelSectionLabel categoryId="photos" />
        <div className={listWrap}>
          {FILTER_PHOTOS_OPTIONS.map((o) => (
            <FilterOptionRow
              key={o.id}
              label={o.label}
              selected={draft.minImageCount === o.id}
              onClick={() =>
                setDraft((d) => ({ ...d, minImageCount: o.id }))
              }
            />
          ))}
        </div>
      </div>
    )
  }

  if (active === 'rera') {
    return (
      <div className="px-4 pb-24 pt-5">
        <PanelSectionLabel categoryId="rera" />
        <div className={listWrap}>
          <FilterOptionRow
            label="Show all"
            selected={!draft.reraOnly}
            onClick={() =>
              setDraft((d) => ({ ...d, reraOnly: false }))
            }
          />
          <FilterOptionRow
            label="RERA-registered only"
            selected={draft.reraOnly}
            onClick={() =>
              setDraft((d) => ({ ...d, reraOnly: true }))
            }
          />
        </div>
      </div>
    )
  }

  return null
}

export function SrpFiltersSheet({
  open,
  onClose,
  applied,
  onApply,
  onCloseMotionStart,
}: SrpFiltersSheetProps) {
  const [active, setActive] = useState<FilterCategoryId>('budget')
  const [draft, setDraft] = useState<SrpAppliedFilters>(() =>
    cloneSrpAppliedFilters(applied),
  )
  /** Keep portal mounted while exit animation runs */
  const [present, setPresent] = useState(open)
  /** Sheet at rest position (open) vs off-screen (closed) */
  const [entered, setEntered] = useState(false)
  /**
   * Transitions must not run on the first paint after mount — browsers skip
   * from “no prior style” to animated. Arm transitions only after layout.
   */
  const [motionReady, setMotionReady] = useState(false)
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const openRafRef = useRef<{ a?: number; b?: number; c?: number }>({})

  const closeAnimated = useCallback(() => {
    onCloseMotionStart?.()
    setEntered(false)
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
    closeTimerRef.current = setTimeout(() => {
      closeTimerRef.current = null
      onClose()
    }, SHEET_TRANSITION_MS)
  }, [onClose, onCloseMotionStart])

  useEffect(() => {
    if (open) {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current)
        closeTimerRef.current = null
      }
      setPresent(true)
      setEntered(false)
      setMotionReady(false)

      const reduced =
        typeof window !== 'undefined' &&
        window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
      if (reduced) {
        setMotionReady(false)
        setEntered(true)
        return
      }

      const { current: refs } = openRafRef
      refs.a = requestAnimationFrame(() => {
        refs.b = requestAnimationFrame(() => {
          setMotionReady(true)
          refs.c = requestAnimationFrame(() => {
            setEntered(true)
          })
        })
      })
      return () => {
        if (refs.a != null) cancelAnimationFrame(refs.a)
        if (refs.b != null) cancelAnimationFrame(refs.b)
        if (refs.c != null) cancelAnimationFrame(refs.c)
        refs.a = refs.b = refs.c = undefined
      }
    }
    setEntered(false)
    setMotionReady(false)
    setPresent(false)
  }, [open])

  useEffect(() => {
    if (open) {
      setDraft(cloneSrpAppliedFilters(applied))
      setActive('budget')
    }
  }, [open, applied])

  useEffect(() => {
    if (!present) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeAnimated()
    }
    window.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    const prevPadding = document.body.style.paddingRight
    const gutter = window.innerWidth - document.documentElement.clientWidth
    document.body.style.overflow = 'hidden'
    if (gutter > 0) {
      document.body.style.paddingRight = `${gutter}px`
    }
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
      document.body.style.paddingRight = prevPadding
    }
  }, [present, closeAnimated])

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
    }
  }, [])

  const applyCtaActive = useMemo(
    () =>
      countActiveSrpFilterDimensions(draft) > 0 ||
      !areSrpAppliedFiltersEqual(draft, applied),
    [draft, applied],
  )

  if (!present) return null

  const clearAll = () => {
    setDraft(createDefaultSrpAppliedFilters())
  }

  const apply = () => {
    onApply(cloneSrpAppliedFilters(draft))
    closeAnimated()
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[110] flex flex-col bg-black/40 motion-reduce:bg-black/40"
      role="presentation"
    >
      {/* Top ~20%+ : tap dimmed area to dismiss; flex-1 fills space above sheet */}
      <button
        type="button"
        className="min-h-[20dvh] w-full flex-1 shrink-0 cursor-pointer bg-transparent"
        aria-label="Close filters"
        onClick={closeAnimated}
      />

      <div
        className="flex h-[80dvh] max-h-[80dvh] min-h-0 w-full max-w-[430px] flex-col self-center overflow-hidden rounded-t-[20px] bg-white shadow-[0_-12px_48px_rgba(0,0,0,0.2)] will-change-transform"
        style={{
          ...(motionReady
            ? {
                transitionProperty: 'transform',
                transitionDuration: `${SHEET_TRANSITION_MS}ms`,
                transitionTimingFunction:
                  'cubic-bezier(0.08, 0.78, 0.12, 0.99)',
              }
            : { transition: 'none' }),
          transform: entered ? 'translate3d(0,0,0)' : 'translate3d(0,100%,0)',
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="srp-filters-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header
          className="flex shrink-0 items-center justify-between border-b border-[#E8E8E8] px-4 pb-3 pt-3"
        >
          <h1
            id="srp-filters-title"
            className="text-[18px] font-bold tracking-tight text-[#212121]"
          >
            Filter
          </h1>
          <button
            type="button"
            onClick={closeAnimated}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-transparent active:opacity-55"
            aria-label="Close filters"
          >
            <CloseIcon />
          </button>
        </header>

        <div className="flex min-h-0 flex-1 overflow-hidden bg-white">
          <CategoryNav active={active} onSelect={setActive} />
          <div
            className="srp-filter-scroll min-h-0 flex-1 overflow-y-auto overscroll-y-contain bg-white"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            <RightPanel active={active} draft={draft} setDraft={setDraft} />
          </div>
        </div>

        <footer
          className="relative z-[1] flex shrink-0 items-center justify-between gap-4 border-t border-[#E8E8E8] bg-white px-4 pt-3 shadow-[0_-2px_7px_-1px_rgba(0,0,0,0.075)]"
          style={{
            paddingBottom: 'max(14px, env(safe-area-inset-bottom, 0px))',
          }}
        >
          <button
            type="button"
            onClick={clearAll}
            className="shrink-0 py-2 text-[14px] font-medium text-[#878787] active:opacity-70"
          >
            Clear Filters
          </button>
          <button
            type="button"
            onClick={apply}
            disabled={!applyCtaActive}
            className={[
              'min-w-[168px] shrink-0 rounded-[12px] px-14 py-2.5 text-[14px] font-semibold transition-[background-color,color,opacity]',
              applyCtaActive
                ? 'bg-[#5B22DE] text-white active:bg-[#4C1BB8]'
                : 'cursor-not-allowed text-[#454545] opacity-80',
            ].join(' ')}
            style={
              applyCtaActive
                ? undefined
                : { backgroundColor: FS.applyBg, boxShadow: 'none' }
            }
          >
            Apply
          </button>
        </footer>
      </div>
    </div>,
    document.body,
  )
}
