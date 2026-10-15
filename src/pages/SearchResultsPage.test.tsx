import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import SearchResultsPage from './SearchResultsPage'

function LocationProbe() {
  const location = useLocation()
  return <div data-testid="location">{location.pathname}{location.search}</div>
}

function renderSearchResults(url: string) {
  return render(
    <MemoryRouter initialEntries={[url]}>
      <LocationProbe />
      <Routes>
        <Route path="/search" element={<SearchResultsPage />} />
        <Route path="/booking" element={<div>Booking page</div>} />
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

    const radios = screen.getAllByRole('radio')
    expect(radios).toHaveLength(2)
    expect(screen.getByRole('radio', { name: /Shivajinagar/ })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /Hinjewadi/ })).toBeInTheDocument()
    expect(screen.queryByText('Majestic')).not.toBeInTheDocument()
  })

  it('reads a valid bp from the URL and shows the summary', () => {
    renderSearchResults('/search?from=1&to=2&date=2026-10-02&bp=2')

    expect(screen.getByRole('radio', { name: /Shivajinagar/ })).not.toBeChecked()
    expect(screen.getByRole('radio', { name: /Hinjewadi/ })).toBeChecked()

    const summary = screen.getByRole('complementary', { name: 'Selected boarding point' })
    expect(summary).toHaveTextContent('Hinjewadi')
    expect(summary).toHaveTextContent('Phase 1')
    expect(summary).toHaveTextContent('Near Wipro Circle')
    expect(summary).toHaveTextContent('Pune, Maharashtra')
  })

  it('selecting a boarding point updates the URL', async () => {
    const user = userEvent.setup()
    renderSearchResults('/search?from=1&to=2&date=2026-10-02')

    await user.click(screen.getByRole('radio', { name: /Hinjewadi/ }))

    expect(screen.getByRole('radio', { name: /Hinjewadi/ })).toBeChecked()
    await waitFor(() =>
      expect(screen.getByTestId('location').textContent).toBe(
        '/search?from=1&to=2&date=2026-10-02&bp=2',
      ),
    )
  })

  it('arrow keys move selection and update the URL', async () => {
    renderSearchResults('/search?from=1&to=2&date=2026-10-02&bp=1')

    const firstRadio = screen.getByRole('radio', { name: /Shivajinagar/ })
    expect(firstRadio).toBeChecked()
    firstRadio.focus()

    fireEvent.keyDown(screen.getByRole('radiogroup', { name: 'Boarding points' }), {
      key: 'ArrowDown',
    })

    expect(screen.getByRole('radio', { name: /Hinjewadi/ })).toBeChecked()
    expect(screen.getByRole('radio', { name: /Hinjewadi/ })).toHaveFocus()

    await waitFor(() =>
      expect(screen.getByTestId('location').textContent).toBe(
        '/search?from=1&to=2&date=2026-10-02&bp=2',
      ),
    )
  })

  it('ignores an invalid bp and removes it from the URL', async () => {
    for (const bp of ['999', '3']) {
      const { unmount } = renderSearchResults(`/search?from=1&to=2&date=2026-10-02&bp=${bp}`)

      expect(screen.getAllByRole('radio')).toHaveLength(2)
      screen.getAllByRole('radio').forEach((radio) => expect(radio).not.toBeChecked())
      expect(
        screen.queryByRole('complementary', { name: 'Selected boarding point' }),
      ).not.toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled()

      await waitFor(() =>
        expect(screen.getByTestId('location').textContent).toBe(
          '/search?from=1&to=2&date=2026-10-02',
        ),
      )
      unmount()
    }
  })

  it('keeps Continue disabled until selection, then navigates with params', async () => {
    const user = userEvent.setup()
    renderSearchResults('/search?from=1&to=2&date=2026-10-02')

    const continueButton = screen.getByRole('button', { name: 'Continue' })
    expect(continueButton).toBeDisabled()
    expect(
      screen.queryByRole('complementary', { name: 'Selected boarding point' }),
    ).not.toBeInTheDocument()

    await user.click(screen.getByRole('radio', { name: /Hinjewadi/ }))

    expect(continueButton).toBeEnabled()
    await user.click(continueButton)

    await waitFor(() =>
      expect(screen.getByTestId('location').textContent).toBe(
        '/booking?from=1&to=2&date=2026-10-02&bp=2',
      ),
    )
    expect(screen.getByText('Booking page')).toBeInTheDocument()
  })

  it('shows only the empty state when no route connects the cities', () => {
    renderSearchResults('/search?from=2&to=1&date=2026-10-02')

    expect(screen.getByText(/No buses on this route yet/i)).toBeInTheDocument()
    expect(screen.queryByRole('radiogroup', { name: 'Boarding points' })).not.toBeInTheDocument()
    expect(
      screen.queryByRole('complementary', { name: 'Selected boarding point' }),
    ).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Continue' })).not.toBeInTheDocument()
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
