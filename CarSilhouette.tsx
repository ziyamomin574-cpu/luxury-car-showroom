import { useMemo } from 'react'
import type { Car } from '@/data/cars'

/**
 * Vector stand-in used whenever WebGL or the model itself is unavailable
 * (FR-7). It inherits the currently selected paint so the page never looks
 * broken, even with 3D disabled.
 */
export function CarSilhouette({
  car,
  paintHex,
  className,
}: {
  car: Car
  paintHex: string
  className?: string
}) {
  const { tall, wheelR } = useMemo(
    () => ({ tall: car.shape.cabin === 'suv' ? 132 : 96, wheelR: car.shape.cabin === 'suv' ? 30 : 26 }),
    [car.shape.cabin],
  )
  const bodyTop = 170 - tall
  const id = `paint-${car.slug}`

  return (
    <svg
      viewBox="0 0 480 220"
      className={className}
      role="img"
      aria-label={`${car.brand} ${car.name}, side profile, ${car.type}`}
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={paintHex} stopOpacity="0.95" />
          <stop offset="100%" stopColor={paintHex} stopOpacity="0.45" />
        </linearGradient>
        <linearGradient id={`${id}-glass`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F5F3EE" stopOpacity="0.24" />
          <stop offset="100%" stopColor="#F5F3EE" stopOpacity="0.05" />
        </linearGradient>
      </defs>
      <rect width="480" height="220" fill="#1A1A1A" />
      <ellipse cx="240" cy="186" rx="190" ry="12" fill="#000" opacity="0.45" />
      <path
        d={`M40 168 L40 ${bodyTop + 22} Q42 ${bodyTop + 8} 62 ${bodyTop + 6} L150 ${bodyTop}
            L196 ${bodyTop - tall} Q200 ${bodyTop - tall - 8} 214 ${bodyTop - tall - 8}
            L320 ${bodyTop - tall - 8} Q340 ${bodyTop - tall - 8} 350 ${bodyTop - 26}
            L400 ${bodyTop + 4} Q438 ${bodyTop + 12} 440 ${bodyTop + 30} L440 168 Z`}
        fill={`url(#${id})`}
        stroke="rgba(245,243,238,0.28)"
        strokeWidth="1.5"
      />
      <path
        d={`M198 ${bodyTop - 2} L214 ${bodyTop - tall + 4} L318 ${bodyTop - tall + 4} L346 ${bodyTop - 2} Z`}
        fill={`url(#${id}-glass)`}
      />
      {[130, 350].map((cx) => (
        <g key={cx}>
          <circle cx={cx} cy={168} r={wheelR} fill="#0d0f10" stroke="rgba(245,243,238,0.3)" />
          <circle cx={cx} cy={168} r={wheelR * 0.55} fill="#b9bcc0" opacity="0.75" />
        </g>
      ))}
      <rect x="404" y={bodyTop + 34} width="26" height="8" rx="4" fill="#ffdfae" opacity="0.9" />
      <rect x="40" y={bodyTop + 30} width="22" height="7" rx="3.5" fill="#ff4a3a" opacity="0.85" />
    </svg>
  )
}
