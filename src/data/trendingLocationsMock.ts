export type TrendingLocation = {
  id: string
  /** Area / micro-market name */
  name: string
  propertyCount: number
  /** Positive = interest up (green ↑), negative = down (red ↓). */
  changePercent: number
}

const DEFAULT_TRENDING: TrendingLocation[] = [
  {
    id: 'def1',
    name: 'Golf Course Extension',
    propertyCount: 842,
    changePercent: 14.2,
  },
  {
    id: 'def2',
    name: 'Sector 65',
    propertyCount: 516,
    changePercent: 8.4,
  },
  {
    id: 'def3',
    name: 'Dwarka Expressway',
    propertyCount: 1203,
    changePercent: -3.1,
  },
  {
    id: 'def4',
    name: 'SPR Road',
    propertyCount: 389,
    changePercent: 21.0,
  },
  {
    id: 'def5',
    name: 'Sector 79',
    propertyCount: 274,
    changePercent: -1.8,
  },
]

export const TRENDING_BY_CITY: Record<string, TrendingLocation[]> = {
  Gurgaon: [
    {
      id: 'g1',
      name: 'Golf Course Extension',
      propertyCount: 842,
      changePercent: 14.2,
    },
    {
      id: 'g2',
      name: 'Sector 65',
      propertyCount: 516,
      changePercent: 8.4,
    },
    {
      id: 'g3',
      name: 'Dwarka Expressway',
      propertyCount: 1203,
      changePercent: -3.1,
    },
    {
      id: 'g4',
      name: 'SPR Road',
      propertyCount: 389,
      changePercent: 21.0,
    },
    {
      id: 'g5',
      name: 'Sector 79',
      propertyCount: 274,
      changePercent: -1.8,
    },
  ],
  Mumbai: [
    { id: 'm1', name: 'Worli', propertyCount: 612, changePercent: 11.3 },
    { id: 'm2', name: 'Bandra West', propertyCount: 498, changePercent: 6.2 },
    { id: 'm3', name: 'Powai', propertyCount: 355, changePercent: -2.4 },
    { id: 'm4', name: 'Thane West', propertyCount: 920, changePercent: 9.8 },
    { id: 'm5', name: 'Malad', propertyCount: 401, changePercent: -0.9 },
  ],
  Delhi: [
    { id: 'd1', name: 'Dwarka', propertyCount: 734, changePercent: 5.1 },
    { id: 'd2', name: 'Rohini', propertyCount: 512, changePercent: 3.6 },
    { id: 'd3', name: 'Vasant Kunj', propertyCount: 288, changePercent: -4.2 },
    { id: 'd4', name: 'Indirapuram', propertyCount: 891, changePercent: 12.4 },
    { id: 'd5', name: 'Noida Ext.', propertyCount: 1102, changePercent: 7.9 },
  ],
  Bengaluru: [
    { id: 'b1', name: 'Whitefield', propertyCount: 967, changePercent: 10.5 },
    { id: 'b2', name: 'Sarjapur Road', propertyCount: 702, changePercent: 15.1 },
    { id: 'b3', name: 'Electronic City', propertyCount: 445, changePercent: -2.0 },
    { id: 'b4', name: 'Hebbal', propertyCount: 318, changePercent: 4.3 },
    { id: 'b5', name: 'Bannerghatta', propertyCount: 256, changePercent: -1.1 },
  ],
  Hyderabad: [
    { id: 'h1', name: 'Gachibowli', propertyCount: 589, changePercent: 13.7 },
    { id: 'h2', name: 'Kondapur', propertyCount: 412, changePercent: 8.0 },
    { id: 'h3', name: 'Financial District', propertyCount: 623, changePercent: 18.2 },
    { id: 'h4', name: 'Miyapur', propertyCount: 501, changePercent: -2.8 },
    { id: 'h5', name: 'Kokapet', propertyCount: 198, changePercent: 22.4 },
  ],
  Pune: [
    { id: 'p1', name: 'Baner', propertyCount: 334, changePercent: 7.6 },
    { id: 'p2', name: 'Wakad', propertyCount: 467, changePercent: 5.2 },
    { id: 'p3', name: 'Hinjewadi', propertyCount: 712, changePercent: -3.5 },
    { id: 'p4', name: 'Kharadi', propertyCount: 389, changePercent: 9.1 },
    { id: 'p5', name: 'Hadapsar', propertyCount: 276, changePercent: 1.4 },
  ],
  Chennai: [
    { id: 'c1', name: 'OMR', propertyCount: 823, changePercent: 6.8 },
    { id: 'c2', name: 'Porur', propertyCount: 298, changePercent: -1.2 },
    { id: 'c3', name: 'Velachery', propertyCount: 356, changePercent: 4.5 },
    { id: 'c4', name: 'Tambaram', propertyCount: 512, changePercent: 11.0 },
    { id: 'c5', name: 'ECR', propertyCount: 244, changePercent: 3.3 },
  ],
}

export function getTrendingForCity(city: string): TrendingLocation[] {
  return TRENDING_BY_CITY[city] ?? DEFAULT_TRENDING
}
