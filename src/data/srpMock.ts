import { ALL_HOTSPOT_AREA_IDS } from './srpAreasMock'
import { FILTER_AMENITIES_LONG } from './srpFiltersMock'

export type SrpListing = {
  id: string
  imageMain: string
  imageSecondary: string
  imageCount: number
  timeAgo: string
  statusLine: string
  configuration: string
  price: string
  priceCr: number
  projectName: string
  locationLine: string
  owner: { name: string; role: string; avatarUrl: string }
  verified?: boolean
  rera?: boolean
  /** City hotspot micro-market */
  hotspot: boolean
  /** Booking vs build vs move-in (drives Status filter). */
  possessionStatus: 'new_launch' | 'under_construction' | 'ready'
  /** True when not ready — used for carousels and the “New projects” quick pill. */
  upcoming: boolean
  /** For “newest” sort */
  listedAtMs: number
  /** Hotspot locality bucket (for area filter when City hotspots on) */
  areaId: string
  /** Amenity keys from `FILTER_AMENITIES_LONG` this listing is marketed with */
  amenityIds: string[]
  /** Listing includes a video walkthrough / reels (mock). */
  hasVideo: boolean
}

export type SrpRecoItem = {
  id: string
  title: string
  subtitle: string
  priceHint: string
  imageUrl: string
}

const IMG = [
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=720&h=480&q=80',
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=480&h=720&q=80',
  'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=720&h=480&q=80',
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=480&h=720&q=80',
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=720&h=480&q=80',
  'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=480&h=720&q=80',
]

const CFG = [
  '3 BHK Apartment',
  '2 BHK Apartment',
  '4 BHK Villa',
  '3.5 BHK Duplex',
  '2.5 BHK Apartment',
  '4 BHK Independent House',
  '3 BHK Independent Builder Floor',
  'Residential Plot',
  '3 BHK Penthouse',
  '2 BHK Duplex',
  'Studio Apartment',
  '1 RK Apartment',
  '3 BHK + Study Apartment',
]

const PROJECTS = [
  'Ariisto Bellanza Phase II',
  'Skyline Residences Tower B',
  'Oakwood Estates Villas',
  'M3M Urbana Premium',
  'DLF Phase 4 Heights',
  'Sobha City Towers',
  'Prestige Lake Ridge',
  'Godrej Summit',
  'Brigade Cornerstone',
  'Mahindra Luminare',
  'Tata Primanti',
  'Lodha Upper Thane',
  'Experion Windchants',
  'Adani Samsara',
  'ATS Kingston Heath',
  'IREO Skyon',
  'Emaar Emerald Hills',
  'Central Park Resorts',
  'Bestech Park View',
  'Vatika Seven Elements',
  'Ambience Caitriona',
  'Paras Quartier',
  'Chintels Serenity',
  'Raheja Vedanta',
  'Pioneer Urban Square',
  'Silverglades Hightown',
  'Conscient Heritage Max',
  'Bloomberg Towers',
]

const OWNERS = [
  ['Yashsvir Singh', 'Owner'],
  ['Priya Sharma', 'Agent'],
  ['Rahul Mehta', 'Developer'],
  ['Ananya Rao', 'Featured Agent'],
  ['Vikram Kohli', 'Owner'],
  ['Neha Gupta', 'Agent'],
] as const

function avatar(name: string) {
  const q = encodeURIComponent(name)
  return `https://ui-avatars.com/api/?name=${q}&size=128&background=EBEBEB&color=222222&bold=true`
}

function buildListing(
  i: number,
  city: string,
  slug: string,
): SrpListing {
  const main = IMG[i % IMG.length]!
  const sec = IMG[(i + 2) % IMG.length]!
  const raw = 0.95 + (i % 17) * 0.35 + (i % 3) * 0.2
  const priceCr = Math.round(Math.min(4.95, raw) * 100) / 100
  const price = `₹${priceCr.toFixed(2)} Cr`
  const hotspot = i % 3 !== 1
  const possessionStatus =
    i % 3 === 0 ? 'new_launch' : i % 3 === 1 ? 'under_construction' : 'ready'
  const upcoming = possessionStatus !== 'ready'
  const [oName, oRole] = OWNERS[i % OWNERS.length]!
  const sector = `Sector ${50 + (i % 40)}`
  const areaId = ALL_HOTSPOT_AREA_IDS[i % ALL_HOTSPOT_AREA_IDS.length]!
  const amenityPool = FILTER_AMENITIES_LONG.map((o) => o.id)
  let amenityIds = amenityPool.filter(
    (id, idx) => (i + idx * 5 + id.length) % 4 !== 0,
  )
  if (amenityIds.length === 0) {
    amenityIds = [amenityPool[i % amenityPool.length]!]
  }
  const imageCount = 12 + (i % 28)
  const hasVideo = i % 2 === 0
  const statusLine =
    possessionStatus === 'ready'
      ? 'Ready to Move • Avg. Price/ sq.ft. ₹' +
        (12 + (i % 9)).toFixed(1) +
        'k'
      : possessionStatus === 'new_launch'
        ? 'New launch • Avg. Price/ sq.ft. ₹' + (10 + (i % 8)).toFixed(1) + 'k'
        : 'Under construction • Avg. Price/ sq.ft. ₹' +
          (10 + (i % 8)).toFixed(1) +
          'k'

  return {
    id: `${slug}-srp-${i + 1}`,
    imageMain: main,
    imageSecondary: sec,
    imageCount,
    timeAgo: i % 5 === 0 ? '5h ago' : i % 3 === 0 ? '1d ago' : '3d ago',
    statusLine,
    configuration: CFG[i % CFG.length]!,
    price,
    priceCr,
    projectName: PROJECTS[i % PROJECTS.length]!,
    locationLine: `${sector} • ${1 + (i % 9) * 0.3} km from metro, ${city}`,
    owner: {
      name: oName,
      role: oRole,
      avatarUrl: avatar(oName),
    },
    verified: i % 4 !== 2,
    rera: i % 5 !== 3,
    hotspot,
    possessionStatus,
    upcoming,
    listedAtMs: Date.now() - i * 86400000 * (1 + (i % 3)),
    areaId,
    amenityIds,
    hasVideo,
  }
}

export function getSrpListingsForCity(city: string): SrpListing[] {
  const slug = city.toLowerCase().replace(/\s+/g, '-')
  return Array.from({ length: 28 }, (_, i) => buildListing(i, city, slug))
}

export function getSrpRecommendations(city: string): SrpRecoItem[] {
  const slug = city.toLowerCase().replace(/\s+/g, '-')
  return [0, 1, 2, 3, 4].map((j) => ({
    id: `${slug}-reco-${j}`,
    title: PROJECTS[j + 3]!,
    subtitle: `Near ${city} • ${CFG[j]!}`,
    priceHint: `₹${(1.2 + j * 0.4).toFixed(2)} Cr onwards`,
    imageUrl: IMG[j % IMG.length]!,
  }))
}
