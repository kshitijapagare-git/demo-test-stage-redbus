import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import SearchCard from './SearchCard'
import { RECENT_SEARCHES_STORAGE_KEY } from '../lib/recentSearches'

function LocationProbe() {
  const location = useLocation()
  return <div data-testid="location">{location.pathname}{location.search}</div>
}

function renderWithRouter(initialEntry = '/') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <LocationProbe />
      <Routes>
        <Route path="/" element={<SearchCard />} />
        <Route path="/search" element={<div>Search results page</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('SearchCard', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date(2026, 9, 2, 10, 0))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("shows today's date by default", () => {
    renderWithRouter()
    expect(screen.getByText('02 Oct, 2026')).toBeInTheDocument()
    expect(screen.getByText('(Today)')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Today' })).toHaveAttribute('aria-pressed', 'true')
  })

  it("switches to tomorrow's date when Tomorrow is clicked", async () => {
    const user = userEvent.setup()
    renderWithRouter()
    await user.click(screen.getByRole('button', { name: 'Tomorrow' }))
    expect(screen.getByText('03 Oct, 2026')).toBeInTheDocument()
    expect(screen.getByText('(Tomorrow)')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Tomorrow' })).toHaveClass('chip-active')
  })

  it('selects a day chip with the keyboard', async () => {
    const user = userEvent.setup()
    renderWithRouter()
    screen.getByRole('button', { name: 'Tomorrow' }).focus()
    await user.keyboard('{Enter}')
    expect(screen.getByText('03 Oct, 2026')).toBeInTheDocument()
  })

  it('toggles the booking-for-women switch', async () => {
    const user = userEvent.setup()
    renderWithRouter()
    const toggle = screen.getByRole('switch', { name: 'Booking for women' })
    expect(toggle).toHaveAttribute('aria-checked', 'false')
    await user.click(toggle)
    expect(toggle).toHaveAttribute('aria-checked', 'true')
  })

  it('filters cities by prefix and shows No cities found', async () => {
    const user = userEvent.setup()
    renderWithRouter()
    const from = screen.getByLabelText('From')

    await user.type(from, 'pu')
    expect(screen.getByRole('option', { name: 'Pune, Maharashtra' })).toBeInTheDocument()

    await user.clear(from)
    await user.type(from, 'ne')
    expect(screen.getByRole('option', { name: 'No cities found' })).toBeInTheDocument()
  })

  it('selects a suggestion with arrow keys and Enter', async () => {
    const user = userEvent.setup()
    renderWithRouter()
    const from = screen.getByLabelText('From')

    await user.type(from, 'pu')
    await user.keyboard('{ArrowDown}{Enter}')

    expect(from).toHaveValue('Pune')
    expect(screen.queryByRole('listbox', { name: 'From suggestions' })).not.toBeInTheDocument()
  })

  it('resolves an exactly typed city name', async () => {
    const user = userEvent.setup()
    renderWithRouter()

    await user.type(screen.getByLabelText('From'), 'pune')
    await user.type(screen.getByLabelText('To'), 'bengaluru')
    await user.click(screen.getByRole('button', { name: 'Search buses' }))

    expect(screen.queryByText('Please select a city')).not.toBeInTheDocument()
    expect(screen.queryByText('From and To must be different cities')).not.toBeInTheDocument()
  })

  it('swaps the selected From and To cities', async () => {
    const user = userEvent.setup()
    renderWithRouter()
    const from = screen.getByLabelText('From')
    const to = screen.getByLabelText('To')

    await user.type(from, 'pune')
    await user.type(to, 'bengaluru')
    await user.click(screen.getByRole('button', { name: 'Swap From and To' }))

    expect(from).toHaveValue('Bengaluru')
    expect(to).toHaveValue('Pune')
  })

  it('shows an error for an empty field after Search', async () => {
    const user = userEvent.setup()
    renderWithRouter()

    expect(screen.queryByText('Please select a city')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Search buses' }))

    expect(screen.getAllByText('Please select a city')).toHaveLength(2)
  })

  it('shows an error when From and To are the same city', async () => {
    const user = userEvent.setup()
    renderWithRouter()

    await user.type(screen.getByLabelText('From'), 'pune')
    await user.type(screen.getByLabelText('To'), 'pune')
    await user.click(screen.getByRole('button', { name: 'Search buses' }))

    expect(screen.getByText('From and To must be different cities')).toBeInTheDocument()
  })

  it('fills the search card from the URL', () => {
    renderWithRouter('/?from=1&to=2&date=2026-10-02')

    expect(screen.getByLabelText('From')).toHaveValue('Pune')
    expect(screen.getByLabelText('To')).toHaveValue('Bengaluru')
    expect(screen.getByLabelText('Date of journey')).toHaveValue('2026-10-02')
  })

  it('sets the date picker min to today', () => {
    renderWithRouter()

    expect(screen.getByLabelText('Date of journey')).toHaveAttribute('min', '2026-10-02')
  })

  it('updates the home URL as search state changes', async () => {
    const user = userEvent.setup()
    renderWithRouter()

    await user.type(screen.getByLabelText('From'), 'pune')
    await user.type(screen.getByLabelText('To'), 'bengaluru')
    await user.click(screen.getByRole('button', { name: 'Tomorrow' }))

    await waitFor(() =>
      expect(screen.getByTestId('location')).toHaveTextContent('/?from=1&to=2&date=2026-10-03'),
    )
  })

  it('navigates to /search with from, to, and date on a valid search', async () => {
    const user = userEvent.setup()
    renderWithRouter()

    await user.type(screen.getByLabelText('From'), 'pune')
    await user.type(screen.getByLabelText('To'), 'bengaluru')
    await user.click(screen.getByRole('button', { name: 'Search buses' }))

    await waitFor(() =>
      expect(screen.getByTestId('location')).toHaveTextContent(
        '/search?from=1&to=2&date=2026-10-02',
      ),
    )
    expect(screen.getByText('Search results page')).toBeInTheDocument()
  })

  it('blocks a past date and does not navigate', async () => {
    const user = userEvent.setup()
    renderWithRouter()

    await user.type(screen.getByLabelText('From'), 'pune')
    await user.type(screen.getByLabelText('To'), 'bengaluru')
    fireEvent.change(screen.getByLabelText('Date of journey'), {
      target: { value: '2026-10-01' },
    })
    await user.click(screen.getByRole('button', { name: 'Search buses' }))

    expect(screen.getByText('Past dates are not allowed')).toBeInTheDocument()
    expect(screen.queryByText('Search results page')).not.toBeInTheDocument()
  })

  it('saves a valid search to localStorage', async () => {
    const user = userEvent.setup()
    renderWithRouter()

    await user.type(screen.getByLabelText('From'), 'pune')
    await user.type(screen.getByLabelText('To'), 'bengaluru')
    await user.click(screen.getByRole('button', { name: 'Search buses' }))

    await waitFor(() =>
      expect(screen.getByTestId('location')).toHaveTextContent(
        '/search?from=1&to=2&date=2026-10-02',
      ),
    )

    expect(localStorage.getItem(RECENT_SEARCHES_STORAGE_KEY)).toBe(
      JSON.stringify([{ fromCityId: 1, toCityId: 2, date: '2026-10-02' }]),
    )
  })

  it('does not save an invalid search', async () => {
    const user = userEvent.setup()
    renderWithRouter()

    await user.click(screen.getByRole('button', { name: 'Search buses' }))

    expect(screen.getAllByText('Please select a city')).toHaveLength(2)
    expect(localStorage.getItem(RECENT_SEARCHES_STORAGE_KEY)).toBeNull()
  })

  it('shows a seeded recent search under the search card', () => {
    localStorage.setItem(
      RECENT_SEARCHES_STORAGE_KEY,
      JSON.stringify([{ fromCityId: 1, toCityId: 2, date: '2026-10-02' }]),
    )

    renderWithRouter()

    expect(screen.getByText('Recent searches')).toBeInTheDocument()
    expect(screen.getByText('Pune → Bengaluru')).toBeInTheDocument()
    expect(screen.getByText('· 02 Oct')).toBeInTheDocument()
  })

  it('clicking a recent search fills the card without searching', async () => {
    localStorage.setItem(
      RECENT_SEARCHES_STORAGE_KEY,
      JSON.stringify([{ fromCityId: 1, toCityId: 2, date: '2026-10-03' }]),
    )
    const user = userEvent.setup()
    renderWithRouter()

    await user.click(screen.getByRole('button', { name: /Pune → Bengaluru/ }))

    expect(screen.getByLabelText('From')).toHaveValue('Pune')
    expect(screen.getByLabelText('To')).toHaveValue('Bengaluru')
    expect(screen.getByLabelText('Date of journey')).toHaveValue('2026-10-03')
    expect(screen.queryByText('Search results page')).not.toBeInTheDocument()

    await waitFor(() =>
      expect(screen.getByTestId('location')).toHaveTextContent('/?from=1&to=2&date=2026-10-03'),
    )
  })

  it('clicking a past recent search fills cities and uses today without changing storage', async () => {
    const stored = [{ fromCityId: 1, toCityId: 2, date: '2026-10-01' }]
    localStorage.setItem(RECENT_SEARCHES_STORAGE_KEY, JSON.stringify(stored))
    const user = userEvent.setup()
    renderWithRouter()

    expect(screen.getByText('Past')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Pune → Bengaluru/ }))

    expect(screen.getByLabelText('From')).toHaveValue('Pune')
    expect(screen.getByLabelText('To')).toHaveValue('Bengaluru')
    expect(screen.getByLabelText('Date of journey')).toHaveValue('2026-10-02')
    expect(localStorage.getItem(RECENT_SEARCHES_STORAGE_KEY)).toBe(JSON.stringify(stored))
    expect(screen.queryByText('Search results page')).not.toBeInTheDocument()
  })

  it('removes one recent search with ×', async () => {
    localStorage.setItem(
      RECENT_SEARCHES_STORAGE_KEY,
      JSON.stringify([
        { fromCityId: 1, toCityId: 2, date: '2026-10-02' },
        { fromCityId: 2, toCityId: 1, date: '2026-10-03' },
      ]),
    )
    const user = userEvent.setup()
    renderWithRouter()

    await user.click(screen.getByRole('button', { name: 'Remove Pune to Bengaluru' }))

    expect(screen.queryByRole('button', { name: /Pune → Bengaluru/ })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Bengaluru → Pune/ })).toBeInTheDocument()
    expect(JSON.parse(localStorage.getItem(RECENT_SEARCHES_STORAGE_KEY) ?? 'null')).toEqual([
      { fromCityId: 2, toCityId: 1, date: '2026-10-03' },
    ])
  })

  it('Clear all removes every recent search', async () => {
    localStorage.setItem(
      RECENT_SEARCHES_STORAGE_KEY,
      JSON.stringify([
        { fromCityId: 1, toCityId: 2, date: '2026-10-02' },
        { fromCityId: 2, toCityId: 1, date: '2026-10-03' },
      ]),
    )
    const user = userEvent.setup()
    renderWithRouter()

    await user.click(screen.getByRole('button', { name: 'Clear all' }))

    expect(screen.queryByText('Recent searches')).not.toBeInTheDocument()
    expect(localStorage.getItem(RECENT_SEARCHES_STORAGE_KEY)).toBe('[]')
  })

  it('hides the row and still renders when localStorage holds invalid JSON', () => {
    localStorage.setItem(RECENT_SEARCHES_STORAGE_KEY, '{not valid')

    renderWithRouter()

    expect(screen.queryByText('Recent searches')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Search buses' })).toBeInTheDocument()
  })
})
