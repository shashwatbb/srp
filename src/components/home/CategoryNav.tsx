type Cat = { id: string; label: string }

const categories: Cat[] = [
  { id: 'buy', label: 'Buy' },
  { id: 'project', label: 'Project' },
  { id: 'rent', label: 'Rent' },
  { id: 'plot', label: 'Plot' },
  { id: 'commercial', label: 'Commercial' },
]

function IconBuy({ active }: { active?: boolean }) {
  const c = active ? '#5B22DE' : '#9CA3AF'
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.82 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"
        stroke={c}
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <circle cx="7" cy="7" r="1.5" fill={c} />
      <text
        x="13.5"
        y="15"
        textAnchor="middle"
        fill={c}
        fontSize="8.5"
        fontWeight="800"
        fontFamily="system-ui, sans-serif"
      >
        ₹
      </text>
    </svg>
  )
}

function IconProject({ active }: { active?: boolean }) {
  const c = active ? '#5B22DE' : '#9CA3AF'
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M3 21h18M5 21V10l7-4 7 4v11M9 21v-6h6v6"
        stroke={c}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function IconRent({ active }: { active?: boolean }) {
  const c = active ? '#5B22DE' : '#9CA3AF'
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="7" cy="16" r="3" stroke={c} strokeWidth="1.6" />
      <path
        d="M10 16h9M16 6l4 4-6 6"
        stroke={c}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function IconPlot({ active }: { active?: boolean }) {
  const c = active ? '#5B22DE' : '#9CA3AF'
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 8l8-4 8 4v8l-8 4-8-4V8z"
        stroke={c}
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M4 8l8 4 8-4" stroke={c} strokeWidth="1.6" />
    </svg>
  )
}

function IconCommercial({ active }: { active?: boolean }) {
  const c = active ? '#5B22DE' : '#9CA3AF'
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect
        x="3"
        y="7"
        width="18"
        height="14"
        rx="2"
        stroke={c}
        strokeWidth="1.6"
      />
      <path
        d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2"
        stroke={c}
        strokeWidth="1.6"
      />
    </svg>
  )
}

function CategoryIcon({ id, active }: { id: string; active?: boolean }) {
  switch (id) {
    case 'buy':
      return <IconBuy active={active} />
    case 'project':
      return <IconProject active={active} />
    case 'rent':
      return <IconRent active={active} />
    case 'plot':
      return <IconPlot active={active} />
    case 'commercial':
      return <IconCommercial active={active} />
    default:
      return null
  }
}

export function CategoryNav({
  activeId = 'buy',
  onCategoryPress,
}: {
  activeId?: string
  onCategoryPress?: (id: string) => void
}) {
  return (
    <div className="pb-3 pl-4">
      <div
        className="flex gap-2.5 overflow-x-auto pb-1 pr-4 pt-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {categories.map((cat) => {
          const active = cat.id === activeId
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onCategoryPress?.(cat.id)}
              className={[
                'flex min-w-[76px] flex-col items-center gap-1.5 rounded-2xl px-3 py-3 shadow-sm',
                active
                  ? 'border-2 border-[#5B22DE] bg-white'
                  : 'border border-transparent bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)]',
              ].join(' ')}
            >
              <CategoryIcon id={cat.id} active={active} />
              <span
                className={[
                  'text-[12px] font-semibold',
                  active ? 'text-[#5B22DE]' : 'text-gray-900',
                ].join(' ')}
              >
                {cat.label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
