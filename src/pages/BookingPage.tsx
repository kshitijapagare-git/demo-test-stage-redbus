import { useSearchParams } from 'react-router-dom'

function BookingPage() {
  const [searchParams] = useSearchParams()

  const from = searchParams.get('from')
  const to = searchParams.get('to')
  const date = searchParams.get('date')
  const bp = searchParams.get('bp')

  return (
    <main className="container section">
      <div className="booking-placeholder">
        <h1>Booking</h1>
        <p>This is a placeholder for the booking flow.</p>
        <dl>
          <div>
            <dt>From</dt>
            <dd>{from ?? '—'}</dd>
          </div>
          <div>
            <dt>To</dt>
            <dd>{to ?? '—'}</dd>
          </div>
          <div>
            <dt>Date</dt>
            <dd>{date ?? '—'}</dd>
          </div>
          <div>
            <dt>Boarding point</dt>
            <dd>{bp ?? '—'}</dd>
          </div>
        </dl>
      </div>
    </main>
  )
}

export default BookingPage
