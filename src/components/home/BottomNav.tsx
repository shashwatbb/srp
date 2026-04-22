type TabId = 'home' | 'insights' | 'suggestions' | 'houzy' | 'profile'

const tabs: { id: TabId; label: string }[] = [
  { id: 'home', label: 'Home' },
  { id: 'insights', label: 'Insights' },
  { id: 'suggestions', label: 'Suggestions' },
  { id: 'houzy', label: 'Houzy' },
  { id: 'profile', label: 'Profile' },
]

function IconHome({ active }: { active: boolean }) {
  const stroke = active ? '#374151' : '#9CA3AF'
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="10" stroke={stroke} strokeWidth="1.5" />
      <path
        d="M9 17V10.5L12 8l3 2.5V17"
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function IconInsights({ active }: { active: boolean }) {
  const stroke = active ? '#374151' : '#9CA3AF'
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M7 11V7a1 1 0 011-1h8a1 1 0 011 1v4M7 11h10M7 11v6a1 1 0 001 1h8a1 1 0 001-1v-6"
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 14h4"
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

function IconSuggestions({ active }: { active: boolean }) {
  const stroke = active ? '#374151' : '#9CA3AF'
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect
        x="3"
        y="3"
        width="14"
        height="14"
        rx="2"
        stroke={stroke}
        strokeWidth="1.5"
      />
      <rect
        x="7"
        y="7"
        width="14"
        height="14"
        rx="2"
        stroke={stroke}
        strokeWidth="1.5"
      />
    </svg>
  )
}

function IconHouzy() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 2l2.2 6.8H21l-5.5 4 2.1 6.7L12 15.8 6.4 19.5l2.1-6.7L3 8.8h6.8L12 2z"
        fill="#5B22DE"
        stroke="#5B22DE"
        strokeWidth="1"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function IconProfile({ active }: { active: boolean }) {
  const stroke = active ? '#374151' : '#9CA3AF'
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="10" stroke={stroke} strokeWidth="1.5" />
      <path
        d="M8 17c.8-2 3.2-3 4-3s3.2 1 4 3M12 11a2.5 2.5 0 100-5 2.5 2.5 0 000 5z"
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

function TabIcon({ id, active }: { id: TabId; active: boolean }) {
  switch (id) {
    case 'home':
      return <IconHome active={active} />
    case 'insights':
      return <IconInsights active={active} />
    case 'suggestions':
      return <IconSuggestions active={active} />
    case 'houzy':
      return <IconHouzy />
    case 'profile':
      return <IconProfile active={active} />
    default:
      return null
  }
}

export function BottomNav() {
  const activeId: TabId = 'home'

  return (
    <nav
      className="fixed bottom-0 left-1/2 z-20 w-full max-w-[430px] -translate-x-1/2 rounded-t-[20px] bg-white px-1 pt-2 shadow-[0_-4px_24px_rgba(0,0,0,0.08)]"
      style={{
        paddingBottom: 'max(10px, env(safe-area-inset-bottom, 0px))',
      }}
    >
      <div className="flex items-end justify-between px-2">
        {tabs.map((tab) => {
          const active = tab.id === activeId
          const isHouzy = tab.id === 'houzy'
          const labelClass = isHouzy
            ? 'text-[#5B22DE]'
            : active
              ? 'text-gray-800'
              : 'text-[#9CA3AF]'
          return (
            <button
              key={tab.id}
              type="button"
              className="flex min-w-0 flex-1 flex-col items-center gap-1 py-1 active:opacity-80"
            >
              <TabIcon id={tab.id} active={active} />
              <span
                className={[
                  'max-w-full truncate text-[10px] font-medium',
                  labelClass,
                ].join(' ')}
              >
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
