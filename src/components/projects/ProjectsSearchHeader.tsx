import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react'
import {
  filterProjectSearchMatches,
  pickShortcutTarget,
} from '../../data/projectsSearchSuggestionsMock'
import { ProjectSearchFlowChrome } from './ProjectSearchFlowChrome'

const PLACEHOLDER_PHRASES = [
  '3BHK with a balcony',
  'Search new projects in any locality',
  'Builder floors in Sector 65, Gurgaon',
  'Pre-launch towers by reputed builders',
  'Projects in Sector 29 or Golf Course Ext.',
  'RERA-approved projects near your sector',
]

function useTypewriterPlaceholder(active: boolean) {
  const phrases = useMemo(() => PLACEHOLDER_PHRASES, [])
  const [display, setDisplay] = useState('')
  const phraseIndexRef = useRef(0)
  const charIndexRef = useRef(0)
  const deletingRef = useRef(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const clearTimer = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
    }

    if (!active) {
      clearTimer()
      phraseIndexRef.current = 0
      charIndexRef.current = 0
      deletingRef.current = false
      queueMicrotask(() => setDisplay(''))
      return
    }

    let alive = true

    const schedule = (ms: number, fn: () => void) => {
      clearTimer()
      timeoutRef.current = setTimeout(() => {
        if (alive) fn()
      }, ms)
    }

    const step = () => {
      if (!alive) return
      const phrase = phrases[phraseIndexRef.current]
      if (!phrase) return

      if (!deletingRef.current) {
        if (charIndexRef.current < phrase.length) {
          charIndexRef.current += 1
          setDisplay(phrase.slice(0, charIndexRef.current))
          schedule(42, step)
        } else {
          schedule(2200, () => {
            deletingRef.current = true
            step()
          })
        }
      } else if (charIndexRef.current > 0) {
        charIndexRef.current -= 1
        setDisplay(phrase.slice(0, charIndexRef.current))
        schedule(28, step)
      } else {
        deletingRef.current = false
        phraseIndexRef.current =
          (phraseIndexRef.current + 1) % phrases.length
        schedule(400, step)
      }
    }

    phraseIndexRef.current = 0
    charIndexRef.current = 0
    deletingRef.current = false
    queueMicrotask(() => {
      if (!alive) return
      setDisplay('')
      schedule(280, step)
    })

    return () => {
      alive = false
      clearTimer()
    }
  }, [active, phrases])

  return display
}

function SearchFieldIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#222222"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden
    >
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-4.3-4.3" />
    </svg>
  )
}

function NortheastArrowIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#222222"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M5 19L19 5M19 5H9M19 5v10" />
    </svg>
  )
}

function CloseCircleIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#6A6A6A"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M15 9l-6 6M9 9l6 6" />
    </svg>
  )
}

function highlightQuery(text: string, query: string) {
  const q = query.trim()
  if (!q) return text
  const lower = text.toLowerCase()
  const idx = lower.indexOf(q.toLowerCase())
  if (idx < 0) {
    return text
  }
  return (
    <>
      {text.slice(0, idx)}
      <span className="font-semibold text-[#222222]">
        {text.slice(idx, idx + q.length)}
      </span>
      {text.slice(idx + q.length)}
    </>
  )
}

function MicIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <path
        d="M12 14a3 3 0 003-3V6a3 3 0 10-6 0v5a3 3 0 003 3z"
        stroke="#5B22DE"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M19 11a7 7 0 01-14 0M12 18v3"
        stroke="#5B22DE"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  )
}

type ProjectsSearchHeaderProps = {
  onBack: () => void
  /** City label in the top-right location control */
  locationLabel?: string
  /** Opens city picker (e.g. bottom sheet). */
  onLocationClick?: () => void
  /** Selected city — used for suggestion copy and SRP context */
  city?: string
  /** Called when user presses Enter or picks a suggestion */
  onSubmitSearch?: (query: string) => void
  /** Seed when returning from SRP (parent may remount via `key`) */
  initialSearchValue?: string
}

