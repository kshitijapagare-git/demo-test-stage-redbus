import { beforeEach, describe, expect, it } from 'vitest'
import {
  clearRecentSearches,
  MAX_RECENT_SEARCHES,
  readRecentSearches,
  RECENT_SEARCHES_STORAGE_KEY,
  removeRecentSearch,
  saveRecentSearch,
} from './recentSearches'
import type { City, RecentSearch } from '../types'

const cities: City[] = [
  { id: 1, name: 'Pune', state: 'Maharashtra' },
  { id: 2, name: 'Bengaluru', state: 'Karnataka' },
  { id: 3, name: 'Mumbai', state: 'Maharashtra' },
  { id: 4, name: 'Delhi', state: 'Delhi' },
  { id: 5, name: 'Chennai', state: 'Tamil Nadu' },
  { id: 6, name: 'Kolkata', state: 'West Bengal' },
]

function search(fromCityId: number, toCityId: number, date: string): RecentSearch {
  return { fromCityId, toCityId, date }
}

describe('recentSearches', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('saves a search and persists it', () => {
    const saved = saveRecentSearch(localStorage, search(1, 2, '2026-10-02'), cities)

    expect(saved).toEqual([search(1, 2, '2026-10-02')])
    expect(localStorage.getItem(RECENT_SEARCHES_STORAGE_KEY)).toBe(
      JSON.stringify([search(1, 2, '2026-10-02')]),
    )
  })

  it('moves a repeated from/to pair to the top and overwrites its date', () => {
    saveRecentSearch(localStorage, search(1, 2, '2026-10-02'), cities)
    saveRecentSearch(localStorage, search(2, 1, '2026-10-03'), cities)

    const saved = saveRecentSearch(localStorage, search(1, 2, '2026-10-05'), cities)

    expect(saved).toEqual([search(1, 2, '2026-10-05'), search(2, 1, '2026-10-03')])
    expect(readRecentSearches(localStorage, cities)).toEqual([
      search(1, 2, '2026-10-05'),
      search(2, 1, '2026-10-03'),
    ])
  })

  it('keeps only the five newest searches', () => {
    const searches = [
      search(1, 2, '2026-10-01'),
      search(2, 3, '2026-10-02'),
      search(3, 4, '2026-10-03'),
      search(4, 5, '2026-10-04'),
      search(5, 6, '2026-10-05'),
      search(6, 1, '2026-10-06'),
    ]

    let saved: RecentSearch[] = []
    for (const entry of searches) {
      saved = saveRecentSearch(localStorage, entry, cities)
    }

    expect(saved).toHaveLength(MAX_RECENT_SEARCHES)
    expect(saved).toEqual(searches.slice(1).reverse())
    expect(readRecentSearches(localStorage, cities)).toEqual(searches.slice(1).reverse())
  })

  it('drops entries whose city ids are not in the city list', () => {
    localStorage.setItem(
      RECENT_SEARCHES_STORAGE_KEY,
      JSON.stringify([
        search(1, 2, '2026-10-02'),
        search(99, 2, '2026-10-03'),
        search(1, 98, '2026-10-04'),
      ]),
    )

    expect(readRecentSearches(localStorage, cities)).toEqual([search(1, 2, '2026-10-02')])
  })

  it('returns [] when storage is null', () => {
    expect(readRecentSearches(null, cities)).toEqual([])
    expect(saveRecentSearch(null, search(1, 2, '2026-10-02'), cities)).toEqual([])
    expect(removeRecentSearch(null, 1, 2, cities)).toEqual([])
    expect(() => clearRecentSearches(null)).not.toThrow()
  })

  it('returns [] for invalid JSON', () => {
    localStorage.setItem(RECENT_SEARCHES_STORAGE_KEY, '{not valid')

    expect(readRecentSearches(localStorage, cities)).toEqual([])
  })

  it('returns [] when the stored value is not a JSON array', () => {
    localStorage.setItem(RECENT_SEARCHES_STORAGE_KEY, JSON.stringify({ fromCityId: 1 }))

    expect(readRecentSearches(localStorage, cities)).toEqual([])
  })

  it('removeRecentSearch removes only the matching entry', () => {
    saveRecentSearch(localStorage, search(1, 2, '2026-10-02'), cities)
    saveRecentSearch(localStorage, search(2, 1, '2026-10-03'), cities)

    const remaining = removeRecentSearch(localStorage, 1, 2, cities)

    expect(remaining).toEqual([search(2, 1, '2026-10-03')])
    expect(readRecentSearches(localStorage, cities)).toEqual([search(2, 1, '2026-10-03')])
  })

  it('clearRecentSearches empties storage', () => {
    saveRecentSearch(localStorage, search(1, 2, '2026-10-02'), cities)

    clearRecentSearches(localStorage)

    expect(readRecentSearches(localStorage, cities)).toEqual([])
    expect(localStorage.getItem(RECENT_SEARCHES_STORAGE_KEY)).toBe('[]')
  })
})
