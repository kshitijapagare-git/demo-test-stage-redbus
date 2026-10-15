import { useState } from 'react'
import CityAutocomplete from './CityAutocomplete'
import { cities } from '../data'
import { classNames } from '../lib/classNames'
import { DAY_OPTIONS, formatDate, getJourneyDay, TODAY_OFFSET } from '../lib/date'
import type { City } from '../types'

interface SearchErrors {
  from: string | null
  to: string | null
}

function validateCities(from: City['id'] | null, to: City['id'] | null): SearchErrors {
  if (from === null || to === null) {
    return {
      from: from === null ? 'Please select a city' : null,
      to: to === null ? 'Please select a city' : null,
    }
  }

  if (from === to) {
    return { from: null, to: 'From and To must be different cities' }
  }

  return { from: null, to: null }
}

function SearchCard() {
  const [today] = useState(() => new Date())
  const [dayOffset, setDayOffset] = useState(TODAY_OFFSET)
  const [forWomen, setForWomen] = useState(false)
  const [fromCityId, setFromCityId] = useState<City['id'] | null>(null)
  const [toCityId, setToCityId] = useState<City['id'] | null>(null)
  const [hasSearched, setHasSearched] = useState(false)
  const [fromError, setFromError] = useState<string | null>(null)
  const [toError, setToError] = useState<string | null>(null)

  const journeyDay = getJourneyDay(today, dayOffset)

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

  function handleSearch() {
    setHasSearched(true)
    applyValidation(fromCityId, toCityId)
  }

  return (
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
              <strong>{formatDate(journeyDay.date)}</strong>
              <em>({journeyDay.label})</em>
            </div>
            {DAY_OPTIONS.map((option) => {
              const isSelected = option.offset === dayOffset
              return (
                <button
                  key={option.offset}
                  type="button"
                  className={classNames('chip', isSelected && 'chip-active')}
                  aria-pressed={isSelected}
                  onClick={() => setDayOffset(option.offset)}
                >
                  {option.label}
                </button>
              )
            })}
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
  )
}

export default SearchCard
