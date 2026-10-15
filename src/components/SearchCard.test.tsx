import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import SearchCard from './SearchCard'

describe('SearchCard', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date(2026, 9, 2, 10, 0))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("shows today's date by default", () => {
    render(<SearchCard />)
    expect(screen.getByText('02 Oct, 2026')).toBeInTheDocument()
    expect(screen.getByText('(Today)')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Today' })).toHaveAttribute('aria-pressed', 'true')
  })

  it("switches to tomorrow's date when Tomorrow is clicked", async () => {
    const user = userEvent.setup()
    render(<SearchCard />)
    await user.click(screen.getByRole('button', { name: 'Tomorrow' }))
    expect(screen.getByText('03 Oct, 2026')).toBeInTheDocument()
    expect(screen.getByText('(Tomorrow)')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Tomorrow' })).toHaveClass('chip-active')
  })

  it('selects a day chip with the keyboard', async () => {
    const user = userEvent.setup()
    render(<SearchCard />)
    screen.getByRole('button', { name: 'Tomorrow' }).focus()
    await user.keyboard('{Enter}')
    expect(screen.getByText('03 Oct, 2026')).toBeInTheDocument()
  })

  it('toggles the booking-for-women switch', async () => {
    const user = userEvent.setup()
    render(<SearchCard />)
    const toggle = screen.getByRole('switch', { name: 'Booking for women' })
    expect(toggle).toHaveAttribute('aria-checked', 'false')
    await user.click(toggle)
    expect(toggle).toHaveAttribute('aria-checked', 'true')
  })

  it('filters cities by prefix and shows No cities found', async () => {
    const user = userEvent.setup()
    render(<SearchCard />)
    const from = screen.getByLabelText('From')

    await user.type(from, 'pu')
    expect(screen.getByRole('option', { name: 'Pune, Maharashtra' })).toBeInTheDocument()

    await user.clear(from)
    await user.type(from, 'ne')
    expect(screen.getByRole('option', { name: 'No cities found' })).toBeInTheDocument()
  })

  it('selects a suggestion with arrow keys and Enter', async () => {
    const user = userEvent.setup()
    render(<SearchCard />)
    const from = screen.getByLabelText('From')

    await user.type(from, 'pu')
    await user.keyboard('{ArrowDown}{Enter}')

    expect(from).toHaveValue('Pune')
    expect(screen.queryByRole('listbox', { name: 'From suggestions' })).not.toBeInTheDocument()
  })

  it('resolves an exactly typed city name', async () => {
    const user = userEvent.setup()
    render(<SearchCard />)

    await user.type(screen.getByLabelText('From'), 'pune')
    await user.type(screen.getByLabelText('To'), 'bengaluru')
    await user.click(screen.getByRole('button', { name: 'Search buses' }))

    expect(screen.queryByText('Please select a city')).not.toBeInTheDocument()
    expect(screen.queryByText('From and To must be different cities')).not.toBeInTheDocument()
  })

  it('swaps the selected From and To cities', async () => {
    const user = userEvent.setup()
    render(<SearchCard />)
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
    render(<SearchCard />)

    expect(screen.queryByText('Please select a city')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Search buses' }))

    expect(screen.getAllByText('Please select a city')).toHaveLength(2)
  })

  it('shows an error when From and To are the same city', async () => {
    const user = userEvent.setup()
    render(<SearchCard />)

    await user.type(screen.getByLabelText('From'), 'pune')
    await user.type(screen.getByLabelText('To'), 'pune')
    await user.click(screen.getByRole('button', { name: 'Search buses' }))

    expect(screen.getByText('From and To must be different cities')).toBeInTheDocument()
  })
})
