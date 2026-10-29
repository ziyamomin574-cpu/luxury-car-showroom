import { useNavigate } from 'react-router-dom'
import { cars } from '@/data/cars'
import { ShowroomScene } from '@/three/ShowroomScene'

export function Showroom() {
  const navigate = useNavigate()

  return (
    <section className="relative">
      <div className="h-[70dvh] min-h-[420px] w-full">
        <ShowroomScene onEnter={(slug) => navigate(`/cars/${slug}`)} />
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
        <div className="glass flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <p className="label">The hall</p>
            <h1 className="mt-1 font-display text-2xl">Six bays, one reflective floor</h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-detail">
              Tap a car to fly the camera to its bay, then open the full 3D experience. Keyboard: use
              the bay list on the right.
            </p>
          </div>
        </div>

        <ul className="no-scrollbar mt-6 flex gap-3 overflow-x-auto pb-2 lg:grid lg:grid-cols-3 lg:overflow-visible">
          {cars.map((car) => (
            <li key={car.slug} className="min-w-[240px] lg:min-w-0">
              <a
                href={`/cars/${car.slug}`}
                className="glass flex h-full flex-col gap-1 p-4 transition-colors hover:border-muted"
              >
                <span className="label">{car.brand}</span>
                <span className="font-display text-lg leading-tight">{car.name}</span>
                <span className="text-xs text-detail">{car.type}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
