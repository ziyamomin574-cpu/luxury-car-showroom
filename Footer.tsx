import { Link } from 'react-router-dom'
import { PRICE_DISCLAIMER } from '@/data/cars'

export function Footer() {
  return (
    <footer className="safe-b border-t border-ink/10 px-4 pb-10 pt-14 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-3">
        <div>
          <p className="font-display text-2xl tracking-[0.18em] uppercase">Luxe</p>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-detail">
            A cinematic showroom for six performance cars. Explore in real-time 3D, change the paint,
            step inside, compare and book a drive.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-6 text-sm">
          <ul className="space-y-2">
            <li className="label mb-3">Explore</li>
            <li>
              <Link className="text-detail hover:text-ink" to="/cars">
                Cars
              </Link>
            </li>
            <li>
              <Link className="text-detail hover:text-ink" to="/showroom">
                3D Showroom
              </Link>
            </li>
            <li>
              <Link className="text-detail hover:text-ink" to="/compare">
                Compare
              </Link>
            </li>
          </ul>
          <ul className="space-y-2">
            <li className="label mb-3">Visit</li>
            <li>
              <Link className="text-detail hover:text-ink" to="/contact">
                Book a test drive
              </Link>
            </li>
            <li>
              <Link className="text-detail hover:text-ink" to="/about">
                About
              </Link>
            </li>
            <li>
              <Link className="text-detail hover:text-ink" to="/contact#privacy">
                Privacy notice
              </Link>
            </li>
          </ul>
        </div>

        <address className="text-sm not-italic leading-relaxed text-detail">
          <p className="label mb-3">Showroom</p>
          <p>Level 1, Signature Hall, Auto District</p>
          <p>Bengaluru 560001, India</p>
          <p className="mt-3">
            <a className="hover:text-ink" href="tel:+918000000000">
              +91 80000 00000
            </a>
            <br />
            <a className="hover:text-ink" href="mailto:drive@luxe-showroom.example">
              drive@luxe-showroom.example
            </a>
          </p>
        </address>
      </div>

      <div className="mx-auto mt-12 max-w-7xl space-y-3 border-t border-ink/10 pt-6 text-xs leading-relaxed text-detail">
        <p>{PRICE_DISCLAIMER}</p>
        <p>
          Demonstrator site. Not an official manufacturer website. Car names, badges and designs are
          the property of their respective manufacturers and are used here for identification only.
        </p>
        <p>
          3D geometry shown in the browser is a stylised placeholder. Licensed production models will
          replace it before launch.
        </p>
      </div>
    </footer>
  )
}
