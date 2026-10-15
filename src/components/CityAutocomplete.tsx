import { useEffect, useId, useRef, useState } from 'react'
import type { ChangeEvent, KeyboardEvent } from 'react'
import { classNames } from '../lib/classNames'
import type { City } from '../types'

interface CityAutocompleteProps {
  cities: City[]
  value: City['id'] | null
  onChange: (cityId: City['id'] | null) => void
  label: string
  error?: string
}

function CityAutocomplete({ cities, value, onChange, label, error }: CityAutocompleteProps) {
  const inputId = useId()
  const listboxId = useId()
  const errorId = useId()

  const [query, setQuery] = useState(() => cities.find((city) => city.id === value)?.name ?? '')
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)

  // Tracks the value we last reported to the parent so we can tell whether a
  // change to `value` came from this input (typing/selection) or from outside
  // (e.g. the swap button) and only re-sync the query in the latter case.
  const emittedValueRef = useRef<City['id'] | null>(value)

  useEffect(() => {
    if (value === emittedValueRef.current) return

    const city = cities.find((candidate) => candidate.id === value)
    setQuery(city?.name ?? '')
    setActiveIndex(-1)
    setOpen(false)
    emittedValueRef.current = value
  }, [value, cities])

  const normalizedQuery = query.toLowerCase()
  const suggestions =
    query.length > 0
      ? cities.filter((city) => city.name.toLowerCase().startsWith(normalizedQuery))
      : []
  const isOpen = open && query.length > 0
  const activeCity = activeIndex >= 0 ? suggestions[activeIndex] : undefined

  const optionId = (cityId: City['id']) => `${listboxId}-option-${cityId}`

  function selectCity(city: City) {
    emittedValueRef.current = city.id
    setQuery(city.name)
    setActiveIndex(-1)
    setOpen(false)
    onChange(city.id)
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const nextQuery = event.target.value
    const nextId =
      cities.find((city) => city.name.toLowerCase() === nextQuery.toLowerCase())?.id ?? null

    emittedValueRef.current = nextId
    setQuery(nextQuery)
    setActiveIndex(-1)
    setOpen(nextQuery.length > 0)
    onChange(nextId)
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      if (!isOpen) setOpen(true)
      setActiveIndex((previous) => {
        if (suggestions.length === 0) return -1
        return previous < 0 ? 0 : Math.min(previous + 1, suggestions.length - 1)
      })
      return
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()
      if (!isOpen) setOpen(true)
      setActiveIndex((previous) => {
        if (suggestions.length === 0) return -1
        return previous < 0 ? suggestions.length - 1 : Math.max(previous - 1, 0)
      })
      return
    }

    if (event.key === 'Enter') {
      event.preventDefault()
      if (isOpen && activeCity) {
        selectCity(activeCity)
      } else {
        setOpen(false)
      }
      return
    }

    if (event.key === 'Escape') {
      event.preventDefault()
      setOpen(false)
      setActiveIndex(-1)
    }
  }

  function handleFocus() {
    if (query.length > 0) setOpen(true)
  }

  function handleBlur() {
    setOpen(false)
    setActiveIndex(-1)
  }

  return (
    <div className="autocomplete">
      <label className="autocomplete-label" htmlFor={inputId}>
        {label}
      </label>
      <input
        id={inputId}
        type="text"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-activedescendant={activeCity ? optionId(activeCity.id) : undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        autoComplete="off"
        placeholder={label}
        value={query}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
      />
      {isOpen ? (
        <ul
          id={listboxId}
          role="listbox"
          aria-label={`${label} suggestions`}
          className="autocomplete-listbox"
        >
          {suggestions.length > 0 ? (
            suggestions.map((city) => (
              <li
                key={city.id}
                id={optionId(city.id)}
                role="option"
                aria-selected={city.id === value}
                className={classNames(
                  'autocomplete-option',
                  activeCity?.id === city.id && 'autocomplete-option--active',
                )}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => selectCity(city)}
              >
                <span className="autocomplete-option-name">{city.name}</span>
                <span className="autocomplete-option-state">, {city.state}</span>
              </li>
            ))
          ) : (
            <li
              role="option"
              aria-disabled="true"
              aria-selected={false}
              className="autocomplete-option autocomplete-option--empty"
            >
              No cities found
            </li>
          )}
        </ul>
      ) : null}
      {error ? (
        <span id={errorId} className="field-error">
          {error}
        </span>
      ) : null}
    </div>
  )
}

export default CityAutocomplete
