import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import SearchResultsPage from './SearchResultsPage'

function renderSearchResults(url: string) {
  return render(
    <MemoryRouter initialEntries={[url]}>
      <Routes>
        <Route path="/search" element={<SearchResultsPage />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('SearchResultsPage', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date(2026, 9, 2, 10, 0))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders results directly from the URL and filters boarding points by departure city', () => {
    renderSearchResults('/search?from=1&to=2&date=2026-10-02')

    expect(
      screen.getByRole('heading', { name: 'Pune → Bengaluru · 02 Oct' }),
    ).toBeInTheDocument()

    const items = screen.getAllByRole('listitem')
    expect(items).toHaveLength(2)
    expect(items[0]).toHaveTextContent('Shivajinagar')
    expect(items[1]).toHaveTextContent('Hinjewadi')
    expect(screen.queryByText('Majestic')).not.toBeInTheDocument()
  })

  it('shows an empty state when no route connects the two cities', () => {
    renderSearchResults('/search?from=2&to=1&date=2026-10-02')

    expect(screen.getByText(/No buses on this route yet/i)).toBeInTheDocument()
    expect(screen.queryByRole('listitem')).not.toBeInTheDocument()
  })

  it('shows an error panel for an unknown city id', () => {
    renderSearchResults('/search?from=999&to=2&date=2026-10-02')

    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Back to search' })).toHaveAttribute('href', '/')
  })

  it('shows an error panel for an invalid date', () => {
    renderSearchResults('/search?from=1&to=2&date=not-a-date')

    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Back to search' })).toBeInTheDocument()
  })

  it('shows an error panel for a past date', () => {
    renderSearchResults('/search?from=1&to=2&date=2026-10-01')

    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Back to search' })).toBeInTheDocument()
  })
})
