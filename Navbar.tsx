import { forwardRef } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'

const LINKS = [
  { to: '/', label: 'Home' },
  { to: '/cars', label: 'Cars' },
  { to: '/showroom', label: '3D Showroom' },
  { to: '/compare', label: 'Compare' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
]

export const Navbar = forwardRef<HTMLElement>(function Navbar(_props, _ref) {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()

  useEffect(() => setOpen(false), [location.pathname])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <header className="safe-t fixed inset-x-0 top-0 z-50">
      <div
        className={`border-b transition-colors duration-300 ${
          scrolled ? 'glass-strong border-ink/10' : 'border-transparent bg-transparent'
        }`}
      >
        <nav
          className="mx-auto flex h-[68px] max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8"
          aria-label="Primary"
        >
          <Link to="/" className="font-display text-xl tracking-[0.18em] uppercase">
            Luxe
          </Link>

          <ul className="hidden items-center gap-7 lg:flex">
            {LINKS.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  end={link.to === '/'}
                  className={({ isActive }) =>
                    `label transition-colors hover:text-ink ${isActive ? 'text-ink' : ''}`
                  }
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>

          <Link to="/contact" className="btn btn-primary hidden lg:inline-flex">
            Book a test drive
          </Link>

          <button
            type="button"
            className="btn -mr-2 px-3 lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-drawer"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? 'Close' : 'Menu'}
          </button>
        </nav>
      </div>

      {open && (
        <div
          id="mobile-drawer"
          className="glass-strong safe-b max-h-[80dvh] overflow-y-auto border-t border-ink/10 px-4 pb-8 pt-4 lg:hidden"
        >
          <ul className="flex flex-col">
            {LINKS.map((link) => (
              <li key={link.to} className="border-b border-ink/10 last:border-b-0">
                <NavLink
                  to={link.to}
                  end={link.to === '/'}
                  className={({ isActive }) =>
                    `flex min-h-14 items-center font-display text-2xl ${isActive ? 'text-ink' : 'text-detail'}`
                  }
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
          <Link to="/contact" className="btn btn-primary mt-6 w-full">
            Book a test drive
          </Link>
        </div>
      )}
    </header>
  )
})

export default Navbar
