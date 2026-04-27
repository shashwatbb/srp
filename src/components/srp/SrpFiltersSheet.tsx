import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from 'react'
import { createPortal } from 'react-dom'
import {
  FILTER_AMENITIES_INITIAL_VISIBLE,
  FILTER_AMENITIES_LONG,
  FILTER_BHK_OPTIONS,
  FILTER_CATEGORY_IDS,
  FILTER_CATEGORY_LABELS,
  FILTER_CONSTRUCTION_OPTIONS,
  FILTER_DEVELOPER_OPTIONS,
  FILTER_FACING_OPTIONS,
  FILTER_FURNISHING_OPTIONS,
  FILTER_LAUNCHER_OPTIONS,
  FILTER_LISTED_BY_OPTIONS,
  FILTER_PHOTOS_OPTIONS,
  FILTER_PROPERTY_AGE_OPTIONS,
  FILTER_PROPERTY_TYPE_OPTIONS,
  FILTER_PURCHASE_TYPE_OPTIONS,
  FILTER_ADDED_ON_OPTIONS,
  FILTER_SITE_FEATURE_OPTIONS,
  type FilterCategoryId,
} from '../../data/srpFiltersMock'
import { filterCategoryRailHaptic } from '../../lib/gentleHaptic'
import {
  areSrpAppliedFiltersEqual,
  cloneSrpAppliedFilters,
  countActiveSrpFilterDimensions,
  createDefaultSrpAppliedFilters,
  SRP_BUDGET_MAX_CR,
  SRP_BUDGET_MIN_CR,
  SRP_BUDGET_SNAP_STEPS_CR,
  type SrpAppliedFilters,
  type SrpConstructionStatusId,
} from './srpFilterModel'

