export interface City {
  id: number
  name: string
  state: string
}

export interface BoardingPoint {
  id: number
  name: string
  address: string
  landmark: string
  cityId: City['id']
}

export interface Route {
  id: number
  fromCityId: City['id']
  toCityId: City['id']
}

export type OfferTone = 'peach' | 'pink' | 'yellow'

export interface Offer {
  title: string
  valid: string
  code: string
  tone: OfferTone
  category: 'bus' | 'train'
}
