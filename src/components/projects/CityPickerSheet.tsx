import { useEffect } from 'react'
import type { ComponentType } from 'react'
import { createPortal } from 'react-dom'
import { TOP_INDIAN_CITIES } from '../../data/indianCities'
import {
  IconBengaluru,
  IconChennai,
  IconDelhi,
  IconGurgaon,
  IconHyderabad,
  IconMumbai,
  IconPune,
} from './cityIcons'

type CityIcon = ComponentType<{ className?: string }>

const CITY_ICON_MAP: Record<(typeof TOP_INDIAN_CITIES)[number], CityIcon> = {
  Mumbai: IconMumbai,
  Delhi: IconDelhi,
  Bengaluru: IconBengaluru,
  Hyderabad: IconHyderabad,
  Pune: IconPune,
  Chennai: IconChennai,
  Gurgaon: IconGurgaon,
}

type CityPickerSheetProps = {
  open: boolean
  onClose: () => void
  selectedCity: string
  onSelectCity: (city: string) => void
}

function SelectedBadge() {
  return (
    <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#5B22DE] shadow-sm">
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M20 6L9 17l-5-5" />
      </svg>
    </span>
  )
}

export function CityPickerSheet({
  open,
  onClose,
  selectedCity,
  onSelectCity,
}: CityPickerSheetProps) {
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

  return createPortal(
    <div className="fixed inset-0 z-[100] flex flex-col justify-end" role="presentation">
      <button
        type="button"
        className="absolute inset-0 bg-black/45 backdrop-blur-[1px]"
        aria-label="Close city picker"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="city-sheet-title"
        className="projects-shell relative mt-auto max-h-[min(85dvh,640px)] w-full rounded-t-[22px] bg-white shadow-[0_-8px_32px_rgba(0,0,0,0.12)]"
        style={{
          paddingBottom: 'max(16px, env(safe-area-inset-bottom, 0px))',
        }}
      >
        <div className="mx-auto mb-2 mt-3 h-1 w-10 rounded-full bg-[#DDDDDD]" />

        <h2
          id="city-sheet-title"
          className="px-5 pb-1 pt-1 text-center text-base font-semibold leading-5 text-[#222222]"
        >
          Select city
        </h2>
        <p className="px-5 pb-4 text-center text-sm font-normal leading-[1.125rem] text-[#6A6A6A]">
          Top cities in India
        </p>

        <div className="max-h-[min(58dvh,480px)] overflow-y-auto px-4 pb-2">
          <div className="grid grid-cols-2 gap-3">
            {TOP_INDIAN_CITIES.map((city) => {
              const selected = city === selectedCity
              const Icon = CITY_ICON_MAP[city]
              return (
                <button
                  key={city}
                  type="button"
                  onClick={() => onSelectCity(city)}
                  aria-pressed={selected}
                  className={[
                    'relative flex min-h-[118px] flex-col items-center justify-center gap-2.5 rounded-2xl border-2 px-3 py-4 transition-colors active:scale-[0.98]',
                    selected
                      ? 'border-[#5B22DE] bg-[#F3ECFF]'
                      : 'border-[#DDDDDD] bg-[#F7F7F7] active:bg-[#EBEBEB]',
                  ].join(' ')}
                >
                  {selected ? <SelectedBadge /> : null}
                  {Icon ? (
                    <Icon
                      className={
                        selected ? 'text-[#5B22DE]' : 'text-[#6A6A6A]'
                      }
                    />
                  ) : null}
                  <span
                    className={[
                      'text-center text-sm font-semibold leading-[1.125rem]',
                      selected ? 'text-[#5B22DE]' : 'text-[#222222]',
                    ].join(' ')}
                  >
                    {city}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}