export function ProjectsSearchHeader({
  onBack,
  locationLabel = 'Gurgaon',
  onLocationClick,
  city = 'Gurgaon',
  onSubmitSearch,
  initialSearchValue = '',
}: ProjectsSearchHeaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [value, setValue] = useState(initialSearchValue)
  const [focused, setFocused] = useState(false)
  const showAnimation = !focused && !value
  const animatedLine = useTypewriterPlaceholder(showAnimation)

  const trimmed = value.trim()
  const showPanel = focused && trimmed.length > 0

  const matches = useMemo(
    () => filterProjectSearchMatches(trimmed, city, 8),
    [trimmed, city],
  )

  const shortcutTarget = useMemo(
    () => pickShortcutTarget(trimmed, city),
    [trimmed, city],
  )

  const focusSearch = () => {
    inputRef.current?.focus({ preventScroll: true })
  }

  const goToSrp = (q: string) => {
    const next = q.trim()
    if (!next) return
    onSubmitSearch?.(next)
    inputRef.current?.blur()
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      goToSrp(trimmed)
    }
  }

  useEffect(() => {
    setValue(initialSearchValue)
  }, [initialSearchValue])

  return (
    <ProjectSearchFlowChrome
      onBack={onBack}
      locationLabel={locationLabel}
      onLocationClick={onLocationClick}
    >
      <div className="relative">
        <div className="flex h-[48px] items-center gap-2 rounded-lg border border-[#D8C8E8] bg-white px-3.5 shadow-[0_2px_10px_rgba(91,34,222,0.08)]">
          <div
            className="flex min-w-0 flex-1 cursor-text items-center gap-2"
            onPointerDown={(e) => {
              if (e.pointerType === 'mouse' && e.button !== 0) return
              focusSearch()
            }}
            role="presentation"
          >
            <SearchFieldIcon />

            <div className="relative z-0 min-w-0 flex-1 self-stretch">
              {showAnimation ? (
                <div
                  className="pointer-events-none absolute inset-0 z-0 flex min-w-0 items-center gap-2"
                  aria-hidden
                >
                  <span className="h-[18px] w-0.5 shrink-0 animate-pulse rounded-full bg-[#5B22DE]" />
                  <span className="truncate text-left text-base font-normal leading-6 text-[#6A6A6A]">
                    {animatedLine}
                  </span>
                </div>
              ) : null}
              <input
                ref={inputRef}
                type="search"
                inputMode="search"
                enterKeyHint="search"
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                onKeyDown={handleKeyDown}
                className={[
                  'relative z-[1] h-full min-h-[44px] w-full min-w-0 bg-transparent py-2 text-base font-normal leading-6 outline-none',
                  showAnimation
                    ? 'text-transparent caret-transparent'
                    : 'text-[#222222] caret-[#5B22DE]',
                ].join(' ')}
                placeholder={focused && !value ? 'Search projects…' : ''}
                aria-label="Search projects"
                aria-expanded={showPanel}
                aria-controls="projects-search-suggest"
              />
            </div>
          </div>

          {value ? (
            <button
              type="button"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full active:bg-black/[0.06]"
              aria-label="Clear search"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                setValue('')
                focusSearch()
              }}
            >
              <CloseCircleIcon />
            </button>
          ) : null}

          <div className="h-6 w-px shrink-0 bg-[#EBEBEB]" aria-hidden />

          <button
            type="button"
            data-mic
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg active:bg-[#5B22DE]/10"
            aria-label="Voice search"
          >
            <MicIcon />
          </button>
        </div>

        {showPanel ? (
          <div
            id="projects-search-suggest"
            role="listbox"
            className="absolute left-4 right-4 top-[calc(100%-2px)] z-30 mt-1 max-h-[min(52vh,380px)] overflow-y-auto rounded-2xl border border-[#EBEBEB] bg-white py-1 shadow-[0_8px_32px_rgba(0,0,0,0.12)]"
            onMouseDown={(e) => e.preventDefault()}
          >
            <button
              type="button"
              role="option"
              className="flex w-full items-start gap-3 border-b border-[#F0F0F0] px-4 py-3.5 text-left active:bg-[#F6F8FB]"
              onClick={() => goToSrp(shortcutTarget)}
            >
              <span className="mt-0.5 shrink-0">
                <NortheastArrowIcon />
              </span>
              <span className="min-w-0 text-sm font-normal leading-5 text-[#222222]">
                Search for &quot;{shortcutTarget}&quot;
              </span>
            </button>

            {matches.map((row) => (
              <button
                key={row.id}
                type="button"
                role="option"
                className="flex w-full flex-col items-stretch gap-1 border-b border-[#F0F0F0] px-4 py-3.5 text-left last:border-b-0 active:bg-[#F6F8FB]"
                onClick={() => goToSrp(row.fullText)}
              >
                <span className="text-sm font-normal leading-5 text-[#222222]">
                  {highlightQuery(row.fullText, trimmed)}
                </span>
                <span className="text-xs font-normal leading-4 text-[#6A6A6A]">
                  {row.category} <span className="text-[#C8C8C8]">|</span>{' '}
                  {row.metaLocation}
                </span>
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </ProjectSearchFlowChrome>
  )
}
