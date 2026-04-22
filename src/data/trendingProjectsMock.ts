import { pickPropertyImages } from './propertyImagePool'

export type TrendingProject = {
  id: string
  name: string
  developer: string
  configuration: string
  priceLabel: string
  location: string
  imageUrl: string
  /** Short engagement / momentum line */
  momentumLabel: string
}

const BASE: Omit<TrendingProject, 'id' | 'imageUrl'>[] = [
  {
    name: 'Aurum Skyline',
    developer: 'Lodha Group',
    configuration: '2 & 3 BHK',
    priceLabel: '₹2.1 Cr onwards',
    location: 'Sector 65',
    momentumLabel: '812 views this week',
  },
  {
    name: 'DLF Camellias II',
    developer: 'DLF Limited',
    configuration: '4 & 5 BHK',
    priceLabel: '₹8.5 Cr onwards',
    location: 'Golf Course Rd',
    momentumLabel: 'Hot in your area',
  },
  {
    name: 'Sobha City',
    developer: 'Sobha Limited',
    configuration: '2, 3 & 4 BHK',
    priceLabel: '₹1.45 Cr onwards',
    location: 'Dwarka Expressway',
    momentumLabel: '+340 saves this month',
  },
  {
    name: 'Prestige Lakeside',
    developer: 'Prestige Group',
    configuration: '3 BHK',
    priceLabel: '₹2.95 Cr onwards',
    location: 'Sector 82',
    momentumLabel: 'Rising interest',
  },
  {
    name: 'Godrej Aria',
    developer: 'Godrej Properties',
    configuration: '2 & 3 BHK',
    priceLabel: '₹1.08 Cr onwards',
    location: 'Sector 37D',
    momentumLabel: '640 enquiries',
  },
]

export function getTrendingProjectsForCity(city: string): TrendingProject[] {
  const slug = city.toLowerCase().replace(/\s+/g, '-')
  const images = pickPropertyImages(`trending-projects-${slug}`, BASE.length)
  return BASE.map((item, i) => ({
    ...item,
    id: `${slug}-tp-${i + 1}`,
    location: `${item.location}, ${city}`,
    imageUrl: images[i]!,
  }))
}
