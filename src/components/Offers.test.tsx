import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import Offers from './Offers'
import { testOffers } from '../test/fixtures'

function stubClipboard(writeText: () => Promise<void>) {
  const mock = vi.fn(writeText)
  Object.defineProperty(navigator, 'clipboard', {
    value: { writeText: mock },
    configurable: true,
  })
  return mock
}

afterEach(() => {
  Reflect.deleteProperty(navigator, 'clipboard')
})

describe('Offers', () => {
  it('renders one card per offer with its title, validity and code', () => {
    render(<Offers offers={testOffers} />)
    const cards = screen.getAllByRole('article')
    expect(cards).toHaveLength(3)
    expect(cards[0]).toHaveTextContent('Save up to Rs 300 on bus tickets')
    expect(cards[0]).toHaveTextContent('Valid till 05 Oct')
    expect(cards[0]).toHaveTextContent('FESTIVE300')
  })

  it('applies the tone as a CSS modifier class', () => {
    render(<Offers offers={testOffers} />)
    expect(screen.getAllByRole('article')[1]).toHaveClass('offer', 'offer-yellow')
  })

  it('renders the sample offers by default', () => {
    render(<Offers />)
    expect(screen.getAllByRole('article')).toHaveLength(5)
  })

  it('filters offers by All, Bus and Train tabs', async () => {
    const user = userEvent.setup()
    render(<Offers offers={testOffers} />)

    const allTab = screen.getByRole('tab', { name: 'All' })
    const busTab = screen.getByRole('tab', { name: 'Bus' })
    const trainTab = screen.getByRole('tab', { name: 'Train' })

    expect(allTab).toHaveAttribute('aria-selected', 'true')
    expect(screen.getAllByRole('article')).toHaveLength(3)

    await user.click(busTab)
    expect(busTab).toHaveAttribute('aria-selected', 'true')
    expect(allTab).toHaveAttribute('aria-selected', 'false')
    expect(screen.getAllByRole('article')).toHaveLength(2)
    expect(screen.getByText('Save up to Rs 300 on bus tickets')).toBeInTheDocument()
    expect(screen.getByText('Save up to Rs 200 on Primo operators.')).toBeInTheDocument()
    expect(screen.queryByText('Save up to Rs 200 on train tickets')).not.toBeInTheDocument()

    await user.click(trainTab)
    expect(trainTab).toHaveAttribute('aria-selected', 'true')
    expect(busTab).toHaveAttribute('aria-selected', 'false')
    expect(screen.getAllByRole('article')).toHaveLength(1)
    expect(screen.getByText('Save up to Rs 200 on train tickets')).toBeInTheDocument()

    await user.click(allTab)
    expect(allTab).toHaveAttribute('aria-selected', 'true')
    expect(trainTab).toHaveAttribute('aria-selected', 'false')
    expect(screen.getAllByRole('article')).toHaveLength(3)
  })

  it('shows an empty state when a tab has no offers', async () => {
    const user = userEvent.setup()
    render(<Offers offers={testOffers.filter((offer) => offer.category === 'bus')} />)

    await user.click(screen.getByRole('tab', { name: 'Train' }))

    expect(screen.getByText('No offers right now')).toBeInTheDocument()
    expect(screen.queryByRole('article')).not.toBeInTheDocument()
  })

  it('copies the code and shows Copied! before reverting', async () => {
    const user = userEvent.setup()
    const writeText = stubClipboard(() => Promise.resolve())
    render(<Offers offers={testOffers} />)

    await user.click(screen.getByRole('button', { name: 'FESTIVE300' }))

    expect(writeText).toHaveBeenCalledWith('FESTIVE300')
    expect(await screen.findByRole('button', { name: 'Copied!' })).toBeInTheDocument()

    await waitFor(
      () => {
        expect(screen.getByRole('button', { name: 'FESTIVE300' })).toBeInTheDocument()
      },
      { timeout: 3000 },
    )
    expect(screen.queryByRole('button', { name: 'Copied!' })).not.toBeInTheDocument()
  })

  it('shows a manual copy message when copying fails', async () => {
    const user = userEvent.setup()
    const writeText = stubClipboard(() => Promise.reject(new Error('denied')))
    render(<Offers offers={testOffers} />)

    await user.click(screen.getByRole('button', { name: 'FESTIVE300' }))

    expect(writeText).toHaveBeenCalledWith('FESTIVE300')
    expect(
      await screen.findByRole('button', {
        name: "Couldn't copy — please copy the code manually",
      }),
    ).toBeInTheDocument()
  })
})
