export type TrendingStripProject = {
  id: string
  name: string
  location: string
  pricePerSqft: string
}

const STRIP: TrendingStripProject[] = [
  {
    id: 'ts1',
    name: 'Anantraj Mansion Living',
    location: 'Panchshil Park',
    pricePerSqft: '₹30.2K/sq.ft.',
  },
  {
    id: 'ts2',
    name: 'Pride Wellington',
    location: 'Sector 48, Gurgaon',
    pricePerSqft: '₹54.2K/sq.ft.',
  },
  {
    id: 'ts3',
    name: 'DLF The Aralias',
    location: 'Golf Course Road',
    pricePerSqft: '₹42.8K/sq.ft.',
  },
  {
    id: 'ts4',
    name: 'Sobha City',
    location: 'Sector 108',
    pricePerSqft: '₹19.5K/sq.ft.',
  },
]

export function getTrendingStripForCity(city: string): TrendingStripProject[] {
  void city
  return STRIP
}
