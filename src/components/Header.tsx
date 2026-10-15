import { useCallback, useEffect, useId, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { classNames } from '../lib/classNames'

type DocumentKeyboardEvent = DocumentEventMap['keydown']

interface NavLink {
  label: string
  icon: string
  isActive?: boolean
}

const MAIN_LINKS: NavLink[] = [
  { label: 'Bus tickets', icon: '🚌', isActive: true },
  { label: 'Train tickets', icon: '🚆' },
  { label: 'Hotels', icon: '🛏️' },
]

const SIDE_LINKS: NavLink[] = [
  { label: 'Bookings', icon: '☰' },
  { label: 'Help', icon: 'ⓘ' },
  { label: 'Account', icon: '◉' },
]

const DRAWER_FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

function Header() {
  const menuId = useId()
  const [isOpen, setIsOpen] = useState(false)
  const menuButtonRef = useRef<HTMLButtonElement | null>(null)
  const drawerRef = useRef<HTMLDivElement | null>(null)

  const openMenu = useCallback(() => {
    setIsOpen(true)
  }, [])

  const closeMenu = useCallback(() => {
    setIsOpen(false)
    menuButtonRef.current?.focus()
  }, [])

  useEffect(() => {
    if (!isOpen) return

    function handleDocumentKeyDown(event: DocumentKeyboardEvent) {
      if (event.key === 'Escape') closeMenu()
    }

    document.addEventListener('keydown', handleDocumentKeyDown)
    return () => document.removeEventListener('keydown', handleDocumentKeyDown)
  }, [isOpen, closeMenu])

  useEffect(() => {
    if (!isOpen) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return

    const drawer = drawerRef.current
    if (drawer === null) return

    const firstFocusable = drawer.querySelector<HTMLElement>(DRAWER_FOCUSABLE_SELECTOR)
    firstFocusable?.focus()
  }, [isOpen])

  function handleDrawerKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== 'Tab') return

    const drawer = drawerRef.current
    if (drawer === null) return

    const focusable = Array.from(
      drawer.querySelectorAll<HTMLElement>(DRAWER_FOCUSABLE_SELECTOR),
    )
    if (focusable.length === 0) return

    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    if (first === undefined || last === undefined) return

    const activeElement = document.activeElement
    const focusIsInside = activeElement !== null && drawer.contains(activeElement)

    if (event.shiftKey) {
      if (activeElement === first || !focusIsInside) {
        event.preventDefault()
        last.focus()
      }
    } else if (activeElement === last || !focusIsInside) {
      event.preventDefault()
      first.focus()
    }
  }

  return (
    <header className="header">
      <div className="container header-inner">
        <button
          ref={menuButtonRef}
          type="button"
          className="menu-btn"
          aria-label="Open menu"
          aria-expanded={isOpen}
          aria-controls={menuId}
          onClick={openMenu}
        >
          ☰
        </button>
        <div className="brand">redBus</div>
        <nav className="nav-main" aria-label="Main">
          {MAIN_LINKS.map((link) => (
            <a
              key={link.label}
              className={classNames('nav-item', link.isActive && 'active')}
              href="#"
              aria-current={link.isActive ? 'page' : undefined}
            >
              <span className="nav-icon" aria-hidden="true">
                {link.icon}
              </span>
              {link.label}
            </a>
          ))}
        </nav>
        <nav className="nav-side" aria-label="Account">
          {SIDE_LINKS.map((link) => (
            <a key={link.label} href="#">
              <span aria-hidden="true">{link.icon}</span> {link.label}
            </a>
          ))}
        </nav>
      </div>

      {isOpen ? (
        <>
          <div className="menu-backdrop" onClick={closeMenu} />
          <div
            ref={drawerRef}
            id={menuId}
            role="dialog"
            aria-label="Menu"
            className="menu-drawer"
            onKeyDown={handleDrawerKeyDown}
          >
            <button
              type="button"
              className="menu-close"
              aria-label="Close menu"
              onClick={closeMenu}
            >
              ×
            </button>
            <nav className="drawer-nav" aria-label="Account">
              <ul className="drawer-list">
                {SIDE_LINKS.map((link) => (
                  <li key={link.label}>
                    <a
                      className="drawer-link"
                      href="#"
                      onClick={(event) => {
                        event.preventDefault()
                        closeMenu()
                      }}
                    >
                      <span aria-hidden="true">{link.icon}</span> {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </>
      ) : null}
    </header>
  )
}

export default Header
