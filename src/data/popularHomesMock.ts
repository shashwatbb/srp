import { pickPropertyImages } from './propertyImagePool'

export type PopularHome = {
  id: string
  title: string
  priceLabel: string
  rating: number
  imageUrl: string
  /** Show RERA badge on image when true. */
  rera?: boolean
}

function homes(
  items: Omit<PopularHome, 'id'>[],
  prefix: string,
): PopularHome[] {
  return items.map((item, i) => ({ ...item, id: `${prefix}-${i + 1}` }))
}

const BASE_ITEMS: Omit<PopularHome, 'id' | 'imageUrl'>[] = [
  {
    title: '3 BHK apartment',
    priceLabel: '₹2.85 Cr onwards',
    rating: 5.0,
    rera: true,
  },
  {
    title: '2 BHK with balcony',
    priceLabel: '₹1.65 Cr onwards',
    rating: 4.9,
    rera: true,
  },
  {
    title: 'Builder floor',
    priceLabel: '₹92 Lakh onwards',
    rating: 4.8,
  },
  {
    title: 'Luxury duplex',
    priceLabel: '₹4.20 Cr onwards',
    rating: 4.95,
    rera: true,
  },
]

function packForTrending(trendingId: string): PopularHome[] {
  const images = pickPropertyImages(`popular-homes-${trendingId}`, BASE_ITEMS.length)
  return homes(
    BASE_ITEMS.map((item, i) => ({
      ...item,
      imageUrl: images[i]!,
    })),
    trendingId,
  )
}

/** Popular listings keyed by trending micro-market id (see `trendingLocationsMock`). */
export const POPULAR_BY_TRENDING_ID: Record<string, PopularHome[]> = {
  def1: packForTrending('def1'),
  def2: packForTrending('def2'),
  def3: packForTrending('def3'),
  def4: packForTrending('def4'),
  def5: packForTrending('def5'),
  g1: packForTrending('g1'),
  g2: packForTrending('g2'),
  g3: packForTrending('g3'),
  g4: packForTrending('g4'),
  g5: packForTrending('g5'),
  m1: packForTrending('m1'),
  m2: packForTrending('m2'),
  m3: packForTrending('m3'),
  m4: packForTrending('m4'),
  m5: packForTrending('m5'),
  d1: packForTrending('d1'),
  d2: packForTrending('d2'),
  d3: packForTrending('d3'),
  d4: packForTrending('d4'),
  d5: packForTrending('d5'),
  b1: packForTrending('b1'),
  b2: packForTrending('b2'),
  b3: packForTrending('b3'),
  b4: packForTrending('b4'),
  b5: packForTrending('b5'),
  h1: packForTrending('h1'),
  h2: packForTrending('h2'),
  h3: packForTrending('h3'),
  h4: packForTrending('h4'),
  h5: packForTrending('h5'),
  p1: packForTrending('p1'),
  p2: packForTrending('p2'),
  p3: packForTrending('p3'),
  p4: packForTrending('p4'),
  p5: packForTrending('p5'),
  c1: packForTrending('c1'),
  c2: packForTrending('c2'),
  c3: packForTrending('c3'),
  c4: packForTrending('c4'),
  c5: packForTrending('c5'),
}

export function getPopularHomesForTrending(trendingId: string): PopularHome[] {
  return POPULAR_BY_TRENDING_ID[trendingId] ?? packForTrending('fallback')
}
