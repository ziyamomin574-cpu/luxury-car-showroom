import { useShowroom } from '@/store/useShowroom'
import type { Car } from '@/data/cars'
import { CarImage } from './CarImage'

/** Shown when WebGL is unavailable, the model failed, or quality dropped to 0. */
export function FallbackImage({ car, className }: { car: Car; className?: string }) {
  const colors = useShowroom((s) => s.colors)
  const paintHex = car.colors.find((c) => c.id === colors[car.slug])?.hex ?? car.colors[0].hex

  return (
    <figure
      className={`glass relative flex flex-col items-center justify-center gap-3 overflow-hidden p-6 text-center ${
        className ?? ''
      }`}
    >
      <CarImage car={car} paintHex={paintHex} className="h-full w-full" />
      <figcaption className="label">Interactive 3D unavailable</figcaption>
    </figure>
  )
}
