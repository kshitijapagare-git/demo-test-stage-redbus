import type { ReactElement } from 'react'
import { classNames } from '../lib/classNames'
import { formatShortDate, isBeforeToday, parseISODate } from '../lib/date'
import type { City, RecentSearch } from '../types'

interface RecentSearchesProps {
  cities: City[]
  searches: RecentSearch[]
  today: Date
  onSelect: (search: RecentSearch) => void
  onRemove: (search: RecentSearch) => void
  onClear: () => void
}

function RecentSearches({
  cities,
  searches,
  today,
  onSelect,
  onRemove,
  onClear,
}: RecentSearchesProps): ReactElement | null {
  if (searches.length === 0) return null

  return (
    <section className="recent-searches" aria-label="Recent searches">
      <div className="recent-searches-head">
        <h2 className="recent-searches-title">Recent searches</h2>
        <button type="button" className="recent-searches-clear" onClick={onClear}>
          Clear all
        </button>
      </div>
      <ul className="recent-searches-list">
        {searches.map((search) => {
          const from = cities.find((city) => city.id === search.fromCityId)
          const to = cities.find((city) => city.id === search.toCityId)
          if (from === undefined || to === undefined) return null

          const journeyDate = parseISODate(search.date)
          const isPast = journeyDate !== null && isBeforeToday(journeyDate, today)

          return (
            <li
              key={`${search.fromCityId}-${search.toCityId}`}
              className={classNames('recent-search', isPast && 'recent-search--past')}
            >
              <button
                type="button"
                className="recent-search-main"
                onClick={() => onSelect(search)}
              >
                <span className="recent-search-route">
                  {from.name} → {to.name}
                </span>
                <span className="recent-search-date">
                  · {journeyDate !== null ? formatShortDate(journeyDate) : search.date}
                </span>
                {isPast ? <span className="recent-search-badge">Past</span> : null}
              </button>
              <button
                type="button"
                className="recent-search-remove"
                aria-label={`Remove ${from.name} to ${to.name}`}
                onClick={() => onRemove(search)}
              >
                ×
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

export default RecentSearches
