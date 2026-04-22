/** Top-tier Indian cities for quick project search (order preserved). */
export const TOP_INDIAN_CITIES = [
  'Mumbai',
  'Delhi',
  'Bengaluru',
  'Hyderabad',
  'Pune',
  'Chennai',
  'Gurgaon',
] as const

export type TopIndianCity = (typeof TOP_INDIAN_CITIES)[number]
