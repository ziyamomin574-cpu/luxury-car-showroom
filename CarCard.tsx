import { Link } from 'react-router-dom'
import type { Car } from '@/data/cars'
import { formatPrice } from '@/data/cars'
import { CarImage } from './CarImage'

export function CarCard({ car, index = 0 }: { car: Car; index?: number }) {
  return (
    <Link
      to={`/cars/${car.slug}`}
      data-reveal
      className="glass group flex flex-col overflow-hidden transition-transform duration-500 ease-out hover:-translate-y-1.5"
      style={{ transitionDelay: `${index * 60}ms` }}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <CarImage
          car={car}
          className="h-full w-full transition-transform duration-700 ease-out group-hover:scale-[1.04]"
        />
        <span className="label absolute left-4 top-4">{car.type}</span>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <p className="label">{car.brand}</p>
          <h3 className="font-display text-2xl leading-tight">{car.name}</h3>
        </div>

        <p className="text-sm leading-relaxed text-detail">{car.tagline}. {car.description.slice(0, 92)}…</p>

        <ul className="flex items-center gap-2" aria-label={`Available colours for ${car.name}`}>
          {car.colors.map((color) => (
            <li
              key={color.id}
              className="h-4 w-4 rounded-full ring-1 ring-ink/25"
              style={{ backgroundColor: color.hex }}
              title={color.label}
            />
          ))}
        </ul>

        <div className="mt-auto flex items-end justify-between gap-3 pt-2">
          <div>
            <p className="text-sm text-detail">{formatPrice(car.price)}</p>
            <p className="text-[11px] text-detail">{car.price.note}</p>
          </div>
          <span className="btn">Explore 3D</span>
        </div>
      </div>
    </Link>
  )
}
