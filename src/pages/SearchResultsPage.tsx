import { Link, useSearchParams } from 'react-router-dom'
import BoardingPointList from '../components/BoardingPointList'
import { boardingPoints, cities, routes } from '../data'
import { formatShortDate, isBeforeToday, parseISODate } from '../lib/date'

function readCityId(value: string | null): number | null {
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
  const [searchParams] = useSearchParams()

  const fromCityId = readCityId(searchParams.get('from'))
  const toCityId = readCityId(searchParams.get('to'))
  const dateValue = searchParams.get('date')
  const journeyDate = dateValue === null ? null : parseISODate(dateValue)

  const fromCity = cities.find((city) => city.id === fromCityId)
  const toCity = cities.find((city) => city.id === toCityId)

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
          <BoardingPointList cities={cities} boardingPoints={departureBoardingPoints} />
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
