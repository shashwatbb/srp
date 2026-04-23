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

/** Keep in sync with SRP chrome zoom in `SrpPage` (same value = no snap at end). */
export const SRP_FILTER_SHEET_TRANSITION_MS = 360
const SHEET_TRANSITION_MS = SRP_FILTER_SHEET_TRANSITION_MS

const FS = {
  accent: '#5B22DE',
  border: '#E0E0E0',
  text: '#212121',
  muted: '#878787',
  applyBg: '#E8E8E8',
  applyText: '#454545',
}

function FilterScreenBackIcon() {
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

/** Muted magnifier — matches low-emphasis chrome on SRP search, not the purple bar icon */
function FilterSheetSearchIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.85"
      strokeLinecap="round"
      aria-hidden
    >
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-4.3-4.3" />
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

const BUDGET_CR_LO = 0
const BUDGET_CR_HI = 30
const BUDGET_CR_GAP = 0.05

const BUDGET_QUICK_CHIPS: readonly {
  id: string
  label: string
  min: number
  max: number
}[] = [
  { id: 'u75', label: 'Under 75L', min: 0, max: 0.75 },
  { id: '75-15', label: '75L – 1.5Cr', min: 0.75, max: 1.5 },
  { id: '15-25', label: '1.5Cr – 2.5Cr', min: 1.5, max: 2.5 },
  { id: '25-4', label: '2.5Cr – 4Cr', min: 2.5, max: 4 },
  { id: '4-5', label: '4Cr – 5Cr', min: 4, max: 5 },
  { id: '5p', label: '5Cr+', min: 5, max: 30 },
]

/** Crore part rounded to cents of a crore, max two fractional digits, trailing zeros trimmed */
function formatBudgetCrCoreTwoDp(cr: number): string {
  const t = Math.round(cr * 100) / 100
  return t.toFixed(2).replace(/\.?0+$/, '')
}

/**
 * Budget amounts: under ₹1Cr as whole lakhs (₹75L). From ₹1Cr up, at most two digits
 * after the decimal in crore form (₹26.25Cr) — avoids long four-digit lakh strings.
 */
function formatBudgetPriceCr(cr: number, role: 'min' | 'max'): string {
  if (cr <= 0) return 'Any'
  if (role === 'max' && cr >= BUDGET_CR_HI - 0.001) return '₹30Cr+'
  if (cr < 1) {
    const lakhs = Math.round(cr * 100)
    return lakhs <= 0 ? 'Any' : `₹${lakhs}L`
  }
  return `₹${formatBudgetCrCoreTwoDp(cr)}Cr`
}

function formatBudgetRangeLine(minCr: number, maxCr: number): string {
  const a = formatBudgetPriceCr(minCr, 'min')
  const b = formatBudgetPriceCr(maxCr, 'max')
  return `${a} – ${b}`
}

function budgetRangesClose(
  minA: number,
  maxA: number,
  minB: number,
  maxB: number,
  eps = 0.03,
): boolean {
  return Math.abs(minA - minB) < eps && Math.abs(maxA - maxB) < eps
}

function budgetRangeFromChipIds(
  ids: Set<string>,
): { min: number; max: number } | null {
  if (ids.size === 0) return null
  const chips = BUDGET_QUICK_CHIPS.filter((c) => ids.has(c.id))
  if (chips.length === 0) return null
  return {
    min: Math.min(...chips.map((c) => c.min)),
    max: Math.max(...chips.map((c) => c.max)),
  }
}

function valueFromTrackClientY(clientY: number, rect: DOMRect): number {
  const fromBottom = rect.bottom - clientY
  const ratio = Math.min(1, Math.max(0, fromBottom / rect.height))
  return ratio * BUDGET_CR_HI
}

const BUDGET_TRACK_H = 248
const BUDGET_THUMB_PX = 28
const BUDGET_BAR_WIDTH_PX = 7
/** Width for floating step-price pills (left of bar) */
const BUDGET_THUMB_LABEL_COL_W = 80
const BUDGET_BAR_COL_W = 48
const BUDGET_STEPPER_COL_W = 22
/** Horizontal gap between bar column and steppers */
const BUDGET_SLIDER_ROW_GAP = 0
const BUDGET_SLIDER_ROW_W =
  BUDGET_THUMB_LABEL_COL_W +
  BUDGET_BAR_COL_W +
  BUDGET_SLIDER_ROW_GAP +
  BUDGET_STEPPER_COL_W
/** Shift row so bar center lines up with max/min labels (page-centered block) */
const BUDGET_SLIDER_ROW_ALIGN_SHIFT_PX =
  BUDGET_SLIDER_ROW_W / 2 -
  (BUDGET_THUMB_LABEL_COL_W + BUDGET_BAR_COL_W / 2)
/** Silent tick marks to the right of the budget bar (no labels) */
const BUDGET_BAR_STEPPER_COUNT = 9
const BUDGET_BAR_GREY = '#E8EAEF'
const BUDGET_STEPPER_CRS: readonly number[] = (() => {
  const n = BUDGET_BAR_STEPPER_COUNT
  if (n < 2) return [BUDGET_CR_LO, BUDGET_CR_HI]
  return Array.from({ length: n }, (_, i) =>
    Number((BUDGET_CR_HI * (1 - i / (n - 1))).toFixed(4)),
  )
})()

function snapToNearestStepperCr(v: number): number {
  let best = BUDGET_STEPPER_CRS[0]!
  let bestD = Infinity
  for (const s of BUDGET_STEPPER_CRS) {
    const d = Math.abs(v - s)
    if (d < bestD) {
      bestD = d
      best = s
    }
  }
  return best
}

function snapMinFromTrack(v: number, maxCr: number): number {
  const s = snapToNearestStepperCr(v)
  const limit = maxCr - BUDGET_CR_GAP
  if (s <= limit) return Math.max(BUDGET_CR_LO, s)
  const below = BUDGET_STEPPER_CRS.filter((x) => x <= limit + 1e-9)
  return below.length ? below[below.length - 1]! : BUDGET_CR_LO
}

function snapMaxFromTrack(v: number, minCr: number): number {
  const s = snapToNearestStepperCr(v)
  const limit = minCr + BUDGET_CR_GAP
  if (s >= limit) return Math.min(BUDGET_CR_HI, s)
  const above = BUDGET_STEPPER_CRS.filter((x) => x >= limit - 1e-9)
  return above.length ? above[0]! : BUDGET_CR_HI
}

/** Single thin vertical track, two thumbs, purple range — budget only */
function BudgetVerticalRange({
  minCr,
  maxCr,
  onChange,
}: {
  minCr: number
  maxCr: number
  onChange: (min: number, max: number) => void
}) {
  const trackRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<'min' | 'max' | null>(null)

  const applyMin = useCallback(
    (v: number) => {
      const next = snapMinFromTrack(v, maxCr)
      onChange(Math.max(BUDGET_CR_LO, next), maxCr)
    },
    [maxCr, onChange],
  )

  const applyMax = useCallback(
    (v: number) => {
      const next = snapMaxFromTrack(v, minCr)
      onChange(minCr, Math.min(BUDGET_CR_HI, next))
    },
    [minCr, onChange],
  )

  const pointerMove = useCallback(
    (e: PointerEvent) => {
      const el = trackRef.current
      const role = dragRef.current
      if (!el || !role) return
      const rect = el.getBoundingClientRect()
      const v = valueFromTrackClientY(e.clientY, rect)
      if (role === 'min') {
        const next = snapMinFromTrack(v, maxCr)
        if (next !== minCr) {
          onChange(Math.max(BUDGET_CR_LO, next), maxCr)
        }
      } else {
        const next = snapMaxFromTrack(v, minCr)
        if (next !== maxCr) {
          onChange(minCr, Math.min(BUDGET_CR_HI, next))
        }
      }
    },
    [maxCr, minCr, onChange],
  )

  const pointerUp = useCallback(() => {
    dragRef.current = null
    window.removeEventListener('pointermove', pointerMove)
    window.removeEventListener('pointerup', pointerUp)
    window.removeEventListener('pointercancel', pointerUp)
  }, [pointerMove])

  const startDrag = (role: 'min' | 'max', e: React.PointerEvent) => {
    e.preventDefault()
    dragRef.current = role
    e.currentTarget.setPointerCapture(e.pointerId)
    window.addEventListener('pointermove', pointerMove)
    window.addEventListener('pointerup', pointerUp)
    window.addEventListener('pointercancel', pointerUp)
  }

  const trackBackgroundPointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('button')) return
    const el = trackRef.current
    if (!el || !el.contains(e.target as Node)) return
    const rect = el.getBoundingClientRect()
    const v = valueFromTrackClientY(e.clientY, rect)
    const dMin = Math.abs(v - minCr)
    const dMax = Math.abs(v - maxCr)
    if (dMin <= dMax) {
      applyMin(v)
    } else {
      applyMax(v)
    }
  }

  const thumbBottomPx = (cr: number) =>
    (cr / BUDGET_CR_HI) * BUDGET_TRACK_H - BUDGET_THUMB_PX / 2

  const purpleBottom = (minCr / BUDGET_CR_HI) * BUDGET_TRACK_H
  const purpleHeight = ((maxCr - minCr) / BUDGET_CR_HI) * BUDGET_TRACK_H

  const thumbStyle = (cr: number) => ({
    left: '50%',
    bottom: `${thumbBottomPx(cr)}px`,
    width: BUDGET_THUMB_PX,
    height: BUDGET_THUMB_PX,
    transform: 'translateX(-50%)',
  })

  /** Vertical center of thumb from track bottom (px) — for aligned price pills */
  const thumbCenterBottomPx = (cr: number) =>
    (cr / BUDGET_CR_HI) * BUDGET_TRACK_H

  const stepPricePillClass =
    'pointer-events-none absolute right-0 z-[1] truncate rounded-lg bg-[#5B22DE] px-2 py-1.5 text-center text-[10px] font-semibold leading-tight text-white'

  return (
    <div className="flex w-full flex-col items-center gap-3 px-2 py-4">
      <p className="w-full text-center text-[11px] font-normal leading-snug text-[#9CA3AF]">
        Maximum Price
      </p>

      <div
        className="relative mx-auto shrink-0"
        style={{
          height: BUDGET_TRACK_H,
          width: BUDGET_SLIDER_ROW_W,
          transform: `translateX(${BUDGET_SLIDER_ROW_ALIGN_SHIFT_PX}px)`,
        }}
      >
        <div
          className="pointer-events-none absolute inset-y-0 left-0 z-[1]"
          style={{ width: BUDGET_THUMB_LABEL_COL_W }}
          aria-hidden
        >
          <div
            className={stepPricePillClass}
            style={{
              bottom: `${thumbCenterBottomPx(maxCr)}px`,
              transform: 'translateY(50%)',
              zIndex: 2,
              maxWidth: BUDGET_THUMB_LABEL_COL_W,
            }}
          >
            {formatBudgetPriceCr(maxCr, 'max')}
          </div>
          <div
            className={stepPricePillClass}
            style={{
              bottom: `${thumbCenterBottomPx(minCr)}px`,
              transform: 'translateY(50%)',
              zIndex: 3,
              maxWidth: BUDGET_THUMB_LABEL_COL_W,
            }}
          >
            {formatBudgetPriceCr(minCr, 'min')}
          </div>
        </div>

        <div
          className="absolute top-0 h-full"
          style={{
            left: BUDGET_THUMB_LABEL_COL_W,
            width: BUDGET_BAR_COL_W,
          }}
        >
          <div
            ref={trackRef}
            role="presentation"
            className="touch-none absolute inset-y-0 left-1/2 z-0 w-10 -translate-x-1/2 cursor-pointer"
            style={{ height: BUDGET_TRACK_H }}
            onPointerDown={trackBackgroundPointerDown}
          >
            <div
              className="pointer-events-none absolute left-1/2 top-0 bottom-0 -translate-x-1/2 rounded-full"
              style={{
                width: BUDGET_BAR_WIDTH_PX,
                backgroundColor: BUDGET_BAR_GREY,
              }}
              aria-hidden
            />
            <div
              className="pointer-events-none absolute left-1/2 -translate-x-1/2 rounded-full bg-[#5B22DE]"
              style={{
                width: BUDGET_BAR_WIDTH_PX,
                bottom: `${purpleBottom}px`,
                height: `${Math.max(0, purpleHeight)}px`,
              }}
              aria-hidden
            />
          </div>

          <button
            type="button"
            aria-label="Minimum price"
            aria-valuenow={minCr}
            className="touch-none absolute z-[2] box-border cursor-grab rounded-full border-2 border-white bg-[#5B22DE] shadow-[0_2px_6px_rgba(0,0,0,0.1),0_4px_14px_-2px_rgba(91,34,222,0.28)] outline-none active:cursor-grabbing"
            style={thumbStyle(minCr)}
            onPointerDown={(e) => {
              e.stopPropagation()
              startDrag('min', e)
            }}
          />
          <button
            type="button"
            aria-label="Maximum price"
            aria-valuenow={maxCr}
            className="touch-none absolute z-[2] box-border cursor-grab rounded-full border-2 border-white bg-[#5B22DE] shadow-[0_2px_6px_rgba(0,0,0,0.1),0_4px_14px_-2px_rgba(91,34,222,0.28)] outline-none active:cursor-grabbing"
            style={thumbStyle(maxCr)}
            onPointerDown={(e) => {
              e.stopPropagation()
              startDrag('max', e)
            }}
          />
        </div>

        <div
          className="pointer-events-none absolute inset-y-0 right-0 flex flex-col justify-between py-1"
          style={{ width: BUDGET_STEPPER_COL_W }}
          aria-hidden
        >
          {Array.from({ length: BUDGET_BAR_STEPPER_COUNT }, (_, i) => (
            <span
              key={i}
              className="mx-auto shrink-0 rounded-full"
              style={{
                width: 8,
                height: 5,
                backgroundColor: BUDGET_BAR_GREY,
              }}
            />
          ))}
        </div>
      </div>

      <p className="w-full text-center text-[11px] font-normal leading-snug text-[#9CA3AF]">
        Minimum Price
      </p>
    </div>
  )
}

