import { Link } from 'react-router-dom'
import type { Car } from '@/data/cars'

export function CarNav({ previous, next }: { previous: Car; next: Car }) {
  return (
    <nav className="flex items-stretch gap-2" aria-label="Car navigation">
      <Link
        to={`/cars/${previous.slug}`}
        className="glass group flex min-h-14 flex-1 items-center gap-3 px-4 py-3 transition-colors hover:border-muted"
      >
        <span aria-hidden="true" className="text-lg text-detail transition-transform group-hover:-translate-x-1">
          ←
        </span>
        <span className="min-w-0">
          <span className="label block">Previous</span>
          <span className="block truncate font-display text-lg leading-tight">
            {previous.brand} {previous.name}
          </span>
        </span>
      </Link>

      <Link
        to={`/cars/${next.slug}`}
        className="glass group flex min-h-14 flex-1 items-center justify-end gap-3 px-4 py-3 text-right transition-colors hover:border-muted"
      >
        <span className="min-w-0">
          <span className="label block">Next</span>
          <span className="block truncate font-display text-lg leading-tight">
            {next.brand} {next.name}
          </span>
        </span>
        <span aria-hidden="true" className="text-lg text-detail transition-transform group-hover:translate-x-1">
          →
        </span>
      </Link>
    </nav>
  )
}
