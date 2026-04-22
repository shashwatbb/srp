export type TopDeveloper = {
  id: string
  name: string
  projectCount: number
  /**
   * Picsum image id (stable CDN: `https://picsum.photos/id/{id}/w/h`).
   * @see https://picsum.photos/
   */
  picsumId: number
}

export const TOP_DEVELOPERS: TopDeveloper[] = [
  { id: '1', name: 'Lodha Group', projectCount: 47, picsumId: 28 },
  { id: '2', name: 'DLF Limited', projectCount: 38, picsumId: 29 },
  { id: '3', name: 'Sobha Limited', projectCount: 29, picsumId: 48 },
  { id: '4', name: 'Prestige Group', projectCount: 34, picsumId: 57 },
  { id: '5', name: 'Godrej Properties', projectCount: 31, picsumId: 64 },
  { id: '6', name: 'Brigade Enterprises', projectCount: 22, picsumId: 65 },
  { id: '7', name: 'Mahindra Lifespaces', projectCount: 18, picsumId: 67 },
  { id: '8', name: 'Tata Housing', projectCount: 26, picsumId: 82 },
]

/** Order & counts tuned for the Project search discovery row */
export const PROJECTS_SEARCH_TOP_DEVELOPERS: TopDeveloper[] = [
  { id: 'ps-g', name: 'Godrej', projectCount: 12, picsumId: 64 },
  { id: 'ps-u', name: 'Unitech', projectCount: 6, picsumId: 135 },
  { id: 'ps-1', name: 'Lodha Group', projectCount: 47, picsumId: 28 },
  { id: 'ps-2', name: 'DLF Limited', projectCount: 38, picsumId: 29 },
  { id: 'ps-3', name: 'Sobha Limited', projectCount: 29, picsumId: 48 },
  { id: 'ps-4', name: 'Prestige Group', projectCount: 34, picsumId: 57 },
]

/** Fixed square size for crisp avatars (2× for retina handled by display size). */
export function developerAvatarUrl(picsumId: number, size = 128): string {
  return `https://picsum.photos/id/${picsumId}/${size}/${size}`
}
