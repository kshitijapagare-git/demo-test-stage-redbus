import { useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import BoardingPointPicker from '../components/BoardingPointPicker'
import { boardingPoints, cities, routes } from '../data'
import { formatShortDate, isBeforeToday, parseISODate } from '../lib/date'
import type { BoardingPoint, City } from '../types'

function readCityId(value: string | null): number | null {
  if (value === null) return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function readBoardingPointId(value: string | null): number | null {
  if (value === null) return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function ErrorPanel() {
  return (
    <main className="container section">
      <div className="result-error" role="alert">
        <h1>We couldn't find this search</h1>
        <p>
          The link may be missing a city or date, use a city we don't serve, or point to a past
          date. Search again from the home page.
        </p>
        <Link to="/">Back to search</Link>
      </div>
    </main>
  )
}

function SearchResultsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()

  const fromCityId = readCityId(searchParams.get('from'))
  const toCityId = readCityId(searchParams.get('to'))
  const dateValue = searchParams.get('date')
  const journeyDate = dateValue === null ? null : parseISODate(dateValue)

  const fromCity = cities.find((city) => city.id === fromCityId)
  const toCity = cities.find((city) => city.id === toCityId)

  const bpValue = searchParams.get('bp')
  const parsedBoardingPointId = readBoardingPointId(bpValue)
  const selectedBoardingPoint: BoardingPoint | null =
    parsedBoardingPointId === null
      ? null
      : (boardingPoints.find(
          (boardingPoint) =>
            boardingPoint.id === parsedBoardingPointId && boardingPoint.cityId === fromCityId,
        ) ?? null)
  const selectedCity: City | undefined =
    selectedBoardingPoint === null
      ? undefined
      : cities.find((city) => city.id === selectedBoardingPoint.cityId)

  useEffect(() => {
    if (bpValue !== null && selectedBoardingPoint === null) {
      const nextParams = new URLSearchParams(searchParams)
      nextParams.delete('bp')
      setSearchParams(nextParams, { replace: true })
    }
  }, [bpValue, selectedBoardingPoint, searchParams, setSearchParams])

  if (fromCity === undefined || toCity === undefined || journeyDate === null) {
    return <ErrorPanel />
  }

  const today = new Date()
  if (isBeforeToday(journeyDate, today)) {
    return <ErrorPanel />
  }

  const hasRoute = routes.some(
    (route) => route.fromCityId === fromCity.id && route.toCityId === toCity.id,
  )
  const departureBoardingPoints = boardingPoints.filter(
    (boardingPoint) => boardingPoint.cityId === fromCity.id,
  )

  function handleBoardingPointChange(id: BoardingPoint['id']) {
    const nextParams = new URLSearchParams(searchParams)
    nextParams.set('bp', String(id))
    setSearchParams(nextParams, { replace: true })
  }

  function handleContinue() {
    if (selectedBoardingPoint === null) return
    const nextParams = new URLSearchParams(searchParams)
    nextParams.set('bp', String(selectedBoardingPoint.id))
    navigate(`/booking?${nextParams.toString()}`)
  }

  return (
    <main className="container section">
      <header className="results-header">
        <h1>
          {fromCity.name} → {toCity.name} · {formatShortDate(journeyDate)}
        </h1>
      </header>
      {hasRoute ? (
        <section aria-labelledby="boarding-points-heading">
          <div className="section-head">
            <h2 id="boarding-points-heading">Boarding Points</h2>
          </div>
          <BoardingPointPicker
            cities={cities}
            boardingPoints={departureBoardingPoints}
            selectedId={selectedBoardingPoint?.id ?? null}
            onChange={handleBoardingPointChange}
          />
          {selectedBoardingPoint !== null && selectedCity !== undefined ? (
            <aside className="bp-summary" aria-label="Selected boarding point">
              <h3>{selectedBoardingPoint.name}</h3>
              <p>{selectedBoardingPoint.address}</p>
              <p>{selectedBoardingPoint.landmark}</p>
              <p>
                {selectedCity.name}, {selectedCity.state}
              </p>
            </aside>
          ) : null}
          <button
            type="button"
            className="continue-btn"
            disabled={selectedBoardingPoint === null}
            onClick={handleContinue}
          >
            Continue
          </button>
        </section>
      ) : (
        <p className="results-empty">
          No buses on this route yet. Try a different city or date.
        </p>
      )}
    </main>
  )
}

export default SearchResultsPage
