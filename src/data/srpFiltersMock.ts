/** Static option lists for SRP full-screen filters (exploration UI). */

export const FILTER_BHK_OPTIONS = [
  { id: 'studio', label: 'Studio' },
  { id: '1rk', label: '1 RK' },
  { id: '1', label: '1 BHK' },
  { id: '2', label: '2 BHK' },
  { id: '3', label: '3 BHK' },
  { id: '4+', label: '4+ BHK' },
] as const

export const FILTER_PROPERTY_TYPE_OPTIONS = [
  {
    id: 'apartments',
    label: 'Apartments',
    hint: 'Flats in towers or blocks with shared building services.',
  },
  {
    id: 'independent_house',
    label: 'Independent House',
    hint: 'Standalone house on its own plot.',
  },
  {
    id: 'independent_builder_floor',
    label: 'Independent Builder Floor',
    hint: 'One residential floor with independent title.',
  },
  {
    id: 'plot',
    label: 'Plot',
    hint: 'Vacant land for your own construction.',
  },
  {
    id: 'penthouse',
    label: 'Penthouse',
    hint: 'Top-floor residence, often with terrace or exclusive access.',
  },
  {
    id: 'villa',
    label: 'Villa',
    hint: 'Low-rise home, often in a gated community.',
  },
  {
    id: 'duplex',
    label: 'Duplex',
    hint: 'Two levels linked by an internal staircase.',
  },
] as const

export const FILTER_CONSTRUCTION_OPTIONS = [
  {
    id: 'new_launch' as const,
    label: 'New Launch',
    hint: 'Early sales, usually before possession.',
  },
  {
    id: 'ready' as const,
    label: 'Ready to move',
    hint: 'Complete or near complete for moving in.',
  },
  {
    id: 'under_construction' as const,
    label: 'Under Construction',
    hint: 'Work ongoing, not finished yet.',
  },
] as const

export const FILTER_LISTED_BY_OPTIONS = [
  {
    id: 'owner' as const,
    label: 'Owner',
    hint: 'Direct seller, usually the person who owns it.',
  },
  {
    id: 'agent' as const,
    label: 'Agent',
    hint: 'Broker or advisor marketing this listing for others.',
  },
  {
    id: 'developer' as const,
    label: 'Developer',
    hint: "The builder's own sales or channel team.",
  },
  {
    id: 'featured_agent' as const,
    label: 'Featured Agent',
    hint: 'Hand-picked partner with extra visibility on the app.',
  },
] as const

/** First 7 are shown before “View more” in the filter sheet. */
export const FILTER_AMENITIES_LONG = [
  { id: 'gated_community', label: 'Gated Community' },
  { id: 'swimming_pool', label: 'Swimming pool' },
  { id: 'power_backup', label: 'Power Backup' },
  { id: 'cctv_surveillance', label: 'CCTV Surveillance' },
  { id: 'gym_fitness', label: 'Gym / Fitness Center' },
  { id: 'clubhouse', label: 'Clubhouse' },
  { id: 'jogging_track', label: 'Jogging / Walking Track' },
  {
    id: 'outdoor_sports_courts',
    label: 'Outdoor Sports Courts (Tennis / Badminton / Basketball)',
  },
  { id: 'party_hall', label: 'Party Hall' },
  { id: 'covered_parking', label: 'Covered Parking' },
  { id: 'open_parking', label: 'Open Parking' },
  { id: 'ev_charging', label: 'EV Charging Stations' },
  { id: 'rainwater_harvesting', label: 'Rainwater Harvesting' },
  { id: 'sewage_treatment_plant', label: 'Sewage Treatment Plant' },
  { id: 'solar_panels', label: 'Solar Panels' },
  { id: 'vastu_compliant', label: 'Vastu Compliant' },
  { id: 'waste_management', label: 'Waste Management' },
  { id: 'gas_pipeline', label: 'Gas Pipeline' },
  { id: 'corner_property', label: 'Corner Property' },
  { id: 'boundary_wall', label: 'Boundary wall present' },
] as const

export const FILTER_AMENITIES_INITIAL_VISIBLE = 7