/** Budget filter only — minimal vertical range, inputs, quick chips */
function BudgetFilterPanel({
  minCr,
  maxCr,
  onChange,
}: {
  minCr: number
  maxCr: number
  onChange: (min: number, max: number) => void
}) {
  const defaultBudget = useMemo(() => {
    const d = createDefaultSrpAppliedFilters()
    return { min: d.budgetMinCr, max: d.budgetMaxCr }
  }, [])

  const [selectedChipIds, setSelectedChipIds] = useState<Set<string>>(
    () => new Set(),
  )

  /** Slider (or other) edits outside the union of selected chips — drop chip highlights */
  useEffect(() => {
    setSelectedChipIds((prev) => {
      if (prev.size === 0) return prev
      const fromChips = budgetRangeFromChipIds(prev)
      if (!fromChips) return new Set()
      if (!budgetRangesClose(fromChips.min, fromChips.max, minCr, maxCr)) {
        return new Set()
      }
      return prev
    })
  }, [minCr, maxCr])

  const toggleChip = (chip: (typeof BUDGET_QUICK_CHIPS)[number]) => {
    setSelectedChipIds((prev) => {
      const next = new Set(prev)
      if (next.has(chip.id)) next.delete(chip.id)
      else next.add(chip.id)
      const r = budgetRangeFromChipIds(next)
      if (next.size === 0) {
        onChange(defaultBudget.min, defaultBudget.max)
      } else if (r) {
        onChange(r.min, r.max)
      }
      return next
    })
  }

  return (
    <div className="flex flex-col items-center gap-3 bg-white">
      <div className="w-full self-stretch text-left">
        <p className="text-[11px] font-normal leading-snug text-[#9CA3AF]">
          Price range
        </p>
        <p className="mt-1 text-[16px] font-medium leading-snug tracking-tight text-[#5B22DE]">
          {formatBudgetRangeLine(minCr, maxCr)}
        </p>
      </div>

      <BudgetVerticalRange minCr={minCr} maxCr={maxCr} onChange={onChange} />

      <p className="mb-2 mt-2 w-full self-stretch text-left text-[11px] font-semibold uppercase tracking-[0.1em] text-[#878787]">
        Popular selections
      </p>
      <div className="grid w-full grid-cols-2 gap-x-3 gap-y-3 self-stretch">
        {BUDGET_QUICK_CHIPS.map((chip) => {
          const selected = selectedChipIds.has(chip.id)
          return (
            <button
              key={chip.id}
              type="button"
              onClick={() => toggleChip(chip)}
              className={[
                'min-w-0 rounded-2xl border px-4 py-3.5 text-left text-[12px] font-medium leading-tight transition-all duration-200 ease-out active:opacity-90',
                selected
                  ? 'border-black bg-[#F7F7F7] text-[#1a1a1a]'
                  : 'border-[#D6D6D6] bg-white text-[#6B6B6B] active:bg-[#F5F5F5]',
              ].join(' ')}
            >
              {chip.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

const SQFT_LO = 0
const SQFT_HI = 12000
const SQFT_GAP = 50

const SQFT_QUICK_CHIPS: readonly {
  id: string
  label: string
  min: number
  max: number
}[] = [
  { id: 'u500', label: 'Under 500', min: 0, max: 500 },
  { id: '500-1k', label: '500 – 1,000', min: 500, max: 1000 },
  { id: '1k-15', label: '1,000 – 1,500', min: 1000, max: 1500 },
  { id: '15-2k', label: '1,500 – 2,000', min: 1500, max: 2000 },
  { id: '2k-3k', label: '2,000 – 3,000', min: 2000, max: 3000 },
  { id: '3kp', label: '3,000+', min: 3000, max: 12000 },
]

function formatSqftThumbLabel(sq: number): string {
  return sq.toLocaleString()
}

function formatSqftRangeLine(minSq: number, maxSq: number): string {
  return `${formatSqftThumbLabel(minSq)} – ${formatSqftThumbLabel(maxSq)} sq.ft.`
}

function areaRangesClose(
  minA: number,
  maxA: number,
  minB: number,
  maxB: number,
  eps = 45,
): boolean {
  return Math.abs(minA - minB) < eps && Math.abs(maxA - maxB) < eps
}

function areaRangeFromChipIds(
  ids: Set<string>,
): { min: number; max: number } | null {
  if (ids.size === 0) return null
  const chips = SQFT_QUICK_CHIPS.filter((c) => ids.has(c.id))
  if (chips.length === 0) return null
  return {
    min: Math.min(...chips.map((c) => c.min)),
    max: Math.max(...chips.map((c) => c.max)),
  }
}

function valueFromTrackClientYSqft(clientY: number, rect: DOMRect): number {
  const fromBottom = rect.bottom - clientY
  const ratio = Math.min(1, Math.max(0, fromBottom / rect.height))
  return ratio * SQFT_HI
}

function snapSqftToStep(v: number): number {
  return (
    Math.round(Math.min(SQFT_HI, Math.max(SQFT_LO, v)) / 50) * 50
  )
}

function snapMinSqFromTrack(v: number, maxSq: number): number {
  const s = snapSqftToStep(v)
  const limit = maxSq - SQFT_GAP
  if (s <= limit) return Math.max(SQFT_LO, s)
  const steps = Math.floor(limit / 50) * 50
  return Math.max(SQFT_LO, steps)
}

function snapMaxSqFromTrack(v: number, minSq: number): number {
  const s = snapSqftToStep(v)
  const limit = minSq + SQFT_GAP
  if (s >= limit) return Math.min(SQFT_HI, s)
  const steps = Math.ceil(limit / 50) * 50
  return Math.min(SQFT_HI, steps)
}

/** Built-up sq.ft. — same vertical track + thumb pattern as budget */
function AreaVerticalRange({
  minSq,
  maxSq,
  onChange,
}: {
  minSq: number
  maxSq: number
  onChange: (min: number, max: number) => void
}) {
  const trackRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<'min' | 'max' | null>(null)

  const applyMin = useCallback(
    (v: number) => {
      const next = snapMinSqFromTrack(v, maxSq)
      onChange(Math.max(SQFT_LO, next), maxSq)
    },
    [maxSq, onChange],
  )

  const applyMax = useCallback(
    (v: number) => {
      const next = snapMaxSqFromTrack(v, minSq)
      onChange(minSq, Math.min(SQFT_HI, next))
    },
    [minSq, onChange],
  )

  const pointerMove = useCallback(
    (e: PointerEvent) => {
      const el = trackRef.current
      const role = dragRef.current
      if (!el || !role) return
      const rect = el.getBoundingClientRect()
      const v = valueFromTrackClientYSqft(e.clientY, rect)
      if (role === 'min') {
        const next = snapMinSqFromTrack(v, maxSq)
        if (next !== minSq) {
          onChange(Math.max(SQFT_LO, next), maxSq)
        }
      } else {
        const next = snapMaxSqFromTrack(v, minSq)
        if (next !== maxSq) {
          onChange(minSq, Math.min(SQFT_HI, next))
        }
      }
    },
    [maxSq, minSq, onChange],
  )

  const pointerUp = useCallback(() => {
    dragRef.current = null
    window.removeEventListener('pointermove', pointerMove)
    window.removeEventListener('pointerup', pointerUp)
    window.removeEventListener('pointercancel', pointerUp)
  }, [pointerMove])

  const startDrag = (role: 'min' | 'max', e: React.PointerEvent) => {
    e.preventDefault()
    dragRef.current = role
    e.currentTarget.setPointerCapture(e.pointerId)
    window.addEventListener('pointermove', pointerMove)
    window.addEventListener('pointerup', pointerUp)
    window.addEventListener('pointercancel', pointerUp)
  }

  const trackBackgroundPointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('button')) return
    const el = trackRef.current
    if (!el || !el.contains(e.target as Node)) return
    const rect = el.getBoundingClientRect()
    const v = valueFromTrackClientYSqft(e.clientY, rect)
    const dMin = Math.abs(v - minSq)
    const dMax = Math.abs(v - maxSq)
    if (dMin <= dMax) {
      applyMin(v)
    } else {
      applyMax(v)
    }
  }

  const thumbBottomPx = (sq: number) =>
    (sq / SQFT_HI) * BUDGET_TRACK_H - BUDGET_THUMB_PX / 2

  const purpleBottom = (minSq / SQFT_HI) * BUDGET_TRACK_H
  const purpleHeight = ((maxSq - minSq) / SQFT_HI) * BUDGET_TRACK_H

  const thumbStyle = (sq: number) => ({
    left: '50%',
    bottom: `${thumbBottomPx(sq)}px`,
    width: BUDGET_THUMB_PX,
    height: BUDGET_THUMB_PX,
    transform: 'translateX(-50%)',
  })

  const thumbCenterBottomPx = (sq: number) =>
    (sq / SQFT_HI) * BUDGET_TRACK_H

  const stepSqftPillClass =
    'pointer-events-none absolute right-0 z-[1] truncate rounded-lg bg-[#5B22DE] px-2 py-1.5 text-center text-[10px] font-semibold leading-tight text-white'

  return (
    <div className="flex w-full flex-col items-center gap-3 px-2 py-4">
      <p className="w-full text-center text-[11px] font-normal leading-snug text-[#9CA3AF]">
        Maximum built-up
      </p>

      <div
        className="relative mx-auto shrink-0"
        style={{
          height: BUDGET_TRACK_H,
          width: BUDGET_SLIDER_ROW_W,
          transform: `translateX(${BUDGET_SLIDER_ROW_ALIGN_SHIFT_PX}px)`,
        }}
      >
        <div
          className="pointer-events-none absolute inset-y-0 left-0 z-[1]"
          style={{ width: BUDGET_THUMB_LABEL_COL_W }}
          aria-hidden
        >
          <div
            className={stepSqftPillClass}
            style={{
              bottom: `${thumbCenterBottomPx(maxSq)}px`,
              transform: 'translateY(50%)',
              zIndex: 2,
              maxWidth: BUDGET_THUMB_LABEL_COL_W,
            }}
          >
            {formatSqftThumbLabel(maxSq)}
          </div>
          <div
            className={stepSqftPillClass}
            style={{
              bottom: `${thumbCenterBottomPx(minSq)}px`,
              transform: 'translateY(50%)',
              zIndex: 3,
              maxWidth: BUDGET_THUMB_LABEL_COL_W,
            }}
          >
            {formatSqftThumbLabel(minSq)}
          </div>
        </div>

        <div
          className="absolute top-0 h-full"
          style={{
            left: BUDGET_THUMB_LABEL_COL_W,
            width: BUDGET_BAR_COL_W,
          }}
        >
          <div
            ref={trackRef}
            role="presentation"
            className="touch-none absolute inset-y-0 left-1/2 z-0 w-10 -translate-x-1/2 cursor-pointer"
            style={{ height: BUDGET_TRACK_H }}
            onPointerDown={trackBackgroundPointerDown}
          >
            <div
              className="pointer-events-none absolute left-1/2 top-0 bottom-0 -translate-x-1/2 rounded-full"
              style={{
                width: BUDGET_BAR_WIDTH_PX,
                backgroundColor: BUDGET_BAR_GREY,
              }}
              aria-hidden
            />
            <div
              className="pointer-events-none absolute left-1/2 -translate-x-1/2 rounded-full bg-[#5B22DE]"
              style={{
                width: BUDGET_BAR_WIDTH_PX,
                bottom: `${purpleBottom}px`,
                height: `${Math.max(0, purpleHeight)}px`,
              }}
              aria-hidden
            />
          </div>

          <button
            type="button"
            aria-label="Minimum built-up area"
            aria-valuenow={minSq}
            className="touch-none absolute z-[2] box-border cursor-grab rounded-full border-2 border-white bg-[#5B22DE] shadow-[0_2px_6px_rgba(0,0,0,0.1),0_4px_14px_-2px_rgba(91,34,222,0.28)] outline-none active:cursor-grabbing"
            style={thumbStyle(minSq)}
            onPointerDown={(e) => {
              e.stopPropagation()
              startDrag('min', e)
            }}
          />
          <button
            type="button"
            aria-label="Maximum built-up area"
            aria-valuenow={maxSq}
            className="touch-none absolute z-[2] box-border cursor-grab rounded-full border-2 border-white bg-[#5B22DE] shadow-[0_2px_6px_rgba(0,0,0,0.1),0_4px_14px_-2px_rgba(91,34,222,0.28)] outline-none active:cursor-grabbing"
            style={thumbStyle(maxSq)}
            onPointerDown={(e) => {
              e.stopPropagation()
              startDrag('max', e)
            }}
          />
        </div>

        <div
          className="pointer-events-none absolute inset-y-0 right-0 flex flex-col justify-between py-1"
          style={{ width: BUDGET_STEPPER_COL_W }}
          aria-hidden
        >
          {Array.from({ length: BUDGET_BAR_STEPPER_COUNT }, (_, i) => (
            <span
              key={i}
              className="mx-auto shrink-0 rounded-full"
              style={{
                width: 8,
                height: 5,
                backgroundColor: BUDGET_BAR_GREY,
              }}
            />
          ))}
        </div>
      </div>

      <p className="w-full text-center text-[11px] font-normal leading-snug text-[#9CA3AF]">
        Minimum built-up
      </p>
    </div>
  )
}

/** Built-up area — same layout as budget: summary line, vertical range, quick chips */
function AreaFilterPanel({
  minSq,
  maxSq,
  onChange,
}: {
  minSq: number
  maxSq: number
  onChange: (min: number, max: number) => void
}) {
  const defaultArea = useMemo(() => {
    const d = createDefaultSrpAppliedFilters()
    return { min: d.areaSqFtMin, max: d.areaSqFtMax }
  }, [])

  const [selectedChipIds, setSelectedChipIds] = useState<Set<string>>(
    () => new Set(),
  )

  useEffect(() => {
    setSelectedChipIds((prev) => {
      if (prev.size === 0) return prev
      const fromChips = areaRangeFromChipIds(prev)
      if (!fromChips) return new Set()
      if (!areaRangesClose(fromChips.min, fromChips.max, minSq, maxSq)) {
        return new Set()
      }
      return prev
    })
  }, [minSq, maxSq])

  const toggleChip = (chip: (typeof SQFT_QUICK_CHIPS)[number]) => {
    setSelectedChipIds((prev) => {
      const next = new Set(prev)
      if (next.has(chip.id)) next.delete(chip.id)
      else next.add(chip.id)
      const r = areaRangeFromChipIds(next)
      if (next.size === 0) {
        onChange(defaultArea.min, defaultArea.max)
      } else if (r) {
        onChange(r.min, r.max)
      }
      return next
    })
  }

  return (
    <div className="flex flex-col items-center gap-3 bg-white">
      <div className="w-full self-stretch text-left">
        <p className="text-[11px] font-normal leading-snug text-[#9CA3AF]">
          Built-up range
        </p>
        <p className="mt-1 text-[16px] font-medium leading-snug tracking-tight text-[#5B22DE]">
          {formatSqftRangeLine(minSq, maxSq)}
        </p>
      </div>

      <AreaVerticalRange minSq={minSq} maxSq={maxSq} onChange={onChange} />

      <p className="mb-2 mt-2 w-full self-stretch text-left text-[11px] font-semibold uppercase tracking-[0.1em] text-[#878787]">
        Popular range
      </p>
      <div className="grid w-full grid-cols-2 gap-x-3 gap-y-3 self-stretch">
        {SQFT_QUICK_CHIPS.map((chip) => {
          const selected = selectedChipIds.has(chip.id)
          return (
            <button
              key={chip.id}
              type="button"
              onClick={() => toggleChip(chip)}
              className={[
                'min-w-0 rounded-2xl border px-4 py-3.5 text-left text-[12px] font-medium leading-tight transition-all duration-200 ease-out active:opacity-90',
                selected
                  ? 'border-black bg-[#F7F7F7] text-[#1a1a1a]'
                  : 'border-[#D6D6D6] bg-white text-[#6B6B6B] active:bg-[#F5F5F5]',
              ].join(' ')}
            >
              {chip.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

type CheckboxFilterItem = { id: string; label: string; hint?: string }

const BHK_CHECKBOX_ITEMS: CheckboxFilterItem[] = FILTER_BHK_OPTIONS.map(
  (o) => ({ id: o.id, label: o.label }),
)

const PROPERTY_TYPE_CHECKBOX_ITEMS: CheckboxFilterItem[] =
  FILTER_PROPERTY_TYPE_OPTIONS.map((o) => ({
    id: o.id,
    label: o.label,
    hint: o.hint,
  }))

const CONSTRUCTION_CHECKBOX_ITEMS: CheckboxFilterItem[] =
  FILTER_CONSTRUCTION_OPTIONS.map((o) => ({
    id: o.id,
    label: o.label,
  }))

const LISTED_BY_CHECKBOX_ITEMS: CheckboxFilterItem[] =
  FILTER_LISTED_BY_OPTIONS.map((o) => ({ id: o.id, label: o.label }))

const AMENITIES_CHECKBOX_ITEMS: CheckboxFilterItem[] =
  FILTER_AMENITIES_LONG.map((o) => ({ id: o.id, label: o.label }))

const PURCHASE_CHECKBOX_ITEMS: CheckboxFilterItem[] =
  FILTER_PURCHASE_TYPE_OPTIONS.map((o) => ({ id: o.id, label: o.label }))

const PROPERTY_AGE_CHECKBOX_ITEMS: CheckboxFilterItem[] =
  FILTER_PROPERTY_AGE_OPTIONS.map((o) => ({ id: o.id, label: o.label }))

const DEVELOPER_CHECKBOX_ITEMS: CheckboxFilterItem[] =
  FILTER_DEVELOPER_OPTIONS.map((name) => ({ id: name, label: name }))

const FURNISHING_CHECKBOX_ITEMS: CheckboxFilterItem[] =
  FILTER_FURNISHING_OPTIONS.map((o) => ({ id: o.id, label: o.label }))

const FACING_CHECKBOX_ITEMS: CheckboxFilterItem[] =
  FILTER_FACING_OPTIONS.map((o) => ({ id: o.id, label: o.label }))

const PHOTOS_CHECKBOX_ITEMS: CheckboxFilterItem[] =
  FILTER_PHOTOS_OPTIONS.map((o) => ({
    id: String(o.id),
    label: o.label,
  }))

const RERA_CHECKBOX_ITEMS: CheckboxFilterItem[] = [
  { id: 'all', label: 'Show all' },
  { id: 'rera', label: 'RERA-registered only' },
]

/** BHK / Type: checkbox column, dividers, optional hint line, tap pulse on title */
function CheckboxFilterColumn({
  items,
  selectedIds,
  onToggle,
}: {
  items: readonly CheckboxFilterItem[]
  selectedIds: string[]
  onToggle: (id: string) => void
}) {
  const [pulseId, setPulseId] = useState<string | null>(null)
  const pulseTimerRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (pulseTimerRef.current != null) {
        window.clearTimeout(pulseTimerRef.current)
      }
    }
  }, [])

  const triggerPulse = useCallback((id: string) => {
    setPulseId(id)
    if (pulseTimerRef.current != null) {
      window.clearTimeout(pulseTimerRef.current)
    }
    pulseTimerRef.current = window.setTimeout(() => {
      setPulseId(null)
      pulseTimerRef.current = null
    }, 320)
  }, [])

  return (
    <div className="flex w-full flex-col divide-y divide-[#F3F3F3] bg-white">
      {items.map((o) => {
        const selected = selectedIds.includes(o.id)
        const pulsing = pulseId === o.id
        return (
          <button
            key={o.id}
            type="button"
            role="checkbox"
            aria-checked={selected}
            aria-label={o.hint ? `${o.label}. ${o.hint}` : o.label}
            className="flex w-full items-center gap-4 py-5 pl-0 pr-0 text-left outline-none transition-colors duration-300 first:pt-4 last:pb-4"
            onClick={() => {
              onToggle(o.id)
              triggerPulse(o.id)
            }}
          >
            <span
              className={[
                'flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-md border transition-[border-color,background-color] duration-200',
                selected
                  ? 'border-black bg-[#E8E8E8]'
                  : 'border-[#C8C8C8] bg-white',
              ].join(' ')}
              aria-hidden
            >
              {selected ? (
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#0a0a0a"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              ) : null}
            </span>
            <span className="flex min-w-0 flex-1 flex-col gap-0.5 text-left">
              <span
                className={[
                  'text-[15px] leading-relaxed transition-colors duration-300 ease-out',
                  selected
                    ? 'font-medium text-[#212121]'
                    : 'font-normal text-[#454545]',
                  pulsing ? 'text-[#7C5BD6]' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                {o.label}
              </span>
              {o.hint ? (
                <span className="text-[11px] font-normal leading-snug text-[#9CA3AF]">
                  {o.hint}
                </span>
              ) : null}
            </span>
          </button>
        )
      })}
    </div>
  )
}

/** Long lists: same checkbox column; “Show more” expands once (no “Show less”). */
function ExpandableCheckboxColumn({
  items,
  selectedIds,
  onToggle,
  initial = 5,
}: {
  items: readonly CheckboxFilterItem[]
  selectedIds: string[]
  onToggle: (id: string) => void
  initial?: number
}) {
  const [expanded, setExpanded] = useState(false)
  const visible = expanded ? items : items.slice(0, initial)
  return (
    <div>
      <CheckboxFilterColumn
        items={visible}
        selectedIds={selectedIds}
        onToggle={onToggle}
      />
      {!expanded && items.length > initial ? (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="mt-4 px-1 text-left text-[13px] font-semibold text-[#5B22DE] active:opacity-70"
        >
          Show more
        </button>
      ) : null}
    </div>
  )
}

/** Left category rail only — very light tap when switching category */
function filterLeftCategoryHaptic() {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    try {
      navigator.vibrate(5)
    } catch {
      /* unsupported */
    }
  }
}

function CategoryNav({
  active,
  onSelect,
  visibleIds,
}: {
  active: FilterCategoryId
  onSelect: (id: FilterCategoryId) => void
  visibleIds: readonly FilterCategoryId[]
}) {
  return (
    <nav
      className="srp-filter-scroll flex h-full min-h-0 w-[26%] min-w-[88px] max-w-[118px] shrink-0 flex-col gap-1.5 overflow-y-auto overscroll-y-contain border-r border-[#E8E8E8] bg-white py-1.5"
      style={{ WebkitOverflowScrolling: 'touch' }}
      aria-label="Filter categories"
    >
      {visibleIds.length === 0 ? (
        <p className="px-2 py-4 text-center text-[11px] leading-snug text-[#B0B0B0]">
          No categories match
        </p>
      ) : (
        visibleIds.map((id) => {
          const isActive = id === active
          return (
            <button
              key={id}
              type="button"
              onClick={() => {
                if (id !== active) filterLeftCategoryHaptic()
                onSelect(id)
              }}
              className={[
                'flex w-full items-stretch bg-white text-left text-[11px] leading-snug transition-[background] duration-200',
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
                  'min-w-0 flex-1 py-3.5 pr-2 text-left',
                  isActive ? 'pl-1.5' : 'pl-2',
                ].join(' ')}
              >
                {FILTER_CATEGORY_LABELS[id]}
              </span>
            </button>
          )
        })
      )}
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
          <BudgetFilterPanel
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
        <div className="mt-2">
          <CheckboxFilterColumn
            items={BHK_CHECKBOX_ITEMS}
            selectedIds={draft.bhk}
            onToggle={(id) =>
              setDraft((d) => ({
                ...d,
                bhk: toggleInArray(d.bhk, id),
              }))
            }
          />
        </div>
      </div>
    )
  }

  if (active === 'propertyType') {
    return (
      <div className="px-4 pb-24 pt-5">
        <PanelSectionLabel categoryId="propertyType" />
        <div className="mt-2">
          <CheckboxFilterColumn
            items={PROPERTY_TYPE_CHECKBOX_ITEMS}
            selectedIds={draft.propertyTypes}
            onToggle={(id) =>
              setDraft((d) => ({
                ...d,
                propertyTypes: toggleInArray(d.propertyTypes, id),
              }))
            }
          />
        </div>
      </div>
    )
  }

  if (active === 'construction') {
    return (
      <div className="px-4 pb-24 pt-5">
        <PanelSectionLabel categoryId="construction" />
        <div className="mt-2">
          <CheckboxFilterColumn
            items={CONSTRUCTION_CHECKBOX_ITEMS}
            selectedIds={draft.construction}
            onToggle={(id) =>
              setDraft((d) => ({
                ...d,
                construction: toggleInArray(
                  d.construction,
                  id as 'ready' | 'under_construction',
                ),
              }))
            }
          />
        </div>
      </div>
    )
  }

  if (active === 'listedBy') {
    return (
      <div className="px-4 pb-24 pt-5">
        <PanelSectionLabel categoryId="listedBy" />
        <div className="mt-2">
          <CheckboxFilterColumn
            items={LISTED_BY_CHECKBOX_ITEMS}
            selectedIds={draft.listedBy}
            onToggle={(id) =>
              setDraft((d) => ({
                ...d,
                listedBy: toggleInArray(d.listedBy, id),
              }))
            }
          />
        </div>
      </div>
    )
  }

  if (active === 'amenities') {
    return (
      <div className="px-4 pb-24 pt-5">
        <PanelSectionLabel categoryId="amenities" />
        <div className="mt-2">
          <ExpandableCheckboxColumn
            items={AMENITIES_CHECKBOX_ITEMS}
            selectedIds={draft.amenities}
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
          <AreaFilterPanel
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
        <div className="mt-2">
          <CheckboxFilterColumn
            items={PURCHASE_CHECKBOX_ITEMS}
            selectedIds={draft.purchaseTypes}
            onToggle={(id) =>
              setDraft((d) => ({
                ...d,
                purchaseTypes: toggleInArray(d.purchaseTypes, id),
              }))
            }
          />
        </div>
      </div>
    )
  }

  if (active === 'propertyAge') {
    return (
      <div className="px-4 pb-24 pt-5">
        <PanelSectionLabel categoryId="propertyAge" />
        <div className="mt-2">
          <ExpandableCheckboxColumn
            items={PROPERTY_AGE_CHECKBOX_ITEMS}
            selectedIds={draft.propertyAges}
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
          <ExpandableCheckboxColumn
            items={DEVELOPER_CHECKBOX_ITEMS}
            selectedIds={draft.developers}
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
        <div className="mt-2">
          <CheckboxFilterColumn
            items={FURNISHING_CHECKBOX_ITEMS}
            selectedIds={draft.furnishing}
            onToggle={(id) =>
              setDraft((d) => ({
                ...d,
                furnishing: toggleInArray(d.furnishing, id),
              }))
            }
          />
        </div>
      </div>
    )
  }

  if (active === 'facing') {
    return (
      <div className="px-4 pb-24 pt-5">
        <PanelSectionLabel categoryId="facing" />
        <div className="mt-2">
          <ExpandableCheckboxColumn
            items={FACING_CHECKBOX_ITEMS}
            selectedIds={draft.facing}
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
        <div className="mt-2">
          <CheckboxFilterColumn
            items={PHOTOS_CHECKBOX_ITEMS}
            selectedIds={[String(draft.minImageCount)]}
            onToggle={(id) =>
              setDraft((d) => ({ ...d, minImageCount: Number(id) }))
            }
          />
        </div>
      </div>
    )
  }

  if (active === 'rera') {
    return (
      <div className="px-4 pb-24 pt-5">
        <PanelSectionLabel categoryId="rera" />
        <div className="mt-2">
          <CheckboxFilterColumn
            items={RERA_CHECKBOX_ITEMS}
            selectedIds={draft.reraOnly ? ['rera'] : ['all']}
            onToggle={(id) =>
              setDraft((d) => ({
                ...d,
                reraOnly: id === 'rera',
              }))
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
  const [categoryQuery, setCategoryQuery] = useState('')
  const [draft, setDraft] = useState<SrpAppliedFilters>(() =>
    cloneSrpAppliedFilters(applied),
  )

  const visibleCategoryIds = useMemo(() => {
    const q = categoryQuery.trim().toLowerCase()
    if (!q) return FILTER_CATEGORY_IDS
    return FILTER_CATEGORY_IDS.filter((id) =>
      FILTER_CATEGORY_LABELS[id].toLowerCase().includes(q),
    )
  }, [categoryQuery])
  /** Keep portal mounted while exit animation runs */
  const [present, setPresent] = useState(open)
  /** Sheet at rest position (open) vs off-screen (closed) */
  const [entered, setEntered] = useState(false)
  /** When true, overlay is pass-through + body scroll restored while sheet animates out */
  const [closing, setClosing] = useState(false)
  /**
   * Transitions must not run on the first paint after mount — browsers skip
   * from “no prior style” to animated. Arm transitions only after layout.
   */
  const [motionReady, setMotionReady] = useState(false)
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const openRafRef = useRef<{ a?: number; b?: number; c?: number }>({})
  const bodyBeforeSheetRef = useRef<{ overflow: string; paddingRight: string }>({
    overflow: '',
    paddingRight: '',
  })

  const closeAnimated = useCallback(() => {
    onCloseMotionStart?.()
    setClosing(true)
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
      setClosing(false)
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
      setCategoryQuery('')
    }
  }, [open, applied])

  useEffect(() => {
    if (visibleCategoryIds.length === 0) return
    if (!visibleCategoryIds.includes(active)) {
      setActive(visibleCategoryIds[0]!)
    }
  }, [visibleCategoryIds, active])

  useEffect(() => {
    if (!present) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeAnimated()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
    }
  }, [present, closeAnimated])

  useEffect(() => {
    if (!present) return
    if (closing) {
      document.body.style.overflow = bodyBeforeSheetRef.current.overflow
      document.body.style.paddingRight = bodyBeforeSheetRef.current.paddingRight
      return
    }
    bodyBeforeSheetRef.current = {
      overflow: document.body.style.overflow,
      paddingRight: document.body.style.paddingRight,
    }
    const gutter = window.innerWidth - document.documentElement.clientWidth
    document.body.style.overflow = 'hidden'
    if (gutter > 0) {
      document.body.style.paddingRight = `${gutter}px`
    }
    return () => {
      document.body.style.overflow = bodyBeforeSheetRef.current.overflow
      document.body.style.paddingRight = bodyBeforeSheetRef.current.paddingRight
    }
  }, [present, closing])

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
      className={[
        'fixed inset-0 z-[110]',
        closing ? 'pointer-events-none' : '',
      ].join(' ')}
      role="presentation"
    >
      <button
        type="button"
        className={[
          'absolute inset-0 transition-[background-color,opacity] duration-200 ease-out',
          closing ? 'bg-black/0' : 'bg-black/40 motion-reduce:bg-black/40',
        ].join(' ')}
        aria-label="Close filters"
        onClick={closeAnimated}
        tabIndex={closing ? -1 : 0}
      />

      <div className="pointer-events-none absolute inset-0 flex justify-center">
        <div className="relative h-dvh w-full max-w-[430px] overflow-hidden">
          <div
            className="pointer-events-auto absolute inset-0 flex flex-col bg-white shadow-[-8px_0_32px_rgba(0,0,0,0.12)] will-change-transform"
            style={{
              ...(motionReady
                ? {
                    transitionProperty: 'transform',
                    transitionDuration: `${SHEET_TRANSITION_MS}ms`,
                    transitionTimingFunction:
                      'cubic-bezier(0.08, 0.78, 0.12, 0.99)',
                  }
                : { transition: 'none' }),
              transform: entered
                ? 'translate3d(0,0,0)'
                : 'translate3d(100%,0,0)',
            }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="srp-filters-title"
            onClick={(e) => e.stopPropagation()}
          >
            <header
              className="flex shrink-0 items-center gap-2 border-b border-[#E8E8E8] px-3 pb-3 pt-3"
              style={{
                paddingTop: 'max(10px, env(safe-area-inset-top, 0px))',
              }}
            >
              <div className="flex min-w-0 shrink-0 items-center gap-0.5">
                <button
                  type="button"
                  onClick={closeAnimated}
                  className="-ml-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full active:bg-black/[0.05]"
                  aria-label="Back"
                >
                  <FilterScreenBackIcon />
                </button>
                <h1
                  id="srp-filters-title"
                  className="text-[18px] font-bold tracking-tight text-[#212121]"
                >
                  Filter
                </h1>
              </div>

              <div className="mx-1 flex min-h-[44px] min-w-0 flex-1 items-center gap-2 rounded-lg border border-[#EFEFEF] bg-[#FAFAFA] px-2.5 py-2 outline-none focus-within:border-[#E6E6E6]">
                <span
                  className="shrink-0 text-[#B8B8B8]"
                  aria-hidden
                >
                  <FilterSheetSearchIcon />
                </span>
                <input
                  type="search"
                  value={categoryQuery}
                  onChange={(e) => setCategoryQuery(e.target.value)}
                  placeholder="Search"
                  enterKeyHint="search"
                  className="min-w-0 flex-1 border-0 bg-transparent py-0.5 text-[15px] font-normal leading-normal text-[#555555] placeholder:text-[#BDBDBD] outline-none focus:ring-0"
                  aria-label="Search filter categories"
                />
              </div>

              <button
                type="button"
                onClick={clearAll}
                className="shrink-0 px-1 py-2 text-[13px] font-semibold text-[#5B22DE] active:opacity-70"
              >
                Clear all
              </button>
            </header>

            <div className="flex min-h-0 flex-1 overflow-hidden bg-white">
              <CategoryNav
                active={active}
                onSelect={setActive}
                visibleIds={visibleCategoryIds}
              />
              <div
                className="srp-filter-scroll min-h-0 flex-1 overflow-y-auto overscroll-y-contain bg-white"
                style={{ WebkitOverflowScrolling: 'touch' }}
              >
                <RightPanel active={active} draft={draft} setDraft={setDraft} />
              </div>
            </div>

            <footer
              className="relative z-[1] shrink-0 border-t border-[#E8E8E8] bg-white px-4 pt-3 shadow-[0_-2px_7px_-1px_rgba(0,0,0,0.075)]"
              style={{
                paddingBottom: 'max(14px, env(safe-area-inset-bottom, 0px))',
              }}
            >
              <button
                type="button"
                onClick={apply}
                disabled={!applyCtaActive}
                className={[
                  'w-full rounded-[14px] py-3.5 text-[15px] font-semibold transition-[background-color,color,opacity]',
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
        </div>
      </div>
    </div>,
    document.body,
  )
}