type SrpFiltersSheetProps = {
  open: boolean
  onClose: () => void
  applied: SrpAppliedFilters
  onApply: (next: SrpAppliedFilters) => void
  /** Left-rail tab when the sheet opens (from shortcut row or main Filters). */
  initialFocusCategory?: FilterCategoryId
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

function PanelSectionLabel({ categoryId }: { categoryId: FilterCategoryId }) {
  return (
    <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#878787]">
      {FILTER_CATEGORY_LABELS[categoryId].toUpperCase()}
    </p>
  )
}

/** Single-select row: radio ring + dot use same black / grey palette as checkbox column. */
function FilterOptionRow({
  selected,
  label,
  hint,
  onClick,
}: {
  selected: boolean
  label: string
  hint?: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={hint ? `${label}. ${hint}` : label}
      className="flex w-full items-center gap-3 bg-white py-4 pl-1 pr-2 text-left active:bg-white"
    >
      <span
        className={[
          'flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full border-2 bg-white transition-[border-color] duration-200',
          selected ? 'border-black' : 'border-[#C8C8C8]',
        ].join(' ')}
        aria-hidden
      >
        {selected ? (
          <span className="h-[11px] w-[11px] rounded-full bg-[#0a0a0a]" />
        ) : null}
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5 text-left">
        <span
          className={[
            'text-[15px] leading-snug',
            selected ? 'font-medium text-[#212121]' : 'font-normal text-[#454545]',
          ].join(' ')}
        >
          {label}
        </span>
        {hint ? (
          <span className="text-[11px] font-normal leading-snug text-[#9CA3AF]">
            {hint}
          </span>
        ) : null}
      </span>
    </button>
  )
}

function toggleInArray<T extends string>(arr: T[], id: T): T[] {
  const has = arr.includes(id)
  if (has) return arr.filter((x) => x !== id)
  return [...arr, id]
}

const BUDGET_CR_LO = SRP_BUDGET_MIN_CR
const BUDGET_CR_HI = SRP_BUDGET_MAX_CR
const BUDGET_CR_SPAN = BUDGET_CR_HI - BUDGET_CR_LO
const BUDGET_CR_GAP = 0.05

const BUDGET_QUICK_CHIPS: readonly {
  id: string
  label: string
  min: number
  max: number
}[] = [
  { id: '10-20', label: '₹10L – ₹20L', min: 0.1, max: 0.2 },
  { id: '20-1', label: '₹20L – ₹1Cr', min: 0.2, max: 1 },
  { id: '1-2', label: '₹1Cr – ₹2Cr', min: 1, max: 2 },
  { id: '2-25', label: '₹2Cr – ₹2.5Cr', min: 2, max: 2.5 },
  { id: '25-4', label: '₹2.5Cr – ₹4Cr', min: 2.5, max: 4 },
  { id: '4-5', label: '₹4Cr – ₹5Cr', min: 4, max: 5 },
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
  if (cr < BUDGET_CR_LO - 1e-9) return 'Any'
  if (role === 'max' && cr >= BUDGET_CR_HI - 0.001) return '₹5Cr+'
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

function budgetRangeFromChipId(
  id: string | null,
): { min: number; max: number } | null {
  if (!id) return null
  const chip = BUDGET_QUICK_CHIPS.find((c) => c.id === id)
  return chip ? { min: chip.min, max: chip.max } : null
}

function valueFromTrackClientY(clientY: number, rect: DOMRect): number {
  const fromBottom = rect.bottom - clientY
  const ratio = Math.min(1, Math.max(0, fromBottom / rect.height))
  return BUDGET_CR_LO + ratio * BUDGET_CR_SPAN
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
const BUDGET_BAR_STEPPER_COUNT = SRP_BUDGET_SNAP_STEPS_CR.length
const BUDGET_BAR_GREY = '#E8EAEF'
const BUDGET_STEPPER_CRS: readonly number[] = SRP_BUDGET_SNAP_STEPS_CR

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

  const pointerUp = useCallback(
    function onBudgetPointerUp() {
      dragRef.current = null
      window.removeEventListener('pointermove', pointerMove)
      window.removeEventListener('pointerup', onBudgetPointerUp)
      window.removeEventListener('pointercancel', onBudgetPointerUp)
    },
    [pointerMove],
  )

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
    ((cr - BUDGET_CR_LO) / BUDGET_CR_SPAN) * BUDGET_TRACK_H -
    BUDGET_THUMB_PX / 2

  const purpleBottom =
    ((minCr - BUDGET_CR_LO) / BUDGET_CR_SPAN) * BUDGET_TRACK_H
  const purpleHeight =
    ((maxCr - minCr) / BUDGET_CR_SPAN) * BUDGET_TRACK_H

  const thumbStyle = (cr: number) => ({
    left: '50%',
    bottom: `${thumbBottomPx(cr)}px`,
    width: BUDGET_THUMB_PX,
    height: BUDGET_THUMB_PX,
    transform: 'translateX(-50%)',
  })

  /** Vertical center of thumb from track bottom (px) — for aligned price pills */
  const thumbCenterBottomPx = (cr: number) =>
    ((cr - BUDGET_CR_LO) / BUDGET_CR_SPAN) * BUDGET_TRACK_H

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

  const [selectedChipId, setSelectedChipId] = useState<string | null>(null)

  /** Slider edits that no longer match the highlighted chip — clear chip highlight */
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- keep chip highlight in sync when slider values change externally
    setSelectedChipId((prev) => {
      if (prev === null) return prev
      const r = budgetRangeFromChipId(prev)
      if (!r) return null
      if (!budgetRangesClose(r.min, r.max, minCr, maxCr)) return null
      return prev
    })
  }, [minCr, maxCr])

  const selectChip = (chip: (typeof BUDGET_QUICK_CHIPS)[number]) => {
    setSelectedChipId((prev) => {
      if (prev === chip.id) {
        onChange(defaultBudget.min, defaultBudget.max)
        return null
      }
      onChange(chip.min, chip.max)
      return chip.id
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
          const selected = selectedChipId === chip.id
          return (
            <button
              key={chip.id}
              type="button"
              onClick={() => selectChip(chip)}
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
  { id: 'u500', label: 'Under 500 sq.ft.', min: 0, max: 500 },
  { id: '500-1k', label: '500 – 1,000 sq.ft.', min: 500, max: 1000 },
  { id: '1k-15', label: '1,000 – 1,500 sq.ft.', min: 1000, max: 1500 },
  { id: '15-2k', label: '1,500 – 2,000 sq.ft.', min: 1500, max: 2000 },
  { id: '2k-3k', label: '2,000 – 3,000 sq.ft.', min: 2000, max: 3000 },
  { id: '3kp', label: '3,000+ sq.ft.', min: 3000, max: 12000 },
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

function areaRangeFromChipId(
  id: string | null,
): { min: number; max: number } | null {
  if (!id) return null
  const chip = SQFT_QUICK_CHIPS.find((c) => c.id === id)
  return chip ? { min: chip.min, max: chip.max } : null
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

  const pointerUp = useCallback(
    function onAreaPointerUp() {
      dragRef.current = null
      window.removeEventListener('pointermove', pointerMove)
      window.removeEventListener('pointerup', onAreaPointerUp)
      window.removeEventListener('pointercancel', onAreaPointerUp)
    },
    [pointerMove],
  )

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

  const [selectedChipId, setSelectedChipId] = useState<string | null>(null)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- keep chip highlight in sync when slider values change externally
    setSelectedChipId((prev) => {
      if (prev === null) return prev
      const r = areaRangeFromChipId(prev)
      if (!r) return null
      if (!areaRangesClose(r.min, r.max, minSq, maxSq)) return null
      return prev
    })
  }, [minSq, maxSq])

  const selectChip = (chip: (typeof SQFT_QUICK_CHIPS)[number]) => {
    setSelectedChipId((prev) => {
      if (prev === chip.id) {
        onChange(defaultArea.min, defaultArea.max)
        return null
      }
      onChange(chip.min, chip.max)
      return chip.id
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
          const selected = selectedChipId === chip.id
          return (
            <button
              key={chip.id}
              type="button"
              onClick={() => selectChip(chip)}
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

type CheckboxFilterItem = {
  id: string
  label: string
  hint?: string
  /** Developer filter: show project count under the name */
  projectCount?: number
}

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
    hint: o.hint,
  }))

const LISTED_BY_CHECKBOX_ITEMS: CheckboxFilterItem[] =
  FILTER_LISTED_BY_OPTIONS.map((o) => ({
    id: o.id,
    label: o.label,
    hint: o.hint,
  }))

const AMENITIES_CHECKBOX_ITEMS: CheckboxFilterItem[] =
  FILTER_AMENITIES_LONG.map((o) => ({ id: o.id, label: o.label }))

const PURCHASE_CHECKBOX_ITEMS: CheckboxFilterItem[] =
  FILTER_PURCHASE_TYPE_OPTIONS.map((o) => ({
    id: o.id,
    label: o.label,
    hint: o.hint,
  }))

const DEVELOPER_CHECKBOX_ITEMS: CheckboxFilterItem[] =
  FILTER_DEVELOPER_OPTIONS.map((o) => ({
    id: o.id,
    label: o.id,
    projectCount: o.projectCount,
  }))

const FURNISHING_CHECKBOX_ITEMS: CheckboxFilterItem[] =
  FILTER_FURNISHING_OPTIONS.map((o) => ({ id: o.id, label: o.label }))

const FACING_CHECKBOX_ITEMS: CheckboxFilterItem[] =
  FILTER_FACING_OPTIONS.map((o) => ({ id: o.id, label: o.label }))

const VERIFIED_CHECKBOX_ITEMS: CheckboxFilterItem[] = [
  {
    id: 'verified_only',
    label: 'View verified properties only',
  },
]

const SITE_CHECKBOX_ITEMS: CheckboxFilterItem[] =
  FILTER_SITE_FEATURE_OPTIONS.map((o) => ({ id: o.id, label: o.label }))

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
    <div className="flex w-full flex-col bg-white">
      {items.map((o) => {
        const selected = selectedIds.includes(o.id)
        const pulsing = pulseId === o.id
        return (
          <button
            key={o.id}
            type="button"
            role="checkbox"
            aria-checked={selected}
            aria-label={
              typeof o.projectCount === 'number'
                ? `${o.label}, ${o.projectCount} projects`
                : o.hint
                  ? `${o.label}. ${o.hint}`
                  : o.label
            }
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
            {typeof o.projectCount === 'number' ? (
              <span className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden text-left">
                <span
                  className={[
                    'min-w-0 truncate text-[15px] leading-relaxed transition-colors duration-300 ease-out',
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
                <span
                  className="h-3.5 w-px shrink-0 self-center bg-[#D6D6D6]"
                  aria-hidden
                />
                <span className="shrink-0 text-[13px] font-normal tabular-nums leading-relaxed text-[#6B6B6B]">
                  {o.projectCount}{' '}
                  {o.projectCount === 1 ? 'project' : 'projects'}
                </span>
              </span>
            ) : (
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
            )}
          </button>
        )
      })}
    </div>
  )
}

/** Long lists: same checkbox column; expand CTA expands once (no “Show less”). */
function ExpandableCheckboxColumn({
  items,
  selectedIds,
  onToggle,
  initial = 5,
  expandButtonLabel = 'Show more',
}: {
  items: readonly CheckboxFilterItem[]
  selectedIds: string[]
  onToggle: (id: string) => void
  initial?: number
  expandButtonLabel?: string
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
          {expandButtonLabel}
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
  const navRef = useRef<HTMLElement>(null)
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([])
  const [bar, setBar] = useState({ top: 0, height: 0 })

  const syncBar = useCallback(() => {
    const nav = navRef.current
    const idx = FILTER_CATEGORY_IDS.indexOf(active)
    const btn = itemRefs.current[idx]
    if (!nav || !btn) return
    setBar({ top: btn.offsetTop, height: btn.offsetHeight })
  }, [active])

  useLayoutEffect(() => {
    syncBar()
  }, [syncBar])

  useEffect(() => {
    const nav = navRef.current
    if (!nav || typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(() => syncBar())
    ro.observe(nav)
    return () => ro.disconnect()
  }, [syncBar])

  return (
    <nav
      ref={navRef}
      className="srp-filter-scroll relative flex h-full min-h-0 w-[26%] min-w-[88px] max-w-[118px] shrink-0 flex-col gap-1.5 overflow-y-auto overscroll-y-contain border-r border-[#E8E8E8] bg-white py-1.5"
      style={{ WebkitOverflowScrolling: 'touch' }}
      aria-label="Filter categories"
    >
      <div
        aria-hidden
        className={[
          'pointer-events-none absolute left-0 top-0 z-[1] w-[5px] rounded-r-[10px] bg-[#5B22DE]',
          'motion-safe:transition-[transform,height,opacity] motion-safe:duration-[240ms] motion-safe:ease-[cubic-bezier(0.25,0.46,0.45,0.94)]',
        ].join(' ')}
        style={{
          transform: `translateY(${bar.top}px)`,
          height: bar.height > 0 ? bar.height : 0,
          opacity: bar.height > 0 ? 1 : 0,
        }}
      />
      {FILTER_CATEGORY_IDS.map((id, index) => {
        const isActive = id === active
        return (
          <button
            key={id}
            ref={(el) => {
              itemRefs.current[index] = el
            }}
            type="button"
            onClick={() => {
              if (id !== active) filterCategoryRailHaptic()
              onSelect(id)
            }}
            className={[
              'relative z-0 flex w-full items-stretch bg-white text-left text-[13px] leading-snug transition-[background] duration-200',
              isActive
                ? 'font-medium text-[#2d1f4e] [background-image:linear-gradient(90deg,#f3ecff_0%,#faf7ff_42%,#ffffff_100%)]'
                : 'font-normal text-[#212121] active:bg-[#FCFCFC]',
            ].join(' ')}
          >
            <span className="min-w-0 flex-1 py-3.5 pl-2 pr-2 text-left">
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
  const listWrap = 'mt-2 overflow-hidden rounded-xl bg-white'

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
                upcomingOnly: false,
                construction: toggleInArray(
                  d.construction,
                  id as SrpConstructionStatusId,
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
            initial={FILTER_AMENITIES_INITIAL_VISIBLE}
            expandButtonLabel="View more"
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
        <div className={listWrap}>
          <FilterOptionRow
            label="Any"
            selected={draft.propertyAges.length === 0}
            onClick={() => setDraft((d) => ({ ...d, propertyAges: [] }))}
          />
          {FILTER_PROPERTY_AGE_OPTIONS.map((o) => (
            <FilterOptionRow
              key={o.id}
              label={o.label}
              selected={
                draft.propertyAges.length === 1 &&
                draft.propertyAges[0] === o.id
              }
              onClick={() =>
                setDraft((d) => ({ ...d, propertyAges: [o.id] }))
              }
            />
          ))}
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
        <div className={listWrap}>
          {FILTER_PHOTOS_OPTIONS.map((opt) => (
            <FilterOptionRow
              key={opt.id}
              label={opt.label}
              selected={draft.mediaPreference === opt.id}
              onClick={() =>
                setDraft((d) => ({
                  ...d,
                  mediaPreference: opt.id,
                }))
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
            label="RERA-registered only"
            selected={draft.reraOnly}
            onClick={() =>
              setDraft((d) => ({ ...d, reraOnly: !d.reraOnly }))
            }
          />
        </div>
      </div>
    )
  }

  if (active === 'launched') {
    return (
      <div className="px-4 pb-24 pt-5">
        <PanelSectionLabel categoryId="launched" />
        <div className={listWrap}>
          {FILTER_LAUNCHER_OPTIONS.map((opt) => (
            <FilterOptionRow
              key={opt.id}
              label={opt.label}
              selected={draft.launcherWindow === opt.id}
              onClick={() =>
                setDraft((d) => ({
                  ...d,
                  launcherWindow:
                    d.launcherWindow === opt.id ? '' : opt.id,
                }))
              }
            />
          ))}
        </div>
      </div>
    )
  }

  if (active === 'verified') {
    return (
      <div className="px-4 pb-24 pt-5">
        <PanelSectionLabel categoryId="verified" />
        <div className="mt-2">
          <CheckboxFilterColumn
            items={VERIFIED_CHECKBOX_ITEMS}
            selectedIds={
              draft.verifiedOnly ? ['verified_only'] : []
            }
            onToggle={() =>
              setDraft((d) => ({ ...d, verifiedOnly: !d.verifiedOnly }))
            }
          />
        </div>
      </div>
    )
  }

  if (active === 'site') {
    return (
      <div className="px-4 pb-24 pt-5">
        <PanelSectionLabel categoryId="site" />
        <div className="mt-2">
          <CheckboxFilterColumn
            items={SITE_CHECKBOX_ITEMS}
            selectedIds={[
              ...(draft.siteCorner ? ['corner_property'] : []),
              ...(draft.siteBoundaryWall ? ['boundary_wall'] : []),
            ]}
            onToggle={(id) =>
              setDraft((d) => {
                if (id === 'corner_property') {
                  return { ...d, siteCorner: !d.siteCorner }
                }
                if (id === 'boundary_wall') {
                  return { ...d, siteBoundaryWall: !d.siteBoundaryWall }
                }
                return d
              })
            }
          />
        </div>
      </div>
    )
  }

  if (active === 'addedOn') {
    return (
      <div className="px-4 pb-24 pt-5">
        <PanelSectionLabel categoryId="addedOn" />
        <div className={listWrap}>
          {FILTER_ADDED_ON_OPTIONS.map((opt) => (
            <FilterOptionRow
              key={opt.id}
              label={opt.label}
              selected={draft.addedOn === opt.id}
              onClick={() =>
                setDraft((d) => ({
                  ...d,
                  addedOn: d.addedOn === opt.id ? '' : opt.id,
                }))
              }
            />
          ))}
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
  initialFocusCategory = 'budget',
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
    /* eslint-disable react-hooks/set-state-in-effect -- present/enter/motion flags mirror `open` for sheet animation lifecycle */
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
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [open])

  useEffect(() => {
    if (open) {
      /* eslint-disable react-hooks/set-state-in-effect -- draft mirrors `applied` each time sheet opens */
      setDraft(cloneSrpAppliedFilters(applied))
      setActive(initialFocusCategory)
      /* eslint-enable react-hooks/set-state-in-effect */
    }
  }, [open, applied, initialFocusCategory])

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

  const clearAllDisabled = useMemo(
    () => areSrpAppliedFiltersEqual(draft, createDefaultSrpAppliedFilters()),
    [draft],
  )

  if (!present) return null

  const clearAll = () => {
    if (clearAllDisabled) return
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
              className="flex shrink-0 items-center justify-between gap-3 border-b border-[#E8E8E8] px-3 pb-3 pt-3"
              style={{
                paddingTop: 'max(10px, env(safe-area-inset-top, 0px))',
              }}
            >
              <div className="flex min-w-0 flex-1 items-center gap-0.5">
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
              <button
                type="button"
                onClick={clearAll}
                disabled={clearAllDisabled}
                className={[
                  'shrink-0 px-1 py-2 text-[13px] font-semibold transition-opacity',
                  clearAllDisabled
                    ? 'cursor-not-allowed text-[#9CA3AF] opacity-60'
                    : 'text-[#5B22DE] active:opacity-70',
                ].join(' ')}
              >
                Clear all
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
