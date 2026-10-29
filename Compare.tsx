import { useEffect, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { cars, formatPrice, PRICE_DISCLAIMER, type Car } from '@/data/cars'
import { compareWinner } from '@/lib/api'
import { useShowroom } from '@/store/useShowroom'

type Row = {
  label: string
  value: (car: Car) => string
  numeric?: (car: Car) => number | undefined
  lowerIsBetter?: boolean
}

const ROWS: Row[] = [
  { label: 'Price', value: (c) => formatPrice(c.price), numeric: (c) => c.price.amount, lowerIsBetter: true },
  { label: 'Type', value: (c) => c.type },
  { label: 'Engine / motor', value: (c) => c.specs.engine },
  { label: 'Power', value: (c) => `${c.specs.powerHp} hp`, numeric: (c) => c.specs.powerHp },
  { label: 'Torque', value: (c) => `${c.specs.torqueNm} Nm`, numeric: (c) => c.specs.torqueNm },
  { label: '0–100 km/h', value: (c) => `${c.specs.zeroTo100.toFixed(1)} s`, numeric: (c) => c.specs.zeroTo100, lowerIsBetter: true },
  { label: 'Transmission', value: (c) => c.specs.transmission },
  { label: 'Fuel', value: (c) => c.specs.fuel },
  { label: 'Seating', value: (c) => `${c.specs.seats} seats`, numeric: (c) => c.specs.seats },
  {
    label: 'Dimensions (L × W × H)',
    value: (c) => `${c.specs.dimensions.lengthMm} × ${c.specs.dimensions.widthMm} × ${c.specs.dimensions.heightMm} mm`,
  },
  {
    label: 'EV range',
    value: (c) => (c.specs.evRangeKm ? `${c.specs.evRangeKm} km` : 'Not applicable'),
    numeric: (c) => c.specs.evRangeKm,
  },
]

function Selector({
  value,
  onChange,
  exclude,
  label,
}: {
  value: string
  onChange: (slug: string) => void
  exclude: string | null
  label: string
}) {
  return (
    <div className="flex flex-1 flex-col gap-2">
      <label className="label" htmlFor={`select-${label}`}>
        {label}
      </label>
      <select
        id={`select-${label}`}
        className="field"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {cars.map((car) => (
          <option key={car.slug} value={car.slug} disabled={car.slug === exclude}>
            {car.brand} {car.name}
          </option>
        ))}
      </select>
    </div>
  )
}

export function Compare() {
  const [search, setSearch] = useSearchParams()
  const pair = useShowroom((s) => s.compare)
  const setCompare = useShowroom((s) => s.setCompare)

  const [a, b] = pair
  useEffect(() => {
    const fromUrl = (search.get('a') ?? null) as string | null
    const fromUrlB = (search.get('b') ?? null) as string | null
    if (fromUrl || fromUrlB) setCompare([fromUrl ?? 'bmw-m4-competition', fromUrlB ?? 'porsche-911-turbo-s'])
  }, [search, setCompare])

  const carA = cars.find((c) => c.slug === a) ?? null
  const carB = cars.find((c) => c.slug === b) ?? null

  const update = (slot: 0 | 1, slug: string) => {
    const next: [string | null, string | null] = [carA?.slug ?? null, carB?.slug ?? null]
    if (next[slot] === next[slot === 0 ? 1 : 0]) return
    next[slot] = slug
    setCompare(next)
    const params = new URLSearchParams()
    if (next[0]) params.set('a', next[0])
    if (next[1]) params.set('b', next[1])
    setSearch(params, { replace: true })
  }

  const rows = useMemo(
    () =>
      ROWS.map((row) => ({
        ...row,
        winner: carA && carB ? compareWinner(row.numeric?.(carA), row.numeric?.(carB), row.lowerIsBetter) : null,
      })),
    [carA, carB],
  )

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <header data-reveal>
        <p className="label">Side by side</p>
        <h1 className="mt-2 font-display text-4xl leading-tight sm:text-5xl">Compare two cars</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-detail">
          The stronger figure in each numeric row is marked. Prices are indicative — see each car's
          detail page for the verified date.
        </p>
      </header>

      <div className="mt-8 flex flex-col gap-4 sm:flex-row">
        <Selector label="First car" value={carA?.slug ?? ''} onChange={(slug) => update(0, slug)} exclude={carB?.slug ?? null} />
        <Selector label="Second car" value={carB?.slug ?? ''} onChange={(slug) => update(1, slug)} exclude={carA?.slug ?? null} />
      </div>

      {carA && carB ? (
        <>
          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
            {[carA, carB].map((car, i) => (
              <article key={car.slug} data-reveal className="glass flex flex-col gap-3 p-5">
                <p className="label">{i === 0 ? 'A' : 'B'} · {car.brand}</p>
                <h2 className="font-display text-2xl leading-tight">{car.name}</h2>
                <p className="text-sm text-detail">{car.type}</p>
                <ul className="mt-1 flex items-center gap-2">
                  {car.colors.map((color) => (
                    <li key={color.id} className="h-4 w-4 rounded-full ring-1 ring-ink/25" style={{ backgroundColor: color.hex }} title={color.label} />
                  ))}
                </ul>
                <Link className="btn mt-2 self-start" to={`/cars/${car.slug}`}>
                      Open in 3D
                </Link>
              </article>
            ))}
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[560px] border-collapse text-sm">
              <caption className="sr-only">
                Specification comparison of {carA.brand} {carA.name} and {carB.brand} {carB.name}
              </caption>
              <thead>
                <tr className="border-b border-ink/15">
                  <th scope="col" className="label py-3 pr-4 text-left font-semibold">
                    Specification
                  </th>
                  <th scope="col" className="py-3 pr-4 text-left font-display text-lg">
                    {carA.brand} {carA.name}
                  </th>
                  <th scope="col" className="py-3 text-left font-display text-lg">
                    {carB.brand} {carB.name}
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.label} className="border-b border-ink/10 align-top">
                    <th scope="row" className="label py-3 pr-4 text-left font-normal">
                      {row.label}
                    </th>
                    <td className={`py-3 pr-4 ${row.winner === 'a' ? 'text-ink' : 'text-detail'}`}>
                      {row.winner === 'a' && <span className="sr-only">Better value. </span>}
                      {row.value(carA)}
                    </td>
                    <td className={`py-3 ${row.winner === 'b' ? 'text-ink' : 'text-detail'}`}>
                      {row.winner === 'b' && <span className="sr-only">Better value. </span>}
                      {row.value(carB)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-4 text-[11px] text-detail">{PRICE_DISCLAIMER}</p>
        </>
      ) : (
        <p className="mt-10 text-sm text-detail">Pick two different cars to see the comparison.</p>
      )}
    </section>
  )
}
