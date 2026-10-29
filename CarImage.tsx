import { useState } from 'react'
import type { Car } from '@/data/cars'
import { CarSilhouette } from './CarSilhouette'

type Props = {
  car: Car
  className?: string
  /** Eager-load for above-the-fold use; lazy everywhere else. */
  priority?: boolean
  paintHex?: string
}

/**
 * Real photography when the file exists, generated vector otherwise. The
 * `onError` swap means a car without an image still gets a clean card rather
 * than a broken frame, and the fallback keeps the currently selected paint.
 */
export function CarImage({ car, className = '', priority = false, paintHex }: Props) {
  const [failed, setFailed] = useState(false)
  const src = car.images.fallback

  if (failed || !src) {
    return <CarSilhouette car={car} paintHex={paintHex ?? car.colors[0].hex} className={className} />
  }

  return (
    <img
      src={src}
      alt={`${car.brand} ${car.name}, ${car.type.toLowerCase()}`}
      className={`${className} object-cover`}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      onError={() => setFailed(true)}
    />
  )
}
