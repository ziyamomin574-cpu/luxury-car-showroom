import { Link } from 'react-router-dom'
import { cars } from '@/data/cars'
import { CarViewer } from '@/three/CarViewer'
import { CarImage } from '@/components/CarImage'
import { formatPrice } from '@/data/cars'

const STEPS = [
  { n: '01', t: 'Select', d: 'Pick a car from the collection or walk into the 3D showroom.' },
  { n: '02', t: 'Rotate', d: 'Drag, swipe or scroll. 360° with limits so the car stays framed.' },
  { n: '03', t: 'Colour', d: 'Pick the paint you want. The body updates live, in 400 ms.' },
  { n: '04', t: 'Interior', d: 'The camera flies to the driver seat. Dashboard, seats, screen.' },
  { n: '05', t: 'Compare', d: 'Put any two cars side by side, spec by spec.' },
  { n: '06', t: 'Test drive', d: 'Book a slot. One form, prefilled with your car and colour.' },
]

export function Home() {
  const hero = cars[0]
  const featured = cars.slice(1, 4)

  return (
    <>
      <section className="relative mx-auto max-w-7xl px-4 pb-10 pt-8 sm:px-6 lg:px-8">
        <div className="glass relative h-[62dvh] min-h-[420px] overflow-hidden lg:h-[76dvh]">
          <div className="absolute inset-0">
            <CarViewer car={hero} />
          </div>
          <div className="pointer-events-none relative flex h-full flex-col justify-end gap-4 p-6 sm:p-10">
            <p className="label">{hero.brand} · {hero.type}</p>
            <h1 className="max-w-2xl font-display text-5xl leading-[0.95] sm:text-6xl lg:text-7xl">
              {hero.name}
            </h1>
            <p className="max-w-md text-sm leading-relaxed text-detail">{hero.tagline}. Six cars, one hall.</p>
            <div className="pointer-events-auto mt-2 flex flex-wrap gap-3">
              <Link to="/showroom" className="btn btn-primary">Enter the showroom</Link>
              <Link to="/cars" className="btn">View all cars</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8" aria-labelledby="featured">
        <div className="flex items-end justify-between gap-6">
          <h2 id="featured" className="font-display text-3xl sm:text-4xl">Featured in the hall</h2>
          <Link to="/cars" className="label hover:text-ink">All six →</Link>
        </div>
        <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-3">
          {featured.map((car, i) => (
            <Link
              key={car.slug}
              to={`/cars/${car.slug}`}
              data-reveal
              className="glass group flex flex-col overflow-hidden transition-transform duration-500 ease-out hover:-translate-y-1.5"
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              <div className="relative aspect-[16/10] overflow-hidden">
                <CarImage car={car} className="h-full w-full" />
              </div>
              <div className="flex flex-1 flex-col gap-2 p-5">
                <p className="label">{car.brand}</p>
                <h3 className="font-display text-2xl leading-tight">{car.name}</h3>
                <p className="text-sm text-detail">{formatPrice(car.price)}</p>
                <span className="btn mt-3 self-start">Explore 3D</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8" aria-labelledby="how">
        <h2 id="how" className="font-display text-3xl sm:text-4xl">How it works</h2>
        <ol className="mt-8 grid grid-cols-1 gap-px overflow-hidden rounded-glass border border-ink/10 bg-ink/10 sm:grid-cols-2 lg:grid-cols-3">
          {STEPS.map((step) => (
            <li key={step.n} data-reveal className="bg-bg p-6">
              <p className="label">{step.n}</p>
              <h3 className="mt-2 font-display text-xl">{step.t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-detail">{step.d}</p>
            </li>
          ))}
        </ol>
      </section>
    </>
  )
}
