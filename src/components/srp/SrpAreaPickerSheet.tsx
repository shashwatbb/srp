import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { HotspotAreaOption } from '../../data/srpAreasMock'

type SrpAreaPickerSheetProps = {
  open: boolean
  onClose: () => void
  /** Last applied selection; copied into the sheet when it opens */
  committedIds: Set<string>
  /** Called with the new selection when the user taps Apply */
  onApply: (next: Set<string>) => void
  areas: HotspotAreaOption[]
}

export function SrpAreaPickerSheet({
  open,
  onClose,
  committedIds,
  onApply,
  areas,
}: SrpAreaPickerSheetProps) {
  const [draftIds, setDraftIds] = useState<Set<string>>(() => new Set(committedIds))
  const committedRef = useRef(committedIds)
  committedRef.current = committedIds

  useEffect(() => {
    if (open) {
      setDraftIds(new Set(committedRef.current))
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [open, onClose])

  if (!open) return null

  const areaIdSet = new Set(areas.map((a) => a.id))
  const allSelected =
    areas.length > 0 && areas.every((a) => draftIds.has(a.id))

  const toggleDraft = (id: string) => {
    setDraftIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const selectAllDraft = () => {
    setDraftIds(new Set(areaIdSet))
  }

  const clearDraft = () => {
    setDraftIds(new Set())
  }

  return createPortal(
    <div className="fixed inset-0 z-[100] flex flex-col justify-end" role="presentation">
      <button
        type="button"
        className="absolute inset-0 bg-black/45 backdrop-blur-[1px]"
        aria-label="Close without applying"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="srp-area-sheet-title"
        className="projects-shell relative mt-auto max-h-[min(78dvh,560px)] w-full rounded-t-[22px] bg-white shadow-[0_-8px_32px_rgba(0,0,0,0.12)]"
        onClick={(e) => e.stopPropagation()}
        style={{
          paddingBottom: 'max(16px, env(safe-area-inset-bottom, 0px))',
        }}
      >
        <div className="mx-auto mb-2 mt-3 h-1 w-10 rounded-full bg-[#DDDDDD]" />

        <h2
          id="srp-area-sheet-title"
          className="px-5 pb-1 pt-1 text-center text-base font-semibold leading-5 text-[#222222]"
        >
          All areas
        </h2>
        <p className="px-5 pb-3 text-center text-xs font-normal leading-4 text-[#6A6A6A]">
          Uncheck areas to narrow hotspot listings, then apply
        </p>

        <div className="flex gap-2 border-b border-[#F0F0F0] px-4 pb-3">
          <button
            type="button"
            onClick={selectAllDraft}
            className="rounded-full border border-[#E0E0E0] bg-white px-3 py-1.5 text-xs font-medium text-[#222222] shadow-[0_1px_2px_rgba(0,0,0,0.05)] active:bg-[#F6F8FB]"
          >
            Select all
          </button>
          <button
            type="button"
            onClick={clearDraft}
            className="rounded-full border border-[#E0E0E0] bg-white px-3 py-1.5 text-xs font-medium text-[#222222] shadow-[0_1px_2px_rgba(0,0,0,0.05)] active:bg-[#F6F8FB]"
          >
            Clear all
          </button>
        </div>

        <ul
          className="max-h-[min(48dvh,360px)] overflow-y-auto px-3 py-2"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {areas.map((a) => {
            const on = draftIds.has(a.id)
            return (
              <li key={a.id} className="border-b border-[#F5F5F5] last:border-b-0">
                <button
                  type="button"
                  onClick={() => toggleDraft(a.id)}
                  className="flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left active:bg-[#F6F8FB]"
                >
                  <span
                    className={[
                      'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border',
                      on
                        ? 'border-[#5B22DE] bg-[#5B22DE]'
                        : 'border-[#CCCCCC] bg-white',
                    ].join(' ')}
                    aria-hidden
                  >
                    {on ? (
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="white"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    ) : null}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium leading-snug text-[#222222]">
                      {a.label}
                    </span>
                    <span className="mt-0.5 block truncate text-[11px] font-normal leading-tight text-[#8B9199]">
                      {a.insight}
                    </span>
                  </span>
                </button>
              </li>
            )
          })}
        </ul>

        <div className="px-4 pt-2">
          <button
            type="button"
            onClick={() => onApply(new Set(draftIds))}
            className="w-full rounded-2xl bg-[#5B22DE] py-3 text-center text-sm font-semibold text-white shadow-[0_2px_10px_rgba(91,34,222,0.25)] active:bg-[#4C1BB8]"
          >
            Apply
          </button>
          {!allSelected && draftIds.size > 0 ? (
            <p className="mt-2 text-center text-[11px] text-[#6A6A6A]">
              {draftIds.size} of {areas.length} areas will be included
            </p>
          ) : allSelected ? (
            <p className="mt-2 text-center text-[11px] text-[#6A6A6A]">
              All areas included
            </p>
          ) : (
            <p className="mt-2 text-center text-[11px] text-[#E11D48]">
              Select at least one area to see results
            </p>
          )}
        </div>
      </div>
    </div>,
    document.body,
  )
}
