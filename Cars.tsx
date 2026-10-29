import { cars } from '@/data/cars'
import { CarCard } from '@/components/CarCard'

export function Cars() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <header data-reveal className="max-w-2xl">
        <p className="label">The collection</p>
        <h1 className="mt-2 font-display text-4xl leading-tight sm:text-5xl">Six cars, no filler</h1>
        <p className="mt-4 text-sm leading-relaxed text-detail">
          Every car below opens the same 3D experience: rotate it, change the paint, step inside, read
          the specifications and book a drive. Prices and figures are indicative — check the detail
          page for the last-verified date.
        </p>
      </header>

      <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {cars.map((car, i) => (
          <CarCard key={car.slug} car={car} index={i} />
        ))}
      </div>
    </section>
  )
}
