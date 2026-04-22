import { useMemo, useState } from 'react'
import { developerAvatarUrl } from '../../data/topDevelopersMock'

type DeveloperAvatarProps = {
  picsumId: number
  name: string
}

const SIZE = 40
const SRC_SIZE = 128

function avatarSources(picsumId: number, name: string): string[] {
  const uiAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=${SRC_SIZE}&background=F3ECFF&color=5B22DE&bold=true&format=png`
  return [
    developerAvatarUrl(picsumId, SRC_SIZE),
    `https://picsum.photos/seed/dev-${picsumId}/128/128`,
    uiAvatar,
  ]
}

export function DeveloperAvatar({ picsumId, name }: DeveloperAvatarProps) {
  const sources = useMemo(
    () => avatarSources(picsumId, name),
    [picsumId, name],
  )
  const [index, setIndex] = useState(0)

  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()

  if (index >= sources.length) {
    return (
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#5B22DE] to-[#4C1BB8] text-[11px] font-semibold leading-[15px] text-white ring-1 ring-black/[0.06]"
        aria-hidden
      >
        {initials}
      </div>
    )
  }

  return (
    <img
      src={sources[index]}
      alt=""
      width={SIZE}
      height={SIZE}
      loading="lazy"
      decoding="async"
      className="h-10 w-10 shrink-0 rounded-full object-cover ring-1 ring-black/[0.06]"
      onError={() => setIndex((i) => i + 1)}
    />
  )
}
