import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import Header from './Header'

describe('Header', () => {
  it('marks Bus tickets as the current page', () => {
    render(<Header />)
    expect(screen.getByRole('link', { name: 'Bus tickets' })).toHaveAttribute(
      'aria-current',
      'page',
    )
    expect(screen.getByRole('link', { name: 'Hotels' })).not.toHaveAttribute('aria-current')
  })

  it('hides decorative icons from assistive technology', () => {
    render(<Header />)
    expect(screen.getByRole('link', { name: 'Bookings' })).toBeInTheDocument()
  })

  it('opens the mobile menu', () => {
    render(<Header />)
    const menuButton = screen.getByRole('button', { name: 'Open menu' })
    expect(menuButton).toHaveAttribute('aria-expanded', 'false')

    fireEvent.click(menuButton)

    const dialog = screen.getByRole('dialog', { name: 'Menu' })
    const drawer = within(dialog)
    expect(menuButton).toHaveAttribute('aria-expanded', 'true')
    expect(menuButton).toHaveAttribute('aria-controls', dialog.id)
    expect(drawer.getByRole('link', { name: 'Bookings' })).toBeInTheDocument()
    expect(drawer.getByRole('link', { name: 'Help' })).toBeInTheDocument()
    expect(drawer.getByRole('link', { name: 'Account' })).toBeInTheDocument()
  })

  it('closes via the × button', () => {
    render(<Header />)
    const menuButton = screen.getByRole('button', { name: 'Open menu' })
    fireEvent.click(menuButton)

    fireEvent.click(screen.getByRole('button', { name: 'Close menu' }))

    expect(screen.queryByRole('dialog', { name: 'Menu' })).not.toBeInTheDocument()
    expect(menuButton).toHaveFocus()
  })

  it('closes via backdrop click', () => {
    const { container } = render(<Header />)
    const menuButton = screen.getByRole('button', { name: 'Open menu' })
    fireEvent.click(menuButton)

    const backdrop = container.querySelector('.menu-backdrop')
    if (backdrop === null) throw new Error('Expected menu backdrop')

    fireEvent.click(backdrop)

    expect(screen.queryByRole('dialog', { name: 'Menu' })).not.toBeInTheDocument()
    expect(menuButton).toHaveFocus()
  })

  it('closes via Escape', async () => {
    const user = userEvent.setup()
    render(<Header />)
    const menuButton = screen.getByRole('button', { name: 'Open menu' })
    fireEvent.click(menuButton)

    await user.keyboard('{Escape}')

    expect(screen.queryByRole('dialog', { name: 'Menu' })).not.toBeInTheDocument()
    expect(menuButton).toHaveFocus()
  })

  it('closes via link selection', () => {
    render(<Header />)
    const menuButton = screen.getByRole('button', { name: 'Open menu' })
    fireEvent.click(menuButton)

    const dialog = screen.getByRole('dialog', { name: 'Menu' })
    fireEvent.click(within(dialog).getByRole('link', { name: 'Bookings' }))

    expect(screen.queryByRole('dialog', { name: 'Menu' })).not.toBeInTheDocument()
    expect(menuButton).toHaveFocus()
  })

  it('traps focus inside the dialog', () => {
    render(<Header />)
    fireEvent.click(screen.getByRole('button', { name: 'Open menu' }))

    const dialog = screen.getByRole('dialog', { name: 'Menu' })
    const drawer = within(dialog)
    const closeButton = drawer.getByRole('button', { name: 'Close menu' })
    const links = drawer.getAllByRole('link')
    const lastLink = links[links.length - 1]
    if (lastLink === undefined) throw new Error('Expected drawer links')

    lastLink.focus()
    fireEvent.keyDown(dialog, { key: 'Tab' })
    expect(closeButton).toHaveFocus()

    closeButton.focus()
    fireEvent.keyDown(dialog, { key: 'Tab', shiftKey: true })
    expect(lastLink).toHaveFocus()
  })

  it('locks background scroll while open', () => {
    render(<Header />)
    fireEvent.click(screen.getByRole('button', { name: 'Open menu' }))

    expect(document.body.style.overflow).toBe('hidden')

    fireEvent.click(screen.getByRole('button', { name: 'Close menu' }))

    expect(document.body.style.overflow).toBe('')
  })
})
