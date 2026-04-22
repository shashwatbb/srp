/** Static option lists for SRP full-screen filters (exploration UI). */

export const FILTER_BHK_OPTIONS = [
  { id: '1', label: '1 BHK' },
  { id: '1.5', label: '1.5 BHK' },
  { id: '2', label: '2 BHK' },
  { id: '2.5', label: '2.5 BHK' },
  { id: '3', label: '3 BHK' },
  { id: '3.5', label: '3.5 BHK' },
  { id: '4+', label: '4+ BHK' },
  { id: 'studio', label: 'Studio' },
] as const

export const FILTER_PROPERTY_TYPE_OPTIONS = [
  { id: 'Apartment', label: 'Apartment' },
  { id: 'Villa', label: 'Villa' },
  { id: 'Duplex', label: 'Duplex' },
  { id: 'Studio', label: 'Studio' },
] as const

export const FILTER_CONSTRUCTION_OPTIONS = [
  { id: 'ready' as const, label: 'Ready to move' },
  { id: 'under_construction' as const, label: 'Under construction' },
]

export const FILTER_LISTED_BY_OPTIONS = [
  { id: 'owner', label: 'Owner' },
  { id: 'dealer', label: 'Dealer' },
]

export const FILTER_AMENITIES_LONG = [
  { id: 'verified', label: 'Verified listings' },
  { id: 'rera', label: 'RERA mentioned' },
  { id: 'gym', label: 'Gymnasium' },
  { id: 'pool', label: 'Swimming pool' },
  { id: 'club', label: 'Clubhouse' },
  { id: 'park', label: 'Park / green' },
  { id: 'security', label: '24×7 security' },
  { id: 'power', label: 'Power backup' },
  { id: 'lift', label: 'High-speed lifts' },
  { id: 'parking', label: 'Covered parking' },
  { id: 'kids', label: "Kids' play area" },
  { id: 'jog', label: 'Jogging track' },
]

export const FILTER_PURCHASE_TYPE_OPTIONS = [
  { id: 'new', label: 'New booking' },
  { id: 'resale', label: 'Resale' },
  { id: 'auction', label: 'Auction' },
]

export const FILTER_PROPERTY_AGE_OPTIONS = [
  { id: '0-1', label: 'Under 1 year' },
  { id: '1-3', label: '1–3 years' },
  { id: '3-5', label: '3–5 years' },
  { id: '5-10', label: '5–10 years' },
  { id: '10+', label: '10+ years' },
]

export const FILTER_DEVELOPER_OPTIONS = [
  'Lodha',
  'DLF',
  'Sobha',
  'Prestige',
  'Godrej',
  'Brigade',
  'Mahindra',
  'Tata',
  'M3M',
  'Experion',
  'ATS',
  'IREO',
  'Emaar',
  'Central Park',
  'Bestech',
  'Vatika',
  'Ambience',
  'Paras',
  'Chintels',
  'Raheja',
]

export const FILTER_FURNISHING_OPTIONS = [
  { id: 'furnished', label: 'Furnished' },
  { id: 'semi', label: 'Semi-furnished' },
  { id: 'unfurnished', label: 'Unfurnished' },
]

export const FILTER_FACING_OPTIONS = [
  { id: 'east', label: 'East' },
  { id: 'west', label: 'West' },
  { id: 'north', label: 'North' },
  { id: 'south', label: 'South' },
  { id: 'ne', label: 'North-East' },
  { id: 'nw', label: 'North-West' },
  { id: 'se', label: 'South-East' },
  { id: 'sw', label: 'South-West' },
]

export const FILTER_PHOTOS_OPTIONS = [
  { id: 0, label: 'Any' },
  { id: 5, label: '5+ photos' },
  { id: 10, label: '10+ photos' },
  { id: 20, label: '20+ photos' },
]

export const FILTER_CATEGORY_IDS = [
  'budget',
  'bhk',
  'propertyType',
  'construction',
  'listedBy',
  'amenities',
  'area',
  'purchaseType',
  'propertyAge',
  'developer',
  'furnishing',
  'facing',
  'photos',
  'rera',
] as const

export type FilterCategoryId = (typeof FILTER_CATEGORY_IDS)[number]

export const FILTER_CATEGORY_LABELS: Record<FilterCategoryId, string> = {
  budget: 'Budget',
  bhk: 'BHK / Configuration',
  propertyType: 'Property Type',
  construction: 'Construction Status',
  listedBy: 'Listed By',
  amenities: 'Amenities & Details',
  area: 'Area',
  purchaseType: 'Purchase Type',
  propertyAge: 'Property Age',
  developer: 'Developer',
  furnishing: 'Furnishing',
  facing: 'Facing',
  photos: 'Photos & Videos',
  rera: 'RERA',
}
