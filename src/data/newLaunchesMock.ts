import { pickPropertyImages } from './propertyImagePool'

export type NewLaunch = {
  id: string
  name: string
  /** e.g. "2, 3 & 4 BHK" */
  bhkOptions: string
  priceLabel: string
  location: string
  imageUrl: string
}

const BASE: Omit<NewLaunch, 'id' | 'imageUrl'>[] = [
  {
    name: 'Skyline Residences',
    bhkOptions: '2, 3 & 4 BHK',
    priceLabel: '₹1.89 Cr onwards',
    location: 'Sector 65, Gurgaon',
  },
  {
    name: 'The Meridian Towers',
    bhkOptions: '3 & 4 BHK',
    priceLabel: '₹3.2 Cr onwards',
    location: 'Golf Course Road',
  },
  {
    name: 'Riverfront Arcade',
    bhkOptions: '2 & 3 BHK',
    priceLabel: '₹1.25 Cr onwards',
    location: 'Dwarka Expressway',
  },
  {
    name: 'Oakwood Estates',
    bhkOptions: '3, 4 & 5 BHK',
    priceLabel: '₹4.5 Cr onwards',
    location: 'Golf Course Extension',
  },
  {
    name: 'Crestview Heights',
    bhkOptions: '2 BHK',
    priceLabel: '₹92 L onwards',
    location: 'Sector 37D',
  },
]

export function getNewLaunchesForCity(city: string): NewLaunch[] {
  const slug = city.toLowerCase().replace(/\s+/g, '-')
  const images = pickPropertyImages(`new-launches-${slug}`, BASE.length)
  return BASE.map((item, i) => ({
    ...item,
    id: `${slug}-nl-${i + 1}`,
    location: item.location.replace(/Gurgaon/gi, city),
    imageUrl: images[i]!,
  }))
}
