import type { BoardingPoint, City, Offer, Route } from '../types'

export const cities: City[] = [
  { id: 1, name: 'Pune', state: 'Maharashtra' },
  { id: 2, name: 'Bengaluru', state: 'Karnataka' },
]

export const boardingPoints: BoardingPoint[] = [
  { id: 1, name: 'Shivajinagar', address: 'FC Road', landmark: 'Near Modern Cafe', cityId: 1 },
  { id: 2, name: 'Hinjewadi', address: 'Phase 1', landmark: 'Near Wipro Circle', cityId: 1 },
  {
    id: 3,
    name: 'Majestic',
    address: 'Kempegowda Bus Station',
    landmark: 'Opp. Railway Station',
    cityId: 2,
  },
]

export const offers: Offer[] = [
  { title: 'Save up to Rs 300 on bus tickets', valid: '05 Oct', code: 'FESTIVE300', tone: 'peach' },
  { title: 'Save up to Rs 250 on bus tickets', valid: '31 Oct', code: 'FIRST', tone: 'pink' },
  { title: 'Save up to Rs 300 on bus tickets', valid: '31 Oct', code: 'BUS300', tone: 'pink' },
  {
    title: 'Save up to Rs 200 on Primo operators.',
    valid: '31 Oct',
    code: 'PRIMODAY',
    tone: 'yellow',
  },
]

export const routes: Route[] = [{ id: 1, fromCityId: 1, toCityId: 2 }]
