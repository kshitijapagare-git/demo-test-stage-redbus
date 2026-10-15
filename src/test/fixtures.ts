import type { BoardingPoint, City, Offer, Route } from '../types'

export const testCities: City[] = [{ id: 1, name: 'Pune', state: 'Maharashtra' }]

export const testBoardingPoints: BoardingPoint[] = [
  { id: 1, name: 'Shivajinagar', address: 'FC Road', landmark: 'Near Modern Cafe', cityId: 1 },
]

export const testOffers: Offer[] = [
  {
    title: 'Save up to Rs 300 on bus tickets',
    valid: '05 Oct',
    code: 'FESTIVE300',
    tone: 'peach',
    category: 'bus',
  },
  {
    title: 'Save up to Rs 200 on Primo operators.',
    valid: '31 Oct',
    code: 'PRIMODAY',
    tone: 'yellow',
    category: 'bus',
  },
  {
    title: 'Save up to Rs 200 on train tickets',
    valid: '31 Oct',
    code: 'TRAIN200',
    tone: 'yellow',
    category: 'train',
  },
]

export const testRoutes: Route[] = [{ id: 1, fromCityId: 1, toCityId: 2 }]
