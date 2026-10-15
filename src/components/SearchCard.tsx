import { useEffect, useState } from 'react'
import type { ChangeEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import CityAutocomplete from './CityAutocomplete'
import RecentSearches from './RecentSearches'
import { cities } from '../data'
import { classNames } from '../lib/classNames'
import {
  addDays,
  DAY_OPTIONS,
  formatDate,
  isBeforeToday,
  parseISODate,
  TODAY_OFFSET,
  TOMORROW_OFFSET,
  toISODate,
} from '../lib/date'
import {
  clearRecentSearches,
  getRecentSearchesStorage,
  readRecentSearches,
  removeRecentSearch,
  saveRecentSearch,
} from '../lib/recentSearches'
import type { City, RecentSearch } from '../types'

interface SearchErrors {
  from: string | null
  to: string | null
  date: string | null
}

function validateCities(from: City['id'] | null, to: City['id'] | null): SearchErrors {
  if (from === null || to === null) {
    return {
      from: from === null ? 'Please select a city' : null,
      to: to === null ? 'Please select a city' : null,
      date: null,
    }
  }

  if (from === to) {
    return { from: null, to: 'From and To must be different cities', date: null }
  }

  return { from: null, to: null, date: null }
}

function validateDate(value: string, today: Date): string | null {
  const date = parseISODate(value)
  if (date === null) return 'Please select a valid date'
  if (isBeforeToday(date, today)) return 'Past dates are not allowed'
  return null
}

function readCityId(value: string | null): City['id'] | null {
  if (value === null) return null
  const parsed = Number(value)
  return cities.find((city) => city.id === parsed)?.id ?? null
}

function readInitialDate(value: string | null, today: Date): string {
  const fallback = toISODate(today)
  if (value === null) return fallback

  const date = parseISODate(value)
  if (date === null || isBeforeToday(date, today)) return fallback

  return toISODate(date)
}

function SearchCard() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [today] = useState(() => new Date())

  const todayISO = toISODate(today)
  const tomorrowISO = toISODate(addDays(today, TOMORROW_OFFSET))

  const [date, setDate] = useState(() => readInitialDate(searchParams.get('date'), today))
  const [fromCityId, setFromCityId] = useState<City['id'] | null>(() =>
    readCityId(searchParams.get('from')),
  )
  const [toCityId, setToCityId] = useState<City['id'] | null>(() =>
    readCityId(searchParams.get('to')),
  )
  const [forWomen, setForWomen] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [fromError, setFromError] = useState<string | null>(null)
  const [toError, setToError] = useState<string | null>(null)
  const [dateError, setDateError] = useState<string | null>(null)
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>(() =>
    readRecentSearches(getRecentSearchesStorage(), cities),
  )

  const journeyDate = parseISODate(date) ?? today
  const journeyLabel = date === todayISO ? 'Today' : date === tomorrowISO ? 'Tomorrow' : ''

  useEffect(() => {
    const params = new URLSearchParams()
    if (fromCityId !== null) params.set('from', String(fromCityId))
    if (toCityId !== null) params.set('to', String(toCityId))
    params.set('date', date)

    navigate({ search: `?${params.toString()}` }, { replace: true })
  }, [fromCityId, toCityId, date, navigate])

  function applyValidation(from: City['id'] | null, to: City['id'] | null) {
    const errors = validateCities(from, to)
    setFromError(errors.from)
    setToError(errors.to)
  }

  function handleFromChange(cityId: City['id'] | null) {
    setFromCityId(cityId)
    if (hasSearched) applyValidation(cityId, toCityId)
  }

  function handleToChange(cityId: City['id'] | null) {
    setToCityId(cityId)
    if (hasSearched) applyValidation(fromCityId, cityId)
  }

  function swapCities() {
    const nextFrom = toCityId
    const nextTo = fromCityId
    setFromCityId(nextFrom)
    setToCityId(nextTo)
    if (hasSearched) applyValidation(nextFrom, nextTo)
  }

  function handleDateChange(event: ChangeEvent<HTMLInputElement>) {
    const nextDate = event.target.value
    setDate(nextDate)
    if (hasSearched) setDateError(validateDate(nextDate, today))
  }

  function handleDayOffset(offset: number) {
    const nextDate = offset === TODAY_OFFSET ? todayISO : tomorrowISO
    setDate(nextDate)
    if (hasSearched) setDateError(validateDate(nextDate, today))
  }

  function handleRecentSelect(search: RecentSearch) {
    setFromCityId(search.fromCityId)
    setToCityId(search.toCityId)

    const selectedDate = parseISODate(search.date)
    setDate(selectedDate !== null && isBeforeToday(selectedDate, today) ? todayISO : search.date)
  }

  function handleRecentRemove(search: RecentSearch) {
    setRecentSearches(
      removeRecentSearch(getRecentSearchesStorage(), search.fromCityId, search.toCityId, cities),
    )
  }

  function handleRecentClear() {
    clearRecentSearches(getRecentSearchesStorage())
    setRecentSearches([])
  }

  function handleSearch() {
    setHasSearched(true)

    const cityErrors = validateCities(fromCityId, toCityId)
    const dateErrorResult = validateDate(date, today)
    setFromError(cityErrors.from)
    setToError(cityErrors.to)
    setDateError(dateErrorResult)

    if (
      fromCityId !== null &&
      toCityId !== null &&
      cityErrors.from === null &&
      cityErrors.to === null &&
      dateErrorResult === null
    ) {
      const next = saveRecentSearch(
        getRecentSearchesStorage(),
        { fromCityId, toCityId, date },
        cities,
      )
      setRecentSearches(next)
      navigate(`/search?from=${fromCityId}&to=${toCityId}&date=${date}`)
    }
  }

  return (
    <>
      <section className="search-card" aria-label="Search buses">
        <div className="search-row">
          <div className="search-fields">
            <div className="field autocomplete-field">
              <span className="field-icon" aria-hidden="true">
                🚌
              </span>
              <CityAutocomplete
                cities={cities}
                value={fromCityId}
                onChange={handleFromChange}
                label="From"
                error={fromError ?? undefined}
              />
            </div>
            <button
              type="button"
              className="swap-btn"
              aria-label="Swap From and To"
              onClick={swapCities}
            >
              ⇄
            </button>
            <div className="field autocomplete-field">
              <span className="field-icon" aria-hidden="true">
                🚌
              </span>
              <CityAutocomplete
                cities={cities}
                value={toCityId}
                onChange={handleToChange}
                label="To"
                error={toError ?? undefined}
              />
            </div>
            <div className="field date-field">
              <span className="field-icon" aria-hidden="true">
                📅
              </span>
              <div className="date-text">
                <small>Date of Journey</small>
                <strong>{formatDate(journeyDate)}</strong>
                <em>{journeyLabel ? `(${journeyLabel})` : ''}</em>
              </div>
              <div className="date-picker">
                <input
                  type="date"
                  aria-label="Date of journey"
                  value={date}
                  min={todayISO}
                  onChange={handleDateChange}
                />
              </div>
              {DAY_OPTIONS.map((option) => {
                const isSelected =
                  option.offset === TODAY_OFFSET ? date === todayISO : date === tomorrowISO
                return (
                  <button
                    key={option.offset}
                    type="button"
                    className={classNames('chip', isSelected && 'chip-active')}
                    aria-pressed={isSelected}
                    onClick={() => handleDayOffset(option.offset)}
                  >
                    {option.label}
                  </button>
                )
              })}
              {dateError ? <span className="field-error">{dateError}</span> : null}
            </div>
          </div>
          <div className="women-box">
            <span className="women-icon" aria-hidden="true">
              👩
            </span>
            <div>
              <div>Booking for women</div>
              <a href="#">Know more</a>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={forWomen}
              aria-label="Booking for women"
              className={classNames('toggle', forWomen && 'on')}
              onClick={() => setForWomen((isOn) => !isOn)}
            />
          </div>
        </div>
        <button type="button" className="search-btn" onClick={handleSearch}>
          <span aria-hidden="true">⌕</span> Search buses
        </button>
      </section>
      <RecentSearches
        cities={cities}
        searches={recentSearches}
        today={today}
        onSelect={handleRecentSelect}
        onRemove={handleRecentRemove}
        onClear={handleRecentClear}
      />
    </>
  )
}

export default SearchCard
