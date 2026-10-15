import { parseISODate } from './date'
import type { City, RecentSearch } from '../types'

export const RECENT_SEARCHES_STORAGE_KEY = 'redbus.recentSearches'
export const MAX_RECENT_SEARCHES = 5

export function getRecentSearchesStorage(): Storage | null {
  try {
    return window.localStorage
  } catch {
    return null
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function parseRecentSearch(value: unknown, cities: City[]): RecentSearch | null {
  if (!isRecord(value)) return null

  const { fromCityId, toCityId, date } = value
  if (typeof fromCityId !== 'number' || !Number.isFinite(fromCityId)) return null
  if (typeof toCityId !== 'number' || !Number.isFinite(toCityId)) return null
  if (typeof date !== 'string' || parseISODate(date) === null) return null
  if (!cities.some((city) => city.id === fromCityId)) return null
  if (!cities.some((city) => city.id === toCityId)) return null

  return { fromCityId, toCityId, date }
}

function persistRecentSearches(storage: Storage, searches: RecentSearch[]): void {
  try {
    storage.setItem(RECENT_SEARCHES_STORAGE_KEY, JSON.stringify(searches))
  } catch {
    // Storage writes can fail (for example when storage is full or disabled).
    // The caller keeps working with the in-memory list in that case.
  }
}

export function readRecentSearches(storage: Storage | null, cities: City[]): RecentSearch[] {
  if (storage === null) return []

  let stored: unknown
  try {
    const raw = storage.getItem(RECENT_SEARCHES_STORAGE_KEY)
    if (raw === null) return []
    stored = JSON.parse(raw)
  } catch {
    return []
  }

  if (!Array.isArray(stored)) return []

  const seen = new Set<string>()
  const result: RecentSearch[] = []

  for (const value of stored) {
    const search = parseRecentSearch(value, cities)
    if (search === null) continue

    const key = `${search.fromCityId}:${search.toCityId}`
    if (seen.has(key)) continue
    seen.add(key)

    result.push(search)
    if (result.length >= MAX_RECENT_SEARCHES) break
  }

  return result
}

export function saveRecentSearch(
  storage: Storage | null,
  search: RecentSearch,
  cities: City[],
): RecentSearch[] {
  if (storage === null) return []

  const current = readRecentSearches(storage, cities)
  const withoutDuplicate = current.filter(
    (entry) => entry.fromCityId !== search.fromCityId || entry.toCityId !== search.toCityId,
  )
  const next = [search, ...withoutDuplicate].slice(0, MAX_RECENT_SEARCHES)

  persistRecentSearches(storage, next)
  return next
}

export function removeRecentSearch(
  storage: Storage | null,
  fromCityId: City['id'],
  toCityId: City['id'],
  cities: City[],
): RecentSearch[] {
  if (storage === null) return []

  const remaining = readRecentSearches(storage, cities).filter(
    (entry) => entry.fromCityId !== fromCityId || entry.toCityId !== toCityId,
  )

  persistRecentSearches(storage, remaining)
  return remaining
}

export function clearRecentSearches(storage: Storage | null): void {
  if (storage === null) return
  persistRecentSearches(storage, [])
}
