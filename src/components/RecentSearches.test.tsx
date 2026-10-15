import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import RecentSearches from './RecentSearches'
import type { City, RecentSearch } from '../types'

const cities: City[] = [
  { id: 1, name: 'Pune', state: 'Maharashtra' },
  { id: 2, name: 'Bengaluru', state: 'Karnataka' },
]

const today = new Date(2026, 9, 2)

const currentSearch: RecentSearch = { fromCityId: 1, toCityId: 2, date: '2026-10-02' }

interface RenderOptions {
  onSelect?: (search: RecentSearch) => void
  onRemove?: (search: RecentSearch) => void
  onClear?: () => void
}

function renderRecentSearches(searches: RecentSearch[], options: RenderOptions = {}) {
  return render(
    <RecentSearches
      cities={cities}
      searches={searches}
      today={today}
      onSelect={options.onSelect ?? vi.fn()}
      onRemove={options.onRemove ?? vi.fn()}
      onClear={options.onClear ?? vi.fn()}
    />,
  )
}

describe('RecentSearches', () => {
  it('renders nothing when searches is empty', () => {
    const { container } = renderRecentSearches([])

    expect(container).toBeEmptyDOMElement()
  })

  it('renders route and date text', () => {
    renderRecentSearches([currentSearch])

    expect(screen.getByText('Recent searches')).toBeInTheDocument()
    expect(screen.getByText('Pune → Bengaluru')).toBeInTheDocument()
    expect(screen.getByText('· 02 Oct')).toBeInTheDocument()
  })

  it('renders a Past badge for a past date', () => {
    renderRecentSearches([{ ...currentSearch, date: '2026-10-01' }])

    expect(screen.getByText('Past')).toBeInTheDocument()
    expect(screen.getByRole('listitem')).toHaveClass('recent-search', 'recent-search--past')
  })

  it('clicking the main button calls onSelect', async () => {
    const onSelect = vi.fn()
    const user = userEvent.setup()
    renderRecentSearches([currentSearch], { onSelect })

    await user.click(screen.getByRole('button', { name: /Pune → Bengaluru/ }))

    expect(onSelect).toHaveBeenCalledWith(currentSearch)
  })

  it('clicking × calls onRemove without confirmation', async () => {
    const onRemove = vi.fn()
    const user = userEvent.setup()
    renderRecentSearches([currentSearch], { onRemove })

    await user.click(screen.getByRole('button', { name: 'Remove Pune to Bengaluru' }))

    expect(onRemove).toHaveBeenCalledWith(currentSearch)
  })

  it('clicking Clear all calls onClear', async () => {
    const onClear = vi.fn()
    const user = userEvent.setup()
    renderRecentSearches([currentSearch], { onClear })

    await user.click(screen.getByRole('button', { name: 'Clear all' }))

    expect(onClear).toHaveBeenCalledTimes(1)
  })
})
