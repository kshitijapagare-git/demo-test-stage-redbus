import { useRef } from 'react'
import type { KeyboardEvent } from 'react'
import { classNames } from '../lib/classNames'
import type { BoardingPoint, City } from '../types'

interface BoardingPointPickerProps {
  cities: City[]
  boardingPoints: BoardingPoint[]
  selectedId: BoardingPoint['id'] | null
  onChange: (id: BoardingPoint['id']) => void
}

function formatCityLabel(city: City | undefined): string {
  return city ? ` (${city.name}, ${city.state})` : ''
}

function BoardingPointPicker({
  cities,
  boardingPoints,
  selectedId,
  onChange,
}: BoardingPointPickerProps) {
  const radioRefs = useRef<Array<HTMLInputElement | null>>([])

  function focusRadio(index: number) {
    radioRefs.current[index]?.focus()
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return
    if (boardingPoints.length === 0) return

    const currentIndex =
      selectedId === null
        ? -1
        : boardingPoints.findIndex((boardingPoint) => boardingPoint.id === selectedId)

    let nextIndex: number
    if (event.key === 'ArrowDown') {
      nextIndex = currentIndex < 0 ? 0 : Math.min(currentIndex + 1, boardingPoints.length - 1)
    } else {
      nextIndex = currentIndex < 0 ? 0 : Math.max(currentIndex - 1, 0)
    }

    event.preventDefault()
    const nextPoint = boardingPoints[nextIndex]
    if (nextPoint === undefined) return
    onChange(nextPoint.id)
    focusRadio(nextIndex)
  }

  return (
    <div
      className="bp-grid"
      role="radiogroup"
      aria-label="Boarding points"
      onKeyDown={handleKeyDown}
    >
      {boardingPoints.map((boardingPoint, index) => {
        const city = cities.find((candidate) => candidate.id === boardingPoint.cityId)
        const isSelected = boardingPoint.id === selectedId

        return (
          <label
            key={boardingPoint.id}
            className={classNames('bp-card', isSelected && 'bp-card--selected')}
          >
            <input
              ref={(element) => {
                radioRefs.current[index] = element
              }}
              className="bp-radio"
              type="radio"
              name="boarding-point"
              value={boardingPoint.id}
              checked={isSelected}
              onChange={() => onChange(boardingPoint.id)}
            />
            <strong>{boardingPoint.name}</strong>
            {' — '}
            {boardingPoint.address}, {boardingPoint.landmark}
            {formatCityLabel(city)}
          </label>
        )
      })}
    </div>
  )
}

export default BoardingPointPicker
