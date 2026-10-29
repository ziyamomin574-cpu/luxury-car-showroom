import { useState } from 'react'
import { PerformanceMonitor } from '@react-three/drei'

/** 0 = fallback image only, 1 = mobile/low tier, 2 = full quality. */
export type QualityTier = 0 | 1 | 2

export function deviceTier(): QualityTier {
  if (typeof window === 'undefined') return 1
  const coarse = window.matchMedia?.('(pointer: coarse)').matches ?? false
  const narrow = window.innerWidth < 768
  const cores = navigator.hardwareConcurrency ?? 4
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4
  if (coarse || narrow || cores <= 4 || memory <= 4) return 1
  return 2
}

export function pixelRatioFor(tier: QualityTier): number {
  const raw = typeof window === 'undefined' ? 1 : window.devicePixelRatio || 1
  const cap = tier === 2 ? 2 : tier === 1 ? 1.5 : 1
  return Math.min(raw, cap)
}

/**
 * Downgrades the scene when the frame rate collapses (arch 2.6) and can hand
 * back to the caller so the UI can offer the static fallback.
 */
export function QualityGuard({
  tier,
  onTier,
}: {
  tier: QualityTier
  onTier: (tier: QualityTier) => void
}) {
  const [current, setCurrent] = useState<QualityTier>(tier)

  const step = (next: QualityTier) => {
    if (next === current) return
    setCurrent(next)
    onTier(next)
  }

  return (
    <PerformanceMonitor
      bounds={() => [45, 60]}
      flipflops={3}
      onDecline={() => step(current === 2 ? 1 : 0)}
      onFallback={() => step(0)}
    />
  )
}