export const FILTER_PURCHASE_TYPE_OPTIONS = [
  {
    id: 'resale' as const,
    label: 'Resale',
    hint: 'Buy from the current owner of an existing unit.',
  },
  {
    id: 'new_booking' as const,
    label: 'New Booking',
    hint: 'Book directly with the developer, often pre-handover.',
  },
  {
    id: 'pre_lived' as const,
    label: 'Pre-lived',
    hint: 'Previously occupied; resale with prior use.',
  },
] as const

export const FILTER_PROPERTY_AGE_OPTIONS = [
  { id: 'under_1y' as const, label: 'Less than a year' },
  { id: 'age_3y' as const, label: '3 years' },
  { id: 'age_5y' as const, label: '5 years' },
  { id: 'over_5y' as const, label: 'More than 5 years' },
] as const

export const FILTER_DEVELOPER_OPTIONS = [
  { id: 'Lodha', projectCount: 46 },
  { id: 'DLF', projectCount: 57 },
  { id: 'Sobha', projectCount: 34 },
  { id: 'Prestige', projectCount: 41 },
  { id: 'Godrej', projectCount: 38 },
  { id: 'Brigade', projectCount: 22 },
  { id: 'Mahindra', projectCount: 29 },
  { id: 'Tata', projectCount: 52 },
  { id: 'M3M', projectCount: 31 },
  { id: 'Experion', projectCount: 18 },
  { id: 'ATS', projectCount: 24 },
  { id: 'IREO', projectCount: 19 },
  { id: 'Emaar', projectCount: 44 },
  { id: 'Central Park', projectCount: 16 },
  { id: 'Bestech', projectCount: 14 },
  { id: 'Vatika', projectCount: 21 },
  { id: 'Ambience', projectCount: 12 },
  { id: 'Paras', projectCount: 17 },
  { id: 'Chintels', projectCount: 9 },
  { id: 'Raheja', projectCount: 15 },
] as const

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
  { id: 'photos' as const, label: 'Photos' },
  { id: 'videos' as const, label: 'Videos' },
  { id: 'both' as const, label: 'Both' },
] as const

export const FILTER_LAUNCHER_OPTIONS = [
  { id: 'within_1y' as const, label: 'Within 1 year' },
  { id: 'within_3y' as const, label: 'Within 3 years' },
  { id: 'within_10y' as const, label: 'Within 10 years' },
] as const

export type SrpLauncherWindowId =
  (typeof FILTER_LAUNCHER_OPTIONS)[number]['id']

/** Listing age on the portal — matches `SrpListing.listedAtMs`. */
export const FILTER_ADDED_ON_OPTIONS = [
  { id: 'yesterday' as const, label: 'Yesterday' },
  { id: 'last_3_days' as const, label: 'Last 3 days' },
  { id: 'last_week' as const, label: 'Last week' },
  { id: 'last_month' as const, label: 'Last month' },
] as const

export type SrpAddedOnWindowId =
  (typeof FILTER_ADDED_ON_OPTIONS)[number]['id']

/** Corner / boundary — short “Site” filter; ids match `FILTER_AMENITIES_LONG`. */
export const FILTER_SITE_FEATURE_OPTIONS = [
  { id: 'corner_property' as const, label: 'Corner property' },
  {
    id: 'boundary_wall' as const,
    label: 'Property with boundary walls',
  },
] as const

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
  'launched',
  'verified',
  'site',
  'addedOn',
] as const

export type FilterCategoryId = (typeof FILTER_CATEGORY_IDS)[number]

export const FILTER_CATEGORY_LABELS: Record<FilterCategoryId, string> = {
  budget: 'Budget',
  bhk: 'BHK',
  propertyType: 'Type',
  construction: 'Status',
  listedBy: 'Listed by',
  amenities: 'Amenities',
  area: 'Area',
  purchaseType: 'Deal type',
  propertyAge: 'Age',
  developer: 'Developer',
  furnishing: 'Furnishing',
  facing: 'Facing',
  photos: 'Photos & video',
  rera: 'RERA',
  launched: 'Launched',
  verified: 'Verified',
  site: 'Site',
  addedOn: 'Added on',
}
