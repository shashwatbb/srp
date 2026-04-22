import { pickPropertyImages } from './propertyImagePool'

export const HOME_USER = {
  name: 'Shashwat',
  city: 'Delhi',
} as const

export type RecentSearch = {
  id: string
  title: string
  newLabel: string
  locality: string
}

export const recentSearches: RecentSearch[] = [
  {
    id: '1',
    title: 'Buy 2BHK under 3 Cr',
    newLabel: '5 new',
    locality: 'Saket',
  },
  {
    id: '2',
    title: 'Buy 2BHK under 3 Cr',
    newLabel: '5 new',
    locality: 'Saket',
  },
]

export type Recommendation = {
  id: string
  image: string
  name: string
  location: string
  price: string
  showProgressBar?: boolean
  /** First carousel tile: full-bleed image only (no bottom copy). */
  imageOnly?: boolean
}

const [recImageA, recImageB] = pickPropertyImages('home-recommendations', 2)

export const recommendations: Recommendation[] = [
  {
    id: '1',
    image: recImageA,
    name: '',
    location: '',
    price: '',
    imageOnly: true,
  },
  {
    id: '2',
    image: recImageB,
    name: 'Opus',
    location: 'Golf Course Rd',
    price: '₹ 2.5 Cr - ...',
    showProgressBar: true,
  },
]
