import type { Car } from '@/data/cars'

function Row({ label, value }: { label: string; value: string | number | null }) {
  return (
    <div className="border-b border-ink/10 py-3 last:border-b-0">
      <dt className="label">{label}</dt>
      <dd className="mt-1 text-[15px] leading-snug text-ink">{value ?? '—'}</dd>
    </div>
  )
}

export function SpecGrid({ car }: { car: Car }) {
  const d = car.specs.dimensions
  return (
    <dl className="grid grid-cols-1 gap-x-6 sm:grid-cols-2">
      <Row label="Engine / motor" value={car.specs.engine} />
      <Row label="Power" value={`${car.specs.powerHp} hp`} />
      <Row label="Torque" value={`${car.specs.torqueNm} Nm`} />
      <Row label="Transmission" value={car.specs.transmission} />
      <Row label="0–100 km/h" value={`${car.specs.zeroTo100.toFixed(1)} s`} />
      <Row label="Fuel" value={car.specs.fuel} />
      <Row label="Seating" value={`${car.specs.seats} seats`} />
      <Row label="EV range" value={car.specs.evRangeKm ? `${car.specs.evRangeKm} km` : 'Not applicable'} />
      <div className="sm:col-span-2">
        <Row label="Dimensions (L × W × H)" value={`${d.lengthMm} × ${d.widthMm} × ${d.heightMm} mm`} />
      </div>
    </dl>
  )
}
